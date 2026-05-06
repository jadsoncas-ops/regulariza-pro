'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp, TrendingDown,
  Clock, CheckCircle2, AlertTriangle, ArrowRight, Plus, BarChart2,
  FileText, Wallet, ArrowUpRight, Activity, ChevronRight, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(value)

  useEffect(() => {
    ref.current = 0
    const duration = 800
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  const formatted = decimals > 0
    ? display.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.floor(display).toLocaleString('pt-BR')

  return <span>{prefix}{formatted}{suffix}</span>
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, bg, prefix = '', suffix = '', decimals = 0, loading }: any) {
  return (
    <div className="card p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300" />
      </div>
      <div className="text-2xl font-bold text-slate-900 tabular-nums">
        {loading ? <div className="h-7 w-24 bg-slate-100 rounded animate-pulse" /> :
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        }
      </div>
      <p className="text-sm font-medium text-slate-600 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_PIPELINE = [
  { id: 'levantamento',    label: 'Levantamento',    color: '#6366f1', bg: '#eef2ff' },
  { id: 'documentacao',    label: 'Documentação',    color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'protocolo',       label: 'Protocolo',       color: '#f59e0b', bg: '#fffbeb' },
  { id: 'em_analise',      label: 'Em Análise',      color: '#3b82f6', bg: '#eff6ff' },
  { id: 'pendencia',       label: 'Pendência',       color: '#ef4444', bg: '#fef2f2' },
  { id: 'finalizado',      label: 'Finalizado',      color: '#10b981', bg: '#ecfdf5' },
]

const STATUS_BADGE: Record<string, string> = {
  finalizado: 'badge-green', em_analise: 'badge-amber',
  protocolo_prefeitura: 'badge-blue', pendente: 'badge-red',
}

const MONTHLY_MOCK = [
  { m: 'Jan', r: 8000,  d: 2500 }, { m: 'Fev', r: 14000, d: 4000 },
  { m: 'Mar', r: 11000, d: 3500 }, { m: 'Abr', r: 19000, d: 5000 },
  { m: 'Mai', r: 16000, d: 4500 }, { m: 'Jun', r: 24000, d: 6000 },
]

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
        clientes:  Array.isArray(clientes)  ? clientes  : [],
        imoveis:   Array.isArray(imoveis)   ? imoveis   : [],
        financeiro:Array.isArray(financeiro) ? financeiro : [],
      })
      setLoading(false)
    })
  }, [])

  const { processos, clientes, imoveis, financeiro } = data

  // Calculations
  const ativos     = processos.filter((p: any) => p.status !== 'finalizado').length
  const concluidos = processos.filter((p: any) => p.status === 'finalizado').length
  const protocolo  = processos.filter((p: any) => p.status === 'protocolo_prefeitura' || p.etapa_atual?.toLowerCase().includes('protocolo')).length
  const receitas   = financeiro.filter((f: any) => f.tipo === 'receita')
  const despesas   = financeiro.filter((f: any) => f.tipo === 'despesa')
  const totalRec   = receitas.reduce((s: number, f: any) => s + f.valor, 0)
  const recebido   = receitas.filter((f: any) => f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0)
  const aReceber   = receitas.filter((f: any) => f.status !== 'pago').reduce((s: number, f: any) => s + f.valor, 0)
  const totalDesp  = despesas.reduce((s: number, f: any) => s + f.valor, 0)
  const lucro      = recebido - despesas.filter((f: any) => f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0)

  // Pie data
  const pieData = STATUS_PIPELINE.map(s => ({
    name: s.label,
    value: processos.filter((p: any) => (p.status || '').includes(s.id.split('_')[0]) || (p.etapa_atual || '').toLowerCase().includes(s.id.slice(0, 5))).length,
    color: s.color,
  })).filter((d: any) => d.value > 0)

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
  const recentProcessos = [...processos].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8)

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão executiva do seu hub de regularização</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* ── AÇÕES RÁPIDAS ────────────────────────────────────────────── */}
      <div className="card p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ações Rápidas</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/clientes/novo',   label: 'Novo Cliente',         icon: Users,     color: '#2563eb', bg: '#eff6ff' },
            { href: '/processos/novo',  label: 'Novo Processo',        icon: Briefcase, color: '#7c3aed', bg: '#f5f3ff' },
            { href: '/processos/novo',  label: 'Novo Imóvel',          icon: Building2, color: '#0891b2', bg: '#ecfeff' },
            { href: '/financeiro',      label: 'Lançamento Financeiro', icon: Wallet,    color: '#059669', bg: '#ecfdf5' },
          ].map(a => (
            <Link key={a.label} href={a.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: a.bg }}>
                <a.icon className="w-4.5 h-4.5" style={{ color: a.color }} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Adicionar</p>
                <p className="text-sm font-semibold text-slate-800">{a.label.replace('Novo ', '').replace('Lançamento ', '')}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPI GRID ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Visão Geral</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard label="Clientes"    value={clientes.length}   icon={Users}        color="#2563eb" bg="#eff6ff" loading={loading} />
          <KpiCard label="Imóveis"     value={imoveis.length}    icon={Building2}    color="#7c3aed" bg="#f5f3ff" loading={loading} />
          <KpiCard label="Ativos"      value={ativos}            icon={Activity}     color="#0891b2" bg="#ecfeff" loading={loading} sub={`${processos.length} total`} />
          <KpiCard label="Protocolados" value={protocolo}        icon={FileText}     color="#f59e0b" bg="#fffbeb" loading={loading} />
          <KpiCard label="Concluídos"  value={concluidos}        icon={CheckCircle2} color="#10b981" bg="#ecfdf5" loading={loading} />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Financeiro</p>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Receita Total"  value={totalRec}   icon={BarChart2}    color="#2563eb" bg="#eff6ff" prefix="R$ " decimals={0} loading={loading} />
          <KpiCard label="Valor Recebido" value={recebido}   icon={TrendingUp}   color="#10b981" bg="#ecfdf5" prefix="R$ " decimals={0} loading={loading} />
          <KpiCard label="A Receber"      value={aReceber}   icon={Clock}        color="#f59e0b" bg="#fffbeb" prefix="R$ " decimals={0} loading={loading} />
          <KpiCard label="Lucro Líquido"  value={lucro}      icon={lucro >= 0 ? TrendingUp : TrendingDown} color={lucro >= 0 ? '#10b981' : '#ef4444'} bg={lucro >= 0 ? '#ecfdf5' : '#fef2f2'} prefix="R$ " decimals={0} loading={loading} />
        </div>
      </div>

      {/* ── CHARTS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Receita vs Despesas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Evolução mensal (últimos 6 meses)</p>
            </div>
            <span className="badge badge-green text-xs">+18% este mês</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={MONTHLY_MOCK}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="m" tick={{fontSize:11, fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11, fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1000}k`}/>
              <Tooltip formatter={(v:any, n:any) => [fmt(Number(v)), n === 'r' ? 'Receita' : 'Despesas']}/>
              <Area type="monotone" dataKey="r" stroke="#2563eb" strokeWidth={2} fill="url(#gR)" name="r"/>
              <Area type="monotone" dataKey="d" stroke="#ef4444" strokeWidth={2} fill="url(#gD)" name="d"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Projetos por Etapa</h3>
          <p className="text-xs text-slate-400 mb-4">Distribuição atual</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                    dataKey="value" stroke="#fff" strokeWidth={2}>
                    {pieData.map((e: any, i: number) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v:any) => [v, 'projetos']}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.slice(0, 5).map((d: any) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}/>
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-300">
              <BarChart2 className="w-8 h-8 mb-2"/>
              <p className="text-xs">Sem dados ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PROCESSOS RECENTES + CLIENTES ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tabela recentes */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Processos Recentes</h3>
            <Link href="/processos" className="btn-ghost text-xs py-1.5 px-3">
              Ver todos <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left table-header">Cliente</th>
                  <th className="px-5 py-3 text-left table-header">Serviço</th>
                  <th className="px-5 py-3 text-left table-header hidden md:table-cell">Cidade</th>
                  <th className="px-5 py-3 text-left table-header">Status</th>
                  <th className="px-5 py-3 text-left table-header hidden sm:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"/>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentProcessos.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                    Nenhum processo cadastrado ainda
                  </td></tr>
                ) : recentProcessos.map((p: any) => (
                  <tr key={p.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600">{p.cliente?.nome?.charAt(0)}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[120px]">{p.cliente?.nome || '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-600 truncate max-w-[140px]">{p.tipo_regularizacao}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-500">{p.imovel?.cidade || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUS_BADGE[p.status] || 'badge-slate'} text-[11px]`}>
                        {p.status?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-xs text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'})}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clientes recentes */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Clientes</h3>
            <Link href="/clientes" className="text-xs text-blue-600 font-semibold hover:underline">Ver todos</Link>
          </div>
          <div className="p-3 space-y-1">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0"/>
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 bg-slate-100 rounded animate-pulse w-3/4"/>
                    <div className="h-3 bg-slate-50 rounded animate-pulse w-1/2"/>
                  </div>
                </div>
              ))
            ) : clientes.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="w-6 h-6 text-slate-300 mx-auto mb-2"/>
                <p className="text-xs text-slate-400">Nenhum cliente ainda</p>
              </div>
            ) : clientes.slice(0, 7).map((c: any) => (
              <Link key={c.id} href={`/clientes/${c.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-white">{c.nome?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.nome}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {c.processos?.length || 0} processo(s) · {c.cidade || 'sem cidade'}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors"/>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
