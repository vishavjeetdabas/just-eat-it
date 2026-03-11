// Diet Plan — Defaults & Utilities
// Profile/macros are now dynamic and stored in user settings.
// These constants serve as DEFAULTS for onboarding.

export const DEFAULT_PROFILE = {
    name: '',
    weight: 80,
    height: 175,
    age: 22,
    goal: 'recomp', // cut | bulk | recomp | maintain
    trainingDaysPerWeek: 5,
    targetCals: 2500,
    restDayCals: 2200,
};

// Calculate macros from profile data
export function calculateMacros(profile) {
    const { weight, goal, targetCals, restDayCals } = profile;
    const proteinPerKg = goal === 'cut' ? 2.4 : goal === 'bulk' ? 2.0 : 2.2;
    const protein = Math.round(weight * proteinPerKg);
    const proteinCals = protein * 4;

    // Training day
    const trainingFatCals = Math.round(targetCals * 0.25);
    const trainingFat = Math.round(trainingFatCals / 9);
    const trainingCarbCals = targetCals - proteinCals - trainingFatCals;
    const trainingCarbs = Math.round(trainingCarbCals / 4);

    // Rest day
    const restFatCals = Math.round(restDayCals * 0.25);
    const restFat = Math.round(restFatCals / 9);
    const restCarbCals = restDayCals - proteinCals - restFatCals;
    const restCarbs = Math.round(restCarbCals / 4);

    return {
        training: { protein, carbs: Math.max(0, trainingCarbs), fats: trainingFat, calories: targetCals },
        rest: { protein, carbs: Math.max(0, restCarbs), fats: restFat, calories: restDayCals },
    };
}

// Estimate TDEE (Mifflin-St Jeor)
export function estimateTDEE(weight, height, age, trainingDaysPerWeek) {
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5; // male formula
    const activityMultiplier = trainingDaysPerWeek >= 5 ? 1.55 : trainingDaysPerWeek >= 3 ? 1.45 : 1.35;
    return Math.round(bmr * activityMultiplier);
}

// Suggest calorie targets based on goal
export function suggestCalories(tdee, goal) {
    switch (goal) {
        case 'cut': return { targetCals: Math.round(tdee - 500), restDayCals: Math.round(tdee - 700) };
        case 'bulk': return { targetCals: Math.round(tdee + 300), restDayCals: Math.round(tdee + 100) };
        case 'maintain': return { targetCals: tdee, restDayCals: Math.round(tdee - 100) };
        case 'recomp':
        default: return { targetCals: Math.round(tdee - 300), restDayCals: Math.round(tdee - 500) };
    }
}

