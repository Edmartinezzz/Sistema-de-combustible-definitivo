"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Fuel, 
  Building2, 
  Users, 
  Zap, 
  Plus, 
  History,
  LogOut 
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Resumen', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Reserva', icon: Fuel, path: '/dashboard/combustible' },
    { label: 'Entidades', icon: Building2, path: '/dashboard/entidades' },
    { label: 'Clientes', icon: Users, path: '/clientes' },
    { label: 'Despacho', icon: Zap, path: '/dashboard/despacho' },
    { label: 'Nuevo', icon: Plus, path: '/dashboard/registrar-cliente' },
    { label: 'Historial', icon: History, path: '/historial' },
  ];

  // Specific check for layout visibility
  const hideOn = ['/login', '/', '/cliente/login'];
  if (hideOn.includes(pathname || '')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="mx-4 mb-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-2xl rounded-2xl flex items-center overflow-x-auto no-scrollbar p-2 transition-colors duration-300">
        <div className="flex items-center gap-6 px-4 min-w-max">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex flex-col items-center gap-1 transition-all duration-300 shrink-0 ${
                  isActive 
                    ? 'text-red-600 dark:text-red-500 scale-105' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-red-600 dark:bg-red-500 mt-0.5" />
                )}
              </Link>
            );
          })}
          
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-all duration-200 shrink-0"
          >
            <LogOut size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tight">Salir</span>
          </button>
        </div>
      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
}
