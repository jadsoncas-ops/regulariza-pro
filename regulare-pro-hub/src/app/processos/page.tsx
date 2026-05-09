'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, Search, Briefcase, Clock, ChevronRight, X, LayoutGrid, List, 
  Filter, User, Trash2, ExternalLink, Command, Sparkles, SlidersHorizontal,
  ArrowUpRight, MapPin, Calendar, Info, GitBranch, DollarSign, ListTodo,
  MoreVertical, CheckCircle2, ChevronLeft
} from 'lucide-react'
import { EditProcessoModal } from '@/components/EditProcessoModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

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
  
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
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

  const getDays = (d: string) => {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  }

  const selectedProcesso = useMemo(() => processos.find(p => p.id === selectedId), [processos, selectedId])

  return (
    <div className="flex h-full overflow-hidden">
      
      {/* ── CENTRAL WORKSPACE ── */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${selectedId ? 'mr-0' : ''}`}>
        
        {/* Workspace Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono">Processos</h1>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setView('board')} 
                className={`p-1.5 rounded-md transition-all ${view === 'board' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button 
                onClick={() => setView('list')} 
                className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrar..."
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-medium outline-none focus:ring-2 focus:ring-primary/10 w-48 transition-all"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Link href="/processos/novo" className="btn-premium py-1.5 px-3 text-[10px]">
              <Plus size={14} strokeWidth={2.5} />
              NOVO
            </Link>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-container p-4">
          {view === 'board' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-[1200px] h-full">
              {Object.keys(STATUS_CONFIG).map(colId => {
                const col = STATUS_CONFIG[colId]
                const procs = filtered.filter(p => p.status === colId)
                return (
                  <div key={colId} className="flex flex-col gap-3 min-w-0">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{col.label}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{procs.length}</span>
                    </div>
                    <div className="space-y-3">
                      {procs.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => setSelectedId(p.id)}
                          className={`compact-card cursor-pointer transition-all border-l-2 ${selectedId === p.id ? 'border-l-primary bg-primary/5 ring-1 ring-primary/10' : 'border-l-transparent hover:border-l-slate-300'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-mono font-black text-slate-400">{p.codigo_projeto || 'REG.000'}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                          </div>
                          <h4 className="text-[11px] font-bold text-slate-900 mb-2 leading-tight line-clamp-2">{p.tipo_regularizacao}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase truncate">
                            <User size={10} className="text-slate-300" />
                            {p.cliente?.nome}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Processo</th>
                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedId(p.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedId === p.id ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-[10px] font-bold text-blue-600">{p.codigo_projeto || 'REG.000'}</td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-900">{p.tipo_regularizacao}</td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-600">{p.cliente?.nome}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[p.status]?.dot || 'bg-slate-300'}`} />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{STATUS_CONFIG[p.status]?.label || p.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight size={14} className="text-slate-300 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── SIDE DETAIL PANEL ── */}
      <AnimatePresence>
        {selectedId && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[450px] border-l border-slate-200 bg-white shadow-2xl z-20 flex flex-col"
          >
            {selectedProcesso ? (
              <>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors">
                      <ChevronLeft size={16} className="text-slate-500" />
                    </button>
                    <span className="text-[10px] font-black text-slate-900 font-mono uppercase tracking-widest">Detalhes do Processo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setProcessoToEdit(selectedProcesso); setIsEditModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                      <SlidersHorizontal size={16} />
                    </button>
                    <button onClick={() => { setProcessoToDelete(selectedProcesso); setIsDeleteModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scroll-container p-6 space-y-8">
                  {/* Header Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 font-mono">
                        {selectedProcesso.codigo_projeto}
                      </span>
                      <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${STATUS_CONFIG[selectedProcesso.status]?.badge}`}>
                        {STATUS_CONFIG[selectedProcesso.status]?.label}
                      </div>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedProcesso.tipo_regularizacao}</h2>
                  </div>

                  {/* Quick Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                      <p className="text-xs font-bold text-slate-800">{selectedProcesso.cliente?.nome}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Início</p>
                      <p className="text-xs font-bold text-slate-800">{new Date(selectedProcesso.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary" />
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Localização</h3>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm space-y-2">
                      <p className="text-xs font-bold text-slate-700">{selectedProcesso.imovel?.endereco}, {selectedProcesso.imovel?.numero}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{selectedProcesso.imovel?.bairro} • {selectedProcesso.imovel?.cidade}/{selectedProcesso.imovel?.estado}</p>
                      <div className="pt-2 mt-2 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Matrícula</span>
                        <span className="text-[10px] font-mono font-bold text-slate-800">{selectedProcesso.imovel?.num_matricula || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Finance Overview */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-500" />
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Financeiro</h3>
                    </div>
                    <div className="bg-slate-900 rounded-2xl p-5 text-white">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Total Contrato</span>
                         <span className="text-lg font-black">{selectedProcesso.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400" 
                          style={{ width: `${selectedProcesso.valor_total && selectedProcesso.financeiro ? Math.min(100, (selectedProcesso.financeiro.filter((f:any)=>f.tipo==='receita' && f.status==='pago').reduce((a:number,b:any)=>a+b.valor,0) / selectedProcesso.valor_total) * 100) : 0}%` }}
                        />
                      </div>
                      <div className="mt-3 flex justify-between text-[10px] font-bold">
                        <span className="text-emerald-400 uppercase">
                          Recebido: {(selectedProcesso.financeiro?.filter((f:any)=>f.tipo==='receita' && f.status==='pago').reduce((a:number,b:any)=>a+b.valor,0) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-slate-500 uppercase">
                          Pendente: {Math.max(0, (selectedProcesso.valor_total || 0) - (selectedProcesso.financeiro?.filter((f:any)=>f.tipo==='receita' && f.status==='pago').reduce((a:number,b:any)=>a+b.valor,0) || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link 
                    href={`/processos/${selectedProcesso.id}`} 
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                  >
                    Abrir Workspace Completo <ExternalLink size={14} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center animate-spin">
                  <Sparkles size={24} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando contexto...</p>
              </div>
            )}
          </motion.div>
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
          <div className="text-xs space-y-2">
            <p>Remover permanentemente <strong>{processoToDelete?.codigo_projeto}</strong>?</p>
            <p className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Ação irreversível.</p>
          </div>
        }
      />
    </div>
  )
}
