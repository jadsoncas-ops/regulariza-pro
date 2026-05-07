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
export const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; color: string }> = {
  em_analise:           { label: 'Análise',       dot: 'bg-blue-400',   badge: 'badge-blue',   color: 'blue' },
  levantamento:         { label: 'Levantamento',  dot: 'bg-amber-400',  badge: 'badge-amber',  color: 'amber' },
  projeto:              { label: 'Projeto',       dot: 'bg-purple-400', badge: 'badge-purple', color: 'purple' },
  protocolo_prefeitura: { label: 'Prefeitura',    dot: 'bg-indigo-400', badge: 'badge-indigo', color: 'indigo' },
  exigencia_tecnica:    { label: 'Exigência',     dot: 'bg-red-500',    badge: 'badge-red',    color: 'red' },
  finalizado:           { label: 'Concluído',     dot: 'bg-emerald-500',badge: 'badge-green',  color: 'emerald' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status?.replace(/_/g, ' ') || '—', dot: 'bg-slate-400', badge: 'badge-slate' }
  return (
    <span className={`badge ${cfg.badge} inline-flex items-center gap-1.5 py-0.5`}>
      <span className={`w-1 h-1 rounded-full shrink-0 ${cfg.dot}`} />
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
      } else {
        const error = await res.json()
        console.error('Falha ao atualizar status:', error)
        alert('Erro ao atualizar status.')
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
    if (diff < 0) return { label: 'Atrasado', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle }
    if (diff <= 5) return { label: `${diff} dias`, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock }
    return { label: `${diff} dias`, color: 'text-slate-500', bg: 'bg-slate-50', icon: Clock }
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Processos</h1>
          <p className="text-xs text-slate-500 font-medium">Gerencie sua esteira de regularização imobiliária</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setView('board')} className={`p-1.5 rounded-md transition-all ${view === 'board' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={14}/></button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={14}/></button>
          </div>
          <Link href="/processos/novo" className="btn-primary py-1.5">
            <Plus size={16} /> Novo
          </Link>
        </div>
      </div>

      {/* Search & Filters compact */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
          <input
            placeholder="Buscar processos..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field py-2 text-xs font-bold uppercase tracking-wider"
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Todos Status</option>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => (
            <option key={v} value={v}>{c.label}</option>
          ))}
        </select>
        <button className="btn-outline py-2 text-xs font-bold uppercase tracking-wider">
          <Filter size={14} /> Filtros
        </button>
      </div>

      {view === 'list' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-2.5">Processo / Cliente</th>
                  <th className="px-6 py-2.5">Endereço</th>
                  <th className="px-6 py-2.5">Responsável</th>
                  <th className="px-6 py-2.5">Prazo</th>
                  <th className="px-6 py-2.5">Status</th>
                  <th className="px-6 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => {
                  const deadline = getDeadlineInfo(p.data_deadline)
                  return (
                    <tr key={p.id} className="table-row group">
                      <td className="px-6 py-3.5">
                        <Link href={`/processos/${p.id}`} className="block">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.tipo_regularizacao}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{p.cliente?.nome}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin size={12} className="text-slate-300" />
                          <span className="text-[11px] truncate max-w-[180px]">{p.imovel?.endereco}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600 border border-slate-200">
                             {p.responsavel?.charAt(0) || 'U'}
                           </div>
                           <span className="text-[11px] font-medium text-slate-600">{p.responsavel || 'Não definido'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        {deadline ? (
                          <div className={`flex items-center gap-1.5 ${deadline.color}`}>
                             <deadline.icon size={12} />
                             <span className="text-[11px] font-bold">{deadline.label}</span>
                          </div>
                        ) : <span className="text-[11px] text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5">
                        <select 
                          className="bg-transparent border-none text-[11px] font-bold outline-none cursor-pointer hover:text-blue-600 transition-colors"
                          value={p.status}
                          onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                        >
                          {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                            <option key={v} value={v}>{c.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                         <Link href={`/processos/${p.id}`} className="p-1 text-slate-400 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
                           <ChevronRight size={16} />
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
        /* Board View (Kanban) Refined */
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
          {Object.entries(STATUS_CONFIG).map(([statusId, config]) => {
            const columnProcs = filtered.filter(p => p.status === statusId)
            return (
              <div key={statusId} className="flex-shrink-0 w-[260px] flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{config.label}</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{columnProcs.length}</span>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600"><Plus size={14}/></button>
                </div>
                
                <div className="flex-1 space-y-2.5 p-1 rounded-xl bg-slate-100/40 border border-slate-200/50 min-h-[500px]">
                  {columnProcs.map(p => {
                    const deadline = getDeadlineInfo(p.data_deadline)
                    return (
                      <Link key={p.id} href={`/processos/${p.id}`} 
                        className="block bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group animate-fade-up">
                        
                        <div className="flex items-center justify-between mb-2">
                          <select 
                            className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer hover:text-blue-600"
                            value={p.status}
                            onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                          >
                            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                              <option key={v} value={v}>{c.label}</option>
                            ))}
                          </select>
                          {deadline && (
                            <div className={`px-1.5 py-0.5 rounded-md flex items-center gap-1 ${deadline.bg} ${deadline.color}`}>
                               <deadline.icon size={10} />
                               <span className="text-[9px] font-bold">{deadline.label}</span>
                            </div>
                          )}
                        </div>

                        <h4 className="text-[12px] font-bold text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {p.tipo_regularizacao}
                        </h4>

                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-[10px] text-slate-500">
                             <Users size={12} className="text-slate-300" />
                             <span className="font-medium truncate">{p.cliente?.nome}</span>
                           </div>
                           <div className="flex items-center gap-2 text-[10px] text-slate-500">
                             <MapPin size={12} className="text-slate-300" />
                             <span className="font-medium truncate">{p.imovel?.endereco}</span>
                           </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                           <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                                {p.responsavel?.charAt(0) || 'U'}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">{p.responsavel || 'Equipe'}</span>
                           </div>
                           <div className="flex gap-1">
                              {p.documentos?.length > 0 && <FileText size={12} className="text-slate-300" />}
                              {p.financeiro?.length > 0 && <DollarSign size={12} className="text-slate-300" />}
                           </div>
                        </div>
                      </Link>
                    )
                  })}
                  {columnProcs.length === 0 && (
                    <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-300">
                      <span className="text-[9px] font-bold uppercase tracking-widest">Vazio</span>
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
