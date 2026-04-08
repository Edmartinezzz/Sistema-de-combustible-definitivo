'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Fuel, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight,
  TrendingDown,
  UserCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const navItems = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'clientes', label: 'Clientes', icon: Users, href: '/clientes' },
  { id: 'despacho', label: 'Registrar Despacho', icon: Fuel, href: '/dashboard/despacho' },
  { id: 'nuevo-cliente', label: 'Nuevo Cliente', icon: Plus, href: '/dashboard/registrar-cliente' },
  { id: 'historial', label: 'Historial', icon: History, href: '/historial' },
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
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out"
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <Fuel className="w-6 h-6" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 font-bold text-xl tracking-tight"
              >
                Gas+
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center h-12 px-3 rounded-xl transition-all relative group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3 font-semibold text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-2 w-1.5 h-1.5 bg-blue-600 rounded-full" 
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center h-12 px-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-semibold text-sm"
          >
            <LogOut className="w-5 h-5 min-w-[20px]" />
            {isSidebarOpen && <span className="ml-3">Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar cliente o placa..."
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{userData?.nombre || 'Administrador'}</p>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-tighter">Admin Master</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 transition-transform hover:scale-105 cursor-pointer">
                {userData?.nombre?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-8 pb-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
