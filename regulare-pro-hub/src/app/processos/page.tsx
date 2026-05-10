'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Briefcase, Clock, ChevronRight, X, LayoutGrid, List,
  User, Trash2, ExternalLink, SlidersHorizontal,
  ArrowUpRight, MapPin, Calendar, DollarSign,
  CheckCircle2, ChevronLeft, Filter, MoreHorizontal,
  Circle, Layers, TrendingUp
} from 'lucide-react'
import { EditProcessoModal } from '@/components/EditProcessoModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'
import { getProcessHealth } from '@/lib/health'

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; badge: string }> = {
  em_analise:           { label: 'Entrada',      color: '#F59E0B', bg: '#FFFBEB', badge: 'badge-amber' },
  levantamento:         { label: 'Levantamento', color: '#3B82F6', bg: '#EFF6FF', badge: 'badge-blue' },
  projeto:              { label: 'Projeto',       color: '#6366F1', bg: '#EEF2FF', badge: 'badge-purple' },
  protocolo_prefeitura: { label: 'Prefeitura',   color: '#8B5CF6', bg: '#F5F3FF', badge: 'badge-purple' },
  cartorio:             { label: 'Cartório',      color: '#F97316', bg: '#FFF7ED', badge: 'badge-amber' },
  finalizado:           { label: 'Conclusão',     color: '#10B981', bg: '#ECFDF5', badge: 'badge-green' },
}

