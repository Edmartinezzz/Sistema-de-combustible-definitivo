'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Search, 
  Download, 
  Fuel, 
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Bitácora de Salida</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic">Auditoría de Despachos Insula Guaira</p>
        </div>
        <button className="flex items-center justify-center space-x-3 px-8 py-4 bg-black text-white rounded-[2rem] font-black shadow-xl hover:bg-red-600 transition-all active:scale-95 uppercase text-[10px] tracking-widest italic">
          <Download className="w-5 h-5" />
          <span>Exportar PDF</span>
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
        <input 
          type="text" placeholder="Búsqueda por beneficiario o placa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all shadow-sm italic"
        />
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Actividad Reciente</span>
        </div>

        <div className="divide-y divide-slate-50">
          <AnimatePresence mode="popLayout">
            {filteredRetiros.map((retiro, idx) => (
              <motion.div 
                key={retiro.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group flex flex-col md:flex-row md:items-center justify-between p-8 hover:bg-red-50/20 transition-colors"
              >
                <div className="flex items-center space-x-8">
                  <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white group-hover:bg-red-600 transition-all duration-500 shadow-lg">
                    <ArrowDownLeft className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-black text-slate-900 leading-none mb-2 uppercase italic tracking-tighter">
                      {retiro.clientes?.nombre || 'Beneficiario'}
                    </h4>
                    <div className="flex items-center space-x-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-2 text-red-600" />
                        ID: {retiro.clientes?.cedula || 'N/A'}
                      </span>
                      <span className="flex items-center">
                        <Fuel className="w-3 h-3 mr-2 text-red-600" />
                        VEH: {retiro.placa}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:items-center mt-6 md:mt-0 text-left md:text-right flex-col md:flex-row md:space-x-12">
                  <div className="mb-4 md:mb-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-2">Sincronización</p>
                    <p className="text-sm font-black text-slate-900 uppercase">
                      {format(new Date(retiro.fecha), "PPP", { locale: es })}
                    </p>
                    <p className="text-xs font-bold text-red-600">{format(new Date(retiro.fecha), "hh:mm a")}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-red-600 tracking-tighter italic">
                      -{retiro.litros} <span className="text-sm font-black opacity-40 uppercase">GL</span>
                    </p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 italic">Operador: {retiro.registrado_por}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRetiros.length === 0 && !loading && (
            <div className="py-24 text-center">
              <HistoryIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-200 uppercase italic">Sin registros de actividad</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
