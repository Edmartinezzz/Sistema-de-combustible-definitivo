"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User, LogOut } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Portal', icon: Home, path: '/portal-beneficiario' },
    { label: 'Historial', icon: ClipboardList, path: '/historial' },
    { label: 'Perfil', icon: User, path: '/admin' }, // Adaptable according to roles
  ];

  // Specific check for layout visibility
  const hideOn = ['/login', '/', '/cliente/login'];
  if (hideOn.includes(pathname || '')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-2xl rounded-2xl flex items-center justify-around p-3 transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive 
                  ? 'text-red-600 dark:text-red-500 scale-110' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-400'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-red-600 dark:bg-red-500 mt-0.5" />
              )}
            </Link>
          );
        })}
        
        <button 
          onClick={() => window.location.href = '/login'}
          className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Salir</span>
        </button>
      </div>
    </nav>
  );
}
