import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

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
