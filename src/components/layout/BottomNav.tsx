"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Fuel, 
  Users, 
  Truck,
  History,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { isAdmin, logout: adminLogout, isAuthenticated: isAdminAuth } = useAuth();
  const { cliente, logout: clienteLogout } = useClienteAuth();

  // Opciones para el Administrador (Dueño)
  const adminItems = [
    { label: 'Panel', icon: LayoutDashboard, path: '/admin' },
    { label: 'Inventario', icon: Fuel, path: '/admin/inventario' },
    { label: 'Clientes', icon: Users, path: '/admin/clientes' },
    { label: 'Repartidor', icon: Truck, path: '/driver' },
  ];

  // Opciones para el Beneficiario (Cliente)
  const clienteItems = [
    { label: 'Resumen', icon: LayoutDashboard, path: '/portal-beneficiario' },
    { label: 'Historial', icon: History, path: '/portal-beneficiario' }, // El historial está integrado en la misma página por ahora
    { label: 'Perfil', icon: User, path: '/portal-beneficiario' },
  ];

  // Determinar qué items mostrar
  let navItems = [];
  let logoutAction: (() => void) | null = null;

  if (isAdmin && isAdminAuth) {
    navItems = adminItems;
    logoutAction = adminLogout;
  } else if (cliente) {
    navItems = clienteItems;
    logoutAction = clienteLogout;
  }

  // Si no hay sesión o es una página de login o el portal del beneficiario, no mostrar nada
  const hideOn = ['/login', '/', '/cliente/login', '/portal-beneficiario', '/cliente/dashboard'];
  if (hideOn.includes(pathname || '') || navItems.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-6">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/40 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex items-center justify-around p-2 transition-all duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path + item.label} 
              href={item.path}
              className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 ${
                isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-110 -translate-y-2' 
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
              }`}
            >
              <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
              {!isActive && (
                <span className="text-[9px] font-bold mt-1 opacity-80 uppercase tracking-tighter">{item.label}</span>
              )}
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
              )}
            </Link>
          );
        })}

        {/* Botón de Logout Rápido en Móvil */}
        {logoutAction && (
          <button 
            onClick={logoutAction}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} strokeWidth={2} />
            <span className="text-[9px] font-bold mt-1 opacity-80 uppercase tracking-tighter">Salir</span>
          </button>
        )}
      </div>
    </nav>
  );
}
