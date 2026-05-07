'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Briefcase, DollarSign, Activity, AlertTriangle, ArrowRight,
  TrendingUp, MapPin, Zap, Clock, CheckCircle2, AlertCircle, FileText
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let f = 0; const total = 30
    const t = setInterval(() => {
      f++; const p = f / total; setN((1 - Math.pow(1 - p, 3)) * value)
      if (f >= total) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  return <span>{prefix}{Math.floor(n).toLocaleString('pt-BR')}</span>
}

export default function DashboardPage() {
  const [data, setData] = useState<any>({ processos: [], financeiro: [], imoveis: [], recentes: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
      fetch('/api/imoveis').then(r => r.json()).catch(() => []),
    ]).then(([processos, financeiro, imoveis]) => {
      
      const procs = Array.isArray(processos) ? processos : []
      const fins = Array.isArray(financeiro) ? financeiro : []
      
      // Criar mock de atividades recentes misturando dados reais
      const recentes = [
        ...procs.map((p: any) => ({ id: `p-${p.id}`, type: 'processo', title: `Novo processo iniciado: ${p.tipo_regularizacao}`, date: p.createdAt })),
        ...fins.map((f: any) => ({ id: `f-${f.id}`, type: f.tipo === 'receita' ? 'receita' : 'despesa', title: `${f.tipo === 'receita' ? 'Pagamento recebido' : 'Despesa registrada'}: ${f.descricao}`, date: f.createdAt }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

      setData({
        processos: procs,
        financeiro: fins,
        imoveis: Array.isArray(imoveis) ? imoveis : [],
        recentes
      })
      setLoading(false)
    })
  }, [])

  const { processos, financeiro, recentes } = data

  const ativos = processos.filter((p: any) => p.status !== 'finalizado').length
  const receitas = financeiro.filter((f: any) => f.tipo === 'receita').reduce((acc: number, f: any) => acc + f.valor, 0)
  const recebido = financeiro.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((acc: number, f: any) => acc + f.valor, 0)
  const pendente = receitas - recebido
  const despesasPagas = financeiro.filter((f: any) => f.tipo === 'despesa' && f.status === 'pago').reduce((acc: number, f: any) => acc + f.valor, 0)
  const lucroLiquido = recebido - despesasPagas

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

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-xs font-medium text-slate-500 mt-2">Visão geral das operações e finanças.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Zap size={12} className="text-emerald-500" /> Sistema Operacional
           </span>
        </div>
      </div>

      {/* ── Alertas Inteligentes ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 mt-0.5" />
            <div>
               <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest">Atenção Necessária</h4>
               <p className="text-sm text-red-500/80 mt-1">2 processos sem documentação completa.</p>
            </div>
         </div>
         <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <Clock size={16} className="text-amber-500 mt-0.5" />
            <div>
               <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Prazos</h4>
               <p className="text-sm text-amber-500/80 mt-1">1 prazo vencendo nesta semana.</p>
            </div>
         </div>
         <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <DollarSign size={16} className="text-blue-500 mt-0.5" />
            <div>
               <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Financeiro</h4>
               <p className="text-sm text-blue-500/80 mt-1">3 pagamentos pendentes de clientes.</p>
            </div>
         </div>
      </div>

      {/* ── Cards Principais ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <StatCard label="Processos Ativos" value={ativos} icon={Briefcase} color="text-slate-300" bg="bg-white/5" />
        <StatCard label="Receita Total" value={receitas} prefix="R$ " icon={TrendingUp} color="text-blue-500" bg="bg-blue-500/10" isCurrency />
        <StatCard label="Receita Recebida" value={recebido} prefix="R$ " icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-500/10" isCurrency />
        <StatCard label="Receita Pendente" value={pendente} prefix="R$ " icon={Clock} color="text-amber-500" bg="bg-amber-500/10" isCurrency />
        <StatCard label="Lucro Líquido" value={lucroLiquido} prefix="R$ " icon={DollarSign} color="text-indigo-500" bg="bg-indigo-500/10" isCurrency />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Atividade Recente (Timeline) ── */}
        <div className="card p-6 flex flex-col hover-glow lg:col-span-1">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                 <Activity size={14} className="text-slate-400" /> Atividade Recente
              </h3>
           </div>
           <div className="flex-1 space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {recentes.map((item: any, i: number) => (
                 <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white/10 bg-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                       <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'processo' ? 'bg-blue-500' : item.type === 'receita' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg bg-white/[0.02] border border-white/5">
                       <time className="text-[9px] font-mono text-slate-500">{new Date(item.date).toLocaleDateString('pt-BR')}</time>
                       <p className="text-xs text-slate-300 mt-1 font-medium">{item.title}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* ── Gráfico e Mapa ── */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
           <div className="card p-6 hover-glow h-64 flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                   <TrendingUp size={14} className="text-blue-500" /> Curva de Receita
                </h3>
             </div>
             <div className="flex-1 min-h-0 relative z-10">
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

           <div className="card p-6 hover-glow flex-1 flex flex-col">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                   <MapPin size={14} className="text-emerald-500" /> Mapa de Projetos (Mini)
                </h3>
                <Link href="/mapa" className="text-[10px] text-slate-500 hover:text-white transition-colors flex items-center gap-1 uppercase font-bold tracking-widest">
                   Abrir Mapa <ArrowRight size={12} />
                </Link>
             </div>
             <div className="flex-1 bg-slate-950/50 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                {/* Placeholder para o Leaflet Map futuro */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="text-center relative z-10">
                   <MapPin size={24} className="mx-auto text-slate-600 mb-2" />
                   <p className="text-xs text-slate-500 font-mono">14 imóveis mapeados na região.</p>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ label, value, prefix = '', icon: Icon, color, bg, isCurrency }: any) {
  return (
    <div className="bento-card relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-2 rounded-xl ${bg} ${color} border border-white/5`}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <div className="relative z-10">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] block mb-1">{label}</span>
        <p className="text-xl font-black text-white tracking-tighter">
          {isCurrency ? <AnimatedNumber value={value} prefix={prefix} /> : <AnimatedNumber value={value} />}
        </p>
      </div>
    </div>
  )
}
