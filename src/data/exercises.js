// Pre-built exercise library organized by muscle group
// Each exercise has: id, name, category, emoji

export const EXERCISE_CATEGORIES = [
    { id: 'chest', name: 'Chest', emoji: '🫁' },
    { id: 'back', name: 'Back', emoji: '🔙' },
    { id: 'shoulders', name: 'Shoulders', emoji: '🤷' },
    { id: 'arms', name: 'Arms', emoji: '💪' },
    { id: 'legs', name: 'Legs', emoji: '🦵' },
    { id: 'core', name: 'Core', emoji: '🧘' },
    { id: 'cardio', name: 'Cardio', emoji: '🏃' },
];

export const EXERCISES = [
    // Chest
    { id: 'flat-bench-press', name: 'Flat Bench Press', category: 'chest', emoji: '🏋️' },
    { id: 'incline-bench-press', name: 'Incline Bench Press', category: 'chest', emoji: '🏋️' },
    { id: 'decline-bench-press', name: 'Decline Bench Press', category: 'chest', emoji: '🏋️' },
    { id: 'dumbbell-press', name: 'Dumbbell Press', category: 'chest', emoji: '🏋️' },
    { id: 'incline-dumbbell-press', name: 'Incline DB Press', category: 'chest', emoji: '🏋️' },
    { id: 'chest-fly', name: 'Chest Fly', category: 'chest', emoji: '🦅' },
    { id: 'cable-crossover', name: 'Cable Crossover', category: 'chest', emoji: '🔗' },
    { id: 'push-ups', name: 'Push Ups', category: 'chest', emoji: '🤸' },
    { id: 'pec-deck', name: 'Pec Deck', category: 'chest', emoji: '🏋️' },

    // Back
    { id: 'deadlift', name: 'Deadlift', category: 'back', emoji: '🏋️' },
    { id: 'barbell-row', name: 'Barbell Row', category: 'back', emoji: '🏋️' },
    { id: 'dumbbell-row', name: 'Dumbbell Row', category: 'back', emoji: '🏋️' },
    { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'back', emoji: '⬇️' },
    { id: 'pull-ups', name: 'Pull Ups', category: 'back', emoji: '🤸' },
    { id: 'chin-ups', name: 'Chin Ups', category: 'back', emoji: '🤸' },
    { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'back', emoji: '🔗' },
    { id: 't-bar-row', name: 'T-Bar Row', category: 'back', emoji: '🏋️' },
    { id: 'face-pulls', name: 'Face Pulls', category: 'back', emoji: '🔗' },

    // Shoulders
    { id: 'overhead-press', name: 'Overhead Press', category: 'shoulders', emoji: '🏋️' },
    { id: 'dumbbell-shoulder-press', name: 'DB Shoulder Press', category: 'shoulders', emoji: '🏋️' },
    { id: 'lateral-raises', name: 'Lateral Raises', category: 'shoulders', emoji: '🏋️' },
    { id: 'front-raises', name: 'Front Raises', category: 'shoulders', emoji: '🏋️' },
    { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'shoulders', emoji: '🦅' },
    { id: 'arnold-press', name: 'Arnold Press', category: 'shoulders', emoji: '🏋️' },
    { id: 'shrugs', name: 'Shrugs', category: 'shoulders', emoji: '🤷' },

    // Arms
    { id: 'barbell-curl', name: 'Barbell Curl', category: 'arms', emoji: '💪' },
    { id: 'dumbbell-curl', name: 'Dumbbell Curl', category: 'arms', emoji: '💪' },
    { id: 'hammer-curl', name: 'Hammer Curl', category: 'arms', emoji: '🔨' },
    { id: 'preacher-curl', name: 'Preacher Curl', category: 'arms', emoji: '💪' },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'arms', emoji: '⬇️' },
    { id: 'skull-crushers', name: 'Skull Crushers', category: 'arms', emoji: '💀' },
    { id: 'tricep-dips', name: 'Tricep Dips', category: 'arms', emoji: '🤸' },
    { id: 'overhead-extension', name: 'Overhead Extension', category: 'arms', emoji: '🏋️' },
    { id: 'concentration-curl', name: 'Concentration Curl', category: 'arms', emoji: '💪' },

    // Legs
    { id: 'barbell-squat', name: 'Barbell Squat', category: 'legs', emoji: '🏋️' },
    { id: 'leg-press', name: 'Leg Press', category: 'legs', emoji: '🦵' },
    { id: 'front-squat', name: 'Front Squat', category: 'legs', emoji: '🏋️' },
    { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs', emoji: '🏋️' },
    { id: 'lunges', name: 'Lunges', category: 'legs', emoji: '🚶' },
    { id: 'leg-extension', name: 'Leg Extension', category: 'legs', emoji: '🦵' },
    { id: 'leg-curl', name: 'Leg Curl', category: 'legs', emoji: '🦵' },
    { id: 'calf-raises', name: 'Calf Raises', category: 'legs', emoji: '🦵' },
    { id: 'hip-thrust', name: 'Hip Thrust', category: 'legs', emoji: '🏋️' },
    { id: 'hack-squat', name: 'Hack Squat', category: 'legs', emoji: '🏋️' },
    { id: 'bulgarian-split', name: 'Bulgarian Split Squat', category: 'legs', emoji: '🏋️' },

    // Core
    { id: 'crunches', name: 'Crunches', category: 'core', emoji: '🧘' },
    { id: 'plank', name: 'Plank', category: 'core', emoji: '🧘' },
    { id: 'russian-twist', name: 'Russian Twist', category: 'core', emoji: '🌀' },
    { id: 'leg-raises', name: 'Leg Raises', category: 'core', emoji: '🦵' },
    { id: 'cable-crunch', name: 'Cable Crunch', category: 'core', emoji: '🔗' },
    { id: 'ab-wheel', name: 'Ab Wheel', category: 'core', emoji: '🎡' },
    { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', category: 'core', emoji: '🤸' },

    // Cardio
    { id: 'treadmill', name: 'Treadmill', category: 'cardio', emoji: '🏃' },
    { id: 'cycling', name: 'Cycling', category: 'cardio', emoji: '🚴' },
    { id: 'stairmaster', name: 'Stairmaster', category: 'cardio', emoji: '🪜' },
    { id: 'rowing', name: 'Rowing', category: 'cardio', emoji: '🚣' },
    { id: 'jump-rope', name: 'Jump Rope', category: 'cardio', emoji: '🪢' },
];

export function searchExercises(query) {
    if (!query || query.trim().length === 0) return EXERCISES;
    const q = query.toLowerCase().trim();
    return EXERCISES.filter(e =>
        e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    );
}

export function getExercisesByCategory(categoryId) {
    return EXERCISES.filter(e => e.category === categoryId);
}

export function getExerciseById(id) {
    return EXERCISES.find(e => e.id === id) || null;
}
