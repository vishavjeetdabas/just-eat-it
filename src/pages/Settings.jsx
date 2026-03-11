import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SCHEDULE, SUPPLEMENTS, MEALS as DEFAULT_MEALS, getDateKey, calculateMacros } from '../data/dietPlan';
import { getActiveMeals } from '../hooks/useAppData';
import './Settings.css';

const GOALS = [
    { id: 'cut', label: 'Cut', emoji: '🔥' },
    { id: 'bulk', label: 'Bulk', emoji: '💪' },
    { id: 'recomp', label: 'Recomp', emoji: '⚡' },
    { id: 'maintain', label: 'Maintain', emoji: '🛡️' },
];

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

export default function Settings({ data, updateSettings, updateProfile, theme, toggleTheme, colorTheme, setColorTheme }) {
    const profile = data.settings.profile;
    const macros = calculateMacros(profile);
    const activeMeals = getActiveMeals(data.settings);
    const isCustomMeals = !!data.settings.customMeals;

    const [showSchedule, setShowSchedule] = useState(false);
    const [showSupplements, setShowSupplements] = useState(false);
    const [showPlan, setShowPlan] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingMeals, setEditingMeals] = useState(false);
    const [editMealType, setEditMealType] = useState('training'); // which meal list we're editing

    // Profile edit state
    const [editName, setEditName] = useState(profile.name);
    const [editWeight, setEditWeight] = useState(profile.weight);
    const [editHeight, setEditHeight] = useState(profile.height);
    const [editAge, setEditAge] = useState(profile.age);
    const [editGoal, setEditGoal] = useState(profile.goal);
    const [editTrainingDays, setEditTrainingDays] = useState(profile.trainingDaysPerWeek);
    const [editTargetCals, setEditTargetCals] = useState(profile.targetCals);
    const [editRestCals, setEditRestCals] = useState(profile.restDayCals);

    // Meals edit state
    const [editMeals, setEditMeals] = useState(null);

    const saveProfile = () => {
        updateProfile({
            name: editName,
            weight: Number(editWeight),
            height: Number(editHeight),
            age: Number(editAge),
            goal: editGoal,
            trainingDaysPerWeek: Number(editTrainingDays),
            targetCals: Number(editTargetCals),
            restDayCals: Number(editRestCals),
        });
        setEditingProfile(false);
    };

    const cancelEdit = () => {
        setEditName(profile.name);
        setEditWeight(profile.weight);
        setEditHeight(profile.height);
        setEditAge(profile.age);
        setEditGoal(profile.goal);
        setEditTrainingDays(profile.trainingDaysPerWeek);
        setEditTargetCals(profile.targetCals);
        setEditRestCals(profile.restDayCals);
        setEditingProfile(false);
    };

    const startEditingMeals = () => {
        // Deep clone current active meals for editing
        setEditMeals(JSON.parse(JSON.stringify(activeMeals)));
        setEditingMeals(true);
    };

    const saveMeals = () => {
        updateSettings({ customMeals: editMeals });
        setEditingMeals(false);
    };

    const cancelMealEdit = () => {
        setEditMeals(null);
        setEditingMeals(false);
    };

    const resetToDefault = () => {
        if (window.confirm('Reset to default meal plan? Your custom meals will be removed.')) {
            updateSettings({ customMeals: null });
            setEditMeals(null);
            setEditingMeals(false);
        }
    };

    const addMeal = (type) => {
        setEditMeals(prev => ({
            ...prev,
            [type]: [...prev[type], createBlankMeal()],
        }));
    };

    const updateMealField = (type, index, field, value) => {
        setEditMeals(prev => ({
            ...prev,
            [type]: prev[type].map((m, i) => i === index ? { ...m, [field]: value } : m),
        }));
    };

    const removeMealItem = (type, index) => {
        setEditMeals(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index),
        }));
    };

    const clearAllData = () => {
        if (window.confirm('⚠️ This will delete ALL your tracking data. Are you absolutely sure?')) {
            localStorage.removeItem('justeatit_data');
            localStorage.removeItem('justeatit_theme');
            window.location.reload();
        }
    };

    const exportData = () => {
        const todayKey = getDateKey();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `justeatit-backup-${todayKey}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const markEggPrep = () => {
        updateSettings({ lastEggPrep: getDateKey() });
    };

    const markDalPrep = () => {
        updateSettings({ lastDalPrep: getDateKey() });
    };

    return (
        <div className="page settings-page">
            <div className="page-header animate-in">
                <h1 className="text-title">Settings</h1>
                <p className="text-caption">Customize your experience</p>
            </div>

            <div className="stack-xl">
                {/* Profile */}
                <div className="glass-card animate-in animate-delay-1">
                    {editingProfile ? (
                        <div className="edit-profile-form">
                            <h3 className="text-headline mb-12">✏️ Edit Profile</h3>
                            <div className="edit-grid">
                                <div className="edit-field full-width">
                                    <label className="text-micro">Name</label>
                                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                                </div>
                                <div className="edit-field">
                                    <label className="text-micro">Weight (kg)</label>
                                    <input type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)} min="30" max="300" />
                                </div>
                                <div className="edit-field">
                                    <label className="text-micro">Height (cm)</label>
                                    <input type="number" value={editHeight} onChange={e => setEditHeight(e.target.value)} min="100" max="250" />
                                </div>
                                <div className="edit-field">
                                    <label className="text-micro">Age</label>
                                    <input type="number" value={editAge} onChange={e => setEditAge(e.target.value)} min="10" max="100" />
                                </div>
                                <div className="edit-field">
                                    <label className="text-micro">Training days/wk</label>
                                    <input type="number" value={editTrainingDays} onChange={e => setEditTrainingDays(e.target.value)} min="1" max="7" />
                                </div>
                                <div className="edit-field full-width">
                                    <label className="text-micro">Goal</label>
                                    <div className="edit-goal-row">
                                        {GOALS.map(g => (
                                            <button
                                                key={g.id}
                                                type="button"
                                                className={`edit-goal-pill${editGoal === g.id ? ' active' : ''}`}
                                                onClick={() => setEditGoal(g.id)}
                                            >
                                                {g.emoji} {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="edit-field">
                                    <label className="text-micro">Cals (Training)</label>
                                    <input type="number" value={editTargetCals} onChange={e => setEditTargetCals(e.target.value)} min="1000" max="6000" />
                                </div>
                                <div className="edit-field">
                                    <label className="text-micro">Cals (Rest)</label>
                                    <input type="number" value={editRestCals} onChange={e => setEditRestCals(e.target.value)} min="1000" max="6000" />
                                </div>
                            </div>
                            <div className="edit-actions">
                                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={saveProfile}>Save</button>
                            </div>
                        </div>
                    ) : (
                        <div className="settings-profile" onClick={() => setEditingProfile(true)} style={{ cursor: 'pointer' }}>
                            <img src="/logo.png" alt="Logo" className="settings-logo" />
                            <div style={{ flex: 1 }}>
                                <h2 className="text-headline">{profile.name || 'User'}</h2>
                                <p className="text-caption">{profile.weight}kg · {profile.height}cm · {profile.age}yrs</p>
                                <p className="text-micro">{GOALS.find(g => g.id === profile.goal)?.emoji} {GOALS.find(g => g.id === profile.goal)?.label} · {profile.targetCals} kcal</p>
                            </div>
                            <span className="edit-hint text-micro">✏️</span>
                        </div>
                    )}
                </div>

                {/* Diet Plan / Meals Editor */}
                <div className="glass-card animate-in animate-delay-2">
                    {editingMeals && editMeals ? (
                        <div className="edit-profile-form">
                            <h3 className="text-headline mb-12">🍽️ Edit Diet Plan</h3>
                            <div className="meal-type-tabs">
                                <button
                                    type="button"
                                    className={`meal-type-tab${editMealType === 'training' ? ' active' : ''}`}
                                    onClick={() => setEditMealType('training')}
                                >🏋️ Training</button>
                                <button
                                    type="button"
                                    className={`meal-type-tab${editMealType === 'rest' ? ' active' : ''}`}
                                    onClick={() => setEditMealType('rest')}
                                >😴 Rest</button>
                            </div>

                            <div className="meals-edit-list">
                                {editMeals[editMealType].map((meal, i) => (
                                    <div key={meal.id || i} className="meal-edit-card">
                                        <div className="meal-edit-header">
                                            <span className="text-micro fw-600">Meal {i + 1}</span>
                                            {editMeals[editMealType].length > 1 && (
                                                <button type="button" className="mini-meal-remove" onClick={() => removeMealItem(editMealType, i)}>✕</button>
                                            )}
                                        </div>
                                        <div className="edit-field full-width">
                                            <label className="text-micro">Name</label>
                                            <input type="text" value={meal.name} onChange={e => updateMealField(editMealType, i, 'name', e.target.value)} placeholder="e.g. Breakfast" />
                                        </div>
                                        <div className="edit-field full-width">
                                            <label className="text-micro">Time</label>
                                            <input type="text" value={meal.time} onChange={e => updateMealField(editMealType, i, 'time', e.target.value)} placeholder="e.g. 8:00 - 9:00 AM" />
                                        </div>
                                        <div className="edit-grid">
                                            <div className="edit-field">
                                                <label className="text-micro">Calories</label>
                                                <input type="number" value={meal.macros.calories || ''} onChange={e => updateMealField(editMealType, i, 'macros', { ...meal.macros, calories: Number(e.target.value) })} placeholder="500" />
                                            </div>
                                            <div className="edit-field">
                                                <label className="text-micro">Protein (g)</label>
                                                <input type="number" value={meal.macros.protein || ''} onChange={e => updateMealField(editMealType, i, 'macros', { ...meal.macros, protein: Number(e.target.value) })} placeholder="30" />
                                            </div>
                                            <div className="edit-field">
                                                <label className="text-micro">Carbs (g)</label>
                                                <input type="number" value={meal.macros.carbs || ''} onChange={e => updateMealField(editMealType, i, 'macros', { ...meal.macros, carbs: Number(e.target.value) })} placeholder="60" />
                                            </div>
                                            <div className="edit-field">
                                                <label className="text-micro">Fats (g)</label>
                                                <input type="number" value={meal.macros.fats || ''} onChange={e => updateMealField(editMealType, i, 'macros', { ...meal.macros, fats: Number(e.target.value) })} placeholder="20" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-meal-btn" onClick={() => addMeal(editMealType)}>+ Add Meal</button>
                            </div>

                            <div className="edit-actions">
                                <button type="button" className="btn btn-secondary" onClick={cancelMealEdit}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={saveMeals}>Save Plan</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="row-between mb-12">
                                <h3 className="text-body fw-600">🍽️ Diet Plan</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {isCustomMeals && (
                                        <button type="button" className="btn btn-secondary btn-xs" onClick={resetToDefault}>Reset</button>
                                    )}
                                    <button type="button" className="btn btn-secondary btn-xs" onClick={startEditingMeals}>Edit</button>
                                </div>
                            </div>
                            <p className="text-caption mb-8">{isCustomMeals ? '✏️ Custom plan' : '✨ Default plan'}</p>
                            <div className="meal-summary-list">
                                <p className="text-micro fw-600 mb-4">Training ({activeMeals.training.length} meals)</p>
                                {activeMeals.training.map((m, i) => (
                                    <div key={i} className="meal-summary-row">
                                        <span className="text-caption">{m.emoji || '🍽️'} {m.name || `Meal ${i + 1}`}</span>
                                        <span className="text-micro">{m.macros.calories} kcal</span>
                                    </div>
                                ))}
                                <p className="text-micro fw-600 mb-4 mt-8">Rest ({activeMeals.rest.length} meals)</p>
                                {activeMeals.rest.map((m, i) => (
                                    <div key={i} className="meal-summary-row">
                                        <span className="text-caption">{m.emoji || '🍽️'} {m.name || `Meal ${i + 1}`}</span>
                                        <span className="text-micro">{m.macros.calories} kcal</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle & Color Accent */}
                <div className="glass-card animate-in animate-delay-3">
                    <div className="row-between mb-16">
                        <div>
                            <h3 className="text-body fw-600">🌙 Appearance</h3>
                            <p className="text-caption">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
                        </div>
                        <button
                            type="button"
                            className="theme-toggle-btn"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            <div className={`theme-toggle-track ${theme}`}>
                                <div className="theme-toggle-thumb" />
                            </div>
                        </button>
                    </div>

                    <div className="color-theme-section">
                        <p className="text-caption mb-8">Accent Color</p>
                        <div className="color-theme-grid">
                            {[
                                { id: 'ember', hex: '#FF6B00', name: 'Ember' },
                                { id: 'ocean', hex: '#0A84FF', name: 'Ocean' },
                                { id: 'emerald', hex: '#30D158', name: 'Emerald' },
                                { id: 'amethyst', hex: '#BF5AF2', name: 'Amethyst' },
                                { id: 'rose', hex: '#FF375F', name: 'Rose' },
                            ].map(ct => (
                                <button
                                    key={ct.id}
                                    type="button"
                                    className={`color-theme-btn${colorTheme === ct.id ? ' active' : ''}`}
                                    style={{ '--theme-color': ct.hex }}
                                    onClick={() => setColorTheme(ct.id)}
                                    aria-label={`Select ${ct.name} color theme`}
                                >
                                    {colorTheme === ct.id && <span className="color-theme-check">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick References */}
                <div className="stack animate-in animate-delay-5">
                    <button type="button" className="glass-card ref-btn" onClick={() => setShowSchedule(!showSchedule)}>
                        <span>📋 Daily Schedule</span>
                        <span className="ref-arrow">{showSchedule ? '▼' : '▶'}</span>
                    </button>
                    {showSchedule && (
                        <div className="glass-card ref-content">
                            {SCHEDULE.map((s, i) => (
                                <div key={i} className="schedule-row">
                                    <span className="schedule-time text-micro">{s.time}</span>
                                    <div>
                                        <p className="text-body fw-500">{s.action}</p>
                                        <p className="text-caption">{s.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="button" className="glass-card ref-btn" onClick={() => setShowSupplements(!showSupplements)}>
                        <span>💊 Supplements</span>
                        <span className="ref-arrow">{showSupplements ? '▼' : '▶'}</span>
                    </button>
                    {showSupplements && (
                        <div className="glass-card ref-content">
                            {SUPPLEMENTS.map((s, i) => (
                                <div key={i} className="supplement-row">
                                    <p className="text-body fw-500">{s.name}</p>
                                    <p className="text-caption">{s.dose} · {s.when}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="button" className="glass-card ref-btn" onClick={() => setShowPlan(!showPlan)}>
                        <span>📊 Macro Targets</span>
                        <span className="ref-arrow">{showPlan ? '▼' : '▶'}</span>
                    </button>
                    {showPlan && (
                        <div className="glass-card ref-content">
                            <div className="macro-compare">
                                <div>
                                    <h4 className="text-body fw-600 mb-8">🏋️ Training Day</h4>
                                    <p className="text-caption">Calories: {macros.training.calories} kcal</p>
                                    <p className="text-caption">Protein: {macros.training.protein}g</p>
                                    <p className="text-caption">Carbs: {macros.training.carbs}g</p>
                                    <p className="text-caption">Fats: {macros.training.fats}g</p>
                                </div>
                                <div>
                                    <h4 className="text-body fw-600 mb-8">😴 Rest Day</h4>
                                    <p className="text-caption">Calories: {macros.rest.calories} kcal</p>
                                    <p className="text-caption">Protein: {macros.rest.protein}g</p>
                                    <p className="text-caption">Carbs: {macros.rest.carbs}g</p>
                                    <p className="text-caption">Fats: {macros.rest.fats}g</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Data Management */}
                <div className="glass-card settings-data-card animate-in animate-delay-6">
                    <h3 className="text-headline mb-12">💾 Data</h3>
                    <div className="stack-sm">
                        <button type="button" className="btn btn-secondary w-full" onClick={exportData}>
                            📤 Export Backup
                        </button>
                        {isSupabaseConfigured && supabase && (
                            <button type="button" className="btn btn-secondary w-full" onClick={async () => await supabase.auth.signOut()}>
                                🚪 Sign Out
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary danger-btn w-full" onClick={clearAllData} style={{ marginTop: 12 }}>
                            🗑️ Clear Local Data
                        </button>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="settings-footer animate-in animate-delay-7">
                <img src="/logo.png" alt="Just Eat It" className="footer-logo" />
                <p className="text-caption">Just Eat It v2.0</p>
                <p className="text-micro">Your Personal Fitness Companion 💪</p>
            </div>
        </div>
    );
}
