'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, Wallet, Clock, Briefcase, 
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Filter, Calendar, Download, RefreshCcw, Sparkles
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePie, Pie, Legend
} from 'recharts'
import { motion } from 'framer-motion'

export default function BIPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bi/stats')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-slate-50">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processando Inteligência de Dados...</p>
       </div>
    </div>
  )

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtShort = (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toString()

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">Inteligência BI</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Análise de Performance & Crescimento</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase">
              <Calendar size={12} /> Últimos 12 Meses
           </div>
           <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
              <RefreshCcw size={18} />
           </button>
           <button className="btn-premium py-2 px-4 text-[10px]">
              <Download size={14} /> EXPORTAR BI
           </button>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="flex-1 overflow-y-auto scroll-container p-8 space-y-8">
        
        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <KPICard 
             title="Receita Acumulada" 
             value={fmt(data.revenueByType.reduce((s:any, r:any) => s + r.total, 0))}
             trend="+12.4%" 
             isUp={true}
             icon={Wallet}
             color="blue"
           />
           <KPICard 
             title="Ticket Médio" 
             value={fmt(data.revenueByType.reduce((s:any, r:any) => s + r.total, 0) / (data.performance.completedCount + data.pipeline.reduce((s:any,p:any)=>s+p.count,0)))}
             trend="+5.2%" 
             isUp={true}
             icon={ArrowUpRight}
             color="emerald"
           />
           <KPICard 
             title="Tempo Médio Ciclo" 
             value={`${data.performance.avgCycleTime} Dias`}
             trend="-2.1%" 
             isUp={true}
             icon={Clock}
             color="amber"
           />
           <KPICard 
             title="Pipeline Ativo" 
             value={fmt(data.pipeline.reduce((s:any, p:any) => s + p.value, 0))}
             trend="+18.7%" 
             isUp={true}
             icon={Briefcase}
             color="purple"
           />
        </div>

        <div className="grid grid-cols-12 gap-8">
           
           {/* REVENUE OVER TIME */}
           <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Performance Mensal</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Evolução de faturamento recebido</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-blue-500" />
                       <span className="text-[9px] font-black text-slate-500 uppercase">Receita Bruta</span>
                    </div>
                 </div>
              </div>

              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueByMonth.map((r:any) => ({ name: new Date(r.data_pagamento).toLocaleDateString('pt-BR', { month: 'short' }), value: r._sum.valor_pago }))}>
                       <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} 
                         dy={10}
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
                         tickFormatter={(v) => `R$ ${fmtShort(v)}`}
                       />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                         itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="value" 
                         stroke="#3B82F6" 
                         strokeWidth={4} 
                         fillOpacity={1} 
                         fill="url(#colorValue)" 
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* PIPELINE BY STAGE */}
           <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pipeline Operacional</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Processos por etapa atual</p>
              </div>

              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <RePie>
                       <Pie
                         data={data.pipeline}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="count"
                         nameKey="stage"
                       >
                          {data.pipeline.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </RePie>
                 </ResponsiveContainer>
              </div>

              <div className="space-y-3 pt-4">
                 {data.pipeline.map((p: any, i: number) => (
                    <div key={p.stage} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{p.stage}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-900">{p.count}</span>
                          <span className="text-[9px] font-bold text-slate-400">{fmtShort(p.value)}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* REVENUE BY TYPE (Bar Chart) */}
           <div className="col-span-12 lg:col-span-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Mix de Serviços</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Volume financeiro por tipo de processo</p>
              </div>

              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByType} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                       <XAxis type="number" hide />
                       <YAxis 
                         dataKey="type" 
                         type="category" 
                         axisLine={false} 
                         tickLine={false} 
                         width={120}
                         tick={{ fontSize: 9, fontWeight: 800, fill: '#64748B' }}
                       />
                       <Tooltip 
                         cursor={{fill: '#F8FAFC'}}
                         contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px' }}
                         itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                       />
                       <Bar dataKey="total" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={24} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* TOP CLIENTS TABLE */}
           <div className="col-span-12 lg:col-span-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Maiores Investidores</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Ranking de clientes por faturamento</p>
                 </div>
                 <Sparkles size={20} className="text-blue-500 opacity-20" />
              </div>

              <div className="space-y-4">
                 {data.clientAnalytics.map((c: any, i: number) => (
                    <div key={c.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                             #{i+1}
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-900 leading-tight">{c.name}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{c.processCount} Processos Ativos</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-blue-600">{fmt(c.totalSpent)}</p>
                          <p className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full inline-block mt-1 uppercase tracking-tighter">VIP Partner</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, trend, isUp, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-600/20',
    emerald: 'bg-emerald-500 shadow-emerald-500/20',
    amber: 'bg-amber-500 shadow-amber-500/20',
    purple: 'bg-purple-600 shadow-purple-600/20'
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group"
    >
       <div className={`absolute top-0 right-0 w-24 h-24 ${colors[color]} opacity-[0.03] -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150`} />
       
       <div className="flex items-center justify-between mb-6">
          <div className={`p-3 rounded-2xl text-white ${colors[color]}`}>
             <Icon size={20} />
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${isUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
             {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
             {trend}
          </div>
       </div>

       <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
       </div>
    </motion.div>
  )
}
