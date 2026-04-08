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

// Datos de ejemplo para el gráfico (se cargarán de la API después)
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
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchData();
  }, []);

  const porcenatjeInventario = stats.inventario 
    ? (stats.inventario.cantidad_actual / stats.inventario.capacidad_total) * 100 
    : 0;

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 font-medium">Aquí tienes el resumen de las operaciones de hoy.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
            Nuevo Despacho
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Inventario actual */}
        <StatCard 
          title="Gas GLP Disponible" 
          value={`${stats.inventario?.cantidad_actual || 0} GL`} 
          subValue={`${porcenatjeInventario.toFixed(1)}% de capacidad`} 
          icon={Fuel} 
          color="blue"
          trend="+2.4%"
        />
        {/* Clientes Totales */}
        <StatCard 
          title="Clientes Activos" 
          value={stats.clientes.toString()} 
          subValue="Registrados en sistema" 
          icon={Users} 
          color="emerald"
        />
        {/* Capacidad Total */}
        <StatCard 
          title="Capacidad Tanque" 
          value={`${stats.inventario?.capacidad_total || 0} GL`} 
          subValue="Límite operativo" 
          icon={Package} 
          color="indigo"
        />
        {/* Rendimiento (Simulado) */}
        <StatCard 
          title="Eficiencia de Entrega" 
          value="98.5%" 
          subValue="Promedio del mes" 
          icon={TrendingUp} 
          color="violet"
          trend="+0.8%"
        />
      </div>

      {/* Chart Section & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Consumption Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 px-2">Actividad Semanal</h3>
            <select className="bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-500 px-4 py-2 focus:ring-0 cursor-pointer">
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#2563EB" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Withdrawals (Retiros) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Últimos Despachos</h3>
            <button className="text-blue-600 hover:text-blue-700 font-bold text-sm">Ver todo</button>
          </div>
          <div className="space-y-6">
            {stats.despachosRecientes.map((d: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-1 group cursor-pointer hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                    <HistoryIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{d.clientes?.nombre || 'Cliente'}</h4>
                    <p className="text-xs font-semibold text-slate-400">{d.placa}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">-{d.cantidad} GL</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Hace 2h</p>
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
    blue: "bg-blue-600 shadow-blue-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    indigo: "bg-indigo-600 shadow-indigo-500/20",
    violet: "bg-violet-600 shadow-violet-500/20"
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-500 ${colorMap[color].split(' ')[0]}`} />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl text-white shadow-lg ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 py-1 px-2.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
        <h2 className="text-3xl font-black text-slate-900">{value}</h2>
        <p className="text-slate-400 text-xs font-semibold mt-2">{subValue}</p>
      </div>
    </div>
  );
}
