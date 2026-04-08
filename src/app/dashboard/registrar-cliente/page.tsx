'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  CreditCard, 
  Droplet, 
  Fuel, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function RegistrarClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    cupo_mensual: '50'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/clientes', formData);
      toast.success('Cliente registrado exitosamente');
      router.push('/clientes');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al registrar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nuevo Beneficiario</h1>
          <p className="text-slate-500 font-medium">Registra un nuevo cliente en el sistema de subsidio.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nombre Completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Cédula */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Documento / Cédula</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="27.123.456"
                  value={formData.cedula}
                  onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Teléfono Móvil</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="tel" 
                  required
                  placeholder="0412 123 4567"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Cupo Mensual */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Cupo Mensual (Galones)</label>
              <div className="relative group">
                <Fuel className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="number" 
                  required
                  placeholder="50"
                  value={formData.cupo_mensual}
                  onChange={(e) => setFormData({...formData, cupo_mensual: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 mr-2" />
              Todos los campos son obligatorios
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Guardar Cliente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