export const MEALS = {
    training: [
        {
            id: 1,
            name: 'Morning Fuel',
            time: '8:00 – 8:30 AM',
            prepTime: '5-7 min',
            emoji: '🌅',
            macros: { protein: 74, carbs: 90, fats: 28, calories: 818 },
            items: [
                { name: '4 Egg Whites + 2 Whole Eggs', qty: '6 eggs', protein: 26, calories: 208, tip: 'Boil or scramble' },
                { name: 'Atom Whey Protein Shake', qty: '1 scoop / 300ml water', protein: 27, calories: 120, tip: '30 seconds' },
                { name: 'Rolled Oats', qty: '80g dry in milk', protein: 10, calories: 300, tip: '5 min microwave' },
                { name: 'Full-fat Milk', qty: '200ml (for oats)', protein: 7, calories: 130, tip: 'Already in oats' },
                { name: 'Banana', qty: '1 medium', protein: 1, calories: 90, tip: 'No prep' },
                { name: 'ON Creatine', qty: '5g in water', protein: 0, calories: 0, tip: '30 seconds' },
            ],
        },
        {
            id: 2,
            name: 'Lunch Power',
            time: '1:00 – 2:00 PM',
            prepTime: '10-15 min',
            emoji: '🍛',
            macros: { protein: 43, carbs: 95, fats: 28, calories: 828 },
            items: [
                { name: 'Roti (wheat flour)', qty: '3 medium rotis', protein: 9, calories: 300, tip: '5 min / buy ready-made' },
                { name: 'Normal Paneer', qty: '120g', protein: 22, calories: 318, tip: '2 min to heat up' },
                { name: 'Dal / Rajma / Chana', qty: '1 katori (150g)', protein: 8, calories: 150, tip: 'Batch cook' },
                { name: 'Curd (plain)', qty: '100g', protein: 4, calories: 60, tip: 'No prep' },
            ],
        },
        {
            id: 3,
            name: 'Pre-Workout',
            time: '4:30 – 5:00 PM',
            prepTime: '0 min',
            emoji: '⚡',
            macros: { protein: 10, carbs: 55, fats: 16, calories: 368 },
            items: [
                { name: 'Banana', qty: '2 medium', protein: 2, calories: 180, tip: 'No prep' },
                { name: 'Peanut Butter', qty: '2 tbsp (30g)', protein: 8, calories: 188, tip: 'No prep' },
            ],
        },
        {
            id: 4,
            name: 'Post-Workout',
            time: '8:30 – 9:30 PM',
            prepTime: '5-7 min',
            emoji: '💪',
            macros: { protein: 67, carbs: 65, fats: 22, calories: 632 },
            items: [
                { name: '4 Egg Whites + 2 Whole Eggs', qty: '6 eggs', protein: 26, calories: 208, tip: 'Boil/scramble — 5 min' },
                { name: 'Atom Whey Protein Shake', qty: '1 scoop / 300ml water', protein: 27, calories: 120, tip: '30 seconds — drink FIRST' },
                { name: 'Roti', qty: '2 medium rotis', protein: 6, calories: 200, tip: '5 min / ready-made' },
                { name: 'Dal / Sabzi (from batch)', qty: '1 katori', protein: 8, calories: 104, tip: 'Reheat 1 min' },
            ],
        },
    ],
    rest: [
        {
            id: 1,
            name: 'Morning Fuel',
            time: '8:00 – 8:30 AM',
            prepTime: '5-7 min',
            emoji: '🌅',
            macros: { protein: 74, carbs: 90, fats: 28, calories: 818 },
            items: [
                { name: '4 Egg Whites + 2 Whole Eggs', qty: '6 eggs', protein: 26, calories: 208, tip: 'Boil or scramble' },
                { name: 'Atom Whey Protein Shake', qty: '1 scoop / 300ml water', protein: 27, calories: 120, tip: '30 seconds' },
                { name: 'Rolled Oats', qty: '80g dry in milk', protein: 10, calories: 300, tip: '5 min microwave' },
                { name: 'Full-fat Milk', qty: '200ml (for oats)', protein: 7, calories: 130, tip: 'Already in oats' },
                { name: 'Banana', qty: '1 medium', protein: 1, calories: 90, tip: 'No prep' },
                { name: 'ON Creatine', qty: '5g in water', protein: 0, calories: 0, tip: '30 seconds' },
            ],
        },
        {
            id: 2,
            name: 'Lunch Power',
            time: '1:00 – 2:00 PM',
            prepTime: '10-15 min',
            emoji: '🍛',
            macros: { protein: 39, carbs: 75, fats: 22, calories: 628 },
            items: [
                { name: 'Roti (wheat flour)', qty: '2 medium rotis', protein: 6, calories: 200, tip: 'Reduced from 3' },
                { name: 'Normal Paneer', qty: '120g', protein: 22, calories: 318, tip: '2 min to heat up' },
                { name: 'Dal / Rajma / Chana', qty: '1 katori (150g)', protein: 8, calories: 150, tip: 'Batch cook' },
                { name: 'Curd (plain)', qty: '100g', protein: 4, calories: 60, tip: 'No prep' },
            ],
        },
        {
            id: 4,
            name: 'Post-Workout Recovery',
            time: '8:30 – 9:30 PM',
            prepTime: '5-7 min',
            emoji: '💪',
            macros: { protein: 67, carbs: 65, fats: 22, calories: 632 },
            items: [
                { name: '4 Egg Whites + 2 Whole Eggs', qty: '6 eggs', protein: 26, calories: 208, tip: 'Boil/scramble — 5 min' },
                { name: 'Atom Whey Protein Shake', qty: '1 scoop / 300ml water', protein: 27, calories: 120, tip: '30 seconds' },
                { name: 'Roti', qty: '2 medium rotis', protein: 6, calories: 200, tip: '5 min / ready-made' },
                { name: 'Dal / Sabzi (from batch)', qty: '1 katori', protein: 8, calories: 104, tip: 'Reheat 1 min' },
            ],
        },
    ],
};

export const SUPPLEMENTS = [
    { name: 'Atom Whey (Morning)', dose: '1 scoop', when: 'With Meal 1' },
    { name: 'Atom Whey (Post-WO)', dose: '1 scoop', when: 'Within 30 min post-workout' },
    { name: 'ON Creatine', dose: '5g', when: 'Morning with Meal 1 daily' },
    { name: 'Water', dose: '3.5-4 litres', when: 'Throughout day' },
];

export const SCHEDULE = [
    { time: '8:00 AM', action: 'Meal 1', detail: 'Eggs + Whey + Oats + Banana | Creatine' },
    { time: '1:00 PM', action: 'Meal 2 — Lunch', detail: '3 Rotis + Paneer + Dal + Curd' },
    { time: '4:30 PM', action: 'Meal 3 — Pre-WO', detail: '2 Bananas + PB (1.5 hrs before gym)' },
    { time: '6:00 PM', action: 'GYM', detail: 'Train. Min 1L water during session' },
    { time: '8:30 PM', action: 'Meal 4 — Post-WO', detail: 'Whey FIRST, then Eggs + Rotis + Dal' },
    { time: '10:30 PM', action: 'Sleep', detail: '7-8 hrs minimum' },
];

export const WORKOUT_TYPES = [
    { id: 'push', name: 'Push', emoji: '🏋️', calsPerMin: 6.5 },
    { id: 'pull', name: 'Pull', emoji: '💪', calsPerMin: 6.0 },
    { id: 'legs', name: 'Legs', emoji: '🦵', calsPerMin: 7.0 },
    { id: 'cardio', name: 'Cardio', emoji: '🏃', calsPerMin: 8.0 },
    { id: 'abs', name: 'Abs/Core', emoji: '🧘', calsPerMin: 5.0 },
];

export const WATER_GOAL = 8; // glasses of 500ml = 4L
export const SLEEP_GOAL = { min: 7, max: 8 };

export function formatDateKeyLocal(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function getDateKey(date = new Date()) {
    return formatDateKeyLocal(date);
}

export function getDayName(date = new Date()) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function isDefaultRestDay(date = new Date()) {
    return date.getDay() === 0; // Sunday
}
