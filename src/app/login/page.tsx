'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Fuel, ArrowRight, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

type LoginMode = 'admin' | 'cliente';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('admin');
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
      // Nota: El backend /api/auth/login ya maneja ambos casos (usuario admin o cédula cliente)
      const response = await axios.post('/api/auth/login', { usuario, contrasena });
      const { token, usuario: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`¡Bienvenido, ${userData.nombre}!`);
      
      setTimeout(() => {
        if (userData.rol === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/portal-beneficiario');
        }
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-red-50 rounded-full blur-[120px] opacity-70" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-slate-50 rounded-full blur-[120px] opacity-70" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Header Logo */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex flex-col items-center justify-center w-full mb-2"
          >
            <div className="text-5xl font-black tracking-tighter text-slate-900 italic leading-none">
              INSULA<span className="text-red-600">GUAIRA</span>
            </div>
            <div className="mt-3 flex items-center space-x-2">
               <div className="h-[2px] w-8 bg-red-600/30 rounded-full" />
               <p className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">Despacho de Combustible</p>
               <div className="h-[2px] w-8 bg-red-600/30 rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Card de Login con Tabs */}
        <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/60 transition-all">
          
          {/* Selector de Modo (Tabs) */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8 relative">
            <motion.div 
              className="absolute h-[calc(100%-12px)] top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm z-0"
              initial={false}
              animate={{ 
                x: mode === 'admin' ? 0 : '100%',
                width: 'calc(50% - 6px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            <button
              onClick={() => { setMode('admin'); setUsuario(''); }}
              className={`relative z-10 flex-1 flex items-center justify-center py-3 text-xs font-black uppercase tracking-widest transition-colors ${mode === 'admin' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Admin
            </button>
            
            <button
              onClick={() => { setMode('cliente'); setUsuario(''); }}
              className={`relative z-10 flex-1 flex items-center justify-center py-3 text-xs font-black uppercase tracking-widest transition-colors ${mode === 'cliente' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Beneficiario
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'admin' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'admin' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                    {mode === 'admin' ? 'Usuario Administrativo' : 'Cédula de Identidad'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      {mode === 'admin' ? (
                        <User className="h-5 w-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                      )}
                    </div>
                    <input
                      type={mode === 'admin' ? 'text' : 'text'}
                      value={usuario}
                      onChange={(e) => setUsuario(mode === 'cliente' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                      className="block w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 border-transparent focus:border-red-500/10 focus:ring-4 focus:ring-red-500/5 rounded-2xl text-slate-900 placeholder-slate-300 font-bold transition-all outline-none"
                      placeholder={mode === 'admin' ? 'Ej: admin' : 'Ej: 12345678'}
                      maxLength={mode === 'cliente' ? 8 : 20}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Contraseña</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      className="block w-full pl-14 pr-5 py-4.5 bg-slate-50 border-2 border-transparent focus:border-red-500/10 focus:ring-4 focus:ring-red-500/5 rounded-2xl text-slate-900 placeholder-slate-300 font-bold transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center py-4.5 px-4 bg-red-600 hover:bg-slate-900 text-white text-base font-black uppercase italic tracking-tighter rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-[0.98] overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center">
                  Acceder al Sistema
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
              Soporte: +58 412-1234567
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-50">
          © 2026 Insula Guaira C.A. - Todos los derechos reservados
        </p>
      </motion.div>
    </div>
  );
}