const fmtK = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v.toFixed(0)}`

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [view, setView] = useState<'list' | 'board'>('board')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [processoToDelete, setProcessoToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [processoToEdit, setProcessoToEdit] = useState<any>(null)

  const fetchData = () => {
    fetch('/api/processos').then(r => r.json())
      .then(d => { setProcessos(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async () => {
    if (!processoToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/processos/${processoToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setIsDeleteModalOpen(false); setProcessoToDelete(null)
        if (selectedId === processoToDelete.id) setSelectedId(null)
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

  const selectedProcesso = useMemo(() => processos.find(p => p.id === selectedId), [processos, selectedId])

  /* per-status stats */
  const stats = useMemo(() => {
    const ativos = processos.filter(p => p.status !== 'finalizado').length
    const totalContratos = processos.reduce((s, p) => s + (p.valor_total || 0), 0)
    const totalRecebido = processos.reduce((s, p) =>
      s + (p.financeiro?.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((a: number, b: any) => a + b.valor, 0) || 0), 0)
    return { ativos, totalContratos, totalRecebido }
  }, [processos])

  return (
    <div className="flex h-full overflow-hidden" style={{ height: 'calc(100vh - 48px)', margin: '-20px' }}>

      {/* ── LEFT: WORKSPACE ──────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Workspace header */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-3 shrink-0">
          <h1 className="text-[14px] font-semibold text-slate-900">Processos</h1>
          <span className="badge badge-slate mono">{processos.length}</span>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 pr-3 py-1.5 text-[12px] w-44 h-8 rounded-lg"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input py-1.5 text-[12px] w-auto h-8 rounded-lg pr-7"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView('board')}
              className={`p-1.5 rounded-md transition-all ${view === 'board' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={14} />
            </button>
          </div>

          <Link href="/processos/novo" className="btn btn-primary btn-sm">
            <Plus size={13} strokeWidth={2.5} /> Novo
          </Link>
        </div>

        {/* Summary bar */}
        <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className="dot dot-blue" />
            <span className="text-secondary">{stats.ativos} ativos</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <DollarSign size={11} className="text-slate-400" />
            <span className="font-semibold text-slate-700">{fmtK(stats.totalContratos)}</span>
            <span className="text-secondary">em contratos</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <TrendingUp size={11} className="text-emerald-500" />
            <span className="font-semibold text-emerald-700">{fmtK(stats.totalRecebido)}</span>
            <span className="text-secondary">recebido</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-auto page-scroll p-5">
          {loading ? (
            <div className="flex items-center justify-center h-40 gap-3">
              <div className="w-5 h-5 border-2 border-[hsl(231,100%,60%)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-secondary">Carregando processos...</p>
            </div>
          ) : view === 'board' ? (

            /* BOARD VIEW */
            <div className="flex gap-4 min-w-[1100px] h-full">
              {Object.entries(STATUS_CONFIG).map(([colId, col]) => {
                const procs = filtered.filter(p => p.status === colId)
                return (
                  <div key={colId} className="kanban-col flex-1 min-w-[180px]">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className="dot" style={{ background: col.color }} />
                        <span className="text-[11px] font-semibold text-slate-600">{col.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-secondary bg-slate-100 px-1.5 py-0.5 rounded-md">{procs.length}</span>
                    </div>

                    <div className="space-y-2">
                      {procs.map(p => {
                        const recebido = p.financeiro?.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((a: number, b: any) => a + b.valor, 0) || 0
                        return (
                          <motion.div
                            key={p.id}
                            layout
                            onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                            className={`kanban-card ${selectedId === p.id ? 'border-[hsl(231,100%,60%)] shadow-[0_0_0_2px_hsl(231,100%,60%/0.2)]' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="mono text-[9px] font-semibold text-secondary">{p.codigo_projeto || 'REG.000'}</span>
                              <div className="dot" style={{ background: col.color }} />
                            </div>
                            <p className="text-[12px] font-semibold text-slate-900 leading-tight mb-2 line-clamp-2">{p.tipo_regularizacao}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-secondary mb-3">
                              <User size={9} className="shrink-0" />
                              <span className="truncate">{p.cliente?.nome}</span>
                            </div>
                            {p.valor_total && (
                              <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                  <span className="text-secondary">Recebido</span>
                                  <span className="font-semibold text-slate-700">{fmtK(recebido)}</span>
                                </div>
                                <div className="progress-track">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min(100, (recebido / p.valor_total) * 100)}%`, background: col.color }}
                                  />
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[8px] font-black uppercase text-slate-400">Saúde</span>
                                  <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${getProcessHealth(p).color}`}>
                                    {getProcessHealth(p).label}
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                      {procs.length === 0 && (
                        <div className="border-2 border-dashed border-slate-100 rounded-2xl p-6 text-center bg-slate-50/50">
                          <Circle size={20} className="text-slate-200 mx-auto mb-2" />
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-tight">Nenhum processo<br/>nesta etapa</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

          ) : (

            /* LIST VIEW */
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Processo</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Saúde</th>
                    <th>Contrato</th>
                    <th>Recebido</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const s = STATUS_CONFIG[p.status]
                    const recebido = p.financeiro?.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((a: number, b: any) => a + b.valor, 0) || 0
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                        className={`cursor-pointer ${selectedId === p.id ? 'bg-[hsl(231,100%,60%/0.04)]' : ''}`}
                      >
                        <td><span className="mono text-[10px] font-semibold text-[hsl(231,100%,60%)]">{p.codigo_projeto || '—'}</span></td>
                        <td><p className="font-semibold text-slate-900">{p.tipo_regularizacao}</p></td>
                        <td><p className="text-secondary">{p.cliente?.nome}</p></td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <div className="dot" style={{ background: s?.color }} />
                            <span className="text-[11px] font-medium" style={{ color: s?.color }}>{s?.label}</span>
                          </div>
                        </td>
                        <td>
                          <div className={`px-2 py-0.5 rounded-full inline-block text-[9px] font-black uppercase tracking-widest ${getProcessHealth(p).color}`}>
                            {getProcessHealth(p).label}
                          </div>
                        </td>
                        <td><span className="font-semibold text-slate-800">{p.valor_total ? fmtK(p.valor_total) : '—'}</span></td>
                        <td>
                          <span className="font-semibold text-emerald-600">{fmtK(recebido)}</span>
                        </td>
                        <td>
                          <Link
                            href={`/processos/${p.id}`}
                            onClick={e => e.stopPropagation()}
                            className="btn btn-ghost btn-xs"
                          >
                            <ArrowUpRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-12 text-center">
                  <Layers size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-[12px] font-medium text-secondary">Nenhum resultado encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: DETAIL PANEL ──────────────────────────────── */}
      <AnimatePresence>
        {selectedId && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="border-l border-slate-100 bg-white shrink-0 flex flex-col overflow-hidden"
            style={{ height: 'calc(100vh - 48px)' }}
          >
            {selectedProcesso ? (
              <>
                {/* Panel header */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedId(null)}
                      className="btn btn-ghost btn-xs p-1.5"
                    >
                      <X size={14} />
                    </button>
                    <span className="mono text-[10px] font-semibold text-secondary">{selectedProcesso.codigo_projeto}</span>
                    <div className="badge" style={{
                      background: STATUS_CONFIG[selectedProcesso.status]?.bg,
                      color: STATUS_CONFIG[selectedProcesso.status]?.color,
                      borderColor: STATUS_CONFIG[selectedProcesso.status]?.color + '30'
                    }}>
                      {STATUS_CONFIG[selectedProcesso.status]?.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setProcessoToEdit(selectedProcesso); setIsEditModalOpen(true) }}
                      className="btn btn-ghost btn-xs p-1.5"
                    >
                      <SlidersHorizontal size={13} />
                    </button>
                    <button
                      onClick={() => { setProcessoToDelete(selectedProcesso); setIsDeleteModalOpen(true) }}
                      className="btn btn-ghost btn-xs p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-y-auto page-scroll p-5 space-y-5">

                  {/* Title */}
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-900 leading-tight">{selectedProcesso.tipo_regularizacao}</h2>
                    <p className="text-[12px] text-secondary mt-1">Aberto em {new Date(selectedProcesso.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>

                  {/* Quick info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card-flat p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cliente</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-bold text-slate-800 truncate">{selectedProcesso.cliente?.nome}</p>
                        <Link href={`/clientes/${selectedProcesso.cliente?.id}`} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all">
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                    <div className="card-flat p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsável</p>
                      <p className="text-[13px] font-bold text-slate-800 truncate">{selectedProcesso.responsavel || 'Não definido'}</p>
                    </div>
                  </div>

                  {/* Localização */}
                  {selectedProcesso.imovel && (
                    <div className="card p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <MapPin size={14} className="text-blue-600" />
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Imóvel do Processo</h4>
                        </div>
                        <Link href={`/imoveis/${selectedProcesso.imovel.id}`} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all">
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                      <p className="text-[13px] font-bold text-slate-900 leading-tight">
                        {selectedProcesso.imovel.endereco}{selectedProcesso.imovel.numero ? `, ${selectedProcesso.imovel.numero}` : ''}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 mt-1">
                        {[selectedProcesso.imovel.bairro, selectedProcesso.imovel.cidade, selectedProcesso.imovel.estado].filter(Boolean).join(' · ')}
                      </p>
                      {selectedProcesso.imovel.num_matricula && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Matrícula</span>
                          <span className="mono text-[11px] font-semibold text-slate-700">{selectedProcesso.imovel.num_matricula}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial */}
                  <div className="rounded-xl overflow-hidden" style={{ background: '#0d0e12' }}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Financeiro</span>
                        <span className="text-[16px] font-bold text-white">
                          {selectedProcesso.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '—'}
                        </span>
                      </div>
                      <div className="progress-track" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${selectedProcesso.valor_total && selectedProcesso.financeiro
                              ? Math.min(100, ((selectedProcesso.financeiro.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((a: number, b: any) => a + b.valor, 0) || 0) / selectedProcesso.valor_total) * 100)
                              : 0}%`,
                            background: '#10B981'
                          }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-emerald-400">
                          Rec: {(selectedProcesso.financeiro?.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((a: number, b: any) => a + b.valor, 0) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-slate-500">
                          Pend: {Math.max(0, (selectedProcesso.valor_total || 0) - (selectedProcesso.financeiro?.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((a: number, b: any) => a + b.valor, 0) || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Open workspace */}
                  <Link
                    href={`/processos/${selectedProcesso.id}`}
                    className="btn btn-secondary w-full justify-center gap-2"
                  >
                    Abrir Workspace Completo <ExternalLink size={13} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

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
          <div className="text-[12px] space-y-2">
            <p>Remover permanentemente <strong>{processoToDelete?.codigo_projeto}</strong>?</p>
            <p className="text-red-500 font-semibold uppercase tracking-widest text-[10px]">Ação irreversível.</p>
          </div>
        }
      />
    </div>
  )
}
