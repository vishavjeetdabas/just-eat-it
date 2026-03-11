import { useState, useMemo, useRef, useEffect } from 'react';
import { useGymData } from '../hooks/useGymData';
import { EXERCISES, EXERCISE_CATEGORIES, searchExercises } from '../data/exercises';
import './Gym.css';

const VIEWS = ['workout', 'history', 'prs'];

export default function Gym() {
    const {
        activeWorkout,
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
    } = useGymData();

    const [view, setView] = useState('workout');
    const [searchQuery, setSearchQuery] = useState('');
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedExercise, setExpandedExercise] = useState(null);
    const [expandedHistorySession, setExpandedHistorySession] = useState(null);

    // Timer
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (activeWorkout) {
            const start = new Date(`${activeWorkout.date}T${activeWorkout.startTime}:00`);
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - start.getTime()) / 1000));
            }, 1000);
            return () => clearInterval(timerRef.current);
        } else {
            setElapsed(0);
        }
    }, [activeWorkout]);

    const formatTimer = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        return `${m}:${String(sec).padStart(2, '0')}`;
    };

    const history = getHistory(30);
    const loggedExercises = getLoggedExercises();

    const filteredExercises = useMemo(() => {
        let results = searchQuery ? searchExercises(searchQuery) : EXERCISES;
        if (selectedCategory) {
            results = results.filter(e => e.category === selectedCategory);
        }
        return results;
    }, [searchQuery, selectedCategory]);

    // ── Workout View ──
    const renderWorkoutView = () => {
        if (!activeWorkout) {
            return (
                <div className="gym-empty">
                    <div className="gym-empty-icon">🏋️</div>
                    <h2 className="text-title">Ready to Train?</h2>
                    <p className="text-caption">Start a workout to log your exercises, sets, and track your progress.</p>
                    <button type="button" className="btn btn-primary gym-start-btn" onClick={startWorkout}>
                        Start Workout 💪
                    </button>
                </div>
            );
        }

        return (
            <div className="stack-xl">
                {/* Timer Bar */}
                <div className="gym-timer-bar glass-card">
                    <div className="timer-info">
                        <span className="timer-clock">{formatTimer(elapsed)}</span>
                        <span className="text-micro">{activeWorkout.exercises.length} exercises</span>
                    </div>
                    <div className="timer-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                            if (window.confirm('Discard this workout?')) cancelWorkout();
                        }}>Cancel</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                            finishWorkout();
                            setShowExercisePicker(false);
                        }}>Finish ✓</button>
                    </div>
                </div>

                {/* Exercise List */}
                {activeWorkout.exercises.map((ex) => (
                    <ExerciseCard
                        key={ex.exerciseId}
                        exercise={ex}
                        isExpanded={expandedExercise === ex.exerciseId}
                        onToggle={() => setExpandedExercise(expandedExercise === ex.exerciseId ? null : ex.exerciseId)}
                        onAddSet={(w, r) => addSet(ex.exerciseId, w, r)}
                        onRemoveSet={(i) => removeSet(ex.exerciseId, i)}
                        onRemove={() => removeExercise(ex.exerciseId)}
                        lastSession={getLastSession(ex.exerciseId)}
                        personalRecord={getPersonalRecord(ex.exerciseId)}
                    />
                ))}

                {/* Add Exercise Button */}
                <button
                    type="button"
                    className="gym-add-exercise-btn glass-card"
                    onClick={() => setShowExercisePicker(true)}
                >
                    <span className="add-icon">＋</span>
                    <span>Add Exercise</span>
                </button>

                {/* Exercise Picker Modal */}
                {showExercisePicker && (
                    <div className="gym-picker-overlay" onClick={() => setShowExercisePicker(false)}>
                        <div className="gym-picker-modal" onClick={e => e.stopPropagation()}>
                            <div className="picker-header">
                                <h3 className="text-headline">Add Exercise</h3>
                                <button type="button" className="picker-close" onClick={() => setShowExercisePicker(false)}>✕</button>
                            </div>
                            <input
                                type="text"
                                className="picker-search"
                                placeholder="Search exercises..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <div className="picker-categories">
                                <button
                                    type="button"
                                    className={`cat-pill${!selectedCategory ? ' active' : ''}`}
                                    onClick={() => setSelectedCategory(null)}
                                >All</button>
                                {EXERCISE_CATEGORIES.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`cat-pill${selectedCategory === c.id ? ' active' : ''}`}
                                        onClick={() => setSelectedCategory(c.id)}
                                    >{c.emoji} {c.name}</button>
                                ))}
                            </div>
                            <div className="picker-list">
                                {filteredExercises.map(ex => {
                                    const alreadyAdded = activeWorkout.exercises.some(e => e.exerciseId === ex.id);
                                    return (
                                        <button
                                            key={ex.id}
                                            type="button"
                                            className={`picker-exercise${alreadyAdded ? ' added' : ''}`}
                                            onClick={() => {
                                                if (!alreadyAdded) {
                                                    addExerciseToWorkout(ex);
                                                    setExpandedExercise(ex.id);
                                                }
                                                setShowExercisePicker(false);
                                                setSearchQuery('');
                                                setSelectedCategory(null);
                                            }}
                                            disabled={alreadyAdded}
                                        >
                                            <span className="picker-ex-emoji">{ex.emoji}</span>
                                            <span className="picker-ex-name">{ex.name}</span>
                                            {alreadyAdded && <span className="picker-ex-check">✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ── History View ──
    const renderHistoryView = () => {
        if (history.length === 0) {
            return (
                <div className="gym-empty">
                    <div className="gym-empty-icon">📋</div>
                    <h2 className="text-title">No History Yet</h2>
                    <p className="text-caption">Complete your first workout to see it here.</p>
                </div>
            );
        }

        return (
            <div className="stack-xl">
                {history.map((session, idx) => {
                    const totalVolume = session.exercises.reduce((sum, ex) =>
                        sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
                    );
                    const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
                    const isExpanded = expandedHistorySession === idx;
                    const dateObj = new Date(session.date + 'T12:00:00');
                    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                    return (
                        <div key={session.id} className="glass-card history-card">
                            <button type="button" className="history-header" onClick={() => setExpandedHistorySession(isExpanded ? null : idx)}>
                                <div>
                                    <h3 className="text-body fw-600">{dateStr}</h3>
                                    <p className="text-caption">{session.exercises.length} exercises · {totalSets} sets · {(totalVolume / 1000).toFixed(1)}k kg volume</p>
                                </div>
                                <span className="ref-arrow">{isExpanded ? '▼' : '▶'}</span>
                            </button>
                            {isExpanded && (
                                <div className="history-details">
                                    {session.exercises.map(ex => (
                                        <div key={ex.exerciseId} className="history-exercise">
                                            <p className="text-body fw-500">{ex.emoji} {ex.name}</p>
                                            <div className="history-sets">
                                                {ex.sets.map((set, si) => (
                                                    <span key={si} className="history-set-chip">
                                                        {set.weight}kg × {set.reps}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // ── PRs View ──
    const renderPRsView = () => {
        if (loggedExercises.length === 0) {
            return (
                <div className="gym-empty">
                    <div className="gym-empty-icon">🏆</div>
                    <h2 className="text-title">No PRs Yet</h2>
                    <p className="text-caption">Start logging workouts to track your personal records.</p>
                </div>
            );
        }

        return (
            <div className="stack-xl">
                {loggedExercises.map(ex => {
                    const pr = getPersonalRecord(ex.exerciseId);
                    return (
                        <div key={ex.exerciseId} className="glass-card pr-card">
                            <div className="pr-info">
                                <span className="pr-emoji">{ex.emoji}</span>
                                <div>
                                    <h3 className="text-body fw-600">{ex.name}</h3>
                                    <p className="text-caption">{ex.sessionCount} session{ex.sessionCount > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            {pr && (
                                <div className="pr-badge">
                                    <span className="pr-weight">{pr.weight}kg</span>
                                    <span className="text-micro">× {pr.reps}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="page gym-page">
            <div className="page-header animate-in">
                <h1 className="text-title">Gym</h1>
                <p className="text-caption">Track your lifts & crush PRs</p>
            </div>

            {/* Sub-view tabs */}
            <div className="gym-tabs glass-card animate-in animate-delay-1">
                {VIEWS.map(v => (
                    <button
                        key={v}
                        type="button"
                        className={`gym-tab${view === v ? ' active' : ''}`}
                        onClick={() => setView(v)}
                    >
                        {v === 'workout' ? '🏋️ Workout' : v === 'history' ? '📋 History' : '🏆 PRs'}
                    </button>
                ))}
            </div>

            <div className="animate-in animate-delay-2">
                {view === 'workout' && renderWorkoutView()}
                {view === 'history' && renderHistoryView()}
                {view === 'prs' && renderPRsView()}
            </div>
        </div>
    );
}

// ── Exercise Card (used during active workout) ──
function ExerciseCard({ exercise, isExpanded, onToggle, onAddSet, onRemoveSet, onRemove, lastSession, personalRecord }) {
    const [weight, setWeight] = useState(() => {
        if (lastSession && lastSession.sets.length > 0) {
            return lastSession.sets[lastSession.sets.length - 1].weight;
        }
        return '';
    });
    const [reps, setReps] = useState(() => {
        if (lastSession && lastSession.sets.length > 0) {
            return lastSession.sets[lastSession.sets.length - 1].reps;
        }
        return '';
    });

    const handleAddSet = () => {
        if (weight > 0 && reps > 0) {
            onAddSet(weight, reps);
        }
    };

    const totalVolume = exercise.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const isNewPR = personalRecord && exercise.sets.some(s => s.weight > personalRecord.weight);

    return (
        <div className={`glass-card exercise-card${isExpanded ? ' expanded' : ''}`}>
            <button type="button" className="exercise-header" onClick={onToggle}>
                <div className="exercise-title">
                    <span className="exercise-emoji">{exercise.emoji}</span>
                    <div>
                        <h3 className="text-body fw-600">{exercise.name}</h3>
                        <p className="text-caption">{exercise.sets.length} sets{totalVolume > 0 ? ` · ${(totalVolume / 1000).toFixed(1)}k vol` : ''}</p>
                    </div>
                </div>
                <div className="exercise-header-right">
                    {isNewPR && <span className="pr-new-badge">🏆 PR!</span>}
                    <span className="ref-arrow">{isExpanded ? '▼' : '▶'}</span>
                </div>
            </button>

            {isExpanded && (
                <div className="exercise-body">
                    {/* Last session hint */}
                    {lastSession && lastSession.sets.length > 0 && (
                        <div className="last-session-hint">
                            <span className="text-micro">Last time:</span>
                            {lastSession.sets.map((s, i) => (
                                <span key={i} className="last-set-chip">{s.weight}×{s.reps}</span>
                            ))}
                        </div>
                    )}

                    {/* Logged sets */}
                    {exercise.sets.length > 0 && (
                        <div className="exercise-sets-list">
                            {exercise.sets.map((set, i) => (
                                <div key={i} className="set-row">
                                    <span className="set-number">Set {i + 1}</span>
                                    <span className="set-details">{set.weight}kg × {set.reps} reps</span>
                                    <button type="button" className="set-remove" onClick={() => onRemoveSet(i)}>✕</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Set Input */}
                    <div className="add-set-row">
                        <div className="set-input-group">
                            <input
                                type="number"
                                className="set-input"
                                placeholder="kg"
                                value={weight}
                                onChange={e => setWeight(Number(e.target.value))}
                                min="0"
                                step="2.5"
                            />
                            <span className="set-input-x">×</span>
                            <input
                                type="number"
                                className="set-input"
                                placeholder="reps"
                                value={reps}
                                onChange={e => setReps(Number(e.target.value))}
                                min="0"
                            />
                        </div>
                        <button type="button" className="btn btn-primary btn-sm add-set-btn" onClick={handleAddSet}>
                            + Set
                        </button>
                    </div>

                    {/* Remove exercise */}
                    <button type="button" className="remove-exercise-btn" onClick={onRemove}>
                        Remove Exercise
                    </button>
                </div>
            )}
        </div>
    );
}
