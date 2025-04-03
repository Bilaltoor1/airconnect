import { useState, useEffect } from 'react';
import { themeChange } from 'theme-change';
import { Sun, Moon } from 'lucide-react';

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
        <button
            className="relative p-2 rounded-full hover:bg-base-300 transition-colors"
            onClick={handleThemeChange}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-400" />
            ) : (
                <Moon size={20} className="text-blue-400" />
            )}
        </button>
    );
};

export default ThemeToggle;