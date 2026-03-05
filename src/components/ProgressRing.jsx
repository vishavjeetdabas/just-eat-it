import { useId } from 'react';
import './ProgressRing.css';

export default function ProgressRing({
    value = 0,
    max = 100,
    size = 100,
    strokeWidth = 10,
    color = 'var(--accent)',
    bgColor = 'var(--bg-tertiary)',
    sublabel = '',
    animate = true,
    gradientId = '',
    gradientColors = null,
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(value / max, 1);
    const offset = circumference - pct * circumference;
    const componentId = useId().replace(/:/g, '');
    const uniqueId = gradientId || `ring-${componentId}`;
    const glowId = `glow-${uniqueId}`;

    const percentage = Math.round(pct * 100);
    const useGradient = gradientColors && gradientColors.length === 2;

    return (
        <div className="progress-ring-container" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="progress-ring-svg">
                <defs>
                    {useGradient && (
                        <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={gradientColors[0]} />
                            <stop offset="100%" stopColor={gradientColors[1]} />
                        </linearGradient>
                    )}
                    <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                    className="progress-ring-bg"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={useGradient ? `url(#${uniqueId})` : color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="progress-ring-fill"
                    style={animate ? { transition: 'stroke-dashoffset 900ms cubic-bezier(0.22, 0.61, 0.36, 1)' } : undefined}
                    filter={`url(#${glowId})`}
                />
            </svg>
            <div className="progress-ring-label">
                <span className="progress-ring-value">{percentage}<span className="progress-ring-pct">%</span></span>
                {sublabel && <span className="progress-ring-sublabel">{sublabel}</span>}
            </div>
        </div>
    );
}
