import { useState } from 'react';
import { PROFILE, MACROS, SCHEDULE, SUPPLEMENTS, getDateKey } from '../data/dietPlan';
import './Settings.css';

export default function Settings({ data, updateSettings, theme, toggleTheme }) {
    const [showSchedule, setShowSchedule] = useState(false);
    const [showSupplements, setShowSupplements] = useState(false);
    const [showPlan, setShowPlan] = useState(false);

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

            {/* Profile */}
            <div className="glass-card animate-in animate-delay-1">
                <div className="settings-profile">
                    <img src="/logo.png" alt="Logo" className="settings-logo" />
                    <div>
                        <h2 className="text-headline">{PROFILE.name}</h2>
                        <p className="text-caption">{PROFILE.weight}kg · {PROFILE.height}cm · {PROFILE.age}yrs</p>
                        <p className="text-micro">Bali Recomp Plan — 1 Month</p>
                    </div>
                </div>
            </div>

            {/* Theme Toggle */}
            <div className="glass-card animate-in animate-delay-2">
                    <div className="row-between">
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
            </div>

            {/* Prep Tracking */}
            <div className="glass-card animate-in animate-delay-3">
                <h3 className="text-headline mb-12">🥚 Prep Tracking</h3>
                <div className="stack-sm">
                    <div className="prep-row">
                        <div>
                            <p className="text-body fw-500">Hard-boil eggs</p>
                            <p className="text-caption">
                                Last: {data.settings.lastEggPrep
                                    ? new Date(data.settings.lastEggPrep + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'Never'}
                            </p>
                        </div>
                        <button className="btn btn-secondary" onClick={markEggPrep}>Done ✓</button>
                    </div>
                    <div className="prep-row">
                        <div>
                            <p className="text-body fw-500">Batch cook dal</p>
                            <p className="text-caption">
                                Last: {data.settings.lastDalPrep
                                    ? new Date(data.settings.lastDalPrep + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'Never'}
                            </p>
                        </div>
                        <button className="btn btn-secondary" onClick={markDalPrep}>Done ✓</button>
                    </div>
                </div>
            </div>

            {/* Quick References */}
            <div className="stack animate-in animate-delay-4">
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
                                <p className="text-caption">Calories: {MACROS.training.calories} kcal</p>
                                <p className="text-caption">Protein: {MACROS.training.protein}g</p>
                                <p className="text-caption">Carbs: {MACROS.training.carbs}g</p>
                                <p className="text-caption">Fats: {MACROS.training.fats}g</p>
                            </div>
                            <div>
                                <h4 className="text-body fw-600 mb-8">😴 Rest Day</h4>
                                <p className="text-caption">Calories: {MACROS.rest.calories} kcal</p>
                                <p className="text-caption">Protein: {MACROS.rest.protein}g</p>
                                <p className="text-caption">Carbs: {MACROS.rest.carbs}g</p>
                                <p className="text-caption">Fats: {MACROS.rest.fats}g</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Management */}
            <div className="glass-card settings-data-card animate-in animate-delay-5">
                <h3 className="text-headline mb-12">💾 Data</h3>
                <div className="stack-sm">
                    <button type="button" className="btn btn-secondary w-full" onClick={exportData}>
                        📤 Export Backup
                    </button>
                    <button type="button" className="btn btn-secondary danger-btn w-full" onClick={clearAllData}>
                        🗑️ Clear All Data
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="settings-footer animate-in animate-delay-6">
                <img src="/logo.png" alt="Just Eat It" className="footer-logo" />
                <p className="text-caption">Just Eat It v1.0</p>
                <p className="text-micro">Built for Sunny's Bali Transformation 🌴</p>
            </div>
        </div>
    );
}
