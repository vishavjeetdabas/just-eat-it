import { useState } from 'react';
import { DEFAULT_PROFILE, MEALS as DEFAULT_MEALS, estimateTDEE, suggestCalories, calculateMacros } from '../data/dietPlan';
import './Onboarding.css';

const GOALS = [
    { id: 'cut', label: 'Cut', emoji: '🔥', desc: 'Lose fat, keep muscle' },
    { id: 'bulk', label: 'Bulk', emoji: '💪', desc: 'Build muscle, gain size' },
    { id: 'recomp', label: 'Recomp', emoji: '⚡', desc: 'Build muscle, lose fat' },
    { id: 'maintain', label: 'Maintain', emoji: '🛡️', desc: 'Stay where you are' },
];

const TOTAL_STEPS = 6;

function createBlankMeal() {
    return {
        id: Date.now(),
        name: '',
        time: '',
        prepTime: '',
        emoji: '🍽️',
        macros: { protein: 0, carbs: 0, fats: 0, calories: 0 },
        items: [],
    };
}

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState({ ...DEFAULT_PROFILE });
    const [direction, setDirection] = useState('forward');
    const [customMeals, setCustomMeals] = useState(null); // null = use defaults
    const [useDefaultMeals, setUseDefaultMeals] = useState(true);

    const tdee = estimateTDEE(profile.weight, profile.height, profile.age, profile.trainingDaysPerWeek);
    const suggested = suggestCalories(tdee, profile.goal);
    const macros = calculateMacros({ ...profile, targetCals: profile.targetCals || suggested.targetCals, restDayCals: profile.restDayCals || suggested.restDayCals });

    const goNext = () => {
        if (step === 2) {
            setProfile(p => ({
                ...p,
                targetCals: suggestCalories(estimateTDEE(p.weight, p.height, p.age, p.trainingDaysPerWeek), p.goal).targetCals,
                restDayCals: suggestCalories(estimateTDEE(p.weight, p.height, p.age, p.trainingDaysPerWeek), p.goal).restDayCals,
            }));
        }
        setDirection('forward');
        setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    };

    const goBack = () => {
        setDirection('back');
        setStep(s => Math.max(s - 1, 0));
    };

    const handleFinish = () => {
        const finalProfile = {
            ...profile,
            targetCals: profile.targetCals || suggested.targetCals,
            restDayCals: profile.restDayCals || suggested.restDayCals,
        };
        onComplete(finalProfile, useDefaultMeals ? null : customMeals);
    };

    const canProceed = () => {
        switch (step) {
            case 0: return profile.name.trim().length > 0;
            case 1: return profile.weight > 0 && profile.height > 0 && profile.age > 0;
            case 2: return !!profile.goal;
            case 3: return profile.targetCals > 0;
            case 4: return true; // diet plan step — always can proceed
            case 5: return true;
            default: return true;
        }
    };

    const initCustomMeals = () => {
        setUseDefaultMeals(false);
        setCustomMeals({
            training: [createBlankMeal()],
            rest: [createBlankMeal()],
        });
    };

    const addMealToType = (type) => {
        setCustomMeals(prev => ({
            ...prev,
            [type]: [...prev[type], createBlankMeal()],
        }));
    };

    const updateMealField = (type, index, field, value) => {
        setCustomMeals(prev => ({
            ...prev,
            [type]: prev[type].map((m, i) => i === index ? { ...m, [field]: value } : m),
        }));
    };

    const removeMeal = (type, index) => {
        setCustomMeals(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index),
        }));
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="onboard-step" key="step-0">
                        <div className="onboard-emoji">👋</div>
                        <h2 className="text-title">What's your name?</h2>
                        <p className="text-caption onboard-sub">Let's personalize your experience</p>
                        <input
                            type="text"
                            className="onboard-input"
                            placeholder="Enter your name"
                            value={profile.name}
                            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                            autoFocus
                        />
                    </div>
                );

            case 1:
                return (
                    <div className="onboard-step" key="step-1">
                        <div className="onboard-emoji">📏</div>
                        <h2 className="text-title">Your Stats</h2>
                        <p className="text-caption onboard-sub">We'll use this to calculate your targets</p>
                        <div className="onboard-stats-grid">
                            <div className="onboard-stat-field">
                                <label className="text-micro">Weight (kg)</label>
                                <input type="number" className="onboard-input" value={profile.weight || ''} onChange={e => setProfile(p => ({ ...p, weight: Number(e.target.value) }))} placeholder="80" min="30" max="300" />
                            </div>
                            <div className="onboard-stat-field">
                                <label className="text-micro">Height (cm)</label>
                                <input type="number" className="onboard-input" value={profile.height || ''} onChange={e => setProfile(p => ({ ...p, height: Number(e.target.value) }))} placeholder="175" min="100" max="250" />
                            </div>
                            <div className="onboard-stat-field">
                                <label className="text-micro">Age</label>
                                <input type="number" className="onboard-input" value={profile.age || ''} onChange={e => setProfile(p => ({ ...p, age: Number(e.target.value) }))} placeholder="22" min="10" max="100" />
                            </div>
                            <div className="onboard-stat-field">
                                <label className="text-micro">Training days/week</label>
                                <input type="number" className="onboard-input" value={profile.trainingDaysPerWeek || ''} onChange={e => setProfile(p => ({ ...p, trainingDaysPerWeek: Number(e.target.value) }))} placeholder="5" min="1" max="7" />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="onboard-step" key="step-2">
                        <div className="onboard-emoji">🎯</div>
                        <h2 className="text-title">Your Goal</h2>
                        <p className="text-caption onboard-sub">What are you training for?</p>
                        <div className="onboard-goal-grid">
                            {GOALS.map(g => (
                                <button
                                    key={g.id}
                                    type="button"
                                    className={`onboard-goal-card${profile.goal === g.id ? ' selected' : ''}`}
                                    onClick={() => setProfile(p => ({ ...p, goal: g.id }))}
                                >
                                    <span className="goal-emoji">{g.emoji}</span>
                                    <span className="goal-label">{g.label}</span>
                                    <span className="goal-desc">{g.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="onboard-step" key="step-3">
                        <div className="onboard-emoji">🔢</div>
                        <h2 className="text-title">Daily Calories</h2>
                        <p className="text-caption onboard-sub">
                            Your estimated TDEE is <strong>{tdee} kcal</strong>. We suggest these targets:
                        </p>
                        <div className="onboard-stats-grid">
                            <div className="onboard-stat-field">
                                <label className="text-micro">Training Day</label>
                                <input type="number" className="onboard-input" value={profile.targetCals || suggested.targetCals} onChange={e => setProfile(p => ({ ...p, targetCals: Number(e.target.value) }))} min="1000" max="6000" />
                            </div>
                            <div className="onboard-stat-field">
                                <label className="text-micro">Rest Day</label>
                                <input type="number" className="onboard-input" value={profile.restDayCals || suggested.restDayCals} onChange={e => setProfile(p => ({ ...p, restDayCals: Number(e.target.value) }))} min="1000" max="6000" />
                            </div>
                        </div>
                        <div className="onboard-hint glass-card">
                            <p className="text-micro">💡 Tip: These are editable later in Settings.</p>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="onboard-step" key="step-4">
                        <div className="onboard-emoji">🍽️</div>
                        <h2 className="text-title">Diet Plan</h2>
                        <p className="text-caption onboard-sub">Set up your daily meals or use our suggested plan</p>

                        <div className="diet-choice-row">
                            <button
                                type="button"
                                className={`onboard-goal-card${useDefaultMeals ? ' selected' : ''}`}
                                onClick={() => { setUseDefaultMeals(true); setCustomMeals(null); }}
                            >
                                <span className="goal-emoji">✨</span>
                                <span className="goal-label">Use Default Plan</span>
                                <span className="goal-desc">Pre-built 4-meal Indian diet</span>
                            </button>
                            <button
                                type="button"
                                className={`onboard-goal-card${!useDefaultMeals ? ' selected' : ''}`}
                                onClick={initCustomMeals}
                            >
                                <span className="goal-emoji">✏️</span>
                                <span className="goal-label">Custom Plan</span>
                                <span className="goal-desc">Enter your own meals</span>
                            </button>
                        </div>

                        {!useDefaultMeals && customMeals && (
                            <div className="custom-meals-section">
                                <h3 className="text-body fw-600 mb-8">Training Day Meals</h3>
                                {customMeals.training.map((meal, i) => (
                                    <div key={meal.id} className="mini-meal-card glass-card">
                                        <div className="mini-meal-header">
                                            <span className="text-micro">Meal {i + 1}</span>
                                            {customMeals.training.length > 1 && (
                                                <button type="button" className="mini-meal-remove" onClick={() => removeMeal('training', i)}>✕</button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            className="onboard-input mini"
                                            placeholder="Meal name (e.g. Breakfast)"
                                            value={meal.name}
                                            onChange={e => updateMealField('training', i, 'name', e.target.value)}
                                        />
                                        <div className="mini-macro-row">
                                            <input type="number" className="onboard-input tiny" placeholder="Cals" value={meal.macros.calories || ''} onChange={e => updateMealField('training', i, 'macros', { ...meal.macros, calories: Number(e.target.value) })} />
                                            <input type="number" className="onboard-input tiny" placeholder="P" value={meal.macros.protein || ''} onChange={e => updateMealField('training', i, 'macros', { ...meal.macros, protein: Number(e.target.value) })} />
                                            <input type="number" className="onboard-input tiny" placeholder="C" value={meal.macros.carbs || ''} onChange={e => updateMealField('training', i, 'macros', { ...meal.macros, carbs: Number(e.target.value) })} />
                                            <input type="number" className="onboard-input tiny" placeholder="F" value={meal.macros.fats || ''} onChange={e => updateMealField('training', i, 'macros', { ...meal.macros, fats: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-meal-btn" onClick={() => addMealToType('training')}>+ Add Meal</button>

                                <h3 className="text-body fw-600 mb-8 mt-16">Rest Day Meals</h3>
                                {customMeals.rest.map((meal, i) => (
                                    <div key={meal.id} className="mini-meal-card glass-card">
                                        <div className="mini-meal-header">
                                            <span className="text-micro">Meal {i + 1}</span>
                                            {customMeals.rest.length > 1 && (
                                                <button type="button" className="mini-meal-remove" onClick={() => removeMeal('rest', i)}>✕</button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            className="onboard-input mini"
                                            placeholder="Meal name"
                                            value={meal.name}
                                            onChange={e => updateMealField('rest', i, 'name', e.target.value)}
                                        />
                                        <div className="mini-macro-row">
                                            <input type="number" className="onboard-input tiny" placeholder="Cals" value={meal.macros.calories || ''} onChange={e => updateMealField('rest', i, 'macros', { ...meal.macros, calories: Number(e.target.value) })} />
                                            <input type="number" className="onboard-input tiny" placeholder="P" value={meal.macros.protein || ''} onChange={e => updateMealField('rest', i, 'macros', { ...meal.macros, protein: Number(e.target.value) })} />
                                            <input type="number" className="onboard-input tiny" placeholder="C" value={meal.macros.carbs || ''} onChange={e => updateMealField('rest', i, 'macros', { ...meal.macros, carbs: Number(e.target.value) })} />
                                            <input type="number" className="onboard-input tiny" placeholder="F" value={meal.macros.fats || ''} onChange={e => updateMealField('rest', i, 'macros', { ...meal.macros, fats: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-meal-btn" onClick={() => addMealToType('rest')}>+ Add Meal</button>
                            </div>
                        )}

                        {useDefaultMeals && (
                            <div className="default-meals-preview">
                                <div className="onboard-hint glass-card">
                                    <p className="text-micro">📋 Default plan: 4 training meals + 3 rest day meals. You can always customize later in Settings.</p>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 5: {
                const finalTarget = profile.targetCals || suggested.targetCals;
                const finalRest = profile.restDayCals || suggested.restDayCals;
                const finalMacros = calculateMacros({ ...profile, targetCals: finalTarget, restDayCals: finalRest });
                return (
                    <div className="onboard-step" key="step-5">
                        <div className="onboard-emoji">🚀</div>
                        <h2 className="text-title">You're All Set!</h2>
                        <p className="text-caption onboard-sub">Here's your personalized plan, {profile.name}</p>
                        <div className="onboard-summary glass-card">
                            <div className="summary-row">
                                <span className="text-caption">Goal</span>
                                <span className="text-body fw-600">{GOALS.find(g => g.id === profile.goal)?.emoji} {GOALS.find(g => g.id === profile.goal)?.label}</span>
                            </div>
                            <div className="summary-row">
                                <span className="text-caption">Training Day</span>
                                <span className="text-body fw-600">{finalTarget} kcal</span>
                            </div>
                            <div className="summary-row">
                                <span className="text-caption">Rest Day</span>
                                <span className="text-body fw-600">{finalRest} kcal</span>
                            </div>
                            <div className="summary-row">
                                <span className="text-caption">Diet Plan</span>
                                <span className="text-body fw-600">{useDefaultMeals ? '📋 Default' : '✏️ Custom'}</span>
                            </div>
                            <hr className="summary-divider" />
                            <div className="summary-row">
                                <span className="text-caption">Protein</span>
                                <span className="text-body fw-600">{finalMacros.training.protein}g</span>
                            </div>
                            <div className="summary-row">
                                <span className="text-caption">Carbs (train/rest)</span>
                                <span className="text-body fw-600">{finalMacros.training.carbs}g / {finalMacros.rest.carbs}g</span>
                            </div>
                            <div className="summary-row">
                                <span className="text-caption">Fats (train/rest)</span>
                                <span className="text-body fw-600">{finalMacros.training.fats}g / {finalMacros.rest.fats}g</span>
                            </div>
                        </div>
                    </div>
                );
            }
            default: return null;
        }
    };

    return (
        <div className="onboard-container">
            <div className="onboard-progress">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div key={i} className={`onboard-dot${i === step ? ' active' : i < step ? ' done' : ''}`} />
                ))}
            </div>

            <div className={`onboard-content animate-slide-${direction}`} key={step}>
                {renderStep()}
            </div>

            <div className="onboard-nav">
                {step > 0 ? (
                    <button type="button" className="btn btn-secondary onboard-back-btn" onClick={goBack}>
                        Back
                    </button>
                ) : <div />}

                {step < TOTAL_STEPS - 1 ? (
                    <button
                        type="button"
                        className="btn btn-primary onboard-next-btn"
                        onClick={goNext}
                        disabled={!canProceed()}
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn btn-primary onboard-next-btn glow-btn"
                        onClick={handleFinish}
                    >
                        Let's Go! 🚀
                    </button>
                )}
            </div>
        </div>
    );
}
