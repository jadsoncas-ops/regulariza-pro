'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Layers, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, Zap, Target,
  FileText, CheckCircle2, Receipt, Clock,
  ChevronRight, Sparkles, Plus, Wallet,
  BarChart3, BrainCircuit, AlertCircle, Timer, FolderKanban,
  ArrowRight, Landmark, PieChart, LayoutDashboard, MoreVertical
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts'
import { motion } from 'framer-motion'
import { getProcessHealth } from '@/lib/health'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtK = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : fmt(v)

const HEALTH_COLORS = {
  on_track: '#10B981',
  attention: '#F59E0B',
  delayed: '#EF4444'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 p-2.5 rounded-lg shadow-2xl text-[10px] min-w-[100px]">
      <p className="font-mono text-slate-400 mb-1.5 tracking-widest uppercase">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-300 font-medium">{p.name}</span>
          </div>
          <span className="font-bold text-white font-mono">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardCockpit() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats/dashboard')
      .then(r => r.json())
      .then(d => {
        setStats(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const s = useMemo(() => {
    if (!stats) return null
    
    const revenueTrend = stats.prevMonthlyRevenue 
      ? ((stats.monthlyRevenue - stats.prevMonthlyRevenue) / stats.prevMonthlyRevenue) * 100 
      : 0

    const healthData = [
      { name: 'No Prazo', value: stats.health.on_track, color: HEALTH_COLORS.on_track },
      { name: 'Atenção', value: stats.health.attention, color: HEALTH_COLORS.attention },
      { name: 'Atrasado', value: stats.health.delayed, color: HEALTH_COLORS.delayed },
    ]

    return {
      ...stats,
      revenueTrend,
      healthData
    }
  }, [stats])

  if (loading) return (

    <div className="h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] font-black text-white uppercase tracking-widest animate-pulse">Initializing Cockpit...</p>
      </div>
    </div>
  )

  if (!s) return null

  return (
    <div className="h-screen flex flex-col bg-[#0F1115] text-slate-300 overflow-hidden" style={{ margin: '-20px' }}>
      
      {/* ── HEADER ── */}
      <header className="h-[52px] border-b border-white/5 bg-slate-900/40 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-[13px] font-black text-white uppercase tracking-tight">Business Control Center</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Real-time Operational Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live System Status</span>
           </div>
           <Link href="/processos/novo" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
             <Plus size={14} /> Novo Processo
           </Link>
        </div>
      </header>

      {/* ── MAIN COCKPIT ── */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        
        {/* ROW 1: KPIs (Top 4 Cards) */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-4 gap-4">
            <KPICard 
              label="Processos Ativos" 
              value={s.activeCount} 
              sub="Em tramitação" 
              icon={FolderKanban} 
              color="text-blue-500" 
            />
            <KPICard 
              label="Faturamento Mes" 
              value={fmt(s.monthlyRevenue)} 
              sub={`${s.revenueTrend > 0 ? '+' : ''}${s.revenueTrend.toFixed(1)}% vs mes ant.`} 
              icon={TrendingUp} 
              color="text-emerald-500" 
              trend={s.revenueTrend}
            />
           <KPICard 
             label="Ticket Médio" 
             value={fmtK(s.avgTicket)} 
             sub="Por contrato fechado" 
             icon={Target} 
             color="text-purple-500" 
           />
           <KPICard 
             label="Tempo Médio" 
             value={`${s.avgCompTime.toFixed(1)}d`} 
             sub="Ciclo de conclusão" 
             icon={Timer} 
             color="text-amber-500" 
           />
        </div>

        {/* ROW 2: CORE ANALYTICS (Middle Row) */}
        <div className="col-span-12 grid grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
          
          {/* Health Distribution & Financial Forecast */}
          <div className="col-span-4 flex flex-col gap-4">
            <Card title="Saúde da Operação" icon={Activity} className="flex-1 min-h-0">
               <div className="h-full flex flex-col items-center justify-center p-4">
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={s.healthData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {s.healthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full mt-2">
                    {s.healthData.map(h => (
                      <div key={h.name} className="flex flex-col items-center">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">{h.name}</span>
                        <span className="text-[14px] font-black text-white" style={{ color: h.color }}>{h.value}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </Card>

            <Card title="Forecast Financeiro" icon={Wallet} className="h-[200px]">
               <div className="space-y-3 p-2">
                  <FinancialItem label="Contratado Total" value={s.financials.totalContracted} color="text-slate-200" />
                  <FinancialItem label="Recebido Realizado" value={s.financials.totalReceived} color="text-emerald-500" />
                  <FinancialItem label="Receita Pendente" value={s.financials.pending} color="text-blue-500" highlight />
                  <div className="pt-2 border-t border-white/5">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Margem Bruta</span>
                        <span className="text-white">82%</span>
                     </div>
                  </div>
               </div>
            </Card>
          </div>

          {/* Workflow Performance & Bottlenecks */}
          <div className="col-span-4 flex flex-col gap-4">
            <Card title="Gargalos por Etapa" icon={Zap} className="flex-1 min-h-0">
               <div className="h-full p-4 flex flex-col">
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={s.bottlenecks} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={80} 
                          tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} 
                        />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center mt-2">Volume de processos por estágio ativo</p>
               </div>
            </Card>
          </div>

          {/* Activity Feed (Right Column) */}
          <div className="col-span-4">
            <Card title="Activity Stream" icon={Activity} className="h-full min-h-0 flex flex-col">
               <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar-dark p-2">
                  {s.events.map((log: any, i: number) => (
                    <Link key={i} href={`/processos/${log.processoId}`} className="flex gap-3 relative group hover:bg-white/5 p-2 rounded-xl transition-all">
                      <div className="w-2 h-2 rounded-full bg-blue-500/30 border border-blue-500/50 mt-1 shrink-0 group-hover:bg-blue-500 transition-colors" />
                      <div>
                        <p className="text-[10px] font-black text-white uppercase leading-none tracking-tight">{log.titulo || log.acao}</p>
                        <p className="text-[9px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">{log.descricao || log.detalhe}</p>
                        <span className="text-[8px] font-mono text-slate-600 uppercase mt-1 block">
                          {new Date(log.createdAt).toLocaleDateString('pt-BR')} · {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {s.events.length === 0 && (
                    <div className="h-40 flex items-center justify-center opacity-30">
                      <Activity size={32} />
                    </div>
                  )}
               </div>
            </Card>
          </div>

        </div>

      </main>

      {/* ── FOOTER BAR ── */}
      <footer className="h-8 border-t border-white/5 bg-slate-900/60 px-6 flex items-center justify-between shrink-0">
         <div className="flex gap-4">
            <FooterStat label="Latência API" value="24ms" />
            <FooterStat label="Database" value="Neon PostgreSQL" />
         </div>
         <p className="text-[9px] font-mono text-slate-600 tracking-widest">REGULARIZA PRO OS v2.0.0</p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  )
}

function KPICard({ label, value, sub, icon: Icon, color, trend }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-white/10 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-[40px] -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors" />
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <div className={`p-1.5 rounded-lg bg-slate-800/50 ${color}`}>
          <Icon size={14} />
        </div>
      </div>
      <div className="relative z-10 mt-1">
        <h3 className="text-2xl font-black text-white tracking-tighter leading-none">{value}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          {trend !== undefined && (
            trend >= 0 ? <TrendingUp size={10} className="text-emerald-500" /> : <TrendingDown size={10} className="text-red-500" />
          )}
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate">{sub}</p>
        </div>
      </div>
    </motion.div>
  )
}

function Card({ title, icon: Icon, children, className = "" }: any) {
  return (
    <div className={`bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden ${className}`}>
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Icon size={12} className="text-slate-500" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        </div>
        <button className="text-slate-600 hover:text-white transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>
      <div className="flex-1 min-h-0 relative">
        {children}
      </div>
    </div>
  )
}

function MoreHorizontal(props: any) {
  return <MoreVertical {...props} />
}

function FinancialItem({ label, value, color, highlight }: any) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${highlight ? 'bg-blue-500/5 border border-blue-500/10' : 'bg-white/2'}`}>
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
      <span className={`text-[12px] font-black ${color}`}>{fmt(value)}</span>
    </div>
  )
}

function FooterStat({ label, value }: any) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{label}:</span>
      <span className="text-[8px] font-mono font-bold text-slate-400">{value}</span>
    </div>
  )
}
