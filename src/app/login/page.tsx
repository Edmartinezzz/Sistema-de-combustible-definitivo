'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Fuel, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !contrasena) {
      toast.error('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { usuario, contrasena });
      const { token, usuario: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`¡Bienvenido, ${userData.nombre}!`);
      
      // Animación antes de redirigir
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px] opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Header Logo */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-500/10 mb-6 border border-white"
          >
            <Fuel className="w-10 h-10 text-blue-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Despacho Gas+</h1>
          <p className="text-slate-500 font-medium tracking-wide">PANEL DE ADMINISTRACIÓN</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-10 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 px-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 rounded-2xl text-slate-900 placeholder-slate-400 font-medium transition-all"
                  placeholder="Introduce tu usuario"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 px-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 rounded-2xl text-slate-900 placeholder-slate-400 font-medium transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    Acceder al sistema
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-400 text-sm font-medium">
              © 2026 Sistema Combustible Definitivo
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
