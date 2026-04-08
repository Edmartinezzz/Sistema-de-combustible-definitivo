'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Fuel, 
  Zap, 
  Save, 
  ArrowLeft,
  ChevronRight,
  Database,
  Search,
  Users
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function EntidadesPage() {
  const [entidades, setEntidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cupo_gasolina: '0',
    cupo_gasoil: '0'
  });

  useEffect(() => {
    fetchEntidades();
  }, []);

  const fetchEntidades = async () => {
    try {
      const res = await axios.get('/api/entidades');
      setEntidades(res.data);
    } catch (error) {
      toast.error('Error al cargar entidades');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/entidades', formData);
      toast.success('Entidad creada con éxito');
      setShowModal(false);
      setFormData({ nombre: '', cupo_gasolina: '0', cupo_gasoil: '0' });
      fetchEntidades();
    } catch (error) {
      toast.error('Error al crear entidad');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Direcciones y Entidades</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic tracking-widest">Gestión de Cupos Jerárquicos Insula Guaira</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-red-600 text-white rounded-[2rem] font-black shadow-xl shadow-red-600/20 hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-widest italic"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Entidad Madre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {entidades.map((entidad) => (
          <EntidadCard key={entidad.id} entidad={entidad} />
        ))}
      </div>

      {/* Modal de Creación */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Registrar Entidad Madre</h2>
              <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Nombre de la Entidad (Madre)</label>
                  <input 
                    type="text" required placeholder="Ej: Gobernación, Secretaría, etc."
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-red-600/5 transition-all italic uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Cupo Gasolina (GL)</label>
                    <input 
                      type="number" required
                      value={formData.cupo_gasolina}
                      onChange={(e) => setFormData({...formData, cupo_gasolina: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black text-slate-900 focus:ring-4 focus:ring-red-600/5 transition-all text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Cupo Gasoil (GL)</label>
                    <input 
                      type="number" required
                      value={formData.cupo_gasoil}
                      onChange={(e) => setFormData({...formData, cupo_gasoil: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black text-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all text-center"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-red-600 hover:bg-black text-white rounded-[2rem] font-black shadow-xl shadow-red-600/20 transition-all uppercase italic">
                  Crear Entidad
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EntidadCard({ entidad }: { entidad: any }) {
  const percGas = (entidad.consumo_gasolina / entidad.cupo_gasolina) * 100 || 0;
  const percGasoil = (entidad.consumo_gasoil / entidad.cupo_gasoil) * 100 || 0;

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm hover:border-red-600 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 opacity-40 group-hover:bg-red-50 transition-colors" />
      <div className="relative z-10 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic group-hover:bg-red-600 transition-colors">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter truncate w-48">{entidad.nombre}</h3>
        </div>

        <div className="space-y-4">
          {/* Gasolina */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase italic">
              <span className="flex items-center"><Fuel className="w-3 h-3 mr-1 text-red-600" /> Gasolina</span>
              <span>{entidad.consumo_gasolina} / {entidad.cupo_gasolina} GL</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${percGas}%` }} className="h-full bg-red-600" />
            </div>
          </div>

          {/* Gasoil */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase italic">
              <span className="flex items-center"><Zap className="w-3 h-3 mr-1 text-slate-900" /> Gasoil</span>
              <span>{entidad.consumo_gasoil} / {entidad.cupo_gasoil} GL</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${percGasoil}%` }} className="h-full bg-slate-900" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
           <div className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest flex items-center">
              <Database className="w-3 h-3 mr-1" />
              Dep: {entidad.id.slice(0, 8)}
           </div>
           <button className="text-[10px] font-black text-red-600 uppercase italic tracking-widest hover:underline decoration-2 underline-offset-4">
              Configurar Litros
           </button>
        </div>
      </div>
    </div>
  );
}
