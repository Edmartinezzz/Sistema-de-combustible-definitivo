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
  { id: 'entidades', label: 'Entidades Madre', icon: Building2, href: '/dashboard/entidades' },
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
    <div className="min-h-screen bg-white flex text-slate-900 overflow-x-hidden">
      <main className="flex-1 w-full min-h-screen">
        <div className="p-4 md:p-10 pb-32 max-w-7xl mx-auto">
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
