'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, Search, Briefcase, Clock, ChevronRight, X, LayoutGrid, List, 
  Filter, User, Trash2, ExternalLink, Command, Sparkles, SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react'
import { EditProcessoModal } from '@/components/EditProcessoModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { motion } from 'framer-motion'

// ─── Status config padronizado ────────────────────────────────────────────────
export const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  em_analise:           { label: 'Entrada',       dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  levantamento:         { label: 'Levantamento',  dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  projeto:              { label: 'Projeto',       dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  protocolo_prefeitura: { label: 'Prefeitura',    dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-100' },
  cartorio:             { label: 'Cartório',      dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-100' },
  finalizado:           { label: 'Conclusão',     dot: 'bg-emerald-500',badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
}

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [view, setView] = useState<'list' | 'board'>('board')
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [processoToDelete, setProcessoToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [processoToEdit, setProcessoToEdit] = useState<any>(null)

  const fetchData = () => {
    fetch('/api/processos')
      .then(r => r.json())
      .then(d => {
        setProcessos(Array.isArray(d) ? d : [])
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
    } catch (e) { console.error(e) }
    finally { setIsDeleting(false) }
  }

  const filtered = useMemo(() => processos.filter(p => {
    const matchSearch = !search ||
      p.cliente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.tipo_regularizacao?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo_projeto?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  }), [processos, search, statusFilter])

  const getDays = (d: string) => {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Processos de Regularização</h1>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
              MOD.PRC / 04
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">Gerencie a esteira de tramitação e status dos seus projetos ativos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
            <button 
              onClick={() => setView('board')} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'board' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <LayoutGrid size={14} />
              KANBAN
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <List size={14} />
              LISTA
            </button>
          </div>
          
          <Link href="/processos/novo" className="btn-premium">
            <Plus size={18} strokeWidth={2.5} />
            NOVO PROCESSO
          </Link>
        </div>
      </div>

      {/* ── Premium Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 bg-white/50 p-2 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 min-w-[300px] group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, código ou serviço..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all">
            <User size={12} />
            RESPONSÁVEL: *
          </div>
          <select 
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-50 transition-all appearance-none"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">TIPO: TODOS</option>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
              <option key={v} value={v}>{c.label.toUpperCase()}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all">
            PRAZO &lt; 30 DIAS
          </div>
        </div>

        {(search || statusFilter) && (
          <button 
            onClick={() => { setSearch(''); setStatusFilter('') }}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Main View Area ── */}
      <div className="w-full overflow-hidden">
        {view === 'board' ? (
          /* Kanban Board - Premium */
          <div className="grid grid-cols-6 gap-6 min-h-[600px]">
            {Object.keys(STATUS_CONFIG).map(colId => {
              const col = STATUS_CONFIG[colId]
              const procs = filtered.filter(p => p.status === colId)

              return (
                <div key={colId} className="flex flex-col gap-4 min-w-0 h-full">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{col.label}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{String(procs.length).padStart(2, '0')}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 p-1 rounded-2xl bg-slate-50/30 border border-slate-100 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-hide">
                    {procs.map(p => (
                      <motion.div 
                        key={p.id}
                        layoutId={p.id}
                        className="kanban-card-premium"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="card-tag-premium">
                            {p.codigo_projeto || 'REG.000'}
                          </span>
                          <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                        </div>

                        <Link href={`/processos/${p.id}`} className="block group/link">
                          <h4 className="text-[13px] font-semibold text-slate-900 mb-2 leading-tight group-hover/link:text-primary transition-colors line-clamp-2">
                            {p.tipo_regularizacao}
                          </h4>
                          
                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                              <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center border border-slate-200 text-[9px]">
                                {p.cliente?.nome?.charAt(0)}
                              </div>
                              <span className="truncate">{p.cliente?.nome || 'Cliente não identificado'}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium truncate ml-7">
                              {p.imovel?.endereco}, {p.imovel?.numero}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock size={11} />
                              <span className="text-[10px] font-mono font-bold uppercase">
                                {getDays(p.data_deadline) !== null ? `PRAZO ${new Date(p.data_deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : 'S/P'}
                              </span>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold uppercase shadow-sm">
                              {p.responsavel?.charAt(0) || 'U'}
                            </div>
                          </div>
                        </Link>
                        
                        <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-slate-50">
                          <button 
                            onClick={() => { setProcessoToEdit(p); setIsEditModalOpen(true) }} 
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <SlidersHorizontal size={14}/>
                          </button>
                          <button 
                            onClick={() => { setProcessoToDelete(p); setIsDeleteModalOpen(true) }} 
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={14}/>
                          </button>
                          <Link 
                            href={`/processos/${p.id}`} 
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                            title="Ver Detalhes"
                          >
                            <ArrowUpRight size={14}/>
                          </Link>
                        </div>
                      </motion.div>
                    ))}

                    {procs.length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200/40 rounded-2xl text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest opacity-50">
                        Vazio
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View - Refined */
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processo / Serviço</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente / Imóvel</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prazo</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-blue-600 uppercase tracking-wider">{p.codigo_projeto || 'REG.000'}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{p.tipo_regularizacao}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">{p.cliente?.nome}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{p.imovel?.cidade}/{p.imovel?.estado}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[p.status]?.dot || 'bg-slate-300'}`} />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{STATUS_CONFIG[p.status]?.label || p.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-bold uppercase">
                        <Clock size={12} />
                        {getDays(p.data_deadline) !== null ? `${getDays(p.data_deadline)} dias` : 'S/P'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => { setProcessoToEdit(p); setIsEditModalOpen(true) }} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <SlidersHorizontal size={16}/>
                        </button>
                        <button 
                          onClick={() => { setProcessoToDelete(p); setIsDeleteModalOpen(true) }} 
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16}/>
                        </button>
                        <Link 
                          href={`/processos/${p.id}`} 
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <ChevronRight size={16}/>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
