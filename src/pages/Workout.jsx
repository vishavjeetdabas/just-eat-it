import { useState, useMemo } from 'react';
import { PROFILE, WORKOUT_TYPES, getDateKey } from '../data/dietPlan';
import { createEmptyDay } from '../hooks/useAppData';
import './Workout.css';

export default function Workout({ data, updateDayField }) {
    const today = getDateKey();
    const dayData = data.days[today] || createEmptyDay(today);
    const [selectedType, setSelectedType] = useState(dayData.workout?.type || '');
    const [duration, setDuration] = useState(dayData.workout?.duration || '');
    const bodyWeightFactor = PROFILE.weight / 89;

    // Default estimated calories from formula
    const defaultCals = useMemo(() => {
        if (!selectedType || !duration) return 0;
        const type = WORKOUT_TYPES.find(t => t.id === selectedType);
        return type ? Math.round(type.calsPerMin * parseFloat(duration) * bodyWeightFactor) : 0;
    }, [selectedType, duration, bodyWeightFactor]);

    // Editable calories — user can override with Apple Watch data
    const [customCals, setCustomCals] = useState('');
    const finalCals = customCals !== '' ? parseInt(customCals) || 0 : defaultCals;

    // Reset custom cals when type or duration changes
    const handleTypeChange = (typeId) => {
        setSelectedType(typeId);
        setCustomCals('');
    };

    const handleDurationChange = (val) => {
        setDuration(val);
        setCustomCals('');
    };

    const workoutHistory = useMemo(() => {
        return Object.entries(data.days)
            .filter(([, d]) => d.workout?.type)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 14)
            .map(([date, d]) => ({
                date,
                ...d.workout,
                typeInfo: WORKOUT_TYPES.find(t => t.id === d.workout.type),
            }));
    }, [data.days]);

    const logWorkout = () => {
        if (!selectedType || !duration) return;
        updateDayField(today, 'workout', {
            type: selectedType,
            duration: parseInt(duration),
            cals: finalCals,
        });
    };

    const totalWeeklyCals = useMemo(() => {
        const now = new Date();
        let total = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = getDateKey(d);
            if (data.days[key]?.workout?.cals) total += data.days[key].workout.cals;
        }
        return total;
    }, [data.days]);

    return (
        <div className="page workout-page">
            <div className="page-header animate-in">
                <h1 className="text-title">Workout Log</h1>
                <p className="text-caption">Track your training sessions</p>
            </div>

            <div className="stack-xl">
                {/* Log Today */}
                <div className="glass-card glow animate-in animate-delay-1">
                    <h2 className="text-headline">🏋️ Today's Session</h2>
                    {dayData.workout ? (
                        <div className="workout-logged">
                            <div className="workout-logged-info">
                                <span className="workout-logged-emoji">{WORKOUT_TYPES.find(t => t.id === dayData.workout.type)?.emoji}</span>
                                <div>
                                    <p className="text-body fw-600">
                                        {WORKOUT_TYPES.find(t => t.id === dayData.workout.type)?.name}
                                    </p>
                                    <p className="text-caption">{dayData.workout.duration} min · {dayData.workout.cals} kcal burned</p>
                                </div>
                            </div>
                            <span className="workout-check">✅</span>
                        </div>
                    ) : (
                        <>
                            <div className="workout-type-grid">
                                {WORKOUT_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`workout-type-btn${selectedType === type.id ? ' selected' : ''}`}
                                        onClick={() => handleTypeChange(type.id)}
                                        aria-pressed={selectedType === type.id}
                                        aria-label={`Select ${type.name} workout`}
                                    >
                                        <span className="wt-emoji">{type.emoji}</span>
                                        <span className="wt-name">{type.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="workout-duration-row">
                                <div className="duration-field">
                                    <label className="text-micro">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => handleDurationChange(e.target.value)}
                                        placeholder="90"
                                        min="1"
                                        max="300"
                                    />
                                </div>
                                <div className="duration-field">
                                    <label className="text-micro">Calories Burned</label>
                                    <input
                                        type="number"
                                        value={customCals !== '' ? customCals : defaultCals || ''}
                                        onChange={(e) => setCustomCals(e.target.value)}
                                        placeholder={String(defaultCals)}
                                        min="0"
                                        max="3000"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary workout-log-btn"
                                onClick={logWorkout}
                                disabled={!selectedType || !duration}
                            >
                                Log Workout
                            </button>
                        </>
                    )}
                </div>

                {/* Weekly Stats */}
                <div className="glass-card animate-in animate-delay-2">
                    <div className="row-between">
                        <h2 className="text-headline">🔥 This Week</h2>
                        <span className="text-accent text-headline">{totalWeeklyCals} kcal</span>
                    </div>
                    <p className="text-caption">Total calories burned from workouts</p>
                </div>

                {/* History */}
                <div className="glass-card animate-in animate-delay-3">
                    <h2 className="text-headline mb-12">History</h2>
                    {workoutHistory.length > 0 ? (
                        <div className="workout-history">
                            {workoutHistory.map(w => (
                                <div key={w.date} className="history-item">
                                    <span className="history-emoji">{w.typeInfo?.emoji}</span>
                                    <div className="history-info">
                                        <span className="text-body fw-500">{w.typeInfo?.name}</span>
                                        <span className="text-micro">{new Date(w.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="history-stats">
                                        <span className="text-body fw-600">{w.cals} kcal</span>
                                        <span className="text-micro">{w.duration} min</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">🏋️</span>
                            <p className="empty-title">No workouts yet</p>
                            <p className="empty-sub">Log today's training session above</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
