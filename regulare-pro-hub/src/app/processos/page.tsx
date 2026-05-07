'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Briefcase, Clock, AlertTriangle, ChevronRight, X, Tag, LayoutGrid, List, Filter, MoreHorizontal, User } from 'lucide-react'
import { TagChip } from '@/components/TagInput'

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
  const [view, setView] = useState<'list' | 'board'>('list')
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/processos')
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setProcessos(list)
        // Extrai todas as tags únicas
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

  const getDays = (d: string) => {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  }

  const activeFilters = [statusFilter, tagFilter].filter(Boolean)

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Processos</h1>
          <p className="page-subtitle">{processos.length} processo(s) no sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={16}/></button>
            <button onClick={() => setView('board')} className={`p-1.5 rounded-lg transition-all ${view === 'board' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={16}/></button>
          </div>
          <Link href="/processos/novo" className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Processo
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Buscar por cliente, serviço, código, cidade..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status */}
          <select
            className="select-field sm:w-44"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400">Filtrar por tag:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
                className={`transition-all ${tagFilter === tag ? 'ring-2 ring-blue-500 ring-offset-1 rounded-full' : 'opacity-70 hover:opacity-100'}`}
              >
                <TagChip tag={tag} size="sm" />
              </button>
            ))}
          </div>
        )}

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtros ativos:</span>
            {statusFilter && (
              <button onClick={() => setStatusFilter('')}
                className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors">
                {STATUS_CONFIG[statusFilter]?.label} <X className="w-3 h-3" />
              </button>
            )}
            {tagFilter && (
              <button onClick={() => setTagFilter('')}
                className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors">
                {tagFilter} <X className="w-3 h-3" />
              </button>
            )}
            <button onClick={() => { setStatusFilter(''); setTagFilter(''); setSearch('') }}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1">
              Limpar tudo
            </button>
          </div>
        )}
      </div>

      {/* Views */}
      {view === 'list' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left table-header">Código</th>
                  <th className="px-5 py-3 text-left table-header">Serviço</th>
                  <th className="px-5 py-3 text-left table-header">Cliente</th>
                  <th className="px-5 py-3 text-left table-header hidden md:table-cell">Imóvel</th>
                  <th className="px-5 py-3 text-left table-header hidden lg:table-cell">Tags</th>
                  <th className="px-5 py-3 text-left table-header">Prazo</th>
                  <th className="px-5 py-3 text-left table-header">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-4">Nenhum processo encontrado</p>
                      <Link href="/processos/novo" className="btn-primary inline-flex">
                        <Plus className="w-4 h-4" /> Criar processo
                      </Link>
                    </td>
                  </tr>
                ) : filtered.map(p => {
                  const days = getDays(p.data_deadline)
                  const isCritical = days !== null && days <= 3 && days >= 0
                  let tags: string[] = []
                  try { tags = JSON.parse(p.tags || '[]') } catch {}

                  return (
                    <tr key={p.id} className="table-row">
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {p.codigo_projeto || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-800 max-w-[160px] truncate">{p.tipo_regularizacao}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">{p.cliente?.nome?.charAt(0)}</span>
                          </div>
                          <p className="text-sm text-slate-700 max-w-[120px] truncate">{p.cliente?.nome || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-xs text-slate-500 max-w-[140px] truncate">
                          {p.imovel?.cidade ? `${p.imovel.cidade}` : '—'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex gap-1 flex-wrap max-w-[140px]">
                          {tags.slice(0, 2).map((t: string) => <TagChip key={t} tag={t} size="sm" />)}
                          {tags.length > 2 && <span className="text-[10px] text-slate-400">+{tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {days !== null ? (
                          <div className={`flex items-center gap-1.5 ${isCritical ? 'text-red-600' : 'text-slate-500'}`}>
                            {isCritical && <AlertTriangle className="w-3.5 h-3.5" />}
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{days < 0 ? 'Vencido' : `${days}d`}</span>
                          </div>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/processos/${p.id}`} className="btn-ghost text-xs py-1.5 px-3">
                          Abrir <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Mostrando <strong>{filtered.length}</strong> de <strong>{processos.length}</strong> processos
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Board View (Kanban) */
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px] scrollbar-hide">
          {[
            { id: 'em_analise', label: 'Entrada / Análise' },
            { id: 'levantamento', label: 'Levantamento' },
            { id: 'projeto', label: 'Projeto Técnico' },
            { id: 'protocolo_prefeitura', label: 'Prefeitura' },
            { id: 'cartorio', label: 'Cartório' },
            { id: 'finalizado', label: 'Finalização' }
          ].map(column => {
            const columnProcs = filtered.filter(p => {
              if (column.id === 'levantamento' || column.id === 'projeto') {
                 // Agrupamento lógico para simplificar o board se necessário, ou usar status exatos
                 return p.status === column.id
              }
              return p.status === column.id
            })

            return (
              <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-3">
                <div className="flex items-center justify-between px-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{column.label}</h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{columnProcs.length}</span>
                  </div>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors"><Plus size={14}/></button>
                </div>
                
                <div className="flex-1 space-y-3 p-1 rounded-2xl bg-slate-100/50 border border-slate-200/50 min-h-[400px]">
                  {columnProcs.map(p => (
                    <Link key={p.id} href={`/processos/${p.id}`} 
                      className="block bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">{p.codigo_projeto}</span>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 transition-all"><MoreHorizontal size={14}/></button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{p.tipo_regularizacao}</h4>
                      <div className="flex items-center gap-2 mb-4">
                         <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200">
                           {p.cliente?.nome?.charAt(0)}
                         </div>
                         <span className="text-[11px] text-slate-500 font-medium truncate">{p.cliente?.nome}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={11} />
                          <span className="text-[10px] font-bold">{getDays(p.data_deadline) || '—'}</span>
                        </div>
                        <div className="flex -space-x-1.5">
                           <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold"><User size={10}/></div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {columnProcs.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-300">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Sem processos</span>
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
