import { useState, useMemo } from 'react';
import { MEALS, getDateKey } from '../data/dietPlan';
import './Calendar.css';

export default function Calendar({ data }) {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayData = data.days[dateKey];
            let status = 'empty';
            if (dayData) {
                const allChecked = dayData.meals.every(m => m);
                const someChecked = dayData.meals.some(m => m);
                status = allChecked ? 'complete' : someChecked ? 'partial' : 'missed';
            }
            days.push({ day: d, dateKey, status, data: dayData });
        }
        return days;
    }, [year, month, data.days]);

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const selectedDayData = selectedDay ? (data.days[selectedDay] || null) : null;
    const selectedMeals = selectedDayData
        ? (selectedDayData.isTrainingDay ? MEALS.training : MEALS.rest)
        : null;

    const todayKey = getDateKey();
    const hasAnyData = Object.keys(data.days).length > 0;

    return (
        <div className="page calendar-page">
            <div className="page-header animate-in">
                <h1 className="text-title">Calendar</h1>
                <p className="text-caption">Your meal tracking history</p>
            </div>

            <div className="calendar-nav glass-card animate-in animate-delay-1">
                <button type="button" className="btn btn-icon btn-secondary" onClick={prevMonth} aria-label="Previous month">←</button>
                <h2 className="text-headline">{monthName}</h2>
                <button type="button" className="btn btn-icon btn-secondary" onClick={nextMonth} aria-label="Next month">→</button>
            </div>

            <div className="calendar-grid animate-in animate-delay-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="cal-header text-micro">{d}</div>
                ))}
                {calendarDays.map((day, i) => {
                    if (!day) {
                        return <div key={i} className="cal-day empty" aria-hidden="true" />;
                    }

                    return (
                        <button
                            key={i}
                            type="button"
                            className={['cal-day', day.status, day.dateKey === todayKey && 'today', day.dateKey === selectedDay && 'selected'].filter(Boolean).join(' ')}
                            onClick={() => setSelectedDay(day.dateKey === selectedDay ? null : day.dateKey)}
                            aria-label={`${day.dateKey}, ${day.status}`}
                            aria-pressed={day.dateKey === selectedDay}
                        >
                            <span>{day.day}</span>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="cal-legend animate-in animate-delay-3">
                <div className="legend-item"><span className="legend-dot complete"></span> All meals</div>
                <div className="legend-item"><span className="legend-dot partial"></span> Partial</div>
                <div className="legend-item"><span className="legend-dot missed"></span> Missed</div>
                <div className="legend-item"><span className="legend-dot empty"></span> No data</div>
            </div>

            {!hasAnyData && (
                <div className="glass-card calendar-empty animate-in animate-delay-3">
                    <p className="empty-title">No tracking data yet</p>
                    <p className="empty-sub">Complete your first meal on Home to start filling the calendar.</p>
                </div>
            )}

            {/* Selected Day Detail */}
            {selectedDay && selectedDayData && (
                <div className="day-detail glass-card glow animate-in">
                    <h3 className="text-headline">{new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                    <div className="day-detail-badges">
                        <span className="macro-pill accent">{selectedDayData.isTrainingDay ? '🏋️ Training' : '😴 Rest'}</span>
                        <span className="macro-pill">💧 {selectedDayData.water}/8</span>
                        {selectedDayData.sleep && <span className="macro-pill">💤 {selectedDayData.sleep.hours}h</span>}
                    </div>
                    <div className="day-detail-meals">
                        {selectedMeals.map((meal, i) => (
                            <div key={meal.id} className={`day-detail-meal ${selectedDayData.meals[i] ? 'done' : ''}`}>
                                <span>{meal.emoji}</span>
                                <span className="text-body">{meal.name}</span>
                                <span className="text-caption">{meal.macros.calories} kcal</span>
                                <span className="meal-status-icon">{selectedDayData.meals[i] ? '✅' : '❌'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
