"use client";
import React from 'react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-xl border-r border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <div className="flex flex-col h-full">
        <div className="px-8 py-8 border-b border-gray-50 dark:border-gray-700">
          <div className="text-2xl font-black tracking-tight text-red-600 dark:text-red-500">
            DESPACHO <span className="text-gray-900 dark:text-white">GAS+</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link href="/admin" className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold transition-all duration-200 shadow-sm shadow-red-100/50">
            <span className="text-xl">📊</span>
            <span>Panel General</span>
          </Link>

          <Link href="/admin/inventario" className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-medium transition-all duration-200">
            <span className="text-xl">🛢️</span>
            <span>Inventario</span>
          </Link>

          <Link href="/admin" className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-medium transition-all duration-200">
            <span className="text-xl">👥</span>
            <span>Clientes</span>
          </Link>

          <Link href="/driver" className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-medium transition-all duration-200">
            <span className="text-xl">🚛</span>
            <span>Pueblo Viejo</span>
          </Link>
        </nav>

        <div className="px-6 py-6 border-t border-gray-50 dark:border-gray-700">
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl">
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-2 uppercase tracking-wider">Servicio Técnico</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">¿Necesitas ayuda con el sistema?</p>
            <button className="mt-3 w-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/30 text-red-600 py-2 rounded-xl text-sm font-bold shadow-sm">Soporte</button>
          </div>
        </div>
      </div>
    </aside>
  );
}






