'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, Search, Briefcase, Clock, AlertTriangle, 
  ChevronRight, X, Tag, LayoutGrid, List, 
  Filter, MoreHorizontal, User, TrendingUp,
  Activity, CheckCircle2, AlertCircle, Building2, MapPin, Users, FileText, DollarSign
} from 'lucide-react'
import { TagChip } from '@/components/TagInput'

// ─── Status config padronizado ────────────────────────────────────────────────
export const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; border: string; color: string; bg: string }> = {
  em_analise:           { label: 'Análise',       dot: 'bg-blue-500',    badge: 'badge-blue',   border: 'border-blue-500/30',   bg: 'bg-blue-500/10',    color: 'text-blue-400' },
  levantamento:         { label: 'Levantamento',  dot: 'bg-amber-500',   badge: 'badge-amber',  border: 'border-amber-500/30',  bg: 'bg-amber-500/10',   color: 'text-amber-400' },
  projeto:              { label: 'Projeto',       dot: 'bg-purple-500',  badge: 'badge-purple', border: 'border-purple-500/30', bg: 'bg-purple-500/10',  color: 'text-purple-400' },
  protocolo_prefeitura: { label: 'Prefeitura',    dot: 'bg-indigo-500',  badge: 'badge-indigo', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10',  color: 'text-indigo-400' },
  exigencia_tecnica:    { label: 'Exigência',     dot: 'bg-red-500',     badge: 'badge-red',    border: 'border-red-500/30',    bg: 'bg-red-500/10',     color: 'text-red-400' },
  finalizado:           { label: 'Concluído',     dot: 'bg-emerald-500', badge: 'badge-green',  border: 'border-emerald-500/30',bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status?.replace(/_/g, ' ') || '—', dot: 'bg-slate-500', border: 'border-white/10', bg: 'bg-white/5', color: 'text-slate-400' }
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${cfg.border} ${cfg.bg} ${cfg.color} flex items-center gap-1.5 w-fit`}>
      <span className={`w-1 h-1 rounded-full shrink-0 ${cfg.dot} shadow-[0_0_5px_currentColor]`} />
      {cfg.label}
    </span>
  )
}

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [view, setView] = useState<'list' | 'board'>('board')
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/processos')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setProcessos(list)
        const tags = [...new Set(list.flatMap((p: any) => {
          try { return JSON.parse(p.tags || '[]') } catch { return [] }
        }))] as string[]
        setAllTags(tags)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/processos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setProcessos(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
      }
    } catch (e) {
      console.error('Erro na requisição de status:', e)
    }
  }

  const filtered = useMemo(() => processos.filter(p => {
    const matchSearch = !search ||
      p.cliente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.tipo_regularizacao?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo_projeto?.toLowerCase().includes(search.toLowerCase()) ||
      p.imovel?.cidade?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    const matchTag    = !tagFilter || (() => {
      try { return (JSON.parse(p.tags || '[]') as string[]).includes(tagFilter) }
      catch { return false }
    })()
    return matchSearch && matchStatus && matchTag
  }), [processos, search, statusFilter, tagFilter])

  const getDeadlineInfo = (date: string) => {
    if (!date) return null
    const diff = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { label: 'ATRASADO', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10', icon: AlertTriangle }
    if (diff <= 5) return { label: `${diff} DIAS`, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: Clock }
    return { label: `${diff} DIAS`, color: 'text-slate-400', border: 'border-white/10', bg: 'bg-white/5', icon: Clock }
  }

  return (
    <div className="space-y-8 animate-fade">

      {/* Header compact */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Processos Técnicos</h1>
          <p className="text-xs text-slate-500 font-medium mt-1 tracking-wider uppercase">Pipeline de Regularização Imobiliária</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
            <button onClick={() => setView('board')} className={`p-2 rounded-lg transition-all ${view === 'board' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}><LayoutGrid size={16}/></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}><List size={16}/></button>
          </div>
          <Link href="/processos/novo" className="btn-primary py-2.5">
            <Plus size={18} strokeWidth={3} /> NOVO PROJETO
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            placeholder="Filtrar por código, cliente, tipo ou cidade..."
            className="w-full pl-11 pr-4 py-3 text-sm bg-slate-950/50 border border-white/10 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all placeholder:text-slate-600 text-white"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field py-3 text-[10px] font-black uppercase tracking-[0.15em] min-w-[200px]"
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">TODOS OS ESTADOS</option>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => (
            <option key={v} value={v}>{c.label.toUpperCase()}</option>
          ))}
        </select>
        <button className="btn-outline py-3 text-[10px] font-black uppercase tracking-[0.15em]">
          <Filter size={16} /> FILTROS AVANÇADOS
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-6 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-[500px] bg-white/5 rounded-2xl" />)}
        </div>
      ) : view === 'list' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identificação / Cliente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Localização</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Responsável</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Deadline</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Atual</th>
                  <th className="px-8 py-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(p => {
                  const deadline = getDeadlineInfo(p.data_deadline)
                  return (
                    <tr key={p.id} className="table-row group">
                      <td className="px-8 py-5">
                        <Link href={`/processos/${p.id}`} className="block">
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{p.tipo_regularizacao}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{p.codigo_projeto || 'SEM CÓD.'}</span>
                             <span className="text-xs font-medium text-slate-400">{p.cliente?.nome}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin size={14} className="text-slate-600" />
                          <span className="text-xs truncate max-w-[200px]">{p.imovel?.endereco}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2.5">
                           <div className="w-6 h-6 rounded-lg bg-blue-600/20 flex items-center justify-center text-[10px] font-black text-blue-400 border border-blue-500/20">
                             {p.responsavel?.charAt(0) || 'U'}
                           </div>
                           <span className="text-xs font-bold text-slate-300">{p.responsavel || 'Equipe'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {deadline ? (
                          <div className={`flex items-center gap-2 ${deadline.color} font-black text-[10px] tracking-widest bg-white/5 px-2 py-1 rounded-md border ${deadline.border}`}>
                             <deadline.icon size={12} />
                             <span>{deadline.label}</span>
                          </div>
                        ) : <span className="text-xs text-slate-600 italic">—</span>}
                      </td>
                      <td className="px-8 py-5">
                        <select 
                          className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:text-blue-400 transition-colors"
                          value={p.status}
                          onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                        >
                          {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                            <option key={v} value={v} className="bg-slate-900 text-white">{c.label.toUpperCase()}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <Link href={`/processos/${p.id}`} className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                           <ChevronRight size={18} />
                         </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Board View (Kanban) - Modern Tech Esthetic */
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide -mx-1 px-1 min-h-[600px]">
          {Object.entries(STATUS_CONFIG).map(([statusId, config]) => {
            const columnProcs = filtered.filter(p => p.status === statusId)
            return (
              <div key={statusId} className="flex-shrink-0 w-[300px] flex flex-col gap-4">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot} shadow-[0_0_8px_currentColor]`} style={{ color: config.color.replace('text-', '') }} />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">{config.label}</h3>
                    <span className="text-[10px] font-black text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">{columnProcs.length}</span>
                  </div>
                  <button className="text-slate-600 hover:text-white transition-colors"><Plus size={16}/></button>
                </div>
                
                <div className="flex-1 space-y-4 p-2 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-sm min-h-[500px]">
                  {columnProcs.map(p => {
                    const deadline = getDeadlineInfo(p.data_deadline)
                    return (
                      <Link key={p.id} href={`/processos/${p.id}`} 
                        className="block bg-slate-900/60 p-5 rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-300 group relative overflow-hidden">
                        
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors pointer-events-none" />

                        <div className="flex items-center justify-between mb-4">
                          <select 
                            className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer hover:text-blue-400 transition-colors"
                            value={p.status}
                            onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                              <option key={v} value={v} className="bg-slate-900 text-white">{c.label.toUpperCase()}</option>
                            ))}
                          </select>
                          {deadline && (
                            <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 border ${deadline.border} ${deadline.bg} ${deadline.color} text-[9px] font-black`}>
                               <deadline.icon size={10} strokeWidth={2.5} />
                               <span>{deadline.label}</span>
                            </div>
                          )}
                        </div>

                        <h4 className="text-[13px] font-bold text-white leading-snug mb-4 group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[40px]">
                          {p.tipo_regularizacao}
                        </h4>

                        <div className="space-y-2.5">
                           <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                             <Users size={14} className="text-slate-700" strokeWidth={1.5} />
                             <span className="truncate">{p.cliente?.nome}</span>
                           </div>
                           <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                             <MapPin size={14} className="text-slate-700" strokeWidth={1.5} />
                             <span className="truncate">{p.imovel?.endereco || 'Localização não definida'}</span>
                           </div>
                        </div>

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5 relative z-10">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20 flex items-center justify-center text-[10px] font-black text-white">
                                {p.responsavel?.charAt(0) || 'U'}
                              </div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.responsavel || 'EQUIPE'}</span>
                           </div>
                           <div className="flex gap-2">
                              {p.documentos?.length > 0 && <div className="p-1.5 bg-white/5 rounded-md border border-white/5 text-slate-500"><FileText size={12} strokeWidth={2} /></div>}
                              {p.financeiro?.length > 0 && <div className="p-1.5 bg-white/5 rounded-md border border-white/5 text-emerald-500/70"><DollarSign size={12} strokeWidth={2} /></div>}
                           </div>
                        </div>
                      </Link>
                    )
                  })}
                  {columnProcs.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-slate-700">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">No Content</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
