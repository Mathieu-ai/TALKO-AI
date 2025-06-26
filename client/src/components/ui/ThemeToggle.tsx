import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5 text-amber-300" />
      ) : (
        <MoonIcon className="w-5 h-5 text-indigo-700" />
      )}
    </button>
  );
};

export default ThemeToggle;
