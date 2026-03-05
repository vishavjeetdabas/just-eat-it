import { useState, useEffect, useCallback } from 'react';

function normalizeTheme(theme) {
    return theme === 'light' ? 'light' : 'dark';
}

export function useTheme(initialTheme = 'dark') {
    const [theme, setTheme] = useState(() => {
        try {
            const storedTheme = localStorage.getItem('justeatit_theme');
            return normalizeTheme(initialTheme || storedTheme);
        } catch {
            return normalizeTheme(initialTheme);
        }
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            'content',
            theme === 'dark' ? '#0A0A0A' : '#F2F2F7'
        );
        try {
            localStorage.setItem('justeatit_theme', theme);
        } catch {
            // no-op: theme still applies to current session
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    return { theme, setTheme, toggleTheme };
}
