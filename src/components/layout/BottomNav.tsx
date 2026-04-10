"use client";
// Trigger deployment - UI Navigation Fix Verified
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
  LogOut,
  Zap,
  Plus,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { isAdmin, logout: adminLogout, isAuthenticated: isAdminAuth, loading } = useAuth();
  const { cliente, logout: clienteLogout } = useClienteAuth();

  // Opciones para el Administrador (Dueño) - Sincronizado con DashboardLayout (7 items)
  const adminItems = [
    { label: 'Resumen', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Reserva', icon: Fuel, path: '/dashboard/combustible' },
    { label: 'Entidades', icon: Building2, path: '/dashboard/entidades' },
    { label: 'Clientes', icon: Users, path: '/clientes' },
    { label: 'Despacho', icon: Zap, path: '/dashboard/despacho', isSpecial: true },
    { label: 'Nuevo', icon: Plus, path: '/dashboard/registrar-cliente' },
    { label: 'Historia', icon: History, path: '/historial' },
  ];

  // Opciones para el Beneficiario (Cliente)
  const clienteItems = [
    { label: 'Resumen', icon: LayoutDashboard, path: '/portal-beneficiario' },
    { label: 'Historial', icon: History, path: '/portal-beneficiario' },
    { label: 'Perfil', icon: User, path: '/portal-beneficiario' },
  ];

  // Determinar qué items mostrar
  let navItems = [];
  let logoutAction: (() => void) | null = null;

  if (isAdmin || (pathname && pathname.startsWith('/dashboard'))) {
    navItems = adminItems;
    logoutAction = adminLogout;
  } else if (cliente || (pathname && pathname.includes('portal-beneficiario'))) {
    navItems = clienteItems;
    logoutAction = clienteLogout;
  }

  // Si es una página de login o landing, no mostrar nada
  const hideOn = ['/login', '/', '/cliente/login'];
  
  // No ocultar si estamos en el dashboard aunque navItems esté vacío momentáneamente (evita parpadeo)
  const isDashboardRoute = pathname?.startsWith('/dashboard') || pathname === '/clientes' || pathname === '/historial';
  
  if (hideOn.includes(pathname || '') || (navItems.length === 0 && !isDashboardRoute)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-2 pb-5">
      <div className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border border-white/40 dark:border-gray-800/50 shadow-[0_15px_60px_rgba(0,0,0,0.15)] rounded-[2.5rem] flex items-center justify-between px-3 py-2 transition-all duration-300">
        <div className="flex flex-1 items-center justify-around">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            if (item.isSpecial) {
              return (
                <Link 
                  key={item.path + item.label} 
                  href={item.path}
                  className="relative -top-6 flex items-center justify-center"
                >
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-2xl ${
                    isActive 
                      ? 'bg-slate-900 text-white rotate-12 scale-110' 
                      : 'bg-red-600 text-white hover:scale-105 active:scale-95 shadow-red-600/40'
                  }`}>
                    <Icon size={28} strokeWidth={2.5} fill={isActive ? "currentColor" : "none"} />
                  </div>
                  {/* Etiqueta especial debajo del botón flotante */}
                  <span className="absolute -bottom-5 text-[9px] font-black text-red-600 uppercase tracking-tighter opacity-80">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link 
                key={item.path + item.label} 
                href={item.path}
                className={`relative flex flex-col items-center justify-center w-11 h-12 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'text-red-600 scale-110' 
                    : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                <div className={`transition-all duration-300 ${isActive ? 'mb-1' : ''}`}>
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-90'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 rounded-full bg-red-600" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Separador sutil antes del logout */}
        <div className="w-[1px] h-8 bg-slate-100 dark:bg-gray-800 mx-1" />

        {/* Botón de Logout */}
        {logoutAction && (
          <button 
            onClick={logoutAction}
            className="flex flex-col items-center justify-center w-11 h-12 text-slate-300 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} strokeWidth={2} />
            <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Salir</span>
          </button>
        )}
      </div>
    </nav>
  );
}
