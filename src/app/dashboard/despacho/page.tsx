'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, 
  Search, 
  User, 
  Zap, 
  CheckCircle2,
  Car,
  Droplet
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function RegistrarDespachoPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [cantidad, setCantidad] = useState('10');
  const [placa, setPlaca] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleDespacho = async () => {
    if (!selectedCliente || !cantidad) {
      toast.error('Selecciona un cliente y la cantidad');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post('/api/retiros', {
        cliente_id: selectedCliente.id,
        cantidad: parseFloat(cantidad),
        placa: placa || 'N/A',
        registrado_por: user.usuario
      });

      toast.success('¡Despacho confirmado con éxito!');
      setSelectedCliente(null);
      setPlaca('');
      fetchClientes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error en el despacho');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Terminal de Despacho</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic">Operaciones de Suministro Insula Guaira</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
            <input 
              type="text" placeholder="Búsqueda rápida por nombre o C.I..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2.5rem] text-sm font-bold focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all shadow-sm"
            />
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Selección de Beneficiario</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => setSelectedCliente(cliente)}
                  className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all group ${
                    selectedCliente?.id === cliente.id 
                      ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                      selectedCliente?.id === cliente.id ? 'bg-white/20' : 'bg-slate-900 text-white'
                    }`}>
                      {cliente.nombre[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black leading-none uppercase italic">{cliente.nombre}</p>
                      <p className={`text-[9px] font-bold mt-1 ${selectedCliente?.id === cliente.id ? 'text-red-100' : 'text-slate-400'}`}>
                        ID: {cliente.cedula}
                      </p>
                    </div>
                  </div>
                  <div className="text-right px-2">
                    <p className={`text-xs font-black italic ${(cliente.cupo_mensual - cliente.cupo_consumido) < 10 ? 'text-red-300' : ''}`}>
                      {(cliente.cupo_mensual - cliente.cupo_consumido).toFixed(1)} GL
                    </p>
                    <p className={`text-[8px] uppercase font-black tracking-widest ${selectedCliente?.id === cliente.id ? 'text-red-200' : 'text-slate-300'}`}>
                      RESTANTE
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!selectedCliente ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[3rem] h-[400px] flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 border border-slate-100">
                  <User className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-300 uppercase italic">Elige un beneficiario para despachar</h3>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden"
              >
                <div className="p-10 bg-black text-white">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{selectedCliente.nombre}</h3>
                      <p className="text-slate-500 font-black text-[10px] tracking-[0.2em] mt-2 uppercase italic">CUOTA INSULA GUAIRA</p>
                    </div>
                    <div className="bg-red-600 p-4 rounded-3xl shadow-lg shadow-red-600/30">
                      <Fuel className="w-7 h-7" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase italic tracking-widest">
                      <span className="text-slate-500">CONSUMO ACTUAL: {selectedCliente.cupo_consumido} GL</span>
                      <span className="text-red-500">LÍMITE: {selectedCliente.cupo_mensual} GL</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedCliente.cupo_consumido / selectedCliente.cupo_mensual) * 100}%` }}
                        className="h-full bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic pl-2">Cantidad (GL)</label>
                      <div className="relative group">
                        <Droplet className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                        <input 
                          type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-2xl font-black text-slate-900 focus:ring-4 focus:ring-red-600/5 transition-all italic tracking-tighter"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic pl-2">Identif. Vehículo</label>
                      <div className="relative group">
                        <Car className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                        <input 
                          type="text" placeholder="PLACA" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-2xl font-black text-slate-900 focus:ring-4 focus:ring-red-600/5 transition-all uppercase italic tracking-tighter"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleDespacho} disabled={isSubmitting}
                    className="w-full py-6 bg-red-600 hover:bg-black text-white rounded-[2.5rem] font-black text-xl italic transition-all shadow-2xl shadow-red-600/40 active:scale-95 flex items-center justify-center space-x-4 disabled:opacity-50 uppercase tracking-tighter"
                  >
                    {isSubmitting ? (
                      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-7 h-7" />
                        <span>Validar y Despachar</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
