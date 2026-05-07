'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp,
  Clock, CheckCircle2, ArrowRight, BarChart2, FileText,
  Wallet, Activity, ChevronRight, AlertCircle, Zap,
  ArrowUpRight, Target, Calendar, ListTodo, AlertTriangle, Plus
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

const STATUS_CFG: Record<string, { label: string; color: string; border: string; bg: string }> = {
  em_analise:           { label: 'Em Andamento',  color: '#3B82F6', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  protocolo_prefeitura: { label: 'Protocolado',   color: '#6366F1', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
  pendente:             { label: 'Pendência',     color: '#EF4444', border: 'border-red-500/30', bg: 'bg-red-500/10' },
  finalizado:           { label: 'Concluído',     color: '#10B981', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
}

const PIE_COLORS = ['#10B981', '#3B82F6', '#6366F1', '#EF4444']

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
  
  const ativos = processos.filter((p: any) => p.status !== 'finalizado').length
  const concluidos = processos.filter((p: any) => p.status === 'finalizado').length
  const receitas = financeiro.filter((f: any) => f.tipo === 'receita')
  const aReceber = receitas.filter((f: any) => f.status !== 'pago' && f.status !== 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const atrasados = processos.filter((p: any) => p.data_deadline && p.status !== 'finalizado' && new Date(p.data_deadline) < new Date()).length
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
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
      return { m: d.toLocaleDateString('pt-BR', { month: 'short' }), monthNum: d.getMonth(), year: d.getFullYear(), r: 0 }
    })
    financeiro.forEach((f: any) => {
      if (f.tipo !== 'receita') return
      const date = new Date(f.createdAt)
      const m = months.find(l => l.monthNum === date.getMonth() && l.year === date.getFullYear())
      if (m) m.r += f.valor
    })
    return months
  }, [financeiro])

  const pieData = Object.keys(STATUS_CFG).map((id, i) => ({
    name: STATUS_CFG[id].label,
    value: processos.filter((p: any) => p.status === id).length,
    color: PIE_COLORS[i % PIE_COLORS.length]
  })).filter(d => d.value > 0)

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-80 bg-white/5 rounded-2xl" />
        <div className="h-80 bg-white/5 rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="space-y-10 animate-fade">

      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <Zap size={12} className="text-blue-500" /> Live Data
            </span>
            <span className="text-xs font-medium text-slate-500">Analytics consolidado de todos os módulos técnicos.</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/processos/novo" className="btn-primary">
            <Plus size={18} strokeWidth={2.5} /> Novo Processo
          </Link>
          <button className="btn-outline">
            <Calendar size={18} strokeWidth={1.5} /> Ver Agenda
          </button>
        </div>
      </div>

      {/* ── Bento Grid Header ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Pipeline Financeiro" value={aReceber} prefix="R$ " icon={DollarSign} color="text-blue-500" bg="bg-blue-500/10" isCurrency />
        <StatCard label="Produção Semanal" value={ativos} icon={Activity} color="text-indigo-500" bg="bg-indigo-500/10" />
        <StatCard label="Prazos Críticos" value={atrasados} icon={AlertTriangle} color="text-red-500" bg="bg-red-500/10" highlight={atrasados > 0} />
        <StatCard label="Backlog Urgente" value={tarefasUrgentes} icon={ListTodo} color="text-amber-500" bg="bg-amber-500/10" />
      </div>

      {/* ── Main Analytics Section (Bento Style) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[400px]">
        
        {/* Performance Chart - Span 8 */}
        <div className="lg:col-span-8 card p-8 flex flex-col hover-glow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart2 size={120} />
          </div>
          <div className="mb-10 relative z-10">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> Curva de Crescimento
            </h3>
            <p className="text-xs text-slate-500 mt-1">Faturamento bruto consolidado (últimos 6 meses)</p>
          </div>
          <div className="flex-1 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="r" stroke="#2563EB" strokeWidth={3} fill="url(#gBlue)" dot={{ fill: '#2563EB', r: 4, strokeWidth: 2, stroke: '#020617' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Span 4 */}
        <div className="lg:col-span-4 card p-8 flex flex-col hover-glow border-emerald-500/10">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Target size={16} className="text-emerald-500" /> Status do Portfólio
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" stroke="none" paddingAngle={6}>
                  {pieData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {pieData.map((d: any) => (
              <div key={d.name} className="flex flex-col gap-1 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{d.name}</span>
                </div>
                <span className="text-sm font-black text-white ml-3.5">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Deadlines - Span 5 */}
        <div className="lg:col-span-5 card overflow-hidden hover-glow flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={14} className="text-blue-500" /> Próximos Milestones
            </h3>
            <Link href="/processos" className="p-1.5 text-slate-500 hover:text-white transition-colors"><ArrowRight size={14} /></Link>
          </div>
          <div className="flex-1 divide-y divide-white/5 overflow-y-auto">
            {próximosPrazos.map((p: any) => {
              const diff = Math.ceil((new Date(p.data_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              return (
                <Link key={p.id} href={`/processos/${p.id}`} className="block p-5 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{p.tipo_regularizacao}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${diff <= 3 ? 'border-red-500/30 text-red-500 bg-red-500/10' : 'border-white/10 text-slate-400 bg-white/5'}`}>
                      {diff <= 0 ? 'ATRASADO' : `EM ${diff} DIAS`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Users size={12} /> {p.cliente?.nome}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="font-mono text-slate-600">ID: {p.id.substring(0,6)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activities - Span 7 */}
        <div className="lg:col-span-7 card overflow-hidden hover-glow flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
             <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
               <History size={14} className="text-indigo-500" /> Fluxo de Operações
             </h3>
             <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors">VER LOG COMPLETO</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.01]">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">Projeto</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-3 text-right text-[9px] font-black text-slate-600 uppercase tracking-widest">Atualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ultimasAtividades.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/processos/${p.id}`} className="block">
                        <p className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors truncate max-w-[200px]">{p.tipo_regularizacao}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">{p.cliente?.nome}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${STATUS_CFG[p.status]?.border || 'border-white/10'} ${STATUS_CFG[p.status]?.bg || 'bg-white/5'} ${STATUS_CFG[p.status]?.color ? '' : 'text-slate-400'}`} style={{ color: STATUS_CFG[p.status]?.color }}>
                        {STATUS_CFG[p.status]?.label || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-mono text-slate-600">{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</span>
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

function StatCard({ label, value, prefix = '', icon: Icon, color, bg, highlight, isCurrency }: any) {
  return (
    <div className={`bento-card relative overflow-hidden group ${highlight ? 'border-red-500/50 bg-red-500/5' : ''}`}>
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`p-2 rounded-xl ${bg} ${color} border border-white/5`}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</span>
        </div>
      </div>
      <div className="relative z-10">
        <p className={`text-2xl font-black text-white tracking-tighter ${highlight ? 'text-red-500' : ''}`}>
          {isCurrency ? <AnimatedNumber value={value} prefix={prefix} decimals={0} /> : <AnimatedNumber value={value} />}
        </p>
        <div className="flex items-center gap-2 mt-2">
           <div className="h-1 w-8 rounded-full bg-blue-500/30" />
           <span className="text-[9px] font-bold text-slate-600 uppercase">Real-time Sync</span>
        </div>
      </div>
    </div>
  )
}

function History({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
    </svg>
  )
}
