import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppData } from './hooks/useAppData';
import { useTheme } from './hooks/useTheme';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Progress from './pages/Progress';
import Workout from './pages/Workout';
import Settings from './pages/Settings';

export default function App() {
    const { data, updateDayField, updateSettings } = useAppData();
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
            </Routes>
            <BottomNav />
        </BrowserRouter>
    );
}
