import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatDateKeyLocal, DEFAULT_PROFILE, MEALS as DEFAULT_MEALS } from '../data/dietPlan';

const STORAGE_KEY = 'justeatit_data';
const APP_DATA_VERSION = 2;
const MAX_SAVED_PHOTOS = 6;

function getDefaultSettings() {
    return {
        theme: 'dark',
        restDay: 0, // Sunday
        notifications: true,
        lastEggPrep: null,
        lastDalPrep: null,
        onboardingComplete: false,
        profile: { ...DEFAULT_PROFILE },
        customMeals: null, // null = use defaults from dietPlan.js
    };
}

function createDefaultData() {
    return {
        version: APP_DATA_VERSION,
        settings: getDefaultSettings(),
        days: {},
    };
}

function normalizeTheme(theme) {
    return theme === 'light' ? 'light' : 'dark';
}

function normalizeDateLike(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function sanitizeProfile(rawProfile) {
    const fallback = { ...DEFAULT_PROFILE };
    const input = rawProfile && typeof rawProfile === 'object' ? rawProfile : {};

    return {
        name: typeof input.name === 'string' ? input.name : fallback.name,
        weight: Number.isFinite(Number(input.weight)) ? Math.max(30, Math.min(300, Number(input.weight))) : fallback.weight,
        height: Number.isFinite(Number(input.height)) ? Math.max(100, Math.min(250, Number(input.height))) : fallback.height,
        age: Number.isFinite(Number(input.age)) ? Math.max(10, Math.min(100, Number(input.age))) : fallback.age,
        goal: ['cut', 'bulk', 'recomp', 'maintain'].includes(input.goal) ? input.goal : fallback.goal,
        trainingDaysPerWeek: Number.isFinite(Number(input.trainingDaysPerWeek)) ? Math.max(1, Math.min(7, Number(input.trainingDaysPerWeek))) : fallback.trainingDaysPerWeek,
        targetCals: Number.isFinite(Number(input.targetCals)) ? Math.max(1000, Math.min(6000, Math.round(Number(input.targetCals)))) : fallback.targetCals,
        restDayCals: Number.isFinite(Number(input.restDayCals)) ? Math.max(1000, Math.min(6000, Math.round(Number(input.restDayCals)))) : fallback.restDayCals,
    };
}

function sanitizeCustomMeals(rawMeals) {
    if (!rawMeals || typeof rawMeals !== 'object') return null;
    // Validate structure: { training: [...], rest: [...] }
    if (!Array.isArray(rawMeals.training) || !Array.isArray(rawMeals.rest)) return null;
    return rawMeals;
}

function sanitizeSettings(rawSettings) {
    const fallback = getDefaultSettings();
    const input = rawSettings && typeof rawSettings === 'object' ? rawSettings : {};

    return {
        ...fallback,
        theme: normalizeTheme(input.theme),
        restDay: Number.isInteger(input.restDay) ? Math.max(0, Math.min(6, input.restDay)) : fallback.restDay,
        notifications: typeof input.notifications === 'boolean' ? input.notifications : fallback.notifications,
        lastEggPrep: normalizeDateLike(input.lastEggPrep),
        lastDalPrep: normalizeDateLike(input.lastDalPrep),
        onboardingComplete: typeof input.onboardingComplete === 'boolean' ? input.onboardingComplete : fallback.onboardingComplete,
        profile: sanitizeProfile(input.profile),
        customMeals: sanitizeCustomMeals(input.customMeals),
    };
}

function normalizeMeals(rawMeals, mealCount) {
    if (!Array.isArray(rawMeals)) return new Array(mealCount).fill(false);
    const meals = rawMeals.map(Boolean).slice(0, mealCount);
    while (meals.length < mealCount) meals.push(false);
    return meals;
}

function sanitizeSleep(rawSleep) {
    if (rawSleep == null) return null;
    if (typeof rawSleep === 'number' && Number.isFinite(rawSleep)) {
        return { hours: Math.max(0, Math.min(24, rawSleep)) };
    }
    if (typeof rawSleep === 'object' && Number.isFinite(rawSleep.hours)) {
        return { hours: Math.max(0, Math.min(24, rawSleep.hours)) };
    }
    return null;
}

function sanitizeWorkout(rawWorkout) {
    if (!rawWorkout || typeof rawWorkout !== 'object') return null;
    if (typeof rawWorkout.type !== 'string' || !rawWorkout.type) return null;

    const duration = Number(rawWorkout.duration);
    const cals = Number(rawWorkout.cals);
    if (!Number.isFinite(duration) || duration <= 0) return null;
    if (!Number.isFinite(cals) || cals < 0) return null;

    return {
        type: rawWorkout.type,
        duration: Math.round(duration),
        cals: Math.round(cals),
    };
}

function sanitizePhoto(rawPhoto) {
    if (typeof rawPhoto !== 'string') return null;
    return rawPhoto.startsWith('data:image/') ? rawPhoto : null;
}

function sanitizeWeight(rawWeight) {
    const w = Number(rawWeight);
    return Number.isFinite(w) && w > 0 ? Number(w.toFixed(1)) : null;
}

export function createEmptyDay(dateKey) {
    const date = new Date(`${dateKey}T12:00:00`);
    const isRest = date.getDay() === 0;
    return {
        isTrainingDay: !isRest,
        meals: isRest ? [false, false, false] : [false, false, false, false],
        water: 0,
        sleep: null,
        workout: null,
        weight: null,
        photo: null,
    };
}

function sanitizeDayData(dateKey, rawDay) {
    const fallback = createEmptyDay(dateKey);
    const input = rawDay && typeof rawDay === 'object' ? rawDay : {};
    const isTrainingDay = typeof input.isTrainingDay === 'boolean' ? input.isTrainingDay : fallback.isTrainingDay;
    const mealCount = isTrainingDay ? 4 : 3;

    return {
        isTrainingDay,
        meals: normalizeMeals(input.meals, mealCount),
        water: Number.isFinite(Number(input.water)) ? Math.max(0, Math.min(12, Math.round(Number(input.water)))) : 0,
        sleep: sanitizeSleep(input.sleep),
        workout: sanitizeWorkout(input.workout),
        weight: sanitizeWeight(input.weight),
        photo: sanitizePhoto(input.photo),
    };
}

function limitPhotoEntries(days, maxPhotos = MAX_SAVED_PHOTOS) {
    const photoDays = Object.entries(days)
        .filter(([, day]) => typeof day?.photo === 'string' && day.photo.startsWith('data:image/'))
        .sort(([a], [b]) => a.localeCompare(b));

    if (photoDays.length <= maxPhotos) return days;

    const removeCount = photoDays.length - maxPhotos;
    const removeKeys = new Set(photoDays.slice(0, removeCount).map(([key]) => key));
    const nextDays = { ...days };

    removeKeys.forEach((key) => {
        if (nextDays[key]) {
            nextDays[key] = { ...nextDays[key], photo: null };
        }
    });

    return nextDays;
}

function sanitizeData(rawData) {
    const fallback = createDefaultData();
    if (!rawData || typeof rawData !== 'object') return fallback;

    const inputDays = rawData.days && typeof rawData.days === 'object' ? rawData.days : {};
    const days = {};

    Object.entries(inputDays).forEach(([key, value]) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
            days[key] = sanitizeDayData(key, value);
        }
    });

    return {
        version: APP_DATA_VERSION,
        settings: sanitizeSettings(rawData.settings),
        days: limitPhotoEntries(days),
    };
}

