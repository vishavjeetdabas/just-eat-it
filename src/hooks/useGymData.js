import { useState, useEffect, useCallback } from 'react';
import { formatDateKeyLocal } from '../data/dietPlan';

const GYM_STORAGE_KEY = 'justeatit_gym';

function getStoredGymData() {
    try {
        const stored = localStorage.getItem(GYM_STORAGE_KEY);
        if (!stored) return { sessions: [], activeWorkout: null };
        return JSON.parse(stored);
    } catch {
        return { sessions: [], activeWorkout: null };
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function useGymData() {
    const [gymData, setGymData] = useState(getStoredGymData);

    // Persist to localStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(GYM_STORAGE_KEY, JSON.stringify(gymData));
            } catch (e) {
                console.warn('Failed to save gym data:', e);
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [gymData]);

    const startWorkout = useCallback(() => {
        const now = new Date();
        setGymData(prev => ({
            ...prev,
            activeWorkout: {
                id: generateId(),
                date: formatDateKeyLocal(now),
                startTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                exercises: [],
            },
        }));
    }, []);

    const addExerciseToWorkout = useCallback((exercise) => {
        setGymData(prev => {
            if (!prev.activeWorkout) return prev;
            // Check if same exercise already added
            const exists = prev.activeWorkout.exercises.find(e => e.exerciseId === exercise.id);
            if (exists) return prev;

            return {
                ...prev,
                activeWorkout: {
                    ...prev.activeWorkout,
                    exercises: [
                        ...prev.activeWorkout.exercises,
                        {
                            exerciseId: exercise.id,
                            name: exercise.name,
                            category: exercise.category,
                            emoji: exercise.emoji,
                            sets: [],
                        },
                    ],
                },
            };
        });
    }, []);

    const addSet = useCallback((exerciseId, weight, reps) => {
        setGymData(prev => {
            if (!prev.activeWorkout) return prev;
            return {
                ...prev,
                activeWorkout: {
                    ...prev.activeWorkout,
                    exercises: prev.activeWorkout.exercises.map(ex => {
                        if (ex.exerciseId !== exerciseId) return ex;
                        return {
                            ...ex,
                            sets: [
                                ...ex.sets,
                                { weight: Number(weight), reps: Number(reps), completed: true },
                            ],
                        };
                    }),
                },
            };
        });
    }, []);

    const removeSet = useCallback((exerciseId, setIndex) => {
        setGymData(prev => {
            if (!prev.activeWorkout) return prev;
            return {
                ...prev,
                activeWorkout: {
                    ...prev.activeWorkout,
                    exercises: prev.activeWorkout.exercises.map(ex => {
                        if (ex.exerciseId !== exerciseId) return ex;
                        return {
                            ...ex,
                            sets: ex.sets.filter((_, i) => i !== setIndex),
                        };
                    }),
                },
            };
        });
    }, []);

    const removeExercise = useCallback((exerciseId) => {
        setGymData(prev => {
            if (!prev.activeWorkout) return prev;
            return {
                ...prev,
                activeWorkout: {
                    ...prev.activeWorkout,
                    exercises: prev.activeWorkout.exercises.filter(ex => ex.exerciseId !== exerciseId),
                },
            };
        });
    }, []);

    const finishWorkout = useCallback(() => {
        setGymData(prev => {
            if (!prev.activeWorkout) return prev;
            const now = new Date();
            const finishedSession = {
                ...prev.activeWorkout,
                endTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            };
            // Only save if there's at least one exercise with sets
            const hasData = finishedSession.exercises.some(e => e.sets.length > 0);
            return {
                sessions: hasData ? [finishedSession, ...prev.sessions] : prev.sessions,
                activeWorkout: null,
            };
        });
    }, []);

    const cancelWorkout = useCallback(() => {
        setGymData(prev => ({
            ...prev,
            activeWorkout: null,
        }));
    }, []);

    // Get the last session data for a specific exercise (for pre-fill)
    const getLastSession = useCallback((exerciseId) => {
        for (const session of gymData.sessions) {
            const match = session.exercises.find(e => e.exerciseId === exerciseId);
            if (match && match.sets.length > 0) {
                return match;
            }
        }
        return null;
    }, [gymData.sessions]);

    // Get personal record for an exercise (heaviest weight)
    const getPersonalRecord = useCallback((exerciseId) => {
        let maxWeight = 0;
        let maxReps = 0;
        let maxVolume = 0;

        for (const session of gymData.sessions) {
            const match = session.exercises.find(e => e.exerciseId === exerciseId);
            if (!match) continue;
            for (const set of match.sets) {
                if (set.weight > maxWeight) {
                    maxWeight = set.weight;
                    maxReps = set.reps;
                }
                const volume = set.weight * set.reps;
                if (volume > maxVolume) maxVolume = volume;
            }
        }

        return maxWeight > 0 ? { weight: maxWeight, reps: maxReps, volume: maxVolume } : null;
    }, [gymData.sessions]);

    // Get history (recent sessions)
    const getHistory = useCallback((limit = 20) => {
        return gymData.sessions.slice(0, limit);
    }, [gymData.sessions]);

    // Get all unique exercises that have been logged
    const getLoggedExercises = useCallback(() => {
        const map = new Map();
        for (const session of gymData.sessions) {
            for (const ex of session.exercises) {
                if (!map.has(ex.exerciseId)) {
                    map.set(ex.exerciseId, { ...ex, sessionCount: 1 });
                } else {
                    map.get(ex.exerciseId).sessionCount++;
                }
            }
        }
        return Array.from(map.values());
    }, [gymData.sessions]);

    return {
        activeWorkout: gymData.activeWorkout,
        sessions: gymData.sessions,
        startWorkout,
        addExerciseToWorkout,
        addSet,
        removeSet,
        removeExercise,
        finishWorkout,
        cancelWorkout,
        getLastSession,
        getPersonalRecord,
        getHistory,
        getLoggedExercises,
    };
}
