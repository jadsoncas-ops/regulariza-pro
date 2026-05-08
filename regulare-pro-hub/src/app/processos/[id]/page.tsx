'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Info, Building2, FileText,
  DollarSign, ListTodo, History, GitBranch,
  MapPin, User, Users, Calendar, Edit, X, Check,
  Loader2, ChevronRight, CheckCircle2, Circle, Clock,
  ExternalLink, ArrowUpRight, Wallet, Briefcase, 
  Search, Plus, Filter, LayoutGrid, List, TrendingUp,
  MoreVertical, Download, Trash2, RefreshCw
} from 'lucide-react'
import { EditProcessoModal } from '@/components/EditProcessoModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'

const TABS = [
  { id: 'visao',      label: 'Visão Geral',    icon: LayoutGrid },
  { id: 'timeline',   label: 'Timeline Operac.', icon: GitBranch },
  { id: 'financeiro', label: 'Financeiro',     icon: DollarSign },
  { id: 'documentos', label: 'Docs Técnicos',   icon: FileText },
  { id: 'tarefas',    label: 'Tarefas',        icon: ListTodo },
  { id: 'prefeitura', label: 'Prefeitura/Órgãos', icon: Building2 },
  { id: 'historico',  label: 'Histórico Log',  icon: History },
]

