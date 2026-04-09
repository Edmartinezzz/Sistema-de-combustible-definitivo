"use client";
import React from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import { usePathname } from 'next/navigation';
// no external image required for avatar — use initials placeholder

export default function Topbar() {
  const pathname = usePathname();

  // hide topbar on login and public pages
  const hideOn = ['/login', '/', '/cliente/login'];
  if (hideOn.includes(pathname || '')) return null;

  return (
    <header className="w-full bg-white dark:bg-gray-800 border-b border-red-100 dark:border-gray-700 shadow-sm animate-fade-in-down transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
        <div className="flex-1">
          <div className="relative max-w-lg">
            <input
              aria-label="Buscar"
              placeholder="Buscar..."
              className="w-full rounded-full border border-red-200 dark:border-gray-600 bg-red-50/30 dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 focus:scale-105"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 dark:text-red-500 text-sm">⌕</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button className="px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110 transition-all duration-200">🏠</button>
          <button className="px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-110 transition-all duration-200 animate-pulse-slow">🔔</button>
          <button id="logoutBtn" className="px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-gray-700 text-red-700 dark:text-red-400 font-medium" onClick={() => { window.location.href = '/login'; }}>Cerrar sesión</button>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">ROBERT WILLIAM</div>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-red-600 dark:bg-red-700 text-white flex items-center justify-center font-medium hover:scale-110 transition-all duration-200 cursor-pointer">RW</div>
          </div>
        </div>
      </div>
    </header>
  );
}
