'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp,
  Clock, CheckCircle2, ArrowRight, BarChart2, FileText,
  Wallet, Activity, ChevronRight, AlertCircle, Zap,
  ArrowUpRight, Target, Calendar, ListTodo, AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'

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

const STATUS_LABEL: Record<string, { label: string; color: string; badge: string }> = {
  em_analise:           { label: 'Em Andamento',  color: '#2563EB', badge: 'badge-blue' },
  protocolo_prefeitura: { label: 'Protocolado',   color: '#7C3AED', badge: 'badge-blue' },
  pendente:             { label: 'Pendência',     color: '#DC2626', badge: 'badge-red' },
  finalizado:           { label: 'Concluído',     color: '#059669', badge: 'badge-green' },
}

const PIE_CFG = [
  { id: 'finalizado', color: '#10B981' },
  { id: 'em_analise', color: '#3B82F6' },
  { id: 'protocolo_prefeitura', color: '#6366F1' },
  { id: 'pendente', color: '#EF4444' },
]

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export default function DashboardPage() {
  const [data, setData] = useState<any>({ processos: [], clientes: [], imoveis: [], financeiro: [], tarefas: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/clientes').then(r => r.json()).catch(() => []),
      fetch('/api/imoveis').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
      fetch('/api/tarefas').then(r => r.json()).catch(() => []),
    ]).then(([processos, clientes, imoveis, financeiro, tarefas]) => {
      setData({
        processos: Array.isArray(processos) ? processos : [],
        clientes: Array.isArray(clientes) ? clientes : [],
        imoveis: Array.isArray(imoveis) ? imoveis : [],
        financeiro: Array.isArray(financeiro) ? financeiro : [],
        tarefas: Array.isArray(tarefas) ? tarefas : [],
      })
      setLoading(false)
    })
  }, [])

  const { processos, clientes, imoveis, financeiro, tarefas } = data
  
  // Métricas calculadas
  const ativos = processos.filter((p: any) => p.status !== 'finalizado').length
  const concluidos = processos.filter((p: any) => p.status === 'finalizado').length
  
  const receitas = financeiro.filter((f: any) => f.tipo === 'receita')
  const totalRec = receitas.reduce((s: number, f: any) => s + f.valor, 0)
  const recebido = receitas.filter((f: any) => f.status === 'pago' || f.status === 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const aReceber = receitas.filter((f: any) => f.status !== 'pago' && f.status !== 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  
  const atrasados = processos.filter((p: any) => {
    if (!p.data_deadline || p.status === 'finalizado') return false
    return new Date(p.data_deadline) < new Date()
  }).length

  const semana = processos.filter((p: any) => {
    const diff = Math.abs(new Date(p.createdAt).getTime() - new Date().getTime())
    return diff <= 7 * 24 * 60 * 60 * 1000
  }).length

  const tarefasUrgentes = tarefas.filter((t: any) => t.status === 'pendente' && (t.prioridade === 'alta' || t.prioridade === 'urgente')).length

  const próximosPrazos = [...processos]
    .filter((p: any) => p.data_deadline && p.status !== 'finalizado')
    .sort((a: any, b: any) => new Date(a.data_deadline).getTime() - new Date(b.data_deadline).getTime())
    .slice(0, 5)

  const ultimasAtividades = [...processos]
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return {
        m: d.toLocaleDateString('pt-BR', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        r: 0
      }
    })
    financeiro.forEach((f: any) => {
      if (f.tipo !== 'receita') return
      const date = new Date(f.createdAt)
      const m = months.find(l => l.monthNum === date.getMonth() && l.year === date.getFullYear())
      if (m) m.r += f.valor
    })
    return months
  }, [financeiro])

  const pieData = PIE_CFG.map(c => ({
    name: STATUS_LABEL[c.id]?.label || c.id,
    value: processos.filter((p: any) => p.status === c.id).length,
    color: c.color,
  })).filter(d => d.value > 0)

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="page-title text-2xl">Olá, Jadson</h1>
          <p className="text-slate-500 text-sm font-medium">Aqui está um resumo das suas operações hoje.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/processos/novo" className="btn-primary">
            <Plus size={16} /> Novo Processo
          </Link>
          <button className="btn-outline">
            <Calendar size={16} /> Ver Agenda
          </button>
        </div>
      </div>

      {/* ── KPI Widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <DollarSign size={16} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receita Prevista</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight">{fmt(aReceber)}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Total acumulado a receber</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concluídos / Semana</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight">{semana}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Novas entradas nos últimos 7 dias</p>
          </div>
        </div>

        <div className="stat-card border-red-100 bg-red-50/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
              <AlertTriangle size={16} />
            </div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Processos Atrasados</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight text-red-600">{atrasados}</p>
            <p className="text-[11px] text-red-500/70 font-medium mt-1">Requerem atenção imediata</p>
          </div>
        </div>

        <div className="stat-card border-amber-100 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
              <ListTodo size={16} />
            </div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Tarefas Urgentes</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight text-amber-700">{tarefasUrgentes}</p>
            <p className="text-[11px] text-amber-600/70 font-medium mt-1">Alta prioridade pendentes</p>
          </div>
        </div>
      </div>

      {/* ── Charts & Lists ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Performance Mensal</h3>
              <p className="text-xs text-slate-500 font-medium">Receita bruta gerada nos últimos meses</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ left: -20, right: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip />
              <Area type="monotone" dataKey="r" stroke="#2563EB" strokeWidth={3} fill="url(#gR)" dot={{ fill: '#2563EB', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Process Stages (Pie) */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-4">Etapas dos Processos</h3>
          <div className="h-[180px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none" paddingAngle={4}>
                  {pieData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {pieData.map((d: any) => (
              <div key={d.name} className="flex items-center justify-between text-[11px] p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="font-semibold text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Deadlines */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Próximos Prazos</h3>
            <Link href="/processos" className="text-[10px] font-bold text-blue-600 hover:underline">Ver Todos</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {próximosPrazos.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">Nenhum prazo agendado.</div>
            ) : próximosPrazos.map((p: any) => {
              const diff = Math.ceil((new Date(p.data_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              return (
                <Link key={p.id} href={`/processos/${p.id}`} className="block p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.tipo_regularizacao}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${diff <= 3 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                      {diff <= 0 ? 'Atrasado' : `${diff} dias`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{p.cliente?.nome}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Last Activities */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Últimas Atividades</h3>
            <button className="text-[10px] font-bold text-slate-400 flex items-center gap-1 hover:text-slate-600">
              <Activity size={12} /> Log Completo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-3">Processo</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Atualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ultimasAtividades.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3.5">
                      <Link href={`/processos/${p.id}`} className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate block max-w-[200px]">
                        {p.tipo_regularizacao}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-slate-500 font-medium">{p.cliente?.nome}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`badge ${STATUS_LABEL[p.status]?.badge || 'badge-slate'}`}>{STATUS_LABEL[p.status]?.label || p.status}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  )
}
