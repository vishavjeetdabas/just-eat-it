import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.css';

const tabs = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/progress', icon: '📊', label: 'Progress' },
    { path: '/workout', icon: '🏋️', label: 'Workout' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function BottomNav() {
    const location = useLocation();
    const activeIndexRaw = tabs.findIndex(t =>
        t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path)
    );
    const activeIndex = activeIndexRaw >= 0 ? activeIndexRaw : 0;

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-inner">
                <div
                    className="nav-indicator"
                    style={{ transform: `translateX(${activeIndex * 100}%)` }}
                />
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
                        end={tab.path === '/'}
                        aria-label={tab.label}
                    >
                        <span className="nav-icon">{tab.icon}</span>
                        <span className="nav-label">{tab.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
