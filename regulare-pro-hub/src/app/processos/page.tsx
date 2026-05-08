'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Briefcase, Clock, AlertTriangle, ChevronRight, X, Tag, LayoutGrid, List, Filter, MoreHorizontal, User, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { TagChip } from '@/components/TagInput'
import { EditProcessoModal } from '@/components/EditProcessoModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'

// ─── Status config padronizado ────────────────────────────────────────────────
export const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  em_analise:           { label: 'Em Andamento',  dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  protocolo_prefeitura: { label: 'Protocolado',   dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  pendente:             { label: 'Pendência',     dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-100' },
  finalizado:           { label: 'Concluído',     dot: 'bg-emerald-500',badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  aprovado:             { label: 'Aprovado',      dot: 'bg-emerald-500',badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  documentacao_pendente:{ label: 'Doc. Pendente', dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-100' },
  exigencia_tecnica:    { label: 'Exigência',     dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-100' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status?.replace(/_/g, ' ') || '—', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 border-slate-200' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
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
  const [view, setView] = useState<'list' | 'board'>('board') // Default to board (Kanban)
  const [allTags, setAllTags] = useState<string[]>([])
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [processoToEdit, setProcessoToEdit] = useState<any>(null)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [processoToDelete, setProcessoToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = () => {
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
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async () => {
    if (!processoToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/processos/${processoToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setIsDeleteModalOpen(false)
        setProcessoToDelete(null)
        fetchData()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsDeleting(false)
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

  const getDays = (d: string) => {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  }

  const activeFilters = [statusFilter, tagFilter].filter(Boolean)

  return (
    <div className="flex flex-col gap-4 animate-fade-up w-full h-full min-h-[calc(100vh-100px)]">

      {/* Header - Mais denso */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fluxo Operacional</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Controle de Processos Ativos • {processos.length} registros</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}><List size={16}/></button>
            <button onClick={() => setView('board')} className={`p-1.5 rounded-lg transition-all ${view === 'board' ? 'bg-white shadow-sm text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16}/></button>
          </div>
          <Link href="/processos/novo" className="btn-primary py-2.5 px-6 text-xs shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" /> Novo Processo
          </Link>
        </div>
      </div>

      {/* Barra de Filtros Full Width */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              placeholder="Pesquisar por cliente, código ou serviço..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 font-medium placeholder:text-slate-300"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer min-w-[180px]"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Status: Todos</option>
              {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.label}</option>
              ))}
            </select>
            
            {(statusFilter || tagFilter || search) && (
              <button onClick={() => { setStatusFilter(''); setTagFilter(''); setSearch('') }} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all" title="Limpar Filtros"><X size={16}/></button>
            )}
          </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 w-full overflow-hidden">
        {view === 'list' ? (
          <div className="card overflow-hidden border-slate-200/60 h-full">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3 text-left table-header">Código</th>
                    <th className="px-5 py-3 text-left table-header">Serviço</th>
                    <th className="px-5 py-3 text-left table-header">Cliente</th>
                    <th className="px-5 py-3 text-left table-header">Prazo</th>
                    <th className="px-5 py-3 text-left table-header">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <Briefcase className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-sm text-slate-300 font-bold uppercase tracking-widest">Nenhum processo em andamento</p>
                      </td>
                    </tr>
                  ) : filtered.map(p => {
                    const days = getDays(p.data_deadline)
                    return (
                      <tr key={p.id} className="table-row group">
                        <td className="px-5 py-3.5"><span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100/50">{p.codigo_projeto || '—'}</span></td>
                        <td className="px-5 py-3.5"><p className="text-sm font-bold text-slate-800 truncate">{p.tipo_regularizacao}</p></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">{p.cliente?.nome?.charAt(0)}</div>
                            <p className="text-xs font-bold text-slate-700 truncate">{p.cliente?.nome || '—'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {days !== null ? (
                            <div className={`flex items-center gap-1.5 ${days <= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                              <Clock className="w-3 h-3" />
                              <span className="text-[10px] font-bold uppercase">{days < 0 ? 'Atrasado' : `${days} dias`}</span>
                            </div>
                          ) : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setProcessoToDelete(p); setIsDeleteModalOpen(true) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                            <Link href={`/processos/${p.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><ChevronRight size={16} /></Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban View - FULL SCREEN OPTIMIZED */
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 h-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {[
              { id: 'em_analise', label: 'Entrada', color: 'bg-amber-500' },
              { id: 'levantamento', label: 'Levantamento', color: 'bg-blue-400' },
              { id: 'projeto', label: 'Projeto', color: 'bg-indigo-500' },
              { id: 'protocolo_prefeitura', label: 'Prefeitura', color: 'bg-purple-500' },
              { id: 'cartorio', label: 'Cartório', color: 'bg-orange-500' },
              { id: 'finalizado', label: 'Conclusão', color: 'bg-emerald-500' }
            ].map(column => {
              const columnProcs = filtered.filter(p => p.status === column.id)

              return (
                <div key={column.id} className="flex-shrink-0 flex-1 min-w-[280px] max-w-[320px] flex flex-col gap-3">
                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${column.color}`} />
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{column.label}</h3>
                      <span className="bg-white text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-slate-200 shadow-sm">{columnProcs.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3 p-2 rounded-[28px] bg-slate-50/50 border border-slate-200/40 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
                    {columnProcs.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-mono font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">
                              {p.codigo_projeto || 'S/C'}
                            </span>
                            <div className="flex gap-1">
                              <button onClick={() => { setProcessoToDelete(p); setIsDeleteModalOpen(true) }} className="p-1 text-slate-300 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={12} /></button>
                              <Link href={`/processos/${p.id}`} className="p-1 text-slate-300 hover:text-blue-600 rounded-lg transition-colors"><ExternalLink size={12} /></Link>
                            </div>
                          </div>
                          <Link href={`/processos/${p.id}`}>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{p.tipo_regularizacao}</h4>
                            <div className="flex items-center gap-2 mb-4">
                               <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-200 uppercase">{p.cliente?.nome?.charAt(0)}</div>
                               <span className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tight">{p.cliente?.nome}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock size={10} />
                                <span className="text-[9px] font-bold uppercase">{getDays(p.data_deadline) !== null ? `${getDays(p.data_deadline)}d` : 'S/P'}</span>
                              </div>
                              <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[7px] text-white font-bold uppercase">{p.responsavel?.charAt(0) || 'U'}</div>
                            </div>
                          </Link>
                        </div>
                    ))}
                    {columnProcs.length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200/30 rounded-2xl text-slate-300">
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">Vazio</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <EditProcessoModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setProcessoToEdit(null) }} 
        processo={processoToEdit} 
        onSuccess={fetchData} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setProcessoToDelete(null) }}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Excluir Processo?"
        description={
          <div className="text-xs space-y-2">
            <p>Remover permanentemente <strong>{processoToDelete?.codigo_projeto}</strong>?</p>
            <p className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Ação irreversível.</p>
          </div>
        }
      />
    </div>
  )
}
