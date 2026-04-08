'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Fuel, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';

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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Fondo decorativo sutil en Rojo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-slate-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Header Logo Insula Guaira */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-full mb-6"
          >
            {/* Aquí va tu logo. Asegúrate de colocarlo en public/logo.png */}
            <div className="relative w-64 h-24">
               <div className="text-4xl font-black tracking-tighter text-slate-900 italic">
                  INSULA<span className="text-red-600">GUAIRA</span>
               </div>
               <p className="text-[10px] font-bold tracking-[0.3em] text-slate-400 mt-2 uppercase">Despacho de Combustible</p>
            </div>
          </motion.div>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-0 focus:ring-2 focus:ring-red-500 rounded-2xl text-slate-900 placeholder-slate-400 font-medium transition-all"
                  placeholder="Usuario administrador"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-0 focus:ring-2 focus:ring-red-500 rounded-2xl text-slate-900 placeholder-slate-400 font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center py-4 px-4 bg-red-600 hover:bg-black text-white text-lg font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loader"><Loader2 className="w-6 h-6 animate-spin" /></motion.div>
                ) : (
                  <motion.div key="content" className="flex items-center">
                    Iniciar Sesión
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              © 2026 Insula Guaira C.A.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
