'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';
import { FiUser, FiArrowLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function ClienteLogin() {
  const [cedula, setCedula] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useClienteAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const cedulaParam = searchParams.get('cedula');
    if (cedulaParam) {
      setCedula(cedulaParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cedulaRegex = /^[0-9]{7,8}$/;
    if (!cedulaRegex.test(cedula)) {
      setError('La cédula debe tener 7 u 8 dígitos numéricos');
      return;
    }

    if (!contrasena || contrasena.length < 4) {
      setError('Ingresa tu contraseña');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(cedula, contrasena);
    } catch (error: any) {
      setError(error.message || 'Cédula o contraseña incorrecta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800 py-12 px-4 relative">
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 flex items-center text-white/80 hover:text-white transition-colors text-sm font-semibold"
      >
        <FiArrowLeft className="mr-2" />
        Volver
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-red-600/30">
              <FiUser className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
              Portal <span className="text-red-600">Beneficiario</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
              Sistema Insula Guaira
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cédula */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                Número de Cédula
              </label>
              <div className="relative">
                <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="Ej: 12345678"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                  maxLength={8}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:border-red-600 focus:ring-0 transition-all outline-none"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                Contraseña
              </label>
              <div className="relative">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tu contraseña de acceso"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full pl-14 pr-14 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:border-red-600 focus:ring-0 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tight transition-all shadow-xl shadow-red-600/30 active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : (
                'Acceder al Portal'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-xs text-slate-400 hover:text-red-600 transition-colors font-bold uppercase tracking-widest"
            >
              ¿Eres administrador?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
