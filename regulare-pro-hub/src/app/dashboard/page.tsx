'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Layers, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, Zap, Target,
  FileText, CheckCircle2, Receipt, Clock,
  ChevronRight, Sparkles, Plus, Wallet,
  BarChart3, BrainCircuit
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtK = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : fmt(v)

const STATUS = {
  em_analise:           { label: 'Entrada',      color: '#F59E0B' },
  levantamento:         { label: 'Levantamento', color: '#3B82F6' },
  projeto:              { label: 'Projeto',       color: '#6366F1' },
  protocolo_prefeitura: { label: 'Prefeitura',   color: '#8B5CF6' },
  cartorio:             { label: 'Cartório',      color: '#F97316' },
  finalizado:           { label: 'Conclusão',     color: '#10B981' },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl text-[11px] min-w-[120px]">
      <p className="font-mono text-slate-400 mb-2 tracking-widest">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-300">{p.name}</span>
          </div>
          <span className="font-bold text-white font-mono">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<any>({ processos: [], clientes: [], financeiro: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/clientes').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
    ]).then(([processos, clientes, financeData]) => {
      setData({
        processos: Array.isArray(processos) ? processos : [],
        clientes: Array.isArray(clientes) ? clientes : [],
        financeiro: Array.isArray(financeData?.financeiro) ? financeData.financeiro : [],
      })
      setLoading(false)
    })
  }, [])

  const { processos, clientes, financeiro } = data

  const receitas = financeiro.filter((f: any) => f.tipo === 'receita')
  const despesas = financeiro.filter((f: any) => f.tipo === 'despesa' || f.is_repasse)
  const ativos   = processos.filter((p: any) => p.status !== 'finalizado')

  const totalContratos  = processos.reduce((s: number, p: any) => s + (p.valor_total || 0), 0)
  const totalRecebido   = receitas.reduce((s: number, f: any) => s + (f.status === 'pago' ? f.valor : 0), 0)
  const totalCustos     = despesas.reduce((s: number, f: any) => s + f.valor, 0)
  const lucroEstimado   = totalContratos - totalCustos
  const pendentePagar   = despesas.reduce((s: number, f: any) => s + (f.status !== 'pago' ? f.valor : 0), 0)

  /* Chart: last 6 months */
  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
      return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.','').toUpperCase(), r: 0, d: 0 }
    })
    receitas.forEach((f: any) => {
      const dt = new Date(f.data_pagamento || f.data_vencimento || f.createdAt)
      const m = months.find(mo => mo.month === dt.getMonth() && mo.year === dt.getFullYear())
      if (m) m.r += (f.status === 'pago' ? f.valor : 0)
    })
    despesas.forEach((f: any) => {
      const dt = new Date(f.data_pagamento || f.data_vencimento || f.createdAt)
      const m = months.find(mo => mo.month === dt.getMonth() && mo.year === dt.getFullYear())
      if (m) m.d += f.valor
    })
    return months
  }, [receitas, despesas])

  /* Recent */
  const recentProcessos = [...processos]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-[hsl(231,100%,60%)]/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-[hsl(231,100%,60%)] border-t-transparent rounded-full animate-spin" />
        <BrainCircuit size={16} className="text-[hsl(231,100%,60%)] animate-pulse" />
      </div>
      <p className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase">Inicializando Sistema...</p>
    </div>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* ── HEADER ─────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistemas Online
            </span>
            <span className="text-[9px] font-mono text-slate-400">V. 3.0.4</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Center</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/relatorios" className="btn btn-ghost bg-white/50 border border-slate-200/50 backdrop-blur-sm">
            <BarChart3 size={14} /> Relatórios
          </Link>
          <Link href="/processos/novo" className="btn btn-primary shadow-[0_0_15px_rgba(51,88,255,0.3)]">
            <Plus size={14} strokeWidth={2.5} /> Nova Operação
          </Link>
        </div>
      </motion.div>

      {/* ── BENTO GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-12 auto-rows-min gap-5">

        {/* 1. Main KPI - Lucro Estimado (Span 4) */}
        <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 rounded-3xl p-6 relative overflow-hidden bg-slate-950 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-32 bg-[hsl(231,100%,60%)]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-white/60 text-[11px] font-mono font-semibold tracking-widest uppercase">
              <BrainCircuit size={14} /> Lucro Projetado
            </div>
            <div className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold text-white font-mono border border-white/5 backdrop-blur-md">
              YTD
            </div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white tracking-tighter mb-2">{fmt(lucroEstimado)}</h2>
            <div className="flex items-center gap-4 text-[11px] font-medium text-white/60">
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                <TrendingUp size={12} /> +12%
              </span>
              <span>vs último semestre</span>
            </div>
          </div>
        </motion.div>

        {/* 2. KPIs Secundários (Span 4) */}
        <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 grid grid-rows-2 gap-5">
          {/* Receita Bruta */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-center group hover:border-[hsl(231,100%,60%)]/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[hsl(231,100%,60%)]/5 transition-colors" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Volume de Contratos</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{fmtK(totalContratos)}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                <FileText size={18} />
              </div>
            </div>
          </div>

          {/* Recebido vs Pagar */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Recebido</p>
              <p className="text-xl font-bold text-emerald-600 tracking-tight">{fmtK(totalRecebido)}</p>
            </div>
            <div className="bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">A Pagar</p>
              <p className="text-xl font-bold text-red-500 tracking-tight">{fmtK(pendentePagar)}</p>
            </div>
          </div>
        </motion.div>

        {/* 3. Operações Ativas (Span 4) */}
        <motion.div variants={itemVariants} className="col-span-12 md:col-span-4 bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-800 text-[11px] font-bold uppercase tracking-widest font-mono">
              <Activity size={14} className="text-[hsl(231,100%,60%)]" /> Pipeline
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[hsl(231,100%,60%)]/10 text-[hsl(231,100%,60%)] text-[10px] font-bold font-mono">
              {ativos.length} ATIVOS
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4">
            {Object.entries(STATUS).slice(0, 4).map(([key, val]) => {
              const count = processos.filter((p: any) => p.status === key).length
              const pct = processos.length > 0 ? (count / processos.length) * 100 : 0
              return (
                <div key={key}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-600">{val.label}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: val.color }} />
                  </div>
                </div>
              )
            })}
          </div>
          
          <Link href="/processos" className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest rounded-xl transition-colors">
            Ver Fluxo Completo <ArrowUpRight size={12} />
          </Link>
        </motion.div>

        {/* 4. Gráfico Fluxo de Caixa (Span 8) */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm min-h-[320px] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Fluxo de Caixa Analítico
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Receitas × Despesas dos últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <div className="w-2 h-2 rounded-full bg-[hsl(231,100%,60%)] shadow-[0_0_8px_hsl(231,100%,60%)]" /> Receita
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <div className="w-2 h-2 rounded-full bg-slate-300" /> Despesa
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(231, 100%, 60%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(231, 100%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 600, fill: '#94A3B8', fontFamily: 'monospace' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 600, fill: '#94A3B8', fontFamily: 'monospace' }} 
                  tickFormatter={v => `${v / 1000}k`} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="r" name="Receita" stroke="hsl(231, 100%, 60%)" strokeWidth={3} fillOpacity={1} fill="url(#gr)" activeDot={{ r: 6, fill: "hsl(231, 100%, 60%)", stroke: "#fff", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="d" name="Despesa" stroke="#CBD5E1" strokeWidth={3} fillOpacity={1} fill="url(#gd)" activeDot={{ r: 6, fill: "#94A3B8", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 5. Processos Recentes (Span 4) */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest font-mono">Ações Recentes</h3>
            <button className="w-6 h-6 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
              <Sparkles size={14} />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {recentProcessos.map((p: any) => {
              const s = STATUS[p.status as keyof typeof STATUS]
              return (
                <Link key={p.id} href={`/processos/${p.id}`} className="group block p-3 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50/50 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                      {p.codigo_projeto || 'REG.000'}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: s?.color }}>{s?.label}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-slate-900 leading-tight mb-1">{p.tipo_regularizacao}</p>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                    <Target size={10} /> {p.cliente?.nome}
                  </p>
                </Link>
              )
            })}
            
            {recentProcessos.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <Layers size={24} className="text-slate-200 mb-2" />
                <p className="text-[11px] font-medium text-slate-400">Nenhuma operação ativa</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}
