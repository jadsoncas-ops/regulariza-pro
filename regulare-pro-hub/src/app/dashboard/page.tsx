'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp,
  Clock, CheckCircle2, ArrowRight, BarChart2, FileText,
  Wallet, Activity, ChevronRight, AlertCircle, Sparkles,
  ArrowUpRight, Target, Zap, ShieldCheck, Star
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  BarChart, Bar
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

function AnimatedNumber({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let f = 0; const total = 60
    const t = setInterval(() => {
      f++; const p = f / total; setN((1 - Math.pow(1 - p, 3)) * value)
      if (f >= total) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  const fmt = decimals > 0
    ? n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.floor(n).toLocaleString('pt-BR')
  return <span>{prefix}{fmt}</span>
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export default function DashboardPage() {
  const [data, setData] = useState<any>({ processos: [], clientes: [], imoveis: [], financeiro: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/clientes').then(r => r.json()).catch(() => []),
      fetch('/api/imoveis').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
    ]).then(([processos, clientes, imoveis, financeiro]) => {
      setData({
        processos: Array.isArray(processos) ? processos : [],
        clientes: Array.isArray(clientes) ? clientes : [],
        imoveis: Array.isArray(imoveis) ? imoveis : [],
        financeiro: Array.isArray(financeiro) ? financeiro : [],
      })
      setLoading(false)
    })
  }, [])

  const { processos, clientes, imoveis, financeiro } = data
  const ativos = processos.filter((p: any) => p.status !== 'finalizado').length
  const concluidos = processos.filter((p: any) => p.status === 'finalizado').length
  const receitas = financeiro.filter((f: any) => f.tipo === 'receita')
  const totalRec = receitas.reduce((s: number, f: any) => s + f.valor, 0)
  const aReceber = receitas.filter((f: any) => f.status !== 'pago' && f.status !== 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const recent = [...processos].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  // Productivity Logic
  const productivityData = [
    { name: 'Helena', val: 12 },
    { name: 'Marcos', val: 9 },
    { name: 'Júlia', val: 15 },
    { name: 'Pedro', val: 7 },
  ]

  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    return {
      m: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      r: Math.random() * 50000 + 20000,
      d: Math.random() * 15000 + 5000
    }
  })

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Ecossistema...</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cockpit Estratégico</h1>
           <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">
              CAIXA.SYNC / {new Date().getFullYear()}
           </span>
        </div>
        <p className="text-sm text-slate-500 font-medium tracking-tight">Consolidação operacional de engenharia e regularização imobiliária.</p>
      </div>

      {/* ── TOP SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Hero Card */}
        <div className="lg:col-span-3 bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-1000" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase tracking-[0.2em] font-mono">ESTEIRA EM TEMPO REAL</span>
                       <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE
                       </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-[0.9]">
                       Você gerencia <span className="text-primary">{ativos} processos</span> ativos e <span className="text-emerald-400">{fmt(aReceber)}</span> em recebíveis.
                    </h2>
                 </div>

                 <div className="flex items-center gap-12">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PROJETOS CONCLUÍDOS</p>
                       <p className="text-3xl font-bold tracking-tighter"><AnimatedNumber value={concluidos} /></p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PATRIMÔNIO SOB GESTÃO</p>
                       <p className="text-3xl font-bold tracking-tighter text-indigo-400">R$ 12.8M</p>
                    </div>
                 </div>
              </div>

              <div className="w-full md:w-64 space-y-4">
                 <Link href="/ia" className="w-full py-5 bg-primary text-white rounded-3xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group/btn">
                    DIAGNÓSTICO IA <Zap size={18} className="fill-white group-hover:scale-125 transition-transform" />
                 </Link>
                 <Link href="/processos/novo" className="w-full py-5 bg-white/5 text-white rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 flex items-center justify-center gap-2">
                    NOVO PROCESSO <ArrowUpRight size={18} />
                 </Link>
              </div>
           </div>
        </div>

        {/* Small Stats Sidebar */}
        <div className="bg-white border border-slate-200 rounded-[48px] p-8 shadow-sm flex flex-col justify-between group overflow-hidden">
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Target size={20} />
                 </div>
                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
              </div>
              <div className="space-y-1">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Meta Trimestral</h3>
                 <p className="text-xs text-slate-400 font-medium">Regularização de Imóveis Urbanos</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-bold tracking-tighter text-slate-900">84%</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">R$ 420k / R$ 500k</p>
              </div>
              <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                 <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(45,91,255,0.4)]" style={{ width: '84%' }} />
              </div>
           </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Productivity Card (NEW) */}
        <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Produtividade Team</h3>
                 <p className="text-xs text-slate-400 font-medium">Processos concluídos (Últimas 4 semanas)</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                 <Activity size={20} />
              </div>
           </div>
           <div className="flex-1 h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={productivityData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} dy={10} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="val" radius={[8, 8, 8, 8]} barSize={24}>
                       {productivityData.map((_, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? '#2D5BFF' : '#6366F1'} fillOpacity={0.8} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">HT</div>
                 <span className="text-[10px] font-bold text-slate-800 uppercase">Top Performer: Helena</span>
              </div>
              <ChevronRight size={14} className="text-slate-300" />
           </div>
        </div>

        {/* Financial Flow Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm relative overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Performance Mensal</h3>
                 <p className="text-xs text-slate-400 font-medium">Fluxo de caixa operacional vs Projeção de metas.</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100">
                    Últimos 6 meses
                 </div>
              </div>
           </div>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2D5BFF" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#2D5BFF" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} tickFormatter={v => `${v / 1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 700 }} />
                    <Area type="monotone" dataKey="r" stroke="#2D5BFF" strokeWidth={4} fillOpacity={1} fill="url(#colorMain)" />
                    <Area type="monotone" dataKey="d" stroke="#E2E8F0" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Activity Feed Card */}
        <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Esteira Recente</h3>
                 <p className="text-xs text-slate-400 font-medium">Movimentações de processos.</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                 <Briefcase size={20} />
              </div>
           </div>
           <div className="space-y-6 flex-1">
              {recent.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer hover:translate-x-2 transition-transform">
                   <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      {p.codigo_projeto?.substring(4) || i}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{p.tipo_regularizacao}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.cliente?.nome}</p>
                   </div>
                   <ArrowUpRight size={14} className="text-slate-200 group-hover:text-primary transition-colors" />
                </div>
              ))}
           </div>
           <Link href="/processos" className="w-full py-4 mt-10 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              ACESSAR KANBAN COMPLETO <ChevronRight size={14} />
           </Link>
        </div>

        {/* Global Stats Footer */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
           {[
             { label: 'Clientes', val: clientes.length, icon: Users, color: 'text-blue-500' },
             { label: 'Imóveis', val: imoveis.length, icon: Building2, color: 'text-indigo-500' },
             { label: 'Documentos', val: 124, icon: FileText, color: 'text-amber-500' },
             { label: 'Suporte IA', val: 'Online', icon: Sparkles, color: 'text-primary' },
           ].map((s, i) => (
             <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-[32px] flex flex-col items-center text-center gap-2 hover:shadow-lg transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
                   <s.icon size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 font-mono">{s.label}</p>
                <p className="text-lg font-bold text-slate-900">{s.val}</p>
             </div>
           ))}
        </div>
      </div>

    </div>
  )
}