export default function ProcessoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tab, setTab] = useState('visao')
  const [processo, setProcesso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditProcessoModalOpen, setIsEditProcessoModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isUpdating, setIsUpdating] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [tarefaToEdit, setTarefaToEdit] = useState<any>(null)
  const [isProtocoloModalOpen, setIsProtocoloModalOpen] = useState(false)
  const [protocoloToEdit, setProtocoloToEdit] = useState<any>(null)
  const [isFinanceiroModalOpen, setIsFinanceiroModalOpen] = useState(false)
  const [financeiroToEdit, setFinanceiroToEdit] = useState<any>(null)

  // Estados de Seleção Múltipla
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [selectedProtocolos, setSelectedProtocolos] = useState<string[]>([])
  const [selectedFinanceiro, setSelectedFinanceiro] = useState<string[]>([])

  const fetchProcesso = async () => {
    try {
      const r = await fetch(`/api/processos/${params.id}`)
      const d = await r.json()
      setProcesso(d)
      setSelectedTasks([])
      setSelectedProtocolos([])
      setSelectedFinanceiro([])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProcesso()
  }, [params.id])

  const handleDeleteProcesso = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/processos/${params.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/processos')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string, observacao?: string) => {
    setIsUpdating(true)
    try {
      await fetch(`/api/processos/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, observacoes: observacao })
      })
      await fetchProcesso()
      setIsEditModalOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleTarefa = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'concluido' ? 'pendente' : 'concluido'
    try {
      await fetch(`/api/processos/${params.id}/tarefas`, {
        method: 'PATCH',
        body: JSON.stringify({ id: taskId, status: nextStatus, processoId: params.id })
      })
      await fetchProcesso()
    } catch (e) {
      console.error(e)
    }
  }

  // --- Exclusão de Tarefas ---
  const handleDeleteTarefa = async (taskId: string, titulo: string) => {
    if (!confirm(`Deseja excluir a tarefa "${titulo}"?`)) return
    try {
      await fetch(`/api/processos/${params.id}/tarefas`, {
        method: 'DELETE',
        body: JSON.stringify({ id: taskId, processoId: params.id, titulo })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  const handleBulkDeleteTasks = async () => {
    if (!confirm(`Deseja excluir as ${selectedTasks.length} tarefas selecionadas?`)) return
    try {
      await fetch(`/api/processos/${params.id}/tarefas`, {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedTasks, processoId: params.id })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  // --- Exclusão de Protocolos ---
  const handleDeleteProtocolo = async (protId: string, orgao: string) => {
    if (!confirm(`Deseja excluir o protocolo do órgão "${orgao}"?`)) return
    try {
      await fetch(`/api/processos/${params.id}/protocolos`, {
        method: 'DELETE',
        body: JSON.stringify({ id: protId, processoId: params.id, orgao })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  const handleBulkDeleteProtocolos = async () => {
    if (!confirm(`Deseja excluir os ${selectedProtocolos.length} protocolos selecionados?`)) return
    try {
      await fetch(`/api/processos/${params.id}/protocolos`, {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedProtocolos, processoId: params.id })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  // --- Exclusão de Financeiro ---
  const handleDeleteFinanceiro = async (id: string, descricao: string) => {
    if (!confirm(`Deseja excluir o lançamento "${descricao}"?`)) return
    try {
      await fetch(`/api/processos/${params.id}/financeiro`, {
        method: 'DELETE',
        body: JSON.stringify({ id, processoId: params.id, descricao })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  const handleBulkDeleteFinanceiro = async () => {
    if (!confirm(`Deseja excluir os ${selectedFinanceiro.length} lançamentos selecionados?`)) return
    try {
      await fetch(`/api/processos/${params.id}/financeiro`, {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedFinanceiro, processoId: params.id })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  if (loading && !processo) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sincronizando Operação...</p>
    </div>
  )

  if (!processo) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="card p-12 text-center border-0 shadow-xl max-w-md">
         <X size={48} className="text-red-500 mx-auto mb-4"/>
         <h2 className="text-xl font-bold text-slate-900">Processo não encontrado</h2>
         <Link href="/processos" className="btn-primary mt-8 inline-flex px-8">Voltar para Central</Link>
      </div>
    </div>
  )

  const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const financeiroItems = processo?.financeiro || []
  const totalRecebido = financeiroItems
    .filter((f: any) => f.tipo === 'receita' && (f.status === 'pago' || f.status === 'recebido'))
    .reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0)
  
  const totalDespesas = financeiroItems
    .filter((f: any) => f.tipo === 'despesa')
    .reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0)

  const totalPagoDespesas = financeiroItems
    .filter((f: any) => f.tipo === 'despesa' && (f.status === 'pago' || f.status === 'recebido'))
    .reduce((acc: number, curr: any) => acc + (Number(curr.valor) || 0), 0)

  const saldoPendenteReceita = (Number(processo?.valor_total) || 0) - totalRecebido
  const saldoPendenteDespesa = totalDespesas - totalPagoDespesas

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* HEADER OPERACIONAL PREMIUM */}
      <div className="bg-slate-900 text-white border-b border-white/5 pb-0">
        <div className="max-w-[1500px] mx-auto px-6 py-6">
           <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                 <Link href="/processos" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10">
                    <ArrowLeft size={16} />
                 </Link>
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                          {processo.codigo_projeto || `#${processo.id.substring(0,8).toUpperCase()}`}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Criado em {new Date(processo.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">{processo.tipo_regularizacao}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
                       <Link href={`/clientes/${processo.clienteId}`} className="flex items-center gap-2 hover:text-white transition-colors group">
                          <User size={14} className="group-hover:text-blue-400"/> {processo.cliente?.nome}
                       </Link>
                       <span className="text-white/10">|</span>
                       <div className="flex items-center gap-2">
                          <MapPin size={14}/> {processo.imovel?.endereco}, {processo.imovel?.numero}
                       </div>
                    </div>
                 </div>
              </div>

               <div className="flex items-center gap-3 self-end md:self-auto">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-right">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Status</p>
                    <p className="text-sm font-bold text-emerald-500">{processo.status?.replace(/_/g, ' ').toUpperCase() || 'ATIVO'}</p>
                 </div>
                 <button onClick={() => setIsEditProcessoModalOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white" title="Editar Processo">
                    <Edit size={18} />
                 </button>
                 <button onClick={() => setIsDeleteModalOpen(true)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20" title="Excluir Processo">
                    <Trash2 size={18} />
                 </button>
              </div>
           </div>

           <div className="flex items-center gap-1 mt-10 overflow-x-auto no-scrollbar">
              {TABS.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                    tab === t.id ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 py-10">
        
        {/* ── VISÃO GERAL ───────────────────────────────────────────── */}
        {tab === 'visao' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-2 space-y-8">
                <div className="card p-8 border-0 shadow-sm bg-white overflow-hidden relative">
                   <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><LayoutGrid size={18} className="text-blue-500"/> Situação da Operação</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Última Atualização</p>
                         <p className="text-sm font-medium text-slate-700">
                            {processo.logs?.[0] ? `${processo.logs[0].acao}: ${processo.logs[0].detalhe || 'Sem detalhes'}` : 'Nenhuma movimentação registrada.'}
                         </p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Principais Pendências</p>
                         <div className="space-y-3">
                            {processo.tarefas?.filter((t: any) => t.status === 'pendente').length === 0 ? (
                               <p className="text-[10px] text-slate-400 italic">Nenhuma pendência operacional.</p>
                            ) : (
                               processo.tarefas?.filter((t: any) => t.status === 'pendente').slice(0, 3).map((t: any, i: number) => (
                                 <div key={i} className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${t.prioridade === 'urgente' ? 'bg-red-500' : 'bg-amber-500'}`}/>
                                    <span className="text-xs font-bold text-slate-600 truncate">{t.titulo}</span>
                                 </div>
                               ))
                            )}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ── FINANCEIRO OPERACIONAL ───────────────────────────────── */}
        {tab === 'financeiro' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="card border-0 shadow-sm bg-white overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <h3 className="text-sm font-bold text-slate-800">Fluxo de Caixa Operacional</h3>
                      {selectedFinanceiro.length > 0 && (
                        <button onClick={handleBulkDeleteFinanceiro} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-100 animate-in zoom-in-95">
                          <Trash2 size={12}/> Excluir ({selectedFinanceiro.length})
                        </button>
                      )}
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => { setFinanceiroToEdit(null); setIsFinanceiroModalOpen(true) }} className="btn-primary py-2 px-6 text-[10px] uppercase">+ Nova Transação</button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-6 py-4 w-10">
                              <input 
                                type="checkbox" 
                                className="accent-blue-600"
                                checked={financeiroItems.length > 0 && selectedFinanceiro.length === financeiroItems.length}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedFinanceiro(financeiroItems.map((f: any) => f.id))
                                  else setSelectedFinanceiro([])
                                }}
                              />
                            </th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Categoria / Descrição</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Valor (R$)</th>
                            <th className="px-6 py-4 w-20"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                         {financeiroItems.length === 0 ? (
                            <tr><td colSpan={6} className="p-10 text-center italic text-slate-400">Nenhuma transação financeira registrada.</td></tr>
                         ) : financeiroItems.map((f: any, i: number) => (
                           <tr key={i} className={`hover:bg-slate-50 transition-colors group ${selectedFinanceiro.includes(f.id) ? 'bg-blue-50/30' : ''}`}>
                              <td className="px-6 py-5">
                                <input 
                                  type="checkbox" 
                                  className="accent-blue-600"
                                  checked={selectedFinanceiro.includes(f.id)}
                                  onChange={() => {
                                    if (selectedFinanceiro.includes(f.id)) setSelectedFinanceiro(selectedFinanceiro.filter(id => id !== f.id))
                                    else setSelectedFinanceiro([...selectedFinanceiro, f.id])
                                  }}
                                />
                              </td>
                              <td className="px-6 py-5 text-slate-500">{new Date(f.data_vencimento || f.createdAt).toLocaleDateString('pt-BR')}</td>
                              <td className="px-6 py-5">
                                 <p className="font-bold text-slate-800">{f.descricao}</p>
                                 <p className="text-[9px] text-slate-400 uppercase mt-0.5">{f.categoria || f.tipo}</p>
                              </td>
                              <td className="px-6 py-5 text-center">
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${f.status === 'pago' || f.status === 'recebido' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {f.status}
                                 </span>
                              </td>
                              <td className={`px-6 py-5 text-right font-bold ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                                 {f.tipo === 'receita' ? '+' : '-'}{fmt(f.valor)}
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setFinanceiroToEdit(f); setIsFinanceiroModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"><Edit size={14}/></button>
                                  <button onClick={() => handleDeleteFinanceiro(f.id, f.descricao)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={14}/></button>
                                </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* ── TAREFAS OPERACIONAIS ─────────────────────────────────── */}
        {tab === 'tarefas' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="card p-8 border-0 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                   <div className="flex items-center gap-4">
                      <h3 className="text-base font-bold text-slate-800">Checklist Operacional</h3>
                      {selectedTasks.length > 0 && (
                        <button onClick={handleBulkDeleteTasks} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-100">
                          <Trash2 size={12}/> Excluir ({selectedTasks.length})
                        </button>
                      )}
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={() => setIsTaskModalOpen(true)} className="btn-primary py-2 px-6 text-[10px] uppercase tracking-widest">+ Nova Tarefa</button>
                   </div>
                </div>

                <div className="space-y-4">
                   {processo.tarefas?.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 italic">Nenhuma tarefa cadastrada.</div>
                   ) : processo.tarefas.map((t: any, i: number) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedTasks.includes(t.id) ? 'border-blue-200 bg-blue-50/20' : t.status === 'concluido' ? 'bg-slate-50 border-slate-50 opacity-60' : 'bg-white border-slate-100 hover:border-blue-100 shadow-sm'}`}>
                         <input 
                           type="checkbox" 
                           checked={selectedTasks.includes(t.id)}
                           onChange={() => {
                              if (selectedTasks.includes(t.id)) setSelectedTasks(selectedTasks.filter(id => id !== t.id))
                              else setSelectedTasks([...selectedTasks, t.id])
                           }}
                           className="accent-blue-600 w-4 h-4 cursor-pointer"
                         />
                         <button onClick={() => handleToggleTarefa(t.id, t.status)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${t.status === 'concluido' ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                            {t.status === 'concluido' && <Check size={14} className="text-white" />}
                         </button>
                         <div className="flex-1">
                            <p className={`text-sm font-bold ${t.status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{t.titulo}</p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-bold uppercase">
                               <span className={t.prioridade === 'urgente' ? 'text-red-500' : 'text-blue-500'}>{t.prioridade}</span>
                               <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(t.data).toLocaleDateString('pt-BR')}</span>
                            </div>
                         </div>
                         <div className="flex gap-1">
                            <button onClick={() => { setTarefaToEdit(t); setIsTaskModalOpen(true) }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteTarefa(t.id, t.titulo)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={16} /></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* ── PREFEITURA / ÓRGÃOS ──────────────────────────────────── */}
        {tab === 'prefeitura' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-2 space-y-6">
                <div className="card p-8 border-0 shadow-sm bg-white">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Building2 size={16} className="text-blue-500"/> Protocolos</h3>
                        {selectedProtocolos.length > 0 && (
                          <button onClick={handleBulkDeleteProtocolos} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-100 animate-in zoom-in-95">
                            <Trash2 size={12}/> Excluir ({selectedProtocolos.length})
                          </button>
                        )}
                      </div>
                      <button onClick={() => setIsProtocoloModalOpen(true)} className="btn-primary py-2 px-6 text-[10px] uppercase tracking-widest">+ Novo Protocolo</button>
                   </div>
                   
                   <div className="space-y-6">
                      {processo.protocolos?.length === 0 ? (
                         <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[32px] text-slate-400 italic">Nenhum protocolo externo registrado.</div>
                      ) : (processo.protocolos || []).map((prot: any, i: number) => (
                        <div key={i} className={`p-6 rounded-3xl border transition-all ${selectedProtocolos.includes(prot.id) ? 'bg-blue-50/30 border-blue-200 shadow-lg' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                 <input 
                                   type="checkbox" 
                                   checked={selectedProtocolos.includes(prot.id)}
                                   onChange={() => {
                                      if (selectedProtocolos.includes(prot.id)) setSelectedProtocolos(selectedProtocolos.filter(id => id !== prot.id))
                                      else setSelectedProtocolos([...selectedProtocolos, prot.id])
                                   }}
                                   className="accent-blue-600 w-4 h-4 cursor-pointer"
                                 />
                                 <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm font-bold text-blue-600 uppercase">{prot.orgao.substring(0, 2)}</div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-800">{prot.orgao}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protocolo: {prot.numero_protocolo}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${prot.status === 'concluido' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{prot.status}</span>
                                 <button onClick={() => { setProtocoloToEdit(prot); setIsProtocoloModalOpen(true) }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><Edit size={14}/></button>
                                 <button onClick={() => handleDeleteProtocolo(prot.id, prot.orgao)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={14}/></button>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Data</p><p className="text-xs font-bold text-slate-700">{new Date(prot.data).toLocaleDateString('pt-BR')}</p></div>
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Prazo</p><p className="text-xs font-bold text-slate-700">{prot.prazo ? new Date(prot.prazo).toLocaleDateString('pt-BR') : '—'}</p></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* ── MODAIS DE EDIÇÃO / CRIAÇÃO ───────────────────────────── */}
      
      {/* 1. Modal Editar Processo (Geral) */}
      <EditProcessoModal 
        isOpen={isEditProcessoModalOpen} 
        onClose={() => setIsEditProcessoModalOpen(false)} 
        processo={processo} 
        onSuccess={fetchProcesso} 
      />

      {/* 2. Modal Confirmar Exclusão Processo */}
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProcesso}
        loading={isDeleting}
        title="Excluir Processo?"
        description={<p>Deseja remover <strong>{processo?.codigo_projeto}</strong> permanentemente?</p>}
      />

      {/* 3. Modal Tarefa */}
      {isTaskModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">{tarefaToEdit ? 'Editar Tarefa' : 'Nova Tarefa Operacional'}</h2>
                <button onClick={() => { setIsTaskModalOpen(false); setTarefaToEdit(null) }} className="text-slate-400 hover:text-slate-600"><X/></button>
             </div>
             <form onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const data = {
                   id: tarefaToEdit?.id,
                   titulo: (form.elements.namedItem('titulo') as HTMLInputElement).value,
                   descricao: (form.elements.namedItem('descricao') as HTMLTextAreaElement).value,
                   tipo: (form.elements.namedItem('tipo') as HTMLSelectElement).value,
                   prioridade: (form.elements.namedItem('prioridade') as HTMLSelectElement).value,
                   responsavel: (form.elements.namedItem('responsavel') as HTMLInputElement).value,
                   data: (form.elements.namedItem('data') as HTMLInputElement).value,
                   agendar: (form.elements.namedItem('agendar') as HTMLInputElement).checked,
                   processoId: params.id
                }
                const method = tarefaToEdit ? 'PATCH' : 'POST'
                await fetch(`/api/processos/${params.id}/tarefas`, { 
                  method, 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data) 
                })
                await fetchProcesso()
                setIsTaskModalOpen(false)
                setTarefaToEdit(null)
             }} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Título</label>
                   <input name="titulo" required type="text" defaultValue={tarefaToEdit?.titulo} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Prioridade</label>
                      <select name="prioridade" defaultValue={tarefaToEdit?.prioridade || 'normal'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold">
                         <option value="baixa">Baixa</option>
                         <option value="normal">Normal</option>
                         <option value="alta">Alta</option>
                         <option value="urgente">Urgente</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Data</label>
                      <input name="data" required type="date" defaultValue={tarefaToEdit?.data ? new Date(tarefaToEdit.data).toISOString().split('T')[0] : ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Responsável</label>
                   <input name="responsavel" required type="text" defaultValue={tarefaToEdit?.responsavel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => { setIsTaskModalOpen(false); setTarefaToEdit(null) }} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm">{tarefaToEdit ? 'Salvar' : 'Criar'}</button>
                </div>
             </form>
           </div>
         </div>
      )}

      {/* 4. Modal Protocolo */}
      {isProtocoloModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">{protocoloToEdit ? 'Editar Protocolo' : 'Novo Protocolo'}</h2>
                <button onClick={() => { setIsProtocoloModalOpen(false); setProtocoloToEdit(null) }} className="text-slate-400 hover:text-slate-600"><X/></button>
             </div>
             <form onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const data = {
                   id: protocoloToEdit?.id,
                   orgao: (form.elements.namedItem('orgao') as HTMLInputElement).value,
                   numero_protocolo: (form.elements.namedItem('numero_protocolo') as HTMLInputElement).value,
                   data: (form.elements.namedItem('data') as HTMLInputElement).value,
                   prazo: (form.elements.namedItem('prazo') as HTMLInputElement).value,
                   status: (form.elements.namedItem('status') as HTMLSelectElement).value,
                   processoId: params.id
                }
                const method = protocoloToEdit ? 'PATCH' : 'POST'
                await fetch(`/api/processos/${params.id}/protocolos`, { 
                  method, 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data) 
                })
                await fetchProcesso()
                setIsProtocoloModalOpen(false)
                setProtocoloToEdit(null)
             }} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Órgão</label>
                   <input name="orgao" required type="text" defaultValue={protocoloToEdit?.orgao} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Número Protocolo</label>
                   <input name="numero_protocolo" required type="text" defaultValue={protocoloToEdit?.numero_protocolo} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Data Entrada</label>
                      <input name="data" required type="date" defaultValue={protocoloToEdit?.data ? new Date(protocoloToEdit.data).toISOString().split('T')[0] : ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Status</label>
                      <select name="status" defaultValue={protocoloToEdit?.status || 'em_analise'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold">
                         <option value="em_analise">Em Análise</option>
                         <option value="concluido">Concluído</option>
                      </select>
                   </div>
                </div>
                <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => { setIsProtocoloModalOpen(false); setProtocoloToEdit(null) }} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm">Salvar</button>
                </div>
             </form>
           </div>
         </div>
      )}

      {/* 5. Modal Financeiro */}
      {isFinanceiroModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">{financeiroToEdit ? 'Editar Transação' : 'Nova Transação'}</h2>
                <button onClick={() => { setIsFinanceiroModalOpen(false); setFinanceiroToEdit(null) }} className="text-slate-400 hover:text-slate-600"><X/></button>
             </div>
             <form onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const data = {
                   id: financeiroToEdit?.id,
                   descricao: (form.elements.namedItem('descricao') as HTMLInputElement).value,
                   tipo: (form.elements.namedItem('tipo') as HTMLSelectElement).value,
                   valor: Number((form.elements.namedItem('valor') as HTMLInputElement).value),
                   status: (form.elements.namedItem('status') as HTMLSelectElement).value,
                   data_vencimento: (form.elements.namedItem('data_vencimento') as HTMLInputElement).value,
                   processoId: params.id
                }
                const method = financeiroToEdit ? 'PATCH' : 'POST'
                await fetch(`/api/processos/${params.id}/financeiro`, { 
                  method, 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data) 
                })
                await fetchProcesso()
                setIsFinanceiroModalOpen(false)
                setFinanceiroToEdit(null)
             }} className="p-8 space-y-4">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Descrição</label>
                   <input name="descricao" required type="text" defaultValue={financeiroToEdit?.descricao} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Valor (R$)</label>
                      <input name="valor" required type="number" step="0.01" defaultValue={financeiroToEdit?.valor} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tipo</label>
                      <select name="tipo" defaultValue={financeiroToEdit?.tipo || 'receita'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold">
                         <option value="receita">Receita</option>
                         <option value="despesa">Despesa</option>
                      </select>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Vencimento</label>
                      <input name="data_vencimento" required type="date" defaultValue={financeiroToEdit?.data_vencimento ? new Date(financeiroToEdit.data_vencimento).toISOString().split('T')[0] : ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Status</label>
                      <select name="status" defaultValue={financeiroToEdit?.status || 'pendente'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold">
                         <option value="pendente">Pendente</option>
                         <option value="pago">Pago</option>
                      </select>
                   </div>
                </div>
                <div className="flex gap-3 pt-6">
                   <button type="button" onClick={() => { setIsFinanceiroModalOpen(false); setFinanceiroToEdit(null) }} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl">Salvar</button>
                </div>
             </form>
           </div>
         </div>
      )}

    </div>
  )
}
