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
    <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-200">
            D
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white lg:hidden">
            GAS<span className="text-red-600">+</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
            <span className="text-xl">🔔</span>
          </button>
          <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 mx-2" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center font-bold hover:ring-2 hover:ring-red-100 transition-all duration-200 cursor-pointer">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
