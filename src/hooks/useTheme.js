import { useState, useEffect, useCallback } from 'react';

const COLOR_THEMES = ['ember', 'ocean', 'emerald', 'amethyst', 'rose'];

function normalizeTheme(theme) {
    return theme === 'light' ? 'light' : 'dark';
}

function normalizeColorTheme(colorTheme) {
    return COLOR_THEMES.includes(colorTheme) ? colorTheme : 'ember';
}

export function useTheme(initialTheme = 'dark', initialColorTheme = 'ember') {
    const [theme, setTheme] = useState(() => {
        try {
            const storedTheme = localStorage.getItem('justeatit_theme');
            return normalizeTheme(initialTheme || storedTheme);
        } catch {
            return normalizeTheme(initialTheme);
        }
    });

    const [colorTheme, setColorTheme] = useState(() => {
        try {
            const stored = localStorage.getItem('justeatit_color_theme');
            return normalizeColorTheme(initialColorTheme || stored);
        } catch {
            return normalizeColorTheme(initialColorTheme);
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
            // no-op
        }
    }, [theme]);

    useEffect(() => {
        if (colorTheme === 'ember') {
            document.documentElement.removeAttribute('data-color-theme');
        } else {
            document.documentElement.setAttribute('data-color-theme', colorTheme);
        }
        try {
            localStorage.setItem('justeatit_color_theme', colorTheme);
        } catch {
            // no-op
        }
    }, [colorTheme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    return { theme, setTheme, toggleTheme, colorTheme, setColorTheme, COLOR_THEMES };
}