function getInitialData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return createDefaultData();
        const parsed = JSON.parse(stored);
        return sanitizeData(parsed);
    } catch (e) {
        console.warn('Failed to parse localStorage data:', e);
        return createDefaultData();
    }
}

// Helper: get the active meal plan (custom or default)
export function getActiveMeals(settings) {
    if (settings.customMeals) {
        return settings.customMeals;
    }
    return DEFAULT_MEALS;
}

export function useAppData(user) {
    const [data, setData] = useState(getInitialData);
    const [isCloudSynced, setIsCloudSynced] = useState(false);

    // Initial Fetch from Cloud
    useEffect(() => {
        if (!user || !isSupabaseConfigured || !supabase) return;

        async function fetchCloudData() {
            try {
                const { data: settingsData, error: settingsError } = await supabase
                    .from('settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - 30);

                const { data: logsData, error: logsError } = await supabase
                    .from('daily_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('date_key', cutoffDate.toISOString().split('T')[0]);

                if (settingsError && settingsError.code !== 'PGRST116') {
                    console.error('Error fetching settings:', settingsError);
                }

                if (logsError) {
                    console.error('Error fetching logs:', logsError);
                }

                setData(prevLocalData => {
                    const mergedSettings = settingsData ? {
                        ...prevLocalData.settings,
                        theme: settingsData.theme || 'dark',
                        lastEggPrep: settingsData.last_egg_prep || null,
                        onboardingComplete: settingsData.onboarding_complete ?? prevLocalData.settings.onboardingComplete,
                        profile: settingsData.profile ? sanitizeProfile(settingsData.profile) : prevLocalData.settings.profile,
                        customMeals: settingsData.custom_meals ? sanitizeCustomMeals(settingsData.custom_meals) : prevLocalData.settings.customMeals,
                    } : prevLocalData.settings;

                    const mergedDays = { ...prevLocalData.days };

                    if (logsData) {
                        logsData.forEach(log => {
                            const localDay = mergedDays[log.date_key];
                            mergedDays[log.date_key] = sanitizeDayData(log.date_key, {
                                isTrainingDay: log.is_training_day,
                                meals: log.meals,
                                water: log.water,
                                sleep: log.sleep,
                                workout: log.workout,
                                weight: log.weight ?? localDay?.weight ?? null,
                                // Keep local photo — photos stay in localStorage only
                                photo: localDay?.photo ?? null,
                            });
                        });
                    }

                    const finalData = {
                        version: APP_DATA_VERSION,
                        settings: sanitizeSettings(mergedSettings),
                        days: limitPhotoEntries(mergedDays),
                    };

                    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
                    return finalData;
                });
                setIsCloudSynced(true);
            } catch (err) {
                console.error("Cloud sync failed on load", err);
            }
        }

        fetchCloudData();
    }, [user]);

    // Local Storage save debounced
    useEffect(() => {
        const saveTimer = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
                console.warn('Failed to save to localStorage:', e);
            }
        }, 150);

        return () => clearTimeout(saveTimer);
    }, [data]);

    const updateDayField = useCallback((dateKey, field, value) => {
        setData((prev) => {
            const existing = sanitizeDayData(dateKey, prev.days[dateKey]);
            const updatedDay = sanitizeDayData(dateKey, { ...existing, [field]: value });
            let days = { ...prev.days, [dateKey]: updatedDay };

            if (field === 'photo') {
                days = limitPhotoEntries(days);
            }

            // Cloud sync — photos stay local-only (too large for DB), everything else syncs
            if (user && isCloudSynced && isSupabaseConfigured && supabase && field !== 'photo') {
                const dbPayload = {
                    user_id: user.id,
                    date_key: dateKey,
                    is_training_day: updatedDay.isTrainingDay,
                    meals: updatedDay.meals,
                    water: updatedDay.water,
                    sleep: updatedDay.sleep || {},
                    workout: updatedDay.workout || null,
                    weight: updatedDay.weight || null,
                    updated_at: new Date().toISOString()
                };

                supabase
                    .from('daily_logs')
                    .upsert(dbPayload, { onConflict: 'user_id,date_key' })
                    .then(({ error }) => {
                        if (error) console.error("Failed to sync log to cloud:", error);
                    });
            }

            return { ...prev, days };
        });
    }, [user, isCloudSynced]);

    const updateSettings = useCallback((updates) => {
        setData((prev) => {
            const newSettings = sanitizeSettings({ ...prev.settings, ...updates });

            if (user && isCloudSynced && isSupabaseConfigured && supabase) {
                supabase
                    .from('settings')
                    .upsert({
                        user_id: user.id,
                        theme: newSettings.theme,
                        last_egg_prep: newSettings.lastEggPrep,
                        onboarding_complete: newSettings.onboardingComplete,
                        profile: newSettings.profile,
                        custom_meals: newSettings.customMeals,
                        updated_at: new Date().toISOString()
                    })
                    .then(({ error }) => {
                        if (error) console.error("Failed to sync settings to cloud:", error);
                    });
            }

            return { ...prev, settings: newSettings };
        });
    }, [user, isCloudSynced]);

    const updateProfile = useCallback((profileUpdates) => {
        setData((prev) => {
            const newProfile = sanitizeProfile({ ...prev.settings.profile, ...profileUpdates });
            const newSettings = { ...prev.settings, profile: newProfile };

            if (user && isCloudSynced && isSupabaseConfigured && supabase) {
                supabase
                    .from('settings')
                    .upsert({
                        user_id: user.id,
                        theme: newSettings.theme,
                        last_egg_prep: newSettings.lastEggPrep,
                        onboarding_complete: newSettings.onboardingComplete,
                        profile: newProfile,
                        custom_meals: newSettings.customMeals,
                        updated_at: new Date().toISOString()
                    })
                    .then(({ error }) => {
                        if (error) console.error("Failed to sync profile to cloud:", error);
                    });
            }

            return { ...prev, settings: newSettings };
        });
    }, [user, isCloudSynced]);

    return { data, updateDayField, updateSettings, updateProfile };
}

export function calculateStreak(days) {
    let streak = 0;
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = formatDateKeyLocal(d);
        const day = days?.[key];

        if (!day) {
            if (i === 0) continue;
            break;
        }

        const meals = Array.isArray(day.meals) ? day.meals : [];
        const allMealsChecked = meals.length > 0 && meals.every((m) => m === true);
        const someMealsChecked = meals.some((m) => m === true);

        if (i === 0) {
            if (allMealsChecked) {
                streak++;
            } else if (someMealsChecked) {
                return 0;
            }
            continue;
        }

        if (allMealsChecked) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}
