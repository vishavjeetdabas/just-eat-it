import { useState, useMemo, useEffect } from 'react';
import ProgressRing from '../components/ProgressRing';
import { WATER_GOAL, getDateKey, getDayName, calculateMacros } from '../data/dietPlan';
import { createEmptyDay, calculateStreak, getActiveMeals } from '../hooks/useAppData';
import './Dashboard.css';

export default function Dashboard({ data, updateDayField }) {
    const today = getDateKey();
    const dayName = getDayName();
    const dayData = data.days[today] || createEmptyDay(today);
    const isTraining = dayData.isTrainingDay;
    const activeMeals = getActiveMeals(data.settings);
    const meals = isTraining ? activeMeals.training : activeMeals.rest;
    const profile = data.settings.profile;
    const computedMacros = calculateMacros(profile);
    const macros = isTraining ? computedMacros.training : computedMacros.rest;
    const [expandedMeal, setExpandedMeal] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [pulsingMeal, setPulsingMeal] = useState(null);

    const streak = useMemo(() => calculateStreak(data.days), [data.days]);

    const consumedMacros = useMemo(() => {
        const result = { protein: 0, carbs: 0, fats: 0, calories: 0 };
        dayData.meals.forEach((checked, i) => {
            if (checked && meals[i]) {
                result.protein += meals[i].macros.protein;
                result.carbs += meals[i].macros.carbs;
                result.fats += meals[i].macros.fats;
                result.calories += meals[i].macros.calories;
            }
        });
        return result;
    }, [dayData.meals, meals]);

    const mealsCompleted = dayData.meals.filter(Boolean).length;
    const totalMeals = meals.length;
    const completionPct = Math.round((mealsCompleted / totalMeals) * 100);

    // Fix remaining calories bug
    const allMealsCompleted = mealsCompleted === totalMeals;
    const remaining = allMealsCompleted ? 0 : Math.max(0, macros.calories - consumedMacros.calories);
    const calPct = Math.min(Math.round((consumedMacros.calories / macros.calories) * 100), 100);

    // Celebration toast
    useEffect(() => {
        if (allMealsCompleted && totalMeals > 0) {
            setShowCelebration(true);
            const timer = setTimeout(() => setShowCelebration(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [allMealsCompleted, totalMeals]);

    const toggleMeal = (index) => {
        const newMeals = [...dayData.meals];
        const wasChecked = newMeals[index];
        newMeals[index] = !newMeals[index];
        updateDayField(today, 'meals', newMeals);
        // Trigger pulse animation on check
        if (!wasChecked) {
            setPulsingMeal(index);
            setTimeout(() => setPulsingMeal(null), 600);
        }
    };

    const toggleDayType = () => {
        const hasTrackedMeals = dayData.meals.some(Boolean);
        if (hasTrackedMeals) {
            const confirmed = window.confirm('Switching day type will reset today\'s meal checkmarks. Continue?');
            if (!confirmed) return;
        }
        const newIsTraining = !dayData.isTrainingDay;
        const newMeals = newIsTraining ? [false, false, false, false] : [false, false, false];
        updateDayField(today, 'isTrainingDay', newIsTraining);
        updateDayField(today, 'meals', newMeals);
        setExpandedMeal(null);
    };

    const addWater = () => {
        if (dayData.water < WATER_GOAL) {
            updateDayField(today, 'water', dayData.water + 1);
        }
    };

    const removeWater = () => {
        if (dayData.water > 0) {
            updateDayField(today, 'water', dayData.water - 1);
        }
    };

    const updateSleep = (hours) => {
        if (hours === '') {
            updateDayField(today, 'sleep', null);
            return;
        }
        updateDayField(today, 'sleep', { hours: parseFloat(hours) || 0 });
    };

    const needsEggPrep = (() => {
        const last = data.settings.lastEggPrep;
        if (!last) return true;
        const todayDate = new Date(`${today}T12:00:00`);
        const lastPrepDate = new Date(`${last}T12:00:00`);
        const diff = (todayDate - lastPrepDate) / (1000 * 60 * 60 * 24);
        return diff >= 2;
    })();

    const needsDalPrep = new Date().getDay() === 0;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="page dashboard">
            {/* Celebration Toast */}
            {showCelebration && (
                <div className="celebration-toast">
                    <div className="celebration-inner">
                        <span className="celebration-emoji">🔥</span>
                        <div>
                            <p className="celebration-title">Perfect Day!</p>
                            <p className="celebration-sub">All meals completed. Great discipline today.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Greeting + 7. Today Progress Badge */}
            <div className="dash-header animate-in">
                <div className="row-between">
                    <div>
                        <p className="text-micro">{dayName}</p>
                        <h1 className="text-title mt-4">{greeting}, {profile.name || 'Champion'}</h1>
                    </div>
                    <div className="header-avatar">
                        <img src="/logo.png" alt="Just Eat It" className="header-logo" />
                    </div>
                </div>
                {/* Progress badge */}
                <div className="progress-badge">
                    <span className="badge-fire">🔥</span>
                    <span className="badge-text">{mealsCompleted}/{totalMeals} meals completed</span>
                </div>
            </div>

            {/* Prep Reminders */}
            {(needsEggPrep || needsDalPrep) && (
                <div className="prep-banner glass-card animate-in animate-delay-1">
                    {needsEggPrep && <div className="prep-item">🥚 <strong>Hard-boil eggs today!</strong> <span className="text-caption">12 eggs, every 2 days</span></div>}
                    {needsDalPrep && <div className="prep-item">🍛 <strong>Batch cook dal!</strong> <span className="text-caption">Sunday prep — 20 min</span></div>}
                </div>
            )}

            {/* 2. Training / Rest Toggle */}
            <div className="day-toggle-section animate-in animate-delay-1">
                <div className="toggle-container">
                    <button
                        type="button"
                        className={`toggle-option${isTraining ? ' active' : ''}`}
                        onClick={() => !isTraining && toggleDayType()}
                    >
                        Training Day
                    </button>
                    <button
                        type="button"
                        className={`toggle-option${!isTraining ? ' active' : ''}`}
                        onClick={() => isTraining && toggleDayType()}
                    >
                        Rest Day
                    </button>
                </div>
            </div>

            {/* 3. Daily Progress Rings — Apple Fitness Centerpiece */}
            <div className="rings-section glass-card glow animate-in animate-delay-2">
                <div className="rings-row">
                    <div className="ring-item">
                        <ProgressRing
                            value={consumedMacros.protein}
                            max={macros.protein}
                            size={100}
                            strokeWidth={10}
                            color="var(--ring-protein)"
                            sublabel="protein"
                            gradientId="proteinGrad"
                            gradientColors={['#FF6B00', '#FF8F2B']}
                        />
                        <span className="ring-grams">{consumedMacros.protein}<span className="ring-grams-unit"> / {macros.protein}g</span></span>
                    </div>
                    <div className="ring-item">
                        <ProgressRing
                            value={consumedMacros.carbs}
                            max={macros.carbs}
                            size={100}
                            strokeWidth={10}
                            color="var(--ring-carbs)"
                            sublabel="carbs"
                            gradientId="carbsGrad"
                            gradientColors={['#E0E0E0', '#FFFFFF']}
                        />
                        <span className="ring-grams">{consumedMacros.carbs}<span className="ring-grams-unit"> / {macros.carbs}g</span></span>
                    </div>
                    <div className="ring-item">
                        <ProgressRing
                            value={consumedMacros.fats}
                            max={macros.fats}
                            size={100}
                            strokeWidth={10}
                            color="var(--ring-fats)"
                            sublabel="fats"
                            gradientId="fatsGrad"
                            gradientColors={['#888888', '#AAAAAA']}
                        />
                        <span className="ring-grams">{consumedMacros.fats}<span className="ring-grams-unit"> / {macros.fats}g</span></span>
                    </div>
                </div>
            </div>

            {/* 4. Calories Remaining */}
            <div className="hero-card glass-card animate-in animate-delay-3">
                <p className="text-micro hero-label">Calories Remaining</p>
                <div className="hero-number">
                    <span className="hero-value">{remaining}</span>
                </div>
                <div className="hero-bar-track">
                    <div className="hero-bar-fill" style={{ width: `${Math.min(calPct, 100)}%` }} />
                </div>
                <div className="hero-meta">
                    <span className="text-caption">{consumedMacros.calories} eaten</span>
                    <span className="text-caption">{macros.calories} goal</span>
                </div>
            </div>

            {/* 1. Progress Momentum Bar */}
            <div className="momentum-card glass-card animate-in animate-delay-3">
                <div className="row-between">
                    <span className="text-micro">Daily Completion</span>
                    <span className="momentum-pct">{completionPct}%</span>
                </div>
                <div className="momentum-bar-track">
                    <div className="momentum-bar-fill" style={{ width: `${completionPct}%` }} />
                </div>
                <p className="momentum-label">{mealsCompleted} / {totalMeals} meals completed</p>
            </div>

            {/* 5. Quick Stats */}
            <div className="stats-grid animate-in animate-delay-3">
                <div className="glass-card stat-card">
                    <span className="stat-emoji flame-anim">🔥</span>
                    <span className="stat-value">{streak}</span>
                    <span className="text-micro">streak</span>
                </div>
                <div className="glass-card stat-card water-card">
                    <span className="stat-emoji">💧</span>
                    <span className="stat-value">{dayData.water}<span className="stat-max">/{WATER_GOAL}</span></span>
                    <div className="water-btns">
                        <button
                            type="button"
                            className="water-btn"
                            onClick={removeWater}
                            disabled={dayData.water <= 0}
                            aria-label="Remove one glass of water"
                        >
                            −
                        </button>
                        <button
                            type="button"
                            className="water-btn water-btn-add"
                            onClick={addWater}
                            disabled={dayData.water >= WATER_GOAL}
                            aria-label="Add one glass of water"
                        >
                            +
                        </button>
                    </div>
                    <div className="water-fill" style={{ height: `${(dayData.water / WATER_GOAL) * 100}%` }} />
                </div>
                <div className="glass-card stat-card sleep-card">
                    <span className="stat-emoji">😴</span>
                    <input
                        type="number"
                        className="sleep-input"
                        value={dayData.sleep?.hours || ''}
                        onChange={(e) => updateSleep(e.target.value)}
                        placeholder="0"
                        aria-label="Sleep hours"
                        min="0"
                        max="14"
                        step="0.5"
                    />
                    <span className="text-micro">hours</span>
                </div>
            </div>

            {/* 6. Today's Meals */}
            <div className="meals-section animate-in animate-delay-4">
                <div className="row-between meals-header">
                    <h2 className="text-headline">Today's Meals</h2>
                    <span className="meals-count">{mealsCompleted}/{totalMeals}</span>
                </div>
                <div className="meals-list">
                    {meals.map((meal, index) => (
                        <div
                            key={meal.id}
                            className={[
                                'meal-card glass-card',
                                dayData.meals[index] && 'checked',
                                pulsingMeal === index && 'pulsing',
                            ].filter(Boolean).join(' ')}
                        >
                            <div
                                className="meal-header"
                                role="button"
                                tabIndex={0}
                                aria-expanded={expandedMeal === index}
                                onClick={() => setExpandedMeal(expandedMeal === index ? null : index)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setExpandedMeal(expandedMeal === index ? null : index);
                                    }
                                }}
                            >
                                <div className="meal-info">
                                    <span className="meal-emoji">{meal.emoji}</span>
                                    <div>
                                        <h3 className="meal-name">{meal.name}</h3>
                                        <p className="text-micro">{meal.time}</p>
                                    </div>
                                </div>
                                <div className="meal-actions">
                                    <span className="meal-cals">{meal.macros.calories}</span>
                                    <button
                                        type="button"
                                        className={['check-btn', dayData.meals[index] && 'checked'].filter(Boolean).join(' ')}
                                        onClick={(e) => { e.stopPropagation(); toggleMeal(index); }}
                                        aria-label={`${dayData.meals[index] ? 'Unmark' : 'Mark'} ${meal.name} as completed`}
                                        aria-pressed={dayData.meals[index]}
                                    >
                                        {dayData.meals[index] ? '✓' : ''}
                                    </button>
                                </div>
                            </div>
                            <div className={`meal-details-wrap ${expandedMeal === index ? 'expanded' : ''}`}>
                                <div className="meal-details">
                                    <div className="meal-macros-row">
                                        <span className="macro-pill accent">P {meal.macros.protein}g</span>
                                        <span className="macro-pill">C {meal.macros.carbs}g</span>
                                        <span className="macro-pill dim">F {meal.macros.fats}g</span>
                                    </div>
                                    <div className="meal-items">
                                        {meal.items.map((item, i) => (
                                            <div key={i} className="meal-item">
                                                <div className="meal-item-info">
                                                    <span className="text-body">{item.name}</span>
                                                    <span className="text-caption">{item.qty}</span>
                                                </div>
                                                <div className="meal-item-stats">
                                                    <span className="text-caption text-accent">{item.protein}g P</span>
                                                    <span className="text-caption">{item.calories} kcal</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
