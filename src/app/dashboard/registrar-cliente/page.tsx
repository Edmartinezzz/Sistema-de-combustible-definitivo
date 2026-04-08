'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  Phone, 
  Fuel, 
  Save, 
  ArrowLeft,
  AlertCircle,
  Zap,
  Building2,
  Plus
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function RegistrarClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [entidades, setEntidades] = useState<any[]>([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [newEntityData, setNewEntityData] = useState({
    nombre: '',
    cupo_gasolina: '0',
    cupo_gasoil: '0'
  });
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    cupo_gasolina: '0',
    cupo_gasoil: '0',
    entidad_id: ''
  });

  useEffect(() => {
    fetchEntidades();
  }, []);

  const fetchEntidades = async () => {
    try {
      const res = await axios.get('/api/entidades');
      setEntidades(res.data);
      if (res.data.length > 0 && !formData.entidad_id) {
        setFormData(prev => ({ ...prev, entidad_id: res.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching entidades');
    }
  };

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/entidades', newEntityData);
      toast.success('Entidad Madre creada');
      await fetchEntidades(); // Recargar lista
      setFormData(prev => ({ ...prev, entidad_id: res.data.id })); // Seleccionar la nueva
      setShowEntityModal(false);
      setNewEntityData({ nombre: '', cupo_gasolina: '0', cupo_gasoil: '0' });
    } catch (error) {
      toast.error('Error al crear entidad');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entidad_id) {
      toast.error('Debes seleccionar una Entidad/Secretaría');
      return;
    }

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
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => router.back()}
          className="p-4 bg-white border border-slate-100 rounded-[2rem] text-slate-400 hover:text-red-600 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Alta Bi-Combustible</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic">Vínculo de Entidad Insula Guaira</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Clasificación Jerárquica */}
          <div className="space-y-4 p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16" />
             <div className="flex items-center justify-between px-2 relative z-10">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Entidad Madre / Clasificación</label>
                <button 
                  type="button"
                  onClick={() => setShowEntityModal(true)}
                  className="flex items-center space-x-2 text-[10px] font-black text-red-600 hover:text-white transition-colors uppercase italic"
                >
                  <Plus className="w-3 h-3" />
                  <span>Configurar Nueva Entidad</span>
                </button>
             </div>
             
             <div className="relative group z-10">
                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-red-600" />
                <select 
                  required
                  value={formData.entidad_id}
                  onChange={(e) => setFormData({...formData, entidad_id: e.target.value})}
                  className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-white font-black italic uppercase focus:ring-4 focus:ring-red-600/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-slate-900">Seleccionar Vínculo...</option>
                  {entidades.length === 0 ? (
                    <option value="" disabled className="text-slate-900 italic">No hay entidades creadas - Pulsa '+' para añadir</option>
                  ) : (
                    entidades.map((entidad) => (
                      <option key={entidad.id} value={entidad.id} className="text-slate-900 uppercase font-bold">
                         {entidad.nombre} (Dispo: {entidad.cupo_gasoil - entidad.consumo_gasoil}L Gasoil)
                      </option>
                    ))
                  )}
                </select>
             </div>
          </div>

          {/* Datos Personales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Beneficiario</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="text" required placeholder="Nombre Completo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-slate-900 font-bold focus:ring-4 focus:ring-red-600/5 transition-all uppercase italic"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Documento</label>
              <div className="relative group">
                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="text" required placeholder="Cédula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-slate-900 font-bold focus:ring-4 focus:ring-red-600/5 transition-all"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Teléfono</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="tel" required placeholder="Contacto"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-slate-900 font-bold focus:ring-4 focus:ring-red-600/5 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Asignación de Cupos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4 p-8 bg-red-50/30 rounded-[2.5rem] border border-red-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg ring-4 ring-white">
                  <Fuel className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-red-600 uppercase italic tracking-tighter">Cupo Gasolina (GL)</h3>
              </div>
              <input 
                type="number" step="0.1" required
                value={formData.cupo_gasolina}
                onChange={(e) => setFormData({...formData, cupo_gasolina: e.target.value})}
                className="w-full px-8 py-5 bg-white border-2 border-red-200 rounded-[2rem] text-3xl font-black text-slate-900 focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all text-center tracking-tighter italic"
              />
            </div>

            <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg ring-4 ring-white">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Cupo Gasoil (GL)</h3>
              </div>
              <input 
                type="number" step="0.1" required
                value={formData.cupo_gasoil}
                onChange={(e) => setFormData({...formData, cupo_gasoil: e.target.value})}
                className="w-full px-8 py-5 bg-white border-2 border-slate-300 rounded-[2rem] text-3xl font-black text-slate-900 focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-center tracking-tighter italic"
              />
            </div>
          </div>

          <div className="pt-10 flex items-center justify-between border-t border-slate-50">
            <div className="flex items-center text-slate-400 text-[9px] font-black uppercase tracking-widest italic">
              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              Consumo compartido con el presupuesto de la Secretaría
            </div>
            <button 
              type="submit" disabled={loading}
              className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 uppercase tracking-tighter flex items-center group"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-3 group-hover:text-red-600 transition-colors" />
                  <span>Finalizar Registro</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Rápido para Nueva Entidad Madre */}
      <AnimatePresence>
        {showEntityModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowEntityModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl border-4 border-red-600/10">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 underline decoration-red-600 decoration-4 underline-offset-8">Nueva Entidad Madre</h2>
              <form onSubmit={handleCreateEntity} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Nombre de la Entidad</label>
                  <input 
                    type="text" required placeholder="Ej: Gobernación del Guairá"
                    value={newEntityData.nombre}
                    onChange={(e) => setNewEntityData({...newEntityData, nombre: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-slate-900 font-bold transition-all uppercase italic"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Litros Gasolina</label>
                    <input 
                      type="number" required
                      value={newEntityData.cupo_gasolina}
                      onChange={(e) => setNewEntityData({...newEntityData, cupo_gasolina: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black text-slate-900 text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Litros Gasoil</label>
                    <input 
                      type="number" required
                      value={newEntityData.cupo_gasoil}
                      onChange={(e) => setNewEntityData({...newEntityData, cupo_gasoil: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black text-slate-900 text-center"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 hover:bg-red-600 text-white rounded-[2rem] font-black shadow-xl transition-all uppercase italic">
                  Guardar y Seleccionar
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
