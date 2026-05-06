'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  MapPin, 
  Clock, 
  FileText,
  AlertTriangle,
  ChevronRight,
  User,
  Zap
} from 'lucide-react'

// --- MOCK DATA ---
const INITIAL_COLUMNS = [
  { id: 'levantamento', title: 'Levantamento', color: 'text-blue-400' },
  { id: 'documentacao', title: 'Documentação', color: 'text-purple-400' },
  { id: 'protocolo',    title: 'Protocolo',     color: 'text-amber-400' },
  { id: 'pendencia',    title: 'Pendência',     color: 'text-red-400' },
  { id: 'cartorio',     title: 'Cartório',      color: 'text-emerald-400' },
  { id: 'finalizado',   title: 'Finalizado',    color: 'text-primary' },
]

const INITIAL_PROJECTS = [
  { 
    id: '1', 
    code: 'REG_SILVA_001', 
    client: 'João da Silva', 
    address: 'Rua das Flores, 123', 
    status: 'levantamento', 
    deadline: '2026-05-10', 
    priority: 'high' 
  },
  { 
    id: '2', 
    code: 'PRJ_GOMES_042', 
    client: 'Maria Gomes', 
    address: 'Av. Brasil, 500', 
    status: 'documentacao', 
    deadline: '2026-05-25', 
    priority: 'medium' 
  },
  { 
    id: '3', 
    code: 'HAB_SANTOS_009', 
    client: 'Carlos Santos', 
    address: 'Rua Sergipe, 88', 
    status: 'protocolo', 
    deadline: '2026-05-08', 
    priority: 'critical' 
  },
]

export default function DashboardKanban() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS)

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="flex flex-col h-full gap-8 animate-in fade-in duration-700">
      
      {/* DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary fill-primary/20" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Engineering Hub</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Fluxo de <span className="neon-text">Projetos</span></h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie a regularização de {projects.length} imóveis ativos.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                U{i}
              </div>
            ))}
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-muted-foreground hover:text-primary transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
            <Calendar className="w-4 h-4" /> Timeline
          </button>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto pb-6 -mx-2">
        <div className="flex gap-6 min-w-max px-2 h-full">
          {INITIAL_COLUMNS.map(col => (
            <div key={col.id} className="w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full bg-current ${col.color}`} />
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{col.title}</h3>
                  <span className="px-1.5 py-0.5 bg-white/5 rounded-md text-[10px] text-slate-500 font-bold">
                    {projects.filter(p => p.status === col.id).length}
                  </span>
                </div>
                <button className="p-1 text-slate-600 hover:text-slate-400 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-2 space-y-3 min-h-[500px]">
                {projects.filter(p => p.status === col.id).map(proj => {
                  const days = getDaysRemaining(proj.deadline)
                  const isCritical = days <= 3

                  return (
                    <div 
                      key={proj.id}
                      className="glass p-4 rounded-xl hover:neon-border group cursor-grab active:cursor-grabbing transition-all animate-in zoom-in-95 duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-primary font-bold">{proj.code}</span>
                        <div className="flex items-center gap-1.5">
                          {isCritical && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning rounded-full border border-warning/20 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="text-[9px] font-bold">CRÍTICO</span>
                            </div>
                          )}
                          <MoreHorizontal className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-primary transition-colors">{proj.client}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-4">
                        <MapPin className="w-3 h-3" /> {proj.address}
                      </p>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                             <FileText className="w-3.5 h-3.5" />
                           </div>
                           <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                             <User className="w-3.5 h-3.5" />
                           </div>
                        </div>

                        <div className={`flex items-center gap-1.5 ${isCritical ? 'text-warning' : 'text-slate-400'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">{days} dias</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
