'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp,
  Clock, CheckCircle2, ArrowRight, BarChart2, FileText,
  Wallet, Activity, ChevronRight, AlertCircle, Zap,
  ArrowUpRight, Target
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
  const protocolo = processos.filter((p: any) => p.status === 'protocolo_prefeitura').length
  const pendentes = processos.filter((p: any) => p.status === 'pendente').length
  const receitas = financeiro.filter((f: any) => f.tipo === 'receita')
  const despesas = financeiro.filter((f: any) => f.tipo === 'despesa')
  const totalRec = receitas.reduce((s: number, f: any) => s + f.valor, 0)
  const recebido = receitas.filter((f: any) => f.status === 'pago' || f.status === 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const aReceber = receitas.filter((f: any) => f.status !== 'pago' && f.status !== 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const lucro = recebido - despesas.filter((f: any) => f.status === 'pago' || f.status === 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const recent = [...processos].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 7)
  
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return {
      m: d.toLocaleDateString('pt-BR', { month: 'short' }),
      monthNum: d.getMonth(),
      year: d.getFullYear(),
      r: 0,
      d: 0
    }
  })

  financeiro.forEach((f: any) => {
    const date = new Date(f.createdAt)
    const m = last6Months.find(l => l.monthNum === date.getMonth() && l.year === date.getFullYear())
    if (m) {
      if (f.tipo === 'receita') m.r += f.valor
      else m.d += f.valor
    }
  })

  const chartData = last6Months
  const pieData = PIE_CFG.map(c => ({
    name: STATUS_LABEL[c.id]?.label || c.id,
    value: processos.filter((p: any) => p.status === c.id).length,
    color: c.color,
  })).filter(d => d.value > 0)

  return (
    <div className="space-y-10 animate-fade-up">

      {/* ── Dashboard Header Premium ── */}
      <div className="premium-dark p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
        <div className="absolute top-[-40px] left-[-40px] w-80 h-80 bg-blue-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-40px] right-[-40px] w-80 h-80 bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Zap className="text-blue-400 fill-blue-400/20" size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cockpit Operacional</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter mb-4 leading-tight">
                 {loading ? 'Sincronizando dados...' : (
                   <>Controle de <span className="text-blue-400">{ativos} processos</span> ativos e <span className="text-emerald-400">{fmt(aReceber)}</span> previstos.</>
                 )}
              </h1>
              <p className="text-slate-400 font-medium text-sm">Dashboard consolidado com métricas em tempo real do banco de dados Neon.</p>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              {[
                { label: 'Eficiência', value: '94%', icon: Target, color: 'text-blue-400' },
                { label: 'Crescimento', value: '+12%', icon: TrendingUp, color: 'text-emerald-400' },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md min-w-[140px]">
                   <s.icon className={`${s.color} mb-3`} size={20}/>
                   <p className="text-2xl font-black tracking-tighter">{s.value}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Clientes', value: clientes.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50', href: '/clientes' },
          { label: 'Imóveis', value: imoveis.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50/50', href: '/imoveis' },
          { label: 'Processos', value: ativos, icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50/50', href: '/processos' },
          { label: 'Protocolados', value: protocolo, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50/50', href: '/processos?status=protocolo_prefeitura' },
          { label: 'Concluídos', value: concluidos, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50', href: '/processos?status=finalizado' },
        ].map(k => (
          <Link key={k.label} href={k.href} className={`stat-card border-transparent shadow-sm ${k.bg} group`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center"><k.icon size={20} className={k.color} /></div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-all" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">
              {loading ? '...' : <AnimatedNumber value={k.value} />}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{k.label}</p>
          </Link>
        ))}
      </div>

      {/* ── Financial Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Receita Total', value: totalRec, icon: BarChart2, color: 'text-blue-600', sub: 'Contrato acumulado' },
          { label: 'Valor Recebido', value: recebido, icon: TrendingUp, color: 'text-emerald-600', sub: 'Liquidado em conta' },
          { label: 'A Receber', value: aReceber, icon: Clock, color: 'text-amber-600', sub: 'Pagamentos pendentes' },
          { label: 'Lucro Líquido', value: lucro, icon: Wallet, color: lucro >= 0 ? 'text-blue-600' : 'text-red-600', sub: 'Resultado consolidado' },
        ].map(f => (
          <div key={f.label} className="card p-6 bg-white border-slate-200 shadow-xl shadow-slate-200/40 group hover:border-blue-500 transition-all">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><f.icon size={16} /></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">
              {loading ? '...' : fmt(f.value)}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{f.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Performance Chart */}
        <div className="card p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Performance Financeira</h3>
                 <p className="text-xs text-slate-400 font-medium">Fluxo de receita e custos operacionais</p>
              </div>
              <div className="badge badge-green">+14.5%</div>
           </div>
           <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ left: -20, right: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip
                formatter={(v: any) => [fmt(Number(v)), 'Receita']}
                contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: 11, fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="r" stroke="#2563EB" strokeWidth={4} fill="url(#gR)" dot={{ fill: '#2563EB', strokeWidth: 2, r: 4, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card p-8">
           <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">Carga Operacional</h3>
           <p className="text-xs text-slate-400 font-medium mb-8">Distribuição de processos por etapa</p>
           <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-full h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" stroke="none" paddingAngle={5}>
                          {pieData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="w-full space-y-4">
                 {pieData.map((d: any) => (
                    <div key={d.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{d.name}</span>
                       </div>
                       <span className="text-sm font-black text-slate-900">{d.value}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Movimentações Recentes</h3>
               <Link href="/processos" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ver Todos</Link>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full zebra-table">
                  <thead>
                     <tr className="table-header">
                        <th className="px-6 py-4">Processo</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Data</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recent.map((p: any) => (
                        <tr key={p.id} className="table-row">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                                    {p.cliente?.nome?.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-900">{p.tipo_regularizacao}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.cliente?.nome}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`badge ${STATUS_LABEL[p.status]?.badge || 'badge-slate'}`}>{STATUS_LABEL[p.status]?.label || p.status}</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="card p-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Atalhos Rápidos</h3>
            <div className="grid grid-cols-1 gap-3">
               {[
                 { label: 'Novo Processo', icon: Plus, color: 'bg-blue-600 text-white', href: '/processos/novo' },
                 { label: 'Gerar Relatório', icon: FileText, color: 'bg-slate-100 text-slate-600', href: '#' },
                 { label: 'Mapa de Atuação', icon: MapPin, color: 'bg-slate-100 text-slate-600', href: '/mapa' },
                 { label: 'Configurações', icon: Settings, color: 'bg-slate-100 text-slate-600', href: '/configuracoes' },
               ].map((a, i) => (
                 <Link key={i} href={a.href} className={`flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm border border-slate-100 ${a.color}`}>
                    <span className="text-[11px] font-black uppercase tracking-widest">{a.label}</span>
                    <a.icon size={16} strokeWidth={3}/>
                 </Link>
               ))}
            </div>
         </div>
      </div>

    </div>
  )
}
