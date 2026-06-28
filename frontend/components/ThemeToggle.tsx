'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-btn"
      id="theme-toggle-btn"
      title="Toggle theme"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? (
        <Sun className="sun-icon" />
      ) : (
        <Moon className="moon-icon" />
      )}
    </button>
  );
}
