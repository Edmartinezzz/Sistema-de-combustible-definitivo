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
  Droplet,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function RegistrarDespachoPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [tipoCombustible, setTipoCombustible] = useState<'Gasolina' | 'Gasoil'>('Gasolina');
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
      toast.error('Selecciona todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post('/api/retiros', {
        cliente_id: selectedCliente.id,
        cantidad: parseFloat(cantidad),
        placa: placa || 'N/A',
        registrado_por: user.usuario,
        tipo_combustible: tipoCombustible
      });

      toast.success('¡Despacho registrado!');
      setSelectedCliente(null);
      setPlaca('');
      fetchClientes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error en el despacho');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCupoRestante = () => {
    if (!selectedCliente) return 0;
    return tipoCombustible === 'Gasolina' 
      ? selectedCliente.cupo_gasolina - selectedCliente.consumo_gasolina
      : selectedCliente.cupo_gasoil - selectedCliente.consumo_gasoil;
  };

  const getCupoTotal = () => {
    if (!selectedCliente) return 0;
    return tipoCombustible === 'Gasolina' ? selectedCliente.cupo_gasolina : selectedCliente.cupo_gasoil;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Despacho Bi-Combustible</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic tracking-widest">Validación de Cupo y Reserva General</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
            <input 
              type="text" placeholder="Búsqueda por beneficiario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2.5rem] text-sm font-bold focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all shadow-sm italic"
            />
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 italic">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Beneficiarios Disponibles</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => setSelectedCliente(cliente)}
                  className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all group ${
                    selectedCliente?.id === cliente.id 
                      ? 'bg-red-600 text-white shadow-xl' 
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
                        CID: {cliente.cedula}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!selectedCliente ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/40 rounded-[3rem] border-2 border-dashed border-slate-100">
                <User className="w-16 h-16 text-slate-100 mb-6" />
                <h3 className="text-xl font-black text-slate-200 uppercase italic">Selecciona un beneficiario</h3>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden p-10 space-y-8">
                {/* Selector de Combustible */}
                <div className="flex p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <button 
                    onClick={() => setTipoCombustible('Gasolina')}
                    className={`flex-1 flex items-center justify-center py-4 rounded-[1.5rem] font-black italic uppercase text-xs transition-all ${tipoCombustible === 'Gasolina' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400'}`}
                  >
                    <Fuel className="w-4 h-4 mr-2" /> Gasolina
                  </button>
                  <button 
                    onClick={() => setTipoCombustible('Gasoil')}
                    className={`flex-1 flex items-center justify-center py-4 rounded-[1.5rem] font-black italic uppercase text-xs transition-all ${tipoCombustible === 'Gasoil' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                  >
                    <Zap className="w-4 h-4 mr-2" /> Gasoil
                  </button>
                </div>

                {/* Info Cupo Real-time */}
                <div className={`p-8 rounded-[2.5rem] text-white transition-colors duration-500 ${tipoCombustible === 'Gasolina' ? 'bg-red-600 shadow-red-600/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
                  <div className="flex justify-between items-start mb-6 italic">
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter italic">{selectedCliente.nombre}</h4>
                      <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1 italic">Cupo {tipoCombustible} Insula Guaira</p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 opacity-30" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black uppercase italic tracking-widest">
                      <span>Restante</span>
                      <span>{getCupoRestante().toFixed(1)} / {getCupoTotal()} GL</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(getCupoRestante() / getCupoTotal()) * 100}%` }}
                        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Formulario de Acción */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 pl-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Litros</label>
                    <div className="relative group">
                       <Droplet className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                       <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-2xl font-black text-slate-900 focus:ring-4 focus:ring-red-600/5 transition-all italic tracking-tighter" />
                    </div>
                  </div>
                  <div className="space-y-2 pl-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Placa</label>
                    <div className="relative group">
                       <Car className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                       <input type="text" placeholder="ABC-123" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-2xl font-black text-slate-900 focus:ring-4 focus:ring-red-600/5 transition-all italic tracking-tighter uppercase" />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-[2rem] p-5 border border-amber-100 flex items-start space-x-4">
                   <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                   <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tighter italic">
                     Al confirmar el despacho de <span className="font-black underline">{cantidad} GL</span> de {tipoCombustible}, el sistema descontará la reserva directamente del Tanque General de la empresa.
                   </p>
                </div>

                <button 
                  onClick={handleDespacho} disabled={isSubmitting}
                  className="w-full py-6 bg-red-600 hover:bg-black text-white rounded-[2.5rem] font-black text-xl italic transition-all shadow-xl shadow-red-600/30 active:scale-95 flex items-center justify-center space-x-4 disabled:opacity-50 uppercase tracking-tighter"
                >
                  {isSubmitting ? (
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-7 h-7" />
                      <span>Validar Despacho</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
