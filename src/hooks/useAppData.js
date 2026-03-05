import { useState, useEffect, useCallback } from 'react';
import { formatDateKeyLocal } from '../data/dietPlan';

const STORAGE_KEY = 'justeatit_data';
const APP_DATA_VERSION = 1;
const MAX_SAVED_PHOTOS = 6;

function getDefaultSettings() {
    return {
        theme: 'dark',
        restDay: 0, // Sunday
        notifications: true,
        lastEggPrep: null,
        lastDalPrep: null,
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

export function useAppData() {
    const [data, setData] = useState(getInitialData);

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

            return { ...prev, days };
        });
    }, []);

    const updateSettings = useCallback((updates) => {
        setData((prev) => ({
            ...prev,
            settings: sanitizeSettings({ ...prev.settings, ...updates }),
        }));
    }, []);

    return { data, updateDayField, updateSettings };
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
            if (i === 0) continue; // no meals logged today does not break streak
            break;
        }

        const meals = Array.isArray(day.meals) ? day.meals : [];
        const allMealsChecked = meals.length > 0 && meals.every((m) => m === true);
        const someMealsChecked = meals.some((m) => m === true);

        if (i === 0) {
            if (allMealsChecked) {
                streak++;
            } else if (someMealsChecked) {
                return 0; // partial today resets active streak
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
