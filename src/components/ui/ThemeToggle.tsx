'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all duration-200 min-h-[44px] min-w-[44px] ${
        isDark
          ? 'bg-zinc-900 border-zinc-800 text-amber-400 hover:text-amber-300 hover:bg-zinc-850 hover:border-zinc-700'
          : 'bg-white border-zinc-200 text-indigo-600 hover:text-indigo-700 hover:bg-zinc-100 hover:border-zinc-300 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs sm:text-sm font-bold tracking-wide">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
