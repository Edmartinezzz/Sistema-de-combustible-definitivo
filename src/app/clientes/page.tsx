'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  CreditCard,
  ChevronRight,
  ArrowUpDown,
  Edit2,
  Trash2,
  Mail,
  ExternalLink
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Clientes</h1>
          <p className="text-slate-500 font-medium">Administra y monitorea el consumo de tus beneficiarios.</p>
        </div>
        <button className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, cédula o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center space-x-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Información del Cliente</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Estado de Cupo</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredClientes.map((cliente, idx) => (
                  <motion.tr 
                    key={cliente.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg group-hover:scale-110 transition-transform">
                          {cliente.nombre[0]}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900 leading-none mb-1">{cliente.nombre}</p>
                          <p className="text-xs font-semibold text-slate-400">ID: {cliente.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-center">
                        <div className="flex justify-between w-40 text-[10px] font-bold text-slate-400 mb-1.5 px-1">
                          <span>{cliente.cupo_consumido} GL usados</span>
                          <span>{cliente.cupo_mensual} GL</span>
                        </div>
                        <div className="w-40 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(cliente.cupo_consumido / cliente.cupo_mensual) * 100}%` }}
                            className={`h-full rounded-full ${
                              (cliente.cupo_consumido / cliente.cupo_mensual) > 0.8 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm font-semibold text-slate-600">
                          <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          {cliente.telefono}
                        </div>
                        <div className="flex items-center text-xs font-medium text-slate-400">
                          <CreditCard className="w-3.5 h-3.5 mr-2 text-slate-300" />
                          Cupo Mensual: {cliente.cupo_mensual} GL
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredClientes.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No hay clientes que coincidan</h3>
            <p className="text-slate-400 mt-2">Intenta buscar con otros términos o registra uno nuevo.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 mt-4 font-bold">Cargando beneficiarios...</p>
          </div>
        )}
      </div>
    </div>
  );
}
