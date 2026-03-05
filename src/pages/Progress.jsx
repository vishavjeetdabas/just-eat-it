import { useState, useMemo, useRef } from 'react';
import { getDateKey } from '../data/dietPlan';
import { calculateStreak } from '../hooks/useAppData';
import './Progress.css';

export default function Progress({ data, updateDayField }) {
    const today = getDateKey();
    const [weightInput, setWeightInput] = useState('');
    const [photoError, setPhotoError] = useState('');
    const fileInputRef = useRef(null);

    // Weekly weigh-ins
    const weighIns = useMemo(() => {
        const entries = [];
        const sortedKeys = Object.keys(data.days).sort();
        sortedKeys.forEach(key => {
            if (data.days[key].weight) {
                entries.push({ date: key, weight: data.days[key].weight });
            }
        });
        return entries;
    }, [data.days]);

    const logWeight = () => {
        const w = parseFloat(weightInput);
        if (w > 0) {
            updateDayField(today, 'weight', w);
            setWeightInput('');
        }
    };

    // Progress photos
    const photos = useMemo(() => {
        const entries = [];
        const sortedKeys = Object.keys(data.days).sort();
        sortedKeys.forEach(key => {
            if (data.days[key].photo) {
                entries.push({ date: key, photo: data.days[key].photo });
            }
        });
        return entries;
    }, [data.days]);

    const handlePhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoError('');
        const reader = new FileReader();
        reader.onload = (ev) => {
            // Compress image
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxW = 400;
                const scale = Math.min(1, maxW / img.width);
                canvas.width = Math.round(img.width * scale);
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setPhotoError('Could not process this image. Try another photo.');
                    return;
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                try {
                    const compressed = canvas.toDataURL('image/jpeg', 0.6);
                    updateDayField(today, 'photo', compressed);
                } catch {
                    setPhotoError('Unable to save photo. Storage may be full.');
                }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // Weekly summary
    const weekSummary = useMemo(() => {
        let totalMeals = 0;
        let completedMeals = 0;
        let totalSleep = 0;
        let sleepLoggedDays = 0;
        let totalWater = 0;
        let trackedDays = 0;

        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = getDateKey(d);
            const day = data.days[key];
            if (day) {
                trackedDays++;
                totalMeals += day.meals.length;
                completedMeals += day.meals.filter(m => m).length;
                totalWater += day.water || 0;
                if (day.sleep?.hours != null) {
                    totalSleep += day.sleep.hours;
                    sleepLoggedDays++;
                }
            }
        }

        return {
            mealPct: totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0,
            avgWater: trackedDays > 0 ? (totalWater / trackedDays).toFixed(1) : '0.0',
            avgSleep: sleepLoggedDays > 0 ? (totalSleep / sleepLoggedDays).toFixed(1) : '0.0',
            streak: calculateStreak(data.days),
            weightChange: weighIns.length >= 2
                ? (weighIns[weighIns.length - 1].weight - weighIns[0].weight).toFixed(1)
                : null,
            daysTracked: trackedDays,
        };
    }, [data.days, weighIns]);

    const recentWeighIns = useMemo(() => weighIns.slice(-8), [weighIns]);
    const weightRange = useMemo(() => {
        if (recentWeighIns.length === 0) {
            return { min: 0, max: 1 };
        }
        const values = recentWeighIns.map((entry) => entry.weight);
        return {
            min: Math.min(...values) - 1,
            max: Math.max(...values) + 1,
        };
    }, [recentWeighIns]);

    const todayData = data.days[today];
    const todayWeight = todayData?.weight;

    return (
        <div className="page progress-page">
            <div className="page-header animate-in">
                <h1 className="text-title">Progress</h1>
                <p className="text-caption">Track your transformation</p>
            </div>

            {/* Weekly Summary Card */}
            <div className="glass-card glow summary-card animate-in animate-delay-1">
                <h2 className="text-headline">📊 Weekly Summary</h2>
                <div className="summary-grid">
                    <div className="summary-item">
                        <span className="summary-value">{weekSummary.mealPct}%</span>
                        <span className="text-micro">meals completed</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value">🔥 {weekSummary.streak}</span>
                        <span className="text-micro">day streak</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value">{weekSummary.avgWater}</span>
                        <span className="text-micro">avg glasses/day</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-value">{weekSummary.avgSleep}h</span>
                        <span className="text-micro">avg sleep</span>
                    </div>
                    {weekSummary.weightChange !== null && (
                        <div className="summary-item full-width">
                            <span className={`summary-value ${parseFloat(weekSummary.weightChange) < 0 ? 'text-success' : 'text-accent'}`}>
                                {parseFloat(weekSummary.weightChange) > 0 ? '+' : ''}{weekSummary.weightChange} kg
                            </span>
                            <span className="text-micro">weight change</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Weigh-in */}
            <div className="glass-card animate-in animate-delay-2">
                <h2 className="text-headline">⚖️ Weekly Weigh-in</h2>
                <p className="text-caption mb-12">Weigh in once/week, same time, same conditions</p>
                <div className="weight-input-row">
                    <input
                        type="number"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        placeholder={todayWeight ? `Today: ${todayWeight} kg` : "Enter weight (kg)"}
                        step="0.1"
                        className="weight-input"
                    />
                    <button className="btn btn-primary" onClick={logWeight}>Log</button>
                </div>

                {weighIns.length > 0 && (
                    <div className="weight-chart">
                        <div className="weight-bars">
                            {recentWeighIns.map((entry, i) => {
                                const pct = ((entry.weight - weightRange.min) / (weightRange.max - weightRange.min)) * 100;
                                return (
                                    <div key={entry.date} className="weight-bar-col">
                                        <span className="weight-bar-val">{entry.weight}</span>
                                        <div className="weight-bar" style={{
                                            height: `${pct}%`,
                                            animationDelay: `${i * 0.1}s`
                                        }} />
                                        <span className="text-micro">{new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {weighIns.length === 0 && (
                    <div className="section-empty">
                        <p className="empty-title">No weigh-ins yet</p>
                        <p className="empty-sub">Log your first weigh-in to start the weekly chart.</p>
                    </div>
                )}
            </div>

            {/* Progress Photos */}
            <div className="glass-card animate-in animate-delay-3">
                <h2 className="text-headline">📸 Progress Photos</h2>
                <p className="text-caption mb-12">Take a photo daily, compare Week 1 vs now</p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhoto}
                    className="hidden-file-input"
                />
                <button
                    type="button"
                    className="btn btn-primary photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                >
                    📷 {todayData?.photo ? 'Retake Today\'s Photo' : 'Take Today\'s Photo'}
                </button>
                {photoError && <p className="text-caption photo-error">{photoError}</p>}

                {photos.length > 0 && (
                    <div className="photo-grid">
                        {photos.slice(-6).reverse().map(p => (
                            <div key={p.date} className="photo-item">
                                <img src={p.photo} alt={p.date} />
                                <span className="text-micro">{new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        ))}
                    </div>
                )}
                {photos.length === 0 && (
                    <div className="section-empty">
                        <p className="empty-title">No progress photos yet</p>
                        <p className="empty-sub">Take your first photo today to start comparisons.</p>
                    </div>
                )}

                {photos.length >= 2 && (
                    <div className="comparison-section">
                        <h3 className="text-body fw-600 mb-12">Before & After</h3>
                        <div className="comparison-grid">
                            <div className="comparison-item">
                                <img src={photos[0].photo} alt="First" />
                                <span className="text-micro">{new Date(photos[0].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="comparison-divider">→</div>
                            <div className="comparison-item">
                                <img src={photos[photos.length - 1].photo} alt="Latest" />
                                <span className="text-micro">{new Date(photos[photos.length - 1].date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
