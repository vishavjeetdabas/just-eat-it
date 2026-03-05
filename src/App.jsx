import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useAppData } from './hooks/useAppData';
import { useTheme } from './hooks/useTheme';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Progress from './pages/Progress';
import Workout from './pages/Workout';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(isSupabaseConfigured);

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!isSupabaseConfigured) {
        return (
            <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '100dvh' }}>
                <h1 className="text-display mb-12">⚠️ Setup Required</h1>
                <p className="text-body mb-24" style={{ color: 'var(--text-secondary)' }}>
                    Supabase environment variables are missing.
                </p>
                <div className="glass-card w-full" style={{ textAlign: 'left' }}>
                    <p className="text-caption mb-12">If you deployed this app, you must add the following Environment Variables to your hosting provider (Vercel, Netlify, etc):</p>
                    <ul className="text-micro stack-sm">
                        <li><code>VITE_SUPABASE_URL</code></li>
                        <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                    </ul>
                </div>
            </div>
        );
    }

    if (loading) return null;

    if (!session) {
        return <Login />;
    }

    return <MainApp user={session.user} />;
}

function MainApp({ user }) {
    const { data, updateDayField, updateSettings } = useAppData(user);
    const { theme, toggleTheme } = useTheme(data.settings.theme);

    useEffect(() => {
        if (data.settings.theme !== theme) {
            updateSettings({ theme });
        }
    }, [data.settings.theme, theme, updateSettings]);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Dashboard
                            data={data}
                            updateDayField={updateDayField}
                        />
                    }
                />
                <Route
                    path="/calendar"
                    element={<Calendar data={data} />}
                />
                <Route
                    path="/progress"
                    element={
                        <Progress
                            data={data}
                            updateDayField={updateDayField}
                        />
                    }
                />
                <Route
                    path="/workout"
                    element={
                        <Workout
                            data={data}
                            updateDayField={updateDayField}
                        />
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <Settings
                            data={data}
                            updateSettings={updateSettings}
                            theme={theme}
                            toggleTheme={toggleTheme}
                        />
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BottomNav />
        </BrowserRouter>
    );
}
