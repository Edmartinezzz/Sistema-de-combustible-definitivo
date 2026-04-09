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

import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PortalBeneficiario() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<any>(null);
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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-32">
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

        {/* Historial de Retiros */}
        <div className="mt-8 space-y-4 pb-12">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Historial Reciente
            </h3>
            
            {(!data.retiros || data.retiros.length === 0) ? (
              <div className="bg-white p-6 rounded-[2rem] border border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase italic tracking-widest">No hay despachos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.retiros.slice(0, 5).map((retiro: any) => (
                  <div key={retiro.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(retiro.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                        <span className="font-black text-slate-900 italic tracking-tighter uppercase">{retiro.tipo_combustible}</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className={`text-lg font-black italic tracking-tighter ${retiro.tipo_combustible === 'Gasolina' ? 'text-red-600' : 'text-slate-900'}`}>
                          -{retiro.litros} <span className="text-[10px] uppercase">GL</span>
                        </span>
                     </div>
                  </div>
                ))}
                {data.retiros.length > 5 && (
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase italic tracking-widest mt-4">
                    Mostrando últimos 5 despachos
                  </p>
                )}
              </div>
            )}
        </div>

      </main>

      {/* Botón de Acción Flotante (Self-Service) - Reposicionado para Móvil */}
      <div className="fixed bottom-24 md:bottom-8 left-0 right-0 p-6 z-40">
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
                   const response = await axios.post('/api/retiros', {
                     tipo_combustible: formData.get('tipo'),
                     cantidad: formData.get('cantidad'),
                     placa: data.placa
                   }, { headers: { Authorization: `Bearer ${token}` } });
                   
                   toast.success('¡Despacho registrado correctamente!');
                   setShowWithdrawForm(false);

                   // Preparar y mostrar ticket
                   const nuevoRetiro = response.data.retiro;
                   setCurrentTicket({
                     ...nuevoRetiro,
                     beneficiario: data.nombre,
                     cedula: data.cedula,
                     vehiculo: data.vehiculo,
                     entidad: data.entidades?.nombre || 'Particular'
                   });
                   setShowTicket(true);

                   fetchData(); // Recargar saldos
                 } catch (error: any) {
                   toast.error(error.response?.data?.error || 'Error al procesar');
                 } finally {
                   setLoading(false);
                 }
               }} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Tipo de Combustible</label>
                    <select name="tipo" required className="w-full px-6 py-6 bg-slate-100 border-2 border-transparent focus:border-red-600 rounded-2xl text-slate-900 font-black italic uppercase appearance-none cursor-pointer transition-all text-lg">
                       <option value="Gasolina">⛽ Gasolina Premium</option>
                       <option value="Gasoil">⚡ Gasoil (Diesel)</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Cantidad a Retirar (Galones)</label>
                    <input name="cantidad" type="number" step="0.1" required placeholder="0.0" className="w-full px-8 py-8 bg-slate-100 border-2 border-transparent focus:border-red-600 rounded-[2.5rem] text-5xl font-black text-center text-slate-900 focus:ring-4 focus:ring-red-600/10 transition-all font-mono" />
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

      {/* Modal de Ticket Premium */}
      <AnimatePresence>
        {showTicket && currentTicket && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl" />
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative w-full max-w-2xl my-auto">
               
               {/* Ticket Visual (Horizontal) */}
               <div id="ticket-retiro" className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white">
                  <div className="bg-slate-900 p-6 flex items-center justify-between relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16" />
                     <div className="text-left relative z-10">
                        <p className="text-red-600 font-black italic text-xl tracking-tighter mb-0 uppercase">INSULA<span className="text-white">GUAIRA</span></p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Comprobante Digital de Despacho</p>
                     </div>
                     <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-right">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ID Ticket</p>
                        <p className="font-mono text-xs font-bold text-white tracking-widest leading-none">#{currentTicket.id.toString().padStart(6, '0')}</p>
                     </div>
                  </div>

                  <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                     {/* Lado Izquierdo: Datos */}
                     <div className="flex-1 space-y-6 w-full">
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beneficiario</p>
                              <p className="font-black text-slate-900 italic uppercase tracking-tight text-lg leading-tight">{currentTicket.beneficiario}</p>
                              <p className="text-xs font-bold text-slate-400 tracking-widest opacity-60">Cedula: {currentTicket.cedula}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entidad Madre</p>
                              <p className="font-black text-slate-900 text-xs uppercase italic truncate">{currentTicket.entidad}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 border-y border-slate-100 py-6">
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Vehículo / Placa</p>
                              <p className="font-black text-slate-900 text-xs uppercase italic truncate w-full">{currentTicket.vehiculo}</p>
                              <p className="font-black text-red-600 text-sm tracking-widest mt-1">{currentTicket.placa}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha y Hora</p>
                              <p className="font-black text-slate-900 text-[10px] uppercase italic leading-tight">{currentTicket.fecha}</p>
                              <p className="font-black text-slate-400 text-[9px] uppercase italic">{currentTicket.hora}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                           <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100">
                                 {currentTicket.tipo_combustible === 'Gasolina' ? <Fuel className="w-6 h-6 text-red-600" /> : <Zap className="w-6 h-6 text-slate-900" />}
                              </div>
                              <p className="font-black text-slate-900 italic uppercase tracking-tighter text-xl">{currentTicket.tipo_combustible}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-4xl font-black italic tracking-tighter text-red-600">{currentTicket.litros} <span className="text-sm uppercase opacity-40">GL</span></p>
                           </div>
                        </div>
                     </div>

                     {/* Lado Derecho: QR */}
                     <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-[2.5rem] shadow-xl text-center min-w-[200px]">
                        <div className="p-3 bg-white rounded-2xl shadow-2xl">
                           <QRCodeCanvas 
                              value={`${window.location.origin}/verificar-ticket/${currentTicket.id}`} 
                              size={120}
                              level="H"
                           />
                        </div>
                        <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mt-4 leading-relaxed">
                          Escanea para Validar<br/>Legalidad del Despacho
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/5 w-full">
                           <p className="text-[8px] font-bold text-red-600 uppercase tracking-widest italic">Documento Auditado</p>
                           <p className="text-[6px] font-black text-slate-700 uppercase">Sistema v2.0</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Botones de Acción */}
               <div className="grid grid-cols-2 gap-6 mt-8">
                  <button 
                    onClick={() => {
                      const input = document.getElementById('ticket-retiro');
                      if (!input) return;
                      html2canvas(input, { scale: 3 }).then((canvas) => {
                        const imgData = canvas.toDataURL('image/png');
                        // Formato landscape 'l'
                        const pdf = new jsPDF('l', 'mm', 'a4');
                        const imgProps = pdf.getImageProperties(imgData);
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`Ticket_Despacho_${currentTicket.id}.pdf`);
                        toast.success('Ticket descargado correctamente');
                      });
                    }}
                    className="py-5 bg-white text-slate-900 rounded-[2rem] font-black uppercase italic text-xs tracking-widest shadow-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all"
                  >
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                    <span>Descargar PDF</span>
                  </button>
                  <button 
                    onClick={() => setShowTicket(false)}
                    className="py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase italic text-xs tracking-widest shadow-2xl active:scale-95 transition-all"
                  >
                    Cerrar
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
