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
  UserCircle,
  Plus
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
    <div className="min-h-screen bg-white flex text-slate-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-white border-r border-slate-100 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm"
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-lg shadow-red-600/20">
            <Fuel className="w-5 h-5" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 flex flex-col pt-1"
              >
                <span className="font-black text-xl tracking-tighter leading-none italic">
                  INSULA<span className="text-red-600">GUAIRA</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Gas System</span>
              </motion.div>
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
                    ? 'bg-red-50 text-red-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3 font-bold text-sm tracking-tight"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && isSidebarOpen && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-2 w-1.5 h-1.5 bg-red-600 rounded-full" 
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-3 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center h-12 px-3 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5 min-w-[20px]" />
            {isSidebarOpen && <span className="ml-3">Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-slate-100 hidden sm:block mx-2" />
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Panel de Control</h2>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{userData?.nombre || 'Admin'}</p>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Master Access</p>
              </div>
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                {userData?.nombre?.[0] || 'I'}
              </div>
            </div>
          </div>
        </header>

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
