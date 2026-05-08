'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp,
  Clock, CheckCircle2, ArrowRight, BarChart2, FileText,
  Wallet, Activity, ChevronRight, AlertCircle, Sparkles,
  ArrowUpRight, Target
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import { motion } from 'framer-motion'

function AnimatedNumber({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let f = 0; const total = 40
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

  // Chart Logic
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    return {
      m: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      r: Math.random() * 50000 + 10000, // Mock for visual beauty
      d: Math.random() * 20000 + 5000
    }
  })

  return (
    <div className="flex flex-col gap-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cockpit Operacional</h1>
           <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-widest">
              PRC.STAT / 2024
           </span>
        </div>
        <p className="text-sm text-slate-500 font-medium tracking-tight">Bem-vindo de volta, Jadson. Aqui está o resumo da sua operação hoje.</p>
      </div>

      {/* ── HERO METRIC ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-[32px] p-10 text-white relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
             <Sparkles size={160} className="text-primary fill-primary/20" />
          </div>
          
          <div className="relative z-10 space-y-12">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] font-mono">STATUS DA ESTEIRA</span>
              <h2 className="text-4xl font-bold tracking-tighter leading-none max-w-xl">
                Você tem <span className="text-primary">{ativos} processos</span> em tramitação e <span className="text-emerald-400">{fmt(aReceber)}</span> previstos.
              </h2>
            </div>

            <div className="flex items-center gap-10">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PROJETOS CONCLUÍDOS</span>
                  <span className="text-2xl font-bold tracking-tight">{concluidos}</span>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TICKET MÉDIO</span>
                  <span className="text-2xl font-bold tracking-tight">{fmt(totalRec / (processos.length || 1))}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
           <div className="space-y-1">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                 <Target size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Meta Mensal</h3>
              <p className="text-xs text-slate-500">Acompanhamento de performance de vendas e regularização.</p>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-end justify-between">
                 <span className="text-3xl font-bold tracking-tighter">72%</span>
                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+12% vs Mês Anterior</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(45,91,255,0.5)]" style={{ width: '72%' }} />
              </div>
           </div>
        </div>
      </div>

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Clientes', value: clientes.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Imóveis', value: imoveis.length, icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Receita', value: totalRec, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/5', isPrice: true },
          { label: 'Processos', value: processos.length, icon: Activity, color: 'text-primary', bg: 'bg-primary/5' },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:border-primary/20 transition-all group">
            <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center ${k.color} mb-6 group-hover:scale-110 transition-transform`}>
              <k.icon size={18} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">{k.label}</p>
            <h4 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
              {k.isPrice ? fmt(k.value) : <AnimatedNumber value={k.value} />}
            </h4>
          </div>
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Performance Financeira</h3>
              <p className="text-xs text-slate-400 tracking-tight">Comparativo de fluxo de caixa operacional vs despesas fixas.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Despesa</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D5BFF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2D5BFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="m" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} 
                  tickFormatter={v => `${v / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="r" stroke="#2D5BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorR)" />
                <Area type="monotone" dataKey="d" stroke="#E2E8F0" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
           <div className="space-y-1 mb-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Atividade Recente</h3>
              <p className="text-xs text-slate-400 tracking-tight">Últimas movimentações na esteira.</p>
           </div>
           
           <div className="space-y-6">
              {recent.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors">
                    {p.codigo_projeto?.substring(4) || i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{p.tipo_regularizacao}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.cliente?.nome}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-200 group-hover:text-primary transition-colors" />
                </div>
              ))}
              
              <Link href="/processos" className="flex items-center justify-center gap-2 w-full py-4 mt-4 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all">
                VER TODOS OS PROCESSOS
                <ChevronRight size={12} />
              </Link>
           </div>
        </div>
      </div>

    </div>
  )
}
