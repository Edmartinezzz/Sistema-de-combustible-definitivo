'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, 
  Search, 
  User, 
  ChevronRight, 
  Zap, 
  AlertTriangle,
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

      toast.success('¡Despacho registrado con éxito!');
      setSelectedCliente(null);
      setPlaca('');
      fetchClientes(); // Recargar datos para actualizar cupos
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al procesar el despacho');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registro de Despacho</h1>
        <p className="text-slate-500 font-medium">Busca un beneficiario y procesa su retiro de combustible.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Lado Izquierdo: Buscador de Clientes */}
        <div className="space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Nombre del cliente o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seleccionar Cliente</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => setSelectedCliente(cliente)}
                  className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all ${
                    selectedCliente?.id === cliente.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                      selectedCliente?.id === cliente.id ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      {cliente.nombre[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold leading-tight">{cliente.nombre}</p>
                      <p className={`text-[10px] font-medium ${selectedCliente?.id === cliente.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {cliente.cedula}
                      </p>
                    </div>
                  </div>
                  <div className="text-right px-2">
                    <p className="text-xs font-bold">{(cliente.cupo_mensual - cliente.cupo_consumido).toFixed(1)} GL</p>
                    <p className={`text-[9px] uppercase font-bold ${selectedCliente?.id === cliente.id ? 'text-blue-200' : 'text-slate-300'}`}>
                      Disponibles
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario de Despacho */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!selectedCliente ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <User className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">Selecciona un cliente para comenzar</h3>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden"
              >
                {/* Visualización de Cupo */}
                <div className="p-8 bg-slate-900 text-white">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-black mb-1">{selectedCliente.nombre}</h3>
                      <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">ESTADO DE CUOTA MENSUAL</p>
                    </div>
                    <div className="bg-blue-600 p-3 rounded-2xl">
                      <Fuel className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-400">Recursos consumidos</span>
                      <span className="text-blue-400">{selectedCliente.cupo_consumido} / {selectedCliente.cupo_mensual} GL</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedCliente.cupo_consumido / selectedCliente.cupo_mensual) * 100}%` }}
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Formulario de Acción */}
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Litros a Despachar</label>
                      <div className="relative group">
                        <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="number" 
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Placa del Vehículo</label>
                      <div className="relative group">
                        <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="OPCIONAL"
                          value={placa}
                          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xl font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-blue-800 leading-relaxed">
                      Al confirmar, se descontarán <span className="font-black underline">{cantidad} GL</span> del cupo del cliente y del inventario del tanque central.
                    </p>
                  </div>

                  <button 
                    onClick={handleDespacho}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        <span>Confirmar Despacho</span>
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
