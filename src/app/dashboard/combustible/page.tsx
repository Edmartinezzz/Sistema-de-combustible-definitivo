'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, 
  Zap, 
  PlusCircle, 
  Database, 
  Save, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function CombustiblePage() {
  const [inventario, setInventario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const res = await axios.get('/api/inventario');
      setInventario(res.data);
    } catch (error) {
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const updateTanque = async (tipo: 'Gasolina' | 'Gasoil', data: any) => {
    setUpdating(tipo);
    try {
      await axios.put('/api/inventario', {
        tipo,
        ...data
      });
      toast.success(`Reserva de ${tipo} actualizada`);
      fetchInventario();
    } catch (error) {
      toast.error('Error al actualizar tanque');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center font-black text-slate-400 italic">CARGANDO RESERVAS...</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Reserva General</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic tracking-widest">Suministro de Planta Insula Guaira</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <TanqueEditor 
          tipo="Gasolina" 
          data={inventario.gasolina} 
          onSave={(data: any) => updateTanque('Gasolina', data)} 
          loading={updating === 'Gasolina'}
          color="red"
        />
        <TanqueEditor 
          tipo="Gasoil" 
          data={inventario.gasoil} 
          onSave={(data: any) => updateTanque('Gasoil', data)} 
          loading={updating === 'Gasoil'}
          color="black"
        />
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20">
                 <Database className="w-8 h-8 text-red-600" />
              </div>
              <div>
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2 underline decoration-red-600">Auditoría de Carga</h3>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic">El sistema bloquea despachos cuando los tanques llegan al 0%</p>
              </div>
           </div>
           <button onClick={fetchInventario} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest italic transition-all">
              Refrescar Sensores
           </button>
        </div>
      </div>
    </div>
  );
}

function TanqueEditor({ tipo, data, onSave, loading, color }: any) {
  const [current, setCurrent] = useState(data?.cantidad_actual || 0);
  const [capacidad, setCapacidad] = useState(data?.capacidad_total || 0);
  const isRed = color === 'red';

  const percentage = (current / capacidad) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-[3.5rem] border p-1(0 shadow-sm relative overflow-hidden flex flex-col h-full ${isRed ? 'border-red-100' : 'border-slate-200'}`}>
      <div className="p-10 space-y-10 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-5 rounded-3xl text-white shadow-xl ${isRed ? 'bg-red-600 shadow-red-500/30' : 'bg-slate-900 shadow-slate-900/40'}`}>
            {isRed ? <Fuel className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
          </div>
          <div className="text-right">
             <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${isRed ? 'text-red-600' : 'text-slate-900'}`}>Tanque {tipo}</h2>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] italic">Reserva de Suministro</p>
          </div>
        </div>

        <div className="px-4 py-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 italic">
           <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
              <span>Nivel Actual</span>
              <span>{percentage.toFixed(1)}%</span>
           </div>
           <div className="h-6 bg-slate-200 rounded-full overflow-hidden p-1">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                className={`h-full rounded-full ${isRed ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`}
              />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic pl-2">Cantidad (GL)</label>
              <input 
                type="number" value={current} onChange={(e) => setCurrent(e.target.value)}
                className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-2xl font-black text-slate-900 focus:border-red-600 transition-all text-center tracking-tighter italic"
              />
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic pl-2">Max. Capacidad</label>
              <input 
                type="number" value={capacidad} onChange={(e) => setCapacidad(e.target.value)}
                className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-2xl font-black text-slate-900 focus:border-red-600 transition-all text-center tracking-tighter italic"
              />
           </div>
        </div>
      </div>

      <div className="p-8 border-t border-slate-50 bg-slate-50/20">
        <button 
          onClick={() => onSave({ cantidad_actual: current, capacidad_total: capacidad })}
          disabled={loading}
          className={`w-full py-5 rounded-[2rem] font-black flex items-center justify-center space-x-3 transition-all text-white uppercase italic tracking-tighter ${isRed ? 'bg-red-600 hover:bg-black shadow-lg shadow-red-600/20' : 'bg-slate-900 hover:bg-red-600 shadow-xl'}`}
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
