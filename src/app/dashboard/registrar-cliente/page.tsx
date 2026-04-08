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
      toast.success('Beneficiario registrado con éxito');
      router.push('/clientes');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => router.back()}
          className="p-4 bg-white border border-slate-100 rounded-[2rem] text-slate-400 hover:text-red-600 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Alta de Beneficiario</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic">Base de Datos Insula Guaira</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Nombre y Apellido</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="text" required placeholder="Juán Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-slate-900 font-bold focus:ring-4 focus:ring-red-600/5 transition-all uppercase italic"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Cédula de Identidad</label>
              <div className="relative group">
                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="text" required placeholder="V-27.123.456"
                  value={formData.cedula}
                  onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-slate-900 font-bold focus:ring-4 focus:ring-red-600/5 transition-all uppercase"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Teléfono de Contacto</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="tel" required placeholder="0412 000 0000"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-slate-900 font-bold focus:ring-4 focus:ring-red-600/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Cupo Mensual (Galones)</label>
              <div className="relative group">
                <Fuel className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="number" required placeholder="50"
                  value={formData.cupo_mensual}
                  onChange={(e) => setFormData({...formData, cupo_mensual: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-slate-900 font-bold focus:ring-4 focus:ring-red-600/5 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center text-slate-400 text-[9px] font-black uppercase tracking-widest italic">
              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              Suscripción sujeta a validación central
            </div>
            <button 
              type="submit" disabled={loading}
              className="px-12 py-5 bg-red-600 text-white rounded-[2rem] font-black shadow-2xl shadow-red-600/40 hover:bg-black transition-all active:scale-95 disabled:opacity-50 uppercase tracking-tighter flex items-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-3" />
                  <span>Guardar Beneficiario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
