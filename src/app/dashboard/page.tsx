'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Fuel, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Package, 
  Calendar,
  ChevronRight,
  MoreVertical,
  History as HistoryIcon
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
    inventario: null,
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
          inventario: iRes.data,
          despachosRecientes: dRes.data.slice(0, 5)
        });
      } catch (error) {
        console.error('Error dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const porcenatjeInventario = stats.inventario 
    ? (stats.inventario.cantidad_actual / stats.inventario.capacidad_total) * 100 
    : 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Panel General</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Resumen de operaciones Gas+</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-red-600/20 hover:bg-black transition-all active:scale-95 uppercase tracking-tighter">
            Realizar Despacho
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Gas GLP Disponible" value={`${stats.inventario?.cantidad_actual || 0} GL`} subValue={`${porcenatjeInventario.toFixed(1)}% capacidad`} icon={Fuel} color="red" trend="+2.4%" />
        <StatCard title="Beneficiarios" value={stats.clientes.toString()} subValue="Padrón Activo" icon={Users} color="black" />
        <StatCard title="Capacidad Total" value={`${stats.inventario?.capacidad_total || 0} GL`} subValue="Tanque Central" icon={Package} color="red" />
        <StatCard title="Eficiencia" value="98.5%" subValue="Promedio Mensual" icon={TrendingUp} color="black" trend="+0.8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Actividad de Consumo</h3>
            <div className="h-2 w-12 bg-red-600 rounded-full" />
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} />
                <Area type="monotone" dataKey="valor" stroke="#DC2626" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Despachos</h3>
            <button className="text-red-600 hover:text-black font-black text-[10px] uppercase tracking-widest">Ver todo</button>
          </div>
          <div className="space-y-6">
            {stats.despachosRecientes.map((d: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-1 group cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <HistoryIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase leading-none mb-1">{d.clientes?.nombre || 'Cliente'}</h4>
                    <p className="text-[10px] font-bold text-slate-400">VEHÍCULO: {d.placa}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-600">-{d.cantidad} GL</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon: Icon, color, trend }: any) {
  const colorMap: any = {
    red: "bg-red-600 shadow-red-500/20",
    black: "bg-slate-900 shadow-slate-900/20"
  };

  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-red-600 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-500 ${colorMap[color].split(' ')[0]}`} />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`p-4 rounded-2xl text-white shadow-xl ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 py-1 px-2.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black italic">
            <ArrowUpRight className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase underline decoration-red-600 decoration-4 underline-offset-8">{value}</h2>
        <p className="text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-tighter">{subValue}</p>
      </div>
    </div>
  );
}
