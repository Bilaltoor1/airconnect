import { useState, useEffect } from 'react';
import { themeChange } from 'theme-change';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        themeChange(false); // Initialize theme-change
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeChange = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    return (
        <div className="flex justify-center">
            <label className="swap swap-rotate">
                <input type="checkbox" onChange={handleThemeChange} checked={theme === 'dark'} />
                <div className="swap-on text-xl">☀️</div>
                <div className="swap-off text-xl">🌙</div>
            </label>
        </div>
    );
};

export default ThemeToggle;