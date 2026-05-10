'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Trophy, 
  Target, 
  BarChart3,
  Calendar,
  Filter,
  RefreshCw,
  LayoutGrid,
  ChevronUp,
  Activity,
  Layers,
  CheckCircle2,
  Timer
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts'
import { motion } from 'framer-motion'

export default function PerformancePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stats/productivity')
      const d = await res.json()
      setData(d)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStats() }, [])

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Processando Intelligence...</p>
    </div>
  )

  const STAGE_LABELS: Record<string, string> = {
    em_analise: 'Entrada',
    levantamento: 'Levantamento',
    projeto: 'Projeto',
    protocolo_prefeitura: 'Prefeitura',
    cartorio: 'Cartório',
    finalizado: 'Conclusão'
  }

  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#6366F1']

  return (
    <div className="p-8 space-y-8 bg-[#FDFDFD] min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Activity className="w-5 h-5 text-blue-600" />
             <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight font-mono">Productivity Intelligence</h1>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Análise de performance operacional e eficiência de equipe</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
             <Calendar className="w-4 h-4 text-slate-400" />
             <span className="text-[11px] font-bold text-slate-600 uppercase">Últimos 30 Dias</span>
          </div>
          <button onClick={fetchStats} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Score Médio Equipe', value: data?.overallAvgTaskHours + 'h', desc: 'Tempo p/ conclusão de tarefa', icon: Timer, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tarefas Concluídas', value: data?.leaderboard.reduce((a:any,b:any)=>a+b.completedTasks,0), desc: 'Volume total processado', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Gargalo Crítico', value: STAGE_LABELS[data?.stageMetrics[0]?.etapa] || 'N/A', desc: 'Maior tempo de espera', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Eficiência de Tipo', value: data?.typeMetrics[0]?.avgDays + 'd', desc: 'Média do tipo mais rápido', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((kpi, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm group hover:border-blue-200 transition-all"
          >
            <div className={`p-3 ${kpi.bg} ${kpi.color} rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{kpi.value}</h3>
            <p className="text-[10px] text-slate-500 font-medium">{kpi.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* LEADERBOARD (Col 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -translate-y-16 translate-x-16" />
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2">
                   <Trophy className="text-amber-400" size={20} />
                   <h2 className="text-sm font-black uppercase tracking-[0.1em] font-mono">Team Leaderboard</h2>
                </div>
             </div>
             
             <div className="space-y-6 relative z-10">
                {data?.leaderboard.slice(0, 5).map((user: any, i: number) => (
                  <div key={user.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-amber-400 text-slate-900' : 
                          i === 1 ? 'bg-slate-300 text-slate-800' : 
                          i === 2 ? 'bg-orange-400 text-slate-900' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {user.name.split(' ').map((n:any)=>n[0]).join('')}
                        </div>
                        {i === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm"><span className="text-[8px] font-black text-slate-900">1</span></div>}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-white group-hover:text-blue-400 transition-colors">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{user.completedTasks} tarefas concluídas</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[12px] font-black text-white">{user.avgTimeHours}h</p>
                       <p className="text-[8px] font-bold text-slate-500 uppercase">Tempo Médio</p>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-12 pt-8 border-t border-slate-800">
                <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Energy</span>
                      <span className="text-xl font-black text-blue-400">{data?.leaderboard.reduce((a:any,b:any)=>a+b.completedTasks,0)} Pts</span>
                   </div>
                   <Target size={32} className="text-slate-800" />
                </div>
             </div>
          </div>
        </div>

        {/* GRAPHS (Col 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           
           {/* STAGE PERFORMANCE */}
           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                       <BarChart3 size={20} />
                    </div>
                    <div>
                       <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono">Tempo de Permanência por Etapa</h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Duração média em dias por fase do processo</p>
                    </div>
                 </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.stageMetrics.map((s:any)=>({...s, label: STAGE_LABELS[s.etapa] || s.etapa}))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Bar dataKey="avgDurationDays" radius={[6, 6, 0, 0]} barSize={40}>
                      {data?.stageMetrics.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* PROCESS TYPE PERFORMANCE */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono mb-6 flex items-center gap-2"><Layers size={18} className="text-indigo-500" /> Ciclo por Categoria</h2>
                 <div className="space-y-4">
                    {data?.typeMetrics.map((type: any, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-[11px] font-bold text-slate-600 uppercase">{type.type}</span>
                           <span className="text-[11px] font-black text-slate-900">{type.avgDays} dias</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-indigo-500 transition-all" 
                              style={{ width: `${(parseFloat(type.avgDays) / 60) * 100}%` }} // Relative to 60 days
                           />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-center">
                 <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">SLA Operational Health</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">94.2%</h3>
                    <div className="flex items-center justify-center gap-1 text-emerald-500 text-[10px] font-bold">
                       <ChevronUp size={12} />
                       <span>+2.4% vs mês anterior</span>
                    </div>
                 </div>
                 <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-around">
                    <div className="text-center">
                       <p className="text-xl font-bold text-slate-900">{data?.tasksByStatus.find((s:any)=>s.status==='concluido')?.count || 0}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Resolved</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                       <p className="text-xl font-bold text-slate-900">{data?.tasksByStatus.find((s:any)=>s.status==='pendente')?.count || 0}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Queue</p>
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>

    </div>
  )
}
