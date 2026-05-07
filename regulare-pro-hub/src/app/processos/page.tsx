'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, Search, Briefcase, Clock, AlertTriangle, 
  ChevronRight, X, Tag, LayoutGrid, List, 
  Filter, MoreHorizontal, User, TrendingUp,
  Activity, CheckCircle2, AlertCircle, Building2, MapPin
} from 'lucide-react'
import { TagChip } from '@/components/TagInput'

// ─── Status config padronizado ────────────────────────────────────────────────
export const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  em_analise:           { label: 'Em Andamento',  dot: 'bg-amber-400',  badge: 'badge-amber' },
  protocolo_prefeitura: { label: 'Protocolado',   dot: 'bg-blue-500',   badge: 'badge-blue' },
  pendente:             { label: 'Pendência',     dot: 'bg-red-500',    badge: 'badge-red' },
  finalizado:           { label: 'Concluído',     dot: 'bg-emerald-500',badge: 'badge-green' },
  aprovado:             { label: 'Aprovado',      dot: 'bg-emerald-500',badge: 'badge-green' },
  documentacao_pendente:{ label: 'Doc. Pendente', dot: 'bg-orange-400', badge: 'badge-amber' },
  exigencia_tecnica:    { label: 'Exigência',     dot: 'bg-red-500',    badge: 'badge-red' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status?.replace(/_/g, ' ') || '—', dot: 'bg-slate-400', badge: 'badge-slate' }
  return (
    <span className={`badge ${cfg.badge} inline-flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
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
  const [view, setView] = useState<'list' | 'board'>('list')
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

  const stats = useMemo(() => {
    return {
      total: processos.length,
      andamento: processos.filter(p => p.status === 'em_analise' || p.status === 'levantamento' || p.status === 'projeto').length,
      pendentes: processos.filter(p => p.status === 'pendente' || p.status === 'exigencia_tecnica').length,
      protocolados: processos.filter(p => p.status === 'protocolo_prefeitura').length,
      concluidos: processos.filter(p => p.status === 'finalizado' || p.status === 'aprovado').length
    }
  }, [processos])

  const getDays = (d: string) => {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  }

  const activeFilters = [statusFilter, tagFilter].filter(Boolean)

  return (
    <div className="space-y-10 animate-fade-up">

      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Processos</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">Controle operacional e monitoramento de protocolos técnicos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider ${view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              <List size={14}/> Lista
            </button>
            <button onClick={() => setView('board')} className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider ${view === 'board' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid size={14}/> Board
            </button>
          </div>
          <Link href="/processos/novo" className="btn-primary">
            <Plus size={18} strokeWidth={3} /> Novo Processo
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Geral', value: stats.total, icon: Briefcase, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Em Andamento', value: stats.andamento, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Pendências', value: stats.pendentes, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50/50' },
          { label: 'Protocolados', value: stats.protocolados, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Concluídos', value: stats.concluidos, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
        ].map((s, i) => (
          <div key={i} className={`card p-6 flex flex-col justify-between border-transparent shadow-sm ${s.bg}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${s.color}`}><s.icon size={20}/></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
            <p className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Card */}
      <div className="card p-6 bg-white border-slate-200 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Busca */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              placeholder="Buscar por cliente, serviço, código de projeto..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {/* Status */}
            <select
              className="select-field min-w-[200px]"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os Status</option>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.label}</option>
              ))}
            </select>

            <button className="btn-ghost border border-slate-200 bg-white">
              <Filter size={16}/> Filtros Avançados
            </button>
          </div>
        </div>

        {/* Tags & Active Filters */}
        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                 <Tag size={14} className="text-slate-400"/>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags Populares:</span>
              </div>
              {allTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
                  className={`transition-all ${tagFilter === tag ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                >
                  <TagChip tag={tag} size="sm" />
                </button>
              ))}
           </div>

           {activeFilters.length > 0 && (
             <button onClick={() => { setStatusFilter(''); setTagFilter(''); setSearch('') }}
               className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">
               Limpar Filtros ({activeFilters.length})
             </button>
           )}
        </div>
      </div>

      {/* Views */}
      {view === 'list' ? (
        <div className="card overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full zebra-table">
              <thead>
                <tr className="table-header border-b border-slate-100">
                  <th className="px-8 py-5">Identificador</th>
                  <th className="px-8 py-5">Tipo de Regularização</th>
                  <th className="px-8 py-5">Contratante</th>
                  <th className="px-8 py-5 hidden md:table-cell">Localidade</th>
                  <th className="px-8 py-5 hidden lg:table-cell">Tags</th>
                  <th className="px-8 py-5">Vencimento</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <Briefcase size={32} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-6">Nenhum processo localizado nos critérios atuais.</p>
                      <button onClick={() => { setSearch(''); setStatusFilter(''); setTagFilter('') }} className="btn-primary py-3 px-8 mx-auto">Limpar Buscas</button>
                    </td>
                  </tr>
                ) : filtered.map(p => {
                  const days = getDays(p.data_deadline)
                  const isCritical = days !== null && days <= 3 && days >= 0
                  let tags: string[] = []
                  try { tags = JSON.parse(p.tags || '[]') } catch {}

                  return (
                    <tr key={p.id} className="table-row group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                          {p.codigo_projeto || `#${p.id.substring(0,6).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px]">{p.tipo_regularizacao}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {p.id.substring(0,8)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                            {p.cliente?.nome?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-800">{p.cliente?.nome || '—'}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.cliente?.tipo === 'PJ' ? 'Empresa' : 'Particular'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                           <MapPin size={12} className="text-slate-300"/>
                           <span className="text-xs">{p.imovel?.cidade || '—'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden lg:table-cell">
                        <div className="flex gap-1.5 flex-wrap max-w-[160px]">
                          {tags.slice(0, 2).map((t: string) => <TagChip key={t} tag={t} size="sm" />)}
                          {tags.length > 2 && <span className="text-[9px] font-black text-slate-400">+{tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {days !== null ? (
                          <div className={`flex flex-col ${isCritical ? 'text-red-600' : 'text-slate-600'}`}>
                            <div className="flex items-center gap-1.5">
                               <Clock size={14} strokeWidth={2.5}/>
                               <span className="text-sm font-black tracking-tight">{days < 0 ? 'Vencido' : `${days} dias`}</span>
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5">{new Date(p.data_deadline).toLocaleDateString('pt-BR')}</p>
                          </div>
                        ) : <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">Sem Prazo</span>}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/processos/${p.id}`} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm group/btn">
                           <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Exibindo <span className="text-slate-900">{filtered.length}</span> resultados de <span className="text-slate-900">{processos.length}</span> registros ativos
              </p>
              <div className="flex gap-2">
                 <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50" disabled><ChevronRight className="rotate-180" size={14}/></button>
                 <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm"><ChevronRight size={14}/></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Board View (Kanban) Premium */
        <div className="flex gap-8 overflow-x-auto pb-10 min-h-[600px] scrollbar-hide -mx-10 px-10">
          {[
            { id: 'em_analise', label: 'Análise Técnica', color: 'blue' },
            { id: 'levantamento', label: 'Levantamento', color: 'amber' },
            { id: 'projeto', label: 'Projeto em Estudo', color: 'purple' },
            { id: 'protocolo_prefeitura', label: 'Prefeitura', color: 'indigo' },
            { id: 'exigencia_tecnica', label: 'Exigência', color: 'red' },
            { id: 'finalizado', label: 'Concluídos', color: 'emerald' }
          ].map(column => {
            const columnProcs = filtered.filter(p => p.status === column.id)

            return (
              <div key={column.id} className="flex-shrink-0 w-[320px] flex flex-col gap-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${column.color}-500 shadow-[0_0_8px] shadow-${column.color}-500/50`} />
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{column.label}</h3>
                    <span className="bg-white border border-slate-200 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">{columnProcs.length}</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 p-2 rounded-[32px] bg-slate-200/30 border border-slate-200/50 min-h-[500px]">
                  {columnProcs.map(p => (
                    <Link key={p.id} href={`/processos/${p.id}`} 
                      className="block bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                      
                      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-all">
                         <div className="w-8 h-8 bg-blue-600 text-white rounded-bl-xl flex items-center justify-center">
                            <ChevronRight size={14}/>
                         </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                          {p.codigo_projeto || `#${p.id.substring(0,4)}`}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <Clock size={12} strokeWidth={2.5}/>
                           <span className="text-[10px] font-black">{getDays(p.data_deadline) || '—'}d</span>
                        </div>
                      </div>

                      <h4 className="text-[13px] font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2rem]">
                        {p.tipo_regularizacao}
                      </h4>

                      <div className="flex items-center gap-3 mb-5 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-lg">
                           {p.cliente?.nome?.charAt(0)}
                         </div>
                         <span className="text-[11px] text-slate-700 font-bold truncate">{p.cliente?.nome}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <MapPin size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-tight">{p.imovel?.cidade || '—'}</span>
                        </div>
                        <div className="flex -space-x-2">
                           {[...Array(1)].map((_, i) => (
                             <div key={i} className="w-6 h-6 rounded-lg bg-blue-600 border-2 border-white flex items-center justify-center text-[8px] text-white font-black shadow-sm ring-1 ring-blue-500/10">
                                JC
                             </div>
                           ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {columnProcs.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300/50 rounded-[28px] text-slate-400 gap-2 opacity-50">
                      <Briefcase size={20} strokeWidth={1.5}/>
                      <span className="text-[9px] font-black uppercase tracking-widest">Sem Alocações</span>
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
