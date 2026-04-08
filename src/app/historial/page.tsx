'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Search, 
  Download, 
  ChevronRight, 
  Fuel, 
  Calendar,
  User,
  ArrowDownLeft
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HistorialPage() {
  const [retiros, setRetiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRetiros();
  }, []);

  const fetchRetiros = async () => {
    try {
      const res = await axios.get('/api/retiros');
      setRetiros(res.data);
    } catch (error) {
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const filteredRetiros = retiros.filter(r => 
    r.clientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.placa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historial de Despachos</h1>
          <p className="text-slate-500 font-medium">Auditoría completa de retiros de combustible realizados.</p>
        </div>
        <button className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95">
          <Download className="w-5 h-5" />
          <span>Exportar Reporte (PDF)</span>
        </button>
      </div>

      {/* Toolbar Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar por cliente o placa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {/* Audit List Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registros de Actividad</span>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-blue-600 uppercase">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span>Datos en tiempo real</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {filteredRetiros.map((retiro, idx) => (
              <motion.div 
                key={retiro.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center space-x-6">
                  {/* Icono de Tipo de Retiro */}
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ArrowDownLeft className="w-7 h-7" />
                  </div>
                  
                  {/* Info Cliente */}
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                      {retiro.clientes?.nombre || 'Beneficiario'}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs font-semibold text-slate-400">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        ID: {retiro.clientes?.cedula || 'N/A'}
                      </span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="flex items-center">
                        <Fuel className="w-3 h-3 mr-1" />
                        Placa: {retiro.placa}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cantidad y Fecha */}
                <div className="flex md:items-center mt-4 md:mt-0 md:text-right flex-col md:flex-row md:space-x-12">
                  <div className="mb-2 md:mb-0">
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1">Fecha de Registro</p>
                    <p className="text-sm font-bold text-slate-900">
                      {format(new Date(retiro.fecha), "PPP 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-blue-600 text-2xl">
                      -{retiro.cantidad} <span className="text-sm font-bold opacity-60">GL</span>
                    </p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Registrado por: {retiro.registrado_por}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRetiros.length === 0 && !loading && (
            <div className="py-20 text-center">
              <HistoryIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">No hay registros aún</h3>
            </div>
          )}

          {loading && (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto pb-4" />
              <p className="text-slate-400 font-bold mt-4">Sincronizando historial...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
