'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MoreVertical, 
  Edit2,
  Building2,
  Fuel,
  Zap
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await axios.get('/api/clientes');
      setClientes(res.data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cedula.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Base de Beneficiarios</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic tracking-widest">Padrón Único Insula Guaira</p>
        </div>
        <button 
          onClick={() => window.location.href='/dashboard/registrar-cliente'}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-red-600 text-white rounded-[2rem] font-black shadow-xl shadow-red-600/20 hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-tighter italic"
        >
          <Plus className="w-5 h-5" />
          <span>Registrar Beneficiario</span>
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
        <input 
          type="text" placeholder="Buscar por nombre o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all shadow-sm italic"
        />
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Información Principal</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Vínculo / Entidad Madre</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Consumo Cupo</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredClientes.map((cliente) => (
                  <motion.tr 
                    key={cliente.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="group hover:bg-red-50/30 transition-colors"
                  >
                    <td className="px-10 py-8">
                       <div className="flex items-center space-x-5">
                          <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-xl group-hover:bg-red-600 transition-all italic">
                             {cliente.nombre[0]}
                          </div>
                          <div>
                             <p className="text-base font-black text-slate-900 leading-none mb-1 uppercase italic tracking-tighter">{cliente.nombre}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CID: {cliente.cedula}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-8">
                       <div className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-2xl w-fit">
                          <Building2 className="w-4 h-4 text-red-600" />
                          <span className="text-[10px] font-black text-slate-700 uppercase italic tracking-tighter">
                             {cliente.entidades?.nombre || 'Particular / General'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-8">
                       <div className="flex flex-col items-center space-y-3">
                          <div className="flex space-x-4">
                             <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-red-600 uppercase italic">Gasolina</span>
                                <span className="text-[10px] font-bold text-slate-400">{cliente.consumo_gasolina}/{cliente.cupo_gasolina} L</span>
                             </div>
                             <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-900 uppercase italic">Gasoil</span>
                                <span className="text-[10px] font-bold text-slate-400">{cliente.consumo_gasoil}/{cliente.cupo_gasoil} L</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <button className="p-3 text-slate-300 hover:text-red-600 transition-all"><Edit2 className="w-5 h-5" /></button>
                          <button className="p-3 text-slate-300 hover:text-red-600 transition-all"><MoreVertical className="w-5 h-5" /></button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
