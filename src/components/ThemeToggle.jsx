import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="theme-toggle-container">
            <span className="theme-label">{isDarkMode ? 'Dark' : 'Light'}</span>
            <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                aria-label="Toggle theme"
            >
                <div className="toggle-track">
                    <div className="toggle-indicator">
                        {isDarkMode ? 
                            <FaMoon className="theme-icon" /> : 
                            <FaSun className="theme-icon" />
                        }
                    </div>
                </div>
            </button>
        </div>
    );
};

export default ThemeToggle;