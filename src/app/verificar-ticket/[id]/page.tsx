'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  Clock, 
  Fuel, 
  Zap,
  Car,
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';

export default function VerificarTicketPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`/api/retiros/${params.id}`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al consultar el ticket');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchTicket();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-12 h-12 animate-spin text-red-600 mb-4" />
        <p className="font-black italic uppercase tracking-widest text-xs">Validando Ticket en Sistema...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-20 h-20 text-red-600 mb-6" />
        <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter mb-4">Ticket Inválido</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-8 leading-loose">
          Este comprobante no existe en nuestra base de datos o ha sido revocado.
        </p>
        <a href="/" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest">
          Volver al Inicio
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-md">
        
        {/* Header de Verificación Correcta */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-green-200/50 p-8 border-2 border-green-100 text-center mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-green-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter mb-2">Despacho Legal</h1>
          <p className="text-green-600 font-extrabold text-[10px] uppercase tracking-[0.2em]">Verificado por Insula Guaira</p>
        </motion.div>

        {/* Detalles del Retiro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white space-y-8"
        >
          <div className="flex items-center space-x-4">
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ticket ID</p>
                <p className="font-mono text-sm font-bold text-slate-300">#{data.id.toString().padStart(6, '0')}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8">
             <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <Calendar className="w-3 h-3 mr-2" />
                  Fecha
                </span>
                <p className="font-black text-sm uppercase italic">{new Date(data.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
             </div>
             <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <Clock className="w-3 h-3 mr-2" />
                  Hora
                </span>
                <p className="font-black text-sm uppercase italic">{data.hora}</p>
             </div>
          </div>

          <div className="space-y-6">
             {/* Beneficiario */}
             <div className="flex items-start space-x-4">
                <Building2 className="w-5 h-5 text-red-600 mt-1" />
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Beneficiario / Entidad</span>
                   <span className="font-black text-md italic uppercase tracking-tight">{data.clientes?.nombre}</span>
                   <span className="text-xs font-bold text-slate-400 opacity-60">ID: {data.clientes?.cedula}</span>
                   {data.clientes?.entidades && (
                     <span className="bg-white/5 px-2 py-1 rounded-md text-[9px] font-black text-red-500 w-fit mt-2 uppercase italic border border-red-500/20">
                       VINCULADO A: {data.clientes.entidades.nombre}
                     </span>
                   )}
                </div>
             </div>

             {/* Vehiculo */}
             <div className="flex items-start space-x-4">
                <Car className="w-5 h-5 text-red-600 mt-1" />
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vehículo Registrado</span>
                   <span className="font-black text-md italic uppercase tracking-tight">{data.clientes?.vehiculo || 'No detallado'}</span>
                   <span className="text-sm font-black text-red-500 tracking-widest">{data.placa}</span>
                </div>
             </div>

             {/* Combustible */}
             <div className="flex items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-lg">
                      {data.tipo_combustible === 'Gasolina' ? <Fuel className="w-6 h-6 text-red-600" /> : <Zap className="w-6 h-6 text-slate-900" />}
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Combustible</p>
                      <p className="font-black text-lg italic tracking-tighter uppercase">{data.tipo_combustible}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-500 uppercase">Volumen</p>
                   <p className="text-2xl font-black italic tracking-tighter text-red-500">{data.litros} <span className="text-xs uppercase opacity-50">GL</span></p>
                </div>
             </div>
          </div>

          <p className="text-center text-[8px] font-bold text-slate-600 uppercase tracking-[0.25em] pt-4">
            Sistema de Despacho Digital v2.0 © Insula Guaira
          </p>
        </motion.div>

        <p className="text-center mt-12 text-slate-300 font-black italic uppercase text-[9px] tracking-[0.3em]">
          Este documento es intransferible y auditable
        </p>
      </div>
    </div>
  );
}
