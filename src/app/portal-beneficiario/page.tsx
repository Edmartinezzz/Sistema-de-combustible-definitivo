'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, 
  Zap, 
  LogOut, 
  Car, 
  CreditCard, 
  User, 
  Building2,
  ChevronRight,
  ArrowUpRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function PortalBeneficiario() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await axios.get('/api/portal/datos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-red-600 mb-4" />
        <p className="font-black italic uppercase tracking-widest text-xs">Cargando tu cupo...</p>
      </div>
    );
  }

  const gasPerc = (data.consumo_gasolina / data.cupo_gasolina) * 100 || 0;
  const gasoilPerc = (data.consumo_gasoil / data.cupo_gasoil) * 100 || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Header Premium */}
      <header className="bg-slate-900 pt-12 pb-20 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
        <div className="flex items-center justify-between relative z-10 mb-8">
           <div className="flex flex-col">
              <span className="text-red-600 font-black italic text-xl tracking-tighter">INSULA<span className="text-white">GUAIRA</span></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Beneficiario</span>
           </div>
           <button onClick={handleLogout} className="p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
              <LogOut className="w-5 h-5" />
           </button>
        </div>

        <div className="relative z-10 mt-6">
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2 italic">Bienvenido, Comandante</p>
           <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">{data.nombre}</h1>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="px-6 -mt-12 space-y-6 relative z-20">
        
        {/* Card de Entidad Madre */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-between border border-slate-50">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                 <Building2 className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Vinculado a la Entidad</p>
                 <p className="font-black text-slate-900 uppercase italic tracking-tighter">{data.entidades?.nombre || 'Particular'}</p>
              </div>
           </div>
           <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-slate-300" />
           </div>
        </div>

        {/* Cupos de Combustible */}
        <div className="grid grid-cols-1 gap-6">
           {/* Gasolina */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Fuel className="w-24 h-24 text-red-600 -mr-6 -mt-6 rotate-12" />
              </div>
              <div className="flex justify-between items-end mb-6">
                 <div>
                    <h3 className="text-[10px] font-black text-red-600 uppercase italic tracking-widest mb-1">Cupo Gasolina</h3>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{(data.cupo_gasolina - data.consumo_gasolina).toFixed(1)} <span className="text-sm">GL</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Consumido</p>
                    <p className="text-sm font-black text-slate-400 italic">{data.consumo_gasolina} GL</p>
                 </div>
              </div>
              <div className="h-4 bg-slate-50 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${Math.min(100, gasPerc)}%` }} 
                    className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                 />
              </div>
           </div>

           {/* Gasoil */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Zap className="w-24 h-24 text-slate-900 -mr-6 -mt-6 rotate-12" />
              </div>
              <div className="flex justify-between items-end mb-6">
                 <div>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest mb-1">Cupo Gasoil</h3>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{(data.cupo_gasoil - data.consumo_gasoil).toFixed(1)} <span className="text-sm">GL</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Consumido</p>
                    <p className="text-sm font-black text-slate-400 italic">{data.consumo_gasoil} GL</p>
                 </div>
              </div>
              <div className="h-4 bg-slate-50 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${Math.min(100, gasoilPerc)}%` }} 
                    className="h-full bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.3)]" 
                 />
              </div>
           </div>
        </div>

        {/* Ficha Vehicular */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-red-600 rounded-full blur-[60px] opacity-20 -mr-8 -mt-8" />
           <div className="flex items-center space-x-4 mb-8">
              <Car className="w-6 h-6 text-red-600" />
              <h3 className="text-xs font-black uppercase italic tracking-widest text-slate-400">Vehículo Registrado</h3>
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Descripción</p>
                 <p className="font-black uppercase italic tracking-tighter">{data.vehiculo || 'No detallado'}</p>
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Matrícula</p>
                 <p className="font-black uppercase italic tracking-tighter bg-white/10 px-3 py-1 rounded-lg w-fit text-red-500">{data.placa || 'SIN PLACA'}</p>
              </div>
           </div>
        </div>

        {/* Aviso de Autogestión */}
        <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 flex items-start space-x-4">
           <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
           <p className="text-[10px] font-black text-red-800/80 uppercase italic leading-relaxed">
              Recuerda que cada despacho queda registrado bajo tu perfil y el de tu entidad madre. El uso indebido será reportado automáticamente.
           </p>
        </div>

      </main>

      {/* Botón de Acción Flotante (Self-Service) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
         <button 
           onClick={() => setShowWithdrawForm(true)}
           className="w-full max-w-lg mx-auto py-5 bg-red-600 hover:bg-black text-white rounded-[2rem] font-black shadow-[0_15px_40px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center space-x-3 uppercase italic tracking-tighter active:scale-95"
         >
           <Zap className="w-6 h-6" />
           <span>Registrar mi Despacho</span>
         </button>
      </div>

      {/* Modal de Despacho para Beneficiario */}
      <AnimatePresence>
        {showWithdrawForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setShowWithdrawForm(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 underline decoration-red-600 decoration-4 underline-offset-8">Solicitar Carga</h2>
               
               <form onSubmit={async (e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 setLoading(true);
                 try {
                   const token = localStorage.getItem('token');
                   await axios.post('/api/retiros', {
                     tipo_combustible: formData.get('tipo'),
                     cantidad: formData.get('cantidad'),
                     placa: data.placa
                   }, { headers: { Authorization: `Bearer ${token}` } });
                   
                   toast.success('¡Despacho registrado correctamente!');
                   setShowWithdrawForm(false);
                   fetchData(); // Recargar saldos
                 } catch (error: any) {
                   toast.error(error.response?.data?.error || 'Error al procesar');
                 } finally {
                   setLoading(false);
                 }
               }} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Tipo de Combustible</label>
                    <select name="tipo" required className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl text-slate-900 font-black italic uppercase appearance-none cursor-pointer">
                       <option value="Gasolina">⛽ Gasolina Premium</option>
                       <option value="Gasoil">⚡ Gasoil (Diesel)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Cantidad a Retirar (Galones)</label>
                    <input name="cantidad" type="number" step="0.1" required placeholder="0.0" className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] text-4xl font-black text-center text-slate-900 focus:ring-4 focus:ring-red-600/10 transition-all font-mono" />
                  </div>

                  <div className="flex items-center p-4 bg-slate-900 rounded-2xl space-x-4">
                     <Car className="w-6 h-6 text-red-600" />
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Vehículo Vinculado</span>
                        <span className="text-xs font-black text-white italic truncate w-48">{data.vehiculo} ({data.placa})</span>
                     </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-5 bg-red-600 hover:bg-black text-white rounded-[2rem] font-black shadow-xl transition-all uppercase italic flex items-center justify-center">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Despacho'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
