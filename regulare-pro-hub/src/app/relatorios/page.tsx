'use client'

import { useState } from 'react'
import { 
  TrendingUp, TrendingDown, Users, FileText, DollarSign, 
  Calendar, ChevronRight, ArrowUpRight, Download, 
  BarChart3, PieChart, Activity, Target, ShieldCheck,
  Zap, FileSpreadsheet, File as FileIcon, MoreHorizontal,
  Search, Filter, Play, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AreaChart, Area, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell, PieChart as RePie, Pie
} from 'recharts'

const REPORTS = [
  {
    id: 'faturamento',
    title: 'Faturamento & DRE',
    desc: 'Análise detalhada de receitas, impostos e margem líquida.',
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/5',
    data: [
      { name: 'Jan', val: 45000 }, { name: 'Fev', val: 52000 },
      { name: 'Mar', val: 48000 }, { name: 'Abr', val: 61000 },
    ],
    type: 'area'
  },
  {
    id: 'produtividade',
    title: 'Produtividade da Equipe',
    desc: 'Taxa de conclusão de processos e performance por engenheiro.',
    icon: Activity,
    color: 'text-primary',
    bg: 'bg-primary/5',
    data: [
      { name: 'Helena', val: 12 }, { name: 'Marcos', val: 8 },
      { name: 'Júlia', val: 15 }, { name: 'Pedro', val: 10 },
    ],
    type: 'bar'
  },
  {
    id: 'prazos',
    title: 'Prazos & Gargalos',
    desc: 'Identificação de etapas com maior tempo de retenção nos órgãos.',
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-500/5',
    data: [
      { name: 'Prefeitura', value: 45 }, { name: 'RGI', value: 30 },
      { name: 'INCRA', value: 15 }, { name: 'Outros', value: 10 },
    ],
    type: 'pie'
  },
]

export default function RelatoriosPage() {
  const [processing, setProcessing] = useState<string | null>(null)
  
  const handleExport = (id: string) => {
    setProcessing(id)
    setTimeout(() => setProcessing(null), 3000)
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="flex flex-col gap-1">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inteligência de Dados</h1>
           <p className="text-sm text-slate-500 font-medium tracking-tight">Relatórios analíticos para tomada de decisão estratégica.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-bold text-slate-500">
              <Calendar size={14} /> JAN 2024 — DEZ 2024
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
              <Filter size={18} />
           </button>
        </div>
      </div>

      {/* ── REPORT GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {REPORTS.map((r, idx) => (
          <motion.div 
            key={r.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-8">
               <div className={`w-12 h-12 ${r.bg} ${r.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                  <r.icon size={24} />
               </div>
               <button className="p-2 text-slate-300 hover:text-slate-600 transition-all">
                  <MoreHorizontal size={20} />
               </button>
            </div>

            <div className="flex-1 space-y-2 mb-8">
               <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">{r.title}</h3>
               <p className="text-xs text-slate-400 font-medium leading-relaxed">{r.desc}</p>
            </div>

            {/* Mini Visual Preview */}
            <div className="h-32 w-full mb-8 bg-slate-50/50 rounded-3xl p-4 flex items-center justify-center overflow-hidden border border-slate-100">
               {r.type === 'area' && (
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={r.data}>
                       <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                 </ResponsiveContainer>
               )}
               {r.type === 'bar' && (
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={r.data}>
                       <Bar dataKey="val" radius={[4, 4, 4, 4]}>
                          {r.data.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#2D5BFF' : '#6366f1'} opacity={0.8} />)}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               )}
               {r.type === 'pie' && (
                  <ResponsiveContainer width="100%" height="100%">
                     <RePie>
                        <Pie 
                          data={r.data} dataKey="value" cx="50%" cy="50%" 
                          innerRadius={25} outerRadius={40} paddingAngle={5}
                        >
                           {r.data.map((_, i) => <Cell key={i} fill={['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'][i]} />)}
                        </Pie>
                     </RePie>
                  </ResponsiveContainer>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={() => handleExport(r.id + '_pdf')}
                 disabled={!!processing}
                 className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
               >
                  {processing === r.id + '_pdf' ? <Clock size={14} className="animate-spin" /> : <FileIcon size={14} />} 
                  GERAR PDF
               </button>
               <button 
                 onClick={() => handleExport(r.id + '_csv')}
                 disabled={!!processing}
                 className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
               >
                  {processing === r.id + '_csv' ? <Clock size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} 
                  GERAR CSV
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── PERFORMANCE TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-[40px] overflow-hidden shadow-sm mt-6">
         <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
               <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Eficiência Operacional</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Performance por Responsável Técnica</p>
            </div>
            <button className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform">
               EXPANDIR RANKING <ChevronRight size={14} />
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Membro da Equipe</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Ativos</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Concluídos</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Taxa de Sucesso</th>
                     <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-right">Faturamento</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {[
                    { name: 'Helena Torres', active: 12, done: 45, rate: 94, total: 124000 },
                    { name: 'Marcos Barros', active: 8, done: 32, rate: 88, total: 98000 },
                    { name: 'Júlia Tavares', active: 15, done: 28, rate: 82, total: 76000 },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                {row.name.charAt(0)}
                             </div>
                             <span className="text-sm font-bold text-slate-800">{row.name}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-center text-xs font-bold text-slate-600 font-mono">{row.active}</td>
                       <td className="px-8 py-5 text-center text-xs font-bold text-slate-600 font-mono">{row.done}</td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${row.rate}%` }} />
                             </div>
                             <span className="text-xs font-bold text-emerald-500 font-mono">{row.rate}%</span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-right text-xs font-bold text-slate-800 font-mono">
                          {row.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* ── TOAST SIMULATION ── */}
      <AnimatePresence>
         {processing && (
           <motion.div 
             initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
             className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl border border-white/10"
           >
              <Zap size={18} className="text-primary fill-primary animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest">Processando Relatório Premium...</p>
              <div className="w-px h-4 bg-white/10 mx-2" />
              <p className="text-[10px] font-bold text-slate-500 uppercase">Aguarde 3s</p>
           </motion.div>
         )}
      </AnimatePresence>

    </div>
  )
}
