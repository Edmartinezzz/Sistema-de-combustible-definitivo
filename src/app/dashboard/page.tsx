'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Fuel, 
  ArrowUpRight, 
  TrendingUp, 
  Package, 
  History as HistoryIcon,
  Zap,
  Droplet
} from 'lucide-react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const chartData = [
  { name: 'Lun', valor: 400 },
  { name: 'Mar', valor: 300 },
  { name: 'Mie', valor: 600 },
  { name: 'Jue', valor: 800 },
  { name: 'Vie', valor: 500 },
  { name: 'Sab', valor: 900 },
  { name: 'Dom', valor: 700 },
];

export default function DashboardHome() {
  const [stats, setStats] = useState<any>({
    clientes: 0,
    gasolina: null,
    gasoil: null,
    despachosRecientes: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, iRes, dRes] = await Promise.all([
          axios.get('/api/clientes'),
          axios.get('/api/inventario'),
          axios.get('/api/retiros')
        ]);
        setStats({
          clientes: cRes.data.length,
          gasolina: iRes.data.gasolina,
          gasoil: iRes.data.gasoil,
          despachosRecientes: dRes.data.slice(0, 5)
        });
      } catch (error) {
        console.error('Error dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const percGasolina = stats.gasolina 
    ? (stats.gasolina.cantidad_actual / stats.gasolina.capacidad_total) * 100 
    : 0;
  
  const percGasoil = stats.gasoil 
    ? (stats.gasoil.cantidad_actual / stats.gasoil.capacidad_total) * 100 
    : 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">Panel General</h1>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest italic">Sistema de Gestión Bi-Combustible</p>
        </div>
        <button 
          onClick={() => window.location.href='/dashboard/despacho'}
          className="px-8 py-4 bg-red-600 text-white rounded-[2rem] font-black shadow-xl shadow-red-600/40 hover:bg-black transition-all active:scale-95 uppercase text-xs tracking-tighter italic"
        >
          Realizar Despacho
        </button>
      </div>

      {/* Doble Medidor de Inventario (Reserva General) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tanque Gasolina */}
        <InventoryGauge 
          title="Reserva Gasolina" 
          cantidad={stats.gasolina?.cantidad_actual || 0} 
          capacidad={stats.gasolina?.capacidad_total || 0}
          porcentaje={percGasolina}
          color="red"
        />
        {/* Tanque Gasoil */}
        <InventoryGauge 
          title="Reserva Gasoil" 
          cantidad={stats.gasoil?.cantidad_actual || 0} 
          capacidad={stats.gasoil?.capacidad_total || 0}
          porcentaje={percGasoil}
          color="black"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Beneficiarios" value={stats.clientes.toString()} subValue="Registros Activos" icon={Users} color="black" />
        <StatCard title="Uso del Sistema" value="98.5%" subValue="Eficiencia Operativa" icon={TrendingUp} color="red" trend="+0.8%" />
        <StatCard title="Capacidad de Carga" value="100%" subValue="Servicio Activo" icon={Zap} color="black" />
        <StatCard title="Frecuencia" value="Alta" subValue="Flujo de Usuarios" icon={Package} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Actividad de Consumo</h3>
            <div className="w-12 h-1 bg-red-600 rounded-full" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="valor" stroke="#DC2626" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Despachos</h3>
            <button className="text-red-600 hover:text-black font-black text-[10px] uppercase">Ver todo</button>
          </div>
          <div className="space-y-6">
            {stats.despachosRecientes.map((d: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-1 group cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <HistoryIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase italic leading-none truncate w-24">{d.clientes?.nombre}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{d.tipo_combustible}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${d.tipo_combustible === 'Gasolina' ? 'text-red-600' : 'text-slate-900'}`}>-{d.cantidad} GL</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryGauge({ title, cantidad, capacidad, porcentaje, color }: any) {
  const isRed = color === 'red';
  return (
    <div className={`bg-white p-8 rounded-[3rem] border shadow-sm relative overflow-hidden group ${isRed ? 'border-red-100' : 'border-slate-200'}`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-3xl text-white shadow-xl ${isRed ? 'bg-red-600' : 'bg-slate-900'}`}>
            <Fuel className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-black uppercase tracking-widest italic ${isRed ? 'text-red-600' : 'text-slate-400'}`}>
              {title}
            </span>
            <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">
              {cantidad.toLocaleString()} / {capacidad.toLocaleString()} <span className="text-sm">GL</span>
            </h4>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase italic">
            <span>Nivel de Reserva</span>
            <span>{porcentaje.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje}%` }}
              className={`h-full rounded-full ${isRed ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.4)]'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon: Icon, color }: any) {
  const isRed = color === 'red';
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-red-600 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl text-white shadow-xl transition-all group-hover:scale-110 ${isRed ? 'bg-red-600' : 'bg-slate-900'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1 italic">{title}</p>
        <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">{value}</h2>
        <p className="text-slate-400 text-[10px] font-bold mt-4 uppercase italic">{subValue}</p>
      </div>
    </div>
  );
}
