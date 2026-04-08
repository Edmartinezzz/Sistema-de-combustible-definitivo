'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Fuel, 
  History as HistoryIcon, 
  LogOut, 
  Menu, 
  Zap,
  Plus,
  Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const navItems = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'combustible', label: 'Gestión de Reserva', icon: Fuel, href: '/dashboard/combustible' },
  { id: 'entidades', label: 'Secretarías/Entidades', icon: Building2, href: '/dashboard/entidades' },
  { id: 'clientes', label: 'Clientes', icon: Users, href: '/clientes' },
  { id: 'despacho', label: 'Registrar Despacho', icon: Zap, href: '/dashboard/despacho' },
  { id: 'nuevo-cliente', label: 'Nuevo Cliente', icon: Plus, href: '/dashboard/registrar-cliente' },
  { id: 'historial', label: 'Historial', icon: HistoryIcon, href: '/historial' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    } else {
      setUserData(JSON.parse(user));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Sesión cerrada');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white flex text-slate-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-white border-r border-slate-100 z-50 flex flex-col transition-all duration-300 shadow-sm"
      >
        <div className="h-24 flex items-center px-6 mb-4">
          <div className="bg-red-600 p-3 rounded-2xl text-white shadow-xl shadow-red-600/30">
            <Fuel className="w-6 h-6" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="ml-4 flex flex-col pt-1"
              >
                <span className="font-black text-xl italic tracking-tighter leading-none">
                  INSULA<span className="text-red-600">GUAIRA</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mt-1">Dual Gas System</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center h-14 px-4 rounded-2xl transition-all relative group ${
                  isActive 
                    ? 'bg-red-50 text-red-600' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                {isSidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-4 font-black text-xs uppercase italic tracking-tight">
                    {item.label}
                  </motion.span>
                )}
                {isActive && isSidebarOpen && (
                  <motion.div layoutId="active-nav" className="absolute right-3 w-2 h-2 bg-red-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center h-14 px-4 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all font-black text-xs uppercase italic"
          >
            <LogOut className="w-5 h-5 min-w-[20px]" />
            {isSidebarOpen && <span className="ml-4">Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-50 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors border border-transparent hover:border-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-10 w-[1px] bg-slate-100" />
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Consola de Administración</h2>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">{userData?.nombre || 'Administrador'}</p>
              <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-0.5">Acceso Master</p>
            </div>
            <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-slate-900/20">
              {userData?.nombre?.[0] || 'A'}
            </div>
          </div>
        </header>

        <div className="p-10 pb-20 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
