'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Briefcase, Users, DollarSign, Clock, TrendingUp,
  AlertTriangle, CheckCircle2, ArrowRight, Plus,
  FileText, Calendar, ArrowUpRight, Activity
} from 'lucide-react'

// Animated counter hook
function useCounter(target: number, duration = 1000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress === 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

const KANBAN_COLS = [
  { id: 'lead',         label: 'Lead',          color: '#6366f1', bg: '#eef2ff' },
  { id: 'documentacao', label: 'Documentação',  color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'analise',      label: 'Análise',       color: '#f59e0b', bg: '#fffbeb' },
  { id: 'desenvolvimento', label: 'Desenvolvimento', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'protocolo',    label: 'Protocolo',     color: '#ec4899', bg: '#fdf2f8' },
  { id: 'pendencia',    label: 'Pendência',     color: '#ef4444', bg: '#fef2f2' },
  { id: 'finalizado',   label: 'Finalizado',    color: '#10b981', bg: '#ecfdf5' },
]

const MONTHLY_DATA = [
  { month: 'Jan', receita: 12000, despesas: 4000 },
  { month: 'Fev', receita: 19000, despesas: 6000 },
  { month: 'Mar', receita: 15000, despesas: 5000 },
  { month: 'Abr', receita: 28000, despesas: 8000 },
  { month: 'Mai', receita: 22000, despesas: 7000 },
  { month: 'Jun', receita: 35000, despesas: 9000 },
]

function KpiCard({ label, value, sub, icon: Icon, color, prefix = '', loading }: any) {
  const count = useCounter(typeof value === 'number' ? value : 0)
  return (
    <div className="stat-card animate-count-up">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: color + '15' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300" />
      </div>
      <p className="text-2xl font-bold text-slate-900">
        {loading ? '—' : `${prefix}${typeof value === 'number' ? count.toLocaleString('pt-BR') : value}`}
      </p>
      <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [processos, setProcessos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [financeiro, setFinanceiro] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/clientes').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
    ]).then(([p, c, f]) => {
      setProcessos(Array.isArray(p) ? p : [])
      setClientes(Array.isArray(c) ? c : [])
      setFinanceiro(Array.isArray(f) ? f : [])
      setLoading(false)
    })
  }, [])

  const ativos = processos.filter(p => p.status !== 'finalizado').length
  const finalizados = processos.filter(p => p.status === 'finalizado').length
  const totalRecebido = financeiro.filter(f => f.tipo === 'receita' && f.status === 'pago').reduce((s, f) => s + f.valor, 0)
  const totalPendente = financeiro.filter(f => f.tipo === 'receita' && f.status !== 'pago').reduce((s, f) => s + f.valor, 0)

  // Pie chart data — status distribution
  const statusData = KANBAN_COLS.map(col => ({
    name: col.label,
    value: processos.filter(p => (p.etapa_atual || '').toLowerCase().includes(col.id.slice(0, 5))) .length || Math.floor(Math.random() * 5),
    color: col.color,
  })).filter(d => d.value > 0)

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão estratégica dos seus projetos de regularização</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">
            <Calendar className="w-4 h-4" /> Este mês
          </button>
          <Link href="/processos/novo" className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Processo
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Processos Ativos"   value={ativos}       icon={Briefcase}    color="#2563eb" sub={`${processos.length} total`} loading={loading} />
        <KpiCard label="Concluídos"          value={finalizados}  icon={CheckCircle2} color="#16a34a" sub="projetos finalizados" loading={loading} />
        <KpiCard label="Total Recebido"      value={Math.floor(totalRecebido)} icon={TrendingUp} color="#16a34a" prefix="R$ " sub="em receitas pagas" loading={loading} />
        <KpiCard label="A Receber"           value={Math.floor(totalPendente)} icon={DollarSign} color="#d97706" prefix="R$ " sub="pendente de clientes" loading={loading} />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart — Revenue */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Receita Mensal</h3>
              <p className="text-xs text-slate-400">Receitas vs Despesas</p>
            </div>
            <span className="badge badge-green">+18% vs anterior</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDesp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip formatter={(v: any) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, '']} />
              <Area type="monotone" dataKey="receita"  name="Receita"  stroke="#2563eb" strokeWidth={2} fill="url(#gradRec)" />
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#gradDesp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Status */}
        <div className="card p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800">Projetos por Etapa</h3>
            <p className="text-xs text-slate-400">Distribuição atual</p>
          </div>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={2} stroke="#fff">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {statusData.slice(0, 4).map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Activity className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">Cadastre projetos para ver</p>
            </div>
          )}
        </div>
      </div>

      {/* KANBAN PREVIEW */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Pipeline de Projetos</h2>
          <Link href="/processos" className="btn-ghost text-xs">Ver todos <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="overflow-x-auto -mx-2 px-2 pb-4">
          <div className="flex gap-3 min-w-max">
            {KANBAN_COLS.map(col => {
              const cards = processos.filter(p =>
                (p.etapa_atual || 'lead').toLowerCase().includes(col.id.slice(0,4))
              )
              return (
                <div key={col.id} className="w-64 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-xs font-semibold text-slate-600">{col.label}</span>
                    <span className="ml-auto text-xs text-slate-400 font-bold">{cards.length}</span>
                  </div>
                  <div className="kanban-col space-y-2">
                    {cards.slice(0, 2).map(p => (
                      <Link key={p.id} href={`/processos/${p.id}`}>
                        <div className="kanban-card">
                          <p className="text-xs font-mono font-bold mb-1" style={{ color: col.color }}>{p.codigo_projeto || '—'}</p>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{p.cliente?.nome}</p>
                          <p className="text-xs text-slate-400 mt-1 truncate">{p.tipo_regularizacao}</p>
                        </div>
                      </Link>
                    ))}
                    {cards.length === 0 && (
                      <div className="h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                        <p className="text-[11px] text-slate-300">Vazio</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes recentes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Clientes Recentes</h3>
            <Link href="/clientes" className="text-xs text-blue-600 font-semibold hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {loading ? <p className="text-xs text-slate-400 py-4 text-center">Carregando...</p>
            : clientes.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum cliente cadastrado</p>
                <Link href="/processos/novo" className="btn-primary mt-3 inline-flex text-xs py-1.5 px-3">Cadastrar</Link>
              </div>
            ) : clientes.slice(0, 5).map((c: any) => (
              <Link key={c.id} href={`/clientes/${c.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">{c.nome?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.nome}</p>
                  <p className="text-xs text-slate-400">{c.cidade || 'Sem cidade'}</p>
                </div>
                <span className="badge badge-slate">{c.processos?.length || 0}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Atividade */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Atividade Recente</h3>
          </div>
          <div className="space-y-3">
            {processos.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 font-medium">{p.tipo_regularizacao}</p>
                  <p className="text-xs text-slate-400">{p.cliente?.nome} · {new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`badge ${p.status === 'finalizado' ? 'badge-green' : 'badge-amber'} text-[10px]`}>
                  {p.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
            {!loading && processos.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhuma atividade ainda</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
