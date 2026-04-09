'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // hide on login and public pages
  const hideOn = ['/login', '/', '/cliente/login'];
  if (hideOn.includes(pathname || '')) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border-2 border-red-200 dark:border-gray-700 transition-all duration-300 hover:scale-110 active:scale-95 transform animate-bounce-in"
      aria-label="Cambiar tema"
      title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
    >
      {theme === 'light' ? (
        <FiMoon className="w-6 h-6 text-red-600 dark:text-red-400" />
      ) : (
        <FiSun className="w-6 h-6 text-yellow-500" />
      )}
    </button>
  );
}
