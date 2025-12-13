// components/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        const abd = setTimeout(() => setMounted(true),0);
        return () => clearTimeout(abd);
    }, []);

    if (!mounted) {
        // Render a placeholder button on initial SSR to prevent mismatch errors
        return <button className="btn btn-ghost btn-circle" aria-label="Toggle Theme"></button>;
    }

    const nextTheme = 
        theme === 'dark' ? 'light' : 
        theme === 'light' ? 'system' : 
        'dark';

    const currentIcon = 
        theme === 'dark' ? faMoon : 
        theme === 'light' ? faSun : 
        faDesktop;

    const currentLabel = 
        theme === 'dark' ? 'Dark Mode' : 
        theme === 'light' ? 'Light Mode' : 
        'System Mode';

    return (
        <button
            onClick={() => setTheme(nextTheme)}
            className="btn btn-ghost btn-circle"
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Current theme: ${currentLabel}. Click to switch.`}
        >
            <FontAwesomeIcon icon={currentIcon} className="h-5 w-5" />
        </button>
    );
};

export default ThemeToggle;