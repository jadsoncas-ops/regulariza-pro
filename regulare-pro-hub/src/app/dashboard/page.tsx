'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp,
  Clock, CheckCircle2, ArrowRight, BarChart2, FileText,
  Wallet, Activity, ChevronRight, AlertCircle, Sparkles,
  ArrowUpRight, Target, Zap, ShieldCheck, Star, Calendar,
  ArrowUp, ArrowDown, MapPin, Receipt
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
  BarChart, Bar
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

function StatCard({ label, value, trend, icon: Icon, color }: any) {
  return (
    <div className="compact-card flex flex-col justify-between h-full group hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 shrink-0`}>
          <Icon size={16} className={color.replace('bg-', 'text-')} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1">{label}</p>
        <p className="kpi-value text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<any>({ processos: [], clientes: [], imoveis: [], financeiro: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/clientes').then(r => r.json()).catch(() => []),
      fetch('/api/imoveis').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
    ]).then(([processos, clientes, imoveis, financeData]) => {
      setData({
        processos: Array.isArray(processos) ? processos : [],
        clientes: Array.isArray(clientes) ? clientes : [],
        imoveis: Array.isArray(imoveis) ? imoveis : [],
        financeiro: Array.isArray(financeData?.financeiro) ? financeData.financeiro : [],
      })
      setLoading(false)
    })
  }, [])

  const { processos, clientes, imoveis, financeiro } = data
  
  // KPI Calculations
  const ativos = processos.filter((p: any) => p.status !== 'finalizado').length
  const receitas = financeiro.filter((f: any) => f.tipo === 'receita')
  const despesas = financeiro.filter((f: any) => f.tipo === 'despesa')

  const totalContratos = processos.reduce((s: number, p: any) => s + (p.valor_total || 0), 0)
  const totalRecebido = receitas.reduce((s: number, f: any) => s + (f.valor_pago || 0), 0)
  const pendenteReceber = Math.max(0, totalContratos - totalRecebido)
  const pendentePagar = despesas.reduce((s: number, f: any) => s + (f.valor - (f.valor_pago || 0)), 0)

  const recentProcessos = [...processos].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  const recentClientes = [...clientes].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
        receita: 0,
        despesa: 0
      }
    })

    receitas.forEach((f: any) => {
      const dt = new Date(f.data_pagamento || f.data_vencimento || f.createdAt)
      const m = months.find(mo => mo.month === dt.getMonth() && mo.year === dt.getFullYear())
      if (m) m.receita += (f.valor_pago || 0)
    })

    despesas.forEach((f: any) => {
      const dt = new Date(f.data_pagamento || f.data_vencimento || f.createdAt)
      const m = months.find(mo => mo.month === dt.getMonth() && mo.year === dt.getFullYear())
      if (m) m.despesa += (f.valor_pago || 0)
    })

    return months.map(m => ({ m: m.label, r: m.receita, d: m.despesa }))
  }, [receitas, despesas])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
       <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Cockpit...</p>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-4 overflow-hidden">
      
      {/* ── ROW 1: COMMAND KPIs (Height: ~15vh) ── */}
      <div className="grid grid-cols-5 gap-4 shrink-0">
        <StatCard label="Processos Ativos" value={ativos} icon={Activity} color="bg-indigo-600" />
        <StatCard label="Receita Bruta" value={fmt(totalContratos)} icon={FileText} color="bg-slate-900" />
        <StatCard label="Lucro Estimado" value={fmt(totalContratos - despesas.reduce((s:number, f:any)=>s+f.valor, 0))} icon={TrendingUp} color="bg-blue-600" />
        <StatCard label="Total Recebido" value={fmt(totalRecebido)} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard label="A Pagar" value={fmt(pendentePagar)} icon={Receipt} color="bg-red-500" />
      </div>

      {/* ── ROW 2: ANALYSIS & FLOW (Height: ~40vh) ── */}
      <div className="grid grid-cols-12 gap-4 flex-[2] min-h-0">
        <div className="col-span-8 compact-card flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Fluxo de Caixa Realizado</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-black text-slate-400 uppercase">Receita</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[9px] font-black text-slate-400 uppercase">Despesa</span></div>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.05}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94A3B8' }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '9px', fontWeight: 'bold' }} formatter={(value: number) => fmt(value)} />
                <Area type="monotone" dataKey="r" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorR)" />
                <Area type="monotone" dataKey="d" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorD)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 compact-card flex flex-col h-full">
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono mb-4">Eficiência de Conversão</h3>
          <div className="flex-1 flex flex-col justify-center gap-4 min-h-0">
            {[
              { label: 'Entrada', count: processos.filter((p:any)=>p.status==='em_analise').length, color: 'bg-amber-400', p: 100 },
              { label: 'Levantamento', count: processos.filter((p:any)=>p.status==='levantamento').length, color: 'bg-blue-400', p: 80 },
              { label: 'Prefeitura', count: processos.filter((p:any)=>p.status==='protocolo_prefeitura').length, color: 'bg-purple-500', p: 60 },
              { label: 'Conclusão', count: processos.filter((p:any)=>p.status==='finalizado').length, color: 'bg-emerald-500', p: 40 },
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="text-slate-900">{s.count}</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.p}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aproveitamento</span>
              <span className="text-xs font-black text-emerald-500">92.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: OPERATIONS & FEEDS (Height: ~40vh) ── */}
      <div className="grid grid-cols-12 gap-4 flex-[2] min-h-0">
        <div className="col-span-5 compact-card flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Processos em Foco</h3>
            <Link href="/processos" className="text-[9px] font-bold text-primary hover:underline">Full Pipeline</Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {recentProcessos.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 group">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-[9px] font-black text-white">{p.codigo_projeto?.split('-')[1] || i}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{p.tipo_regularizacao}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter truncate">{p.cliente?.nome}</p>
                </div>
                <ChevronRight size={12} className="text-slate-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4 compact-card flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Alertas Operacionais</h3>
            <div className="w-4 h-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-[8px] font-black">3</div>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {[
              { label: 'Renovação Alvará', date: 'Hoje', urgency: 'high', icon: Clock },
              { label: 'Vencimento IPTU', date: 'Amanhã', urgency: 'medium', icon: AlertCircle },
              { label: 'Protocolo Prefeitura', date: '12 Out', urgency: 'low', icon: Calendar },
              { label: 'Visita Técnica', date: '15 Out', urgency: 'low', icon: MapPin },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-2 border-l-2 border-transparent hover:border-slate-100 transition-all bg-slate-50/30 rounded-r-lg">
                <div className={`p-1 rounded-md ${d.urgency === 'high' ? 'bg-red-50 text-red-500' : d.urgency === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                  <d.icon size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-800">{d.label}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{d.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 compact-card flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Últimos Clientes</h3>
            <Users size={12} className="text-slate-300" />
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {recentClientes.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                  {c.nome.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{c.nome}</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-tighter truncate">{c.cidade || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
