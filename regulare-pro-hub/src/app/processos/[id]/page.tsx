'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Info, Building2, FileText,
  DollarSign, ListTodo, History, GitBranch,
  MapPin, User, Users, Calendar, Edit, X, Check,
  Loader2, ChevronRight, CheckCircle2, Circle, Clock,
  ExternalLink, ArrowUpRight, Wallet, Briefcase, 
  Search, Plus, Filter, LayoutGrid, List, TrendingUp,
  MoreVertical, Download, Trash2, RefreshCw, Sparkles, Command
} from 'lucide-react'
import { EditProcessoModal } from '@/components/EditProcessoModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { FinanceiroModal } from '@/components/FinanceiroModal'
import { TaskModal } from '@/components/TaskModal'
import { ProtocoloModal } from '@/components/ProtocoloModal'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { id: 'visao',      label: 'Visão Geral',    icon: LayoutGrid },
  { id: 'timeline',   label: 'Esteira',        icon: GitBranch },
  { id: 'financeiro', label: 'Financeiro',     icon: DollarSign },
  { id: 'documentos', label: 'Documentos',     icon: FileText },
  { id: 'tarefas',    label: 'Tarefas',        icon: ListTodo },
  { id: 'prefeitura', label: 'Órgãos',         icon: Building2 },
]

export default function ProcessoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tab, setTab] = useState('visao')
  const [processo, setProcesso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [isEditProcessoModalOpen, setIsEditProcessoModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [tarefaToEdit, setTarefaToEdit] = useState<any>(null)
  const [isProtocoloModalOpen, setIsProtocoloModalOpen] = useState(false)
  const [protocoloToEdit, setProtocoloToEdit] = useState<any>(null)
  const [isFinanceiroModalOpen, setIsFinanceiroModalOpen] = useState(false)
  const [financeiroToEdit, setFinanceiroToEdit] = useState<any>(null)

  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [selectedProtocolos, setSelectedProtocolos] = useState<string[]>([])
  const [selectedFinanceiro, setSelectedFinanceiro] = useState<string[]>([])
  
  const stats = useMemo(() => {
    if (!processo) return null;
    const totalContratado = processo.valor_total || 0;
    // Recebido do Cliente (apenas o que está com status 'pago')
    const totalRecebido = processo.financeiro?.filter((f:any)=>f.tipo==='receita' && f.status === 'pago').reduce((a:number,b:any)=>a+b.valor,0) || 0;
    // Total Lançado (Independente de status, para ver quanto do contrato já foi parcelado)
    const totalLancadoReceita = processo.financeiro?.filter((f:any)=>f.tipo==='receita').reduce((a:number,b:any)=>a+b.valor,0) || 0;
    const totalAReceber = Math.max(0, totalContratado - totalRecebido);
    
    // Repasses (Parceiros/Comissões)
    const totalRepasses = processo.financeiro?.filter((f:any)=>f.is_repasse).reduce((a:number,b:any)=>a+b.valor,0) || 0;
    const totalRepassesPagos = processo.financeiro?.filter((f:any)=>f.is_repasse && f.status === 'pago').reduce((a:number,b:any)=>a+b.valor,0) || 0;
    const totalRepassesPendentes = totalRepasses - totalRepassesPagos;
    
    // Lucro e Saldo
    const lucroEstimadoFinal = totalContratado - totalRepasses;
    const saldoEmContaAtual = totalRecebido - totalRepassesPagos;
    
    return { 
      totalContratado, 
      totalRecebido, 
      totalAReceber, 
      totalRepasses, 
      totalRepassesPagos, 
      totalRepassesPendentes,
      lucroEstimadoFinal, 
      saldoEmContaAtual 
    };
  }, [processo]);

  const fetchProcesso = async () => {
    try {
      const r = await fetch(`/api/processos/${params.id}`)
      const d = await r.json()
      setProcesso(d)
      setSelectedTasks([])
      setSelectedProtocolos([])
      setSelectedFinanceiro([])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchProcesso()
  }, [params.id])

  const handleDeleteProcesso = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/processos/${params.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/processos')
    } catch (e) { console.error(e) }
    finally { setIsDeleting(false) }
  }

  const handleToggleTarefa = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'concluido' ? 'pendente' : 'concluido'
    try {
      await fetch(`/api/processos/${params.id}/tarefas`, {
        method: 'PATCH',
        body: JSON.stringify({ id: taskId, status: nextStatus, processoId: params.id })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Sincronizando Operação...</p>
    </div>
  )

  if (!processo) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center p-12">
         <X size={48} className="text-red-500 mx-auto mb-4 opacity-20"/>
         <h2 className="text-xl font-bold text-slate-900">Processo não encontrado</h2>
         <Link href="/processos" className="btn-premium mt-8 inline-flex">Voltar para Central</Link>
      </div>
    </div>
  )

  const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── BREADCRUMBS & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/processos" className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group">
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-wider">
                {processo.codigo_projeto || `#${processo.id.substring(0,8).toUpperCase()}`}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">/ ESTEIRA DE TRAMITAÇÃO</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{processo.tipo_regularizacao}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end pr-4 border-r border-slate-200">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">STATUS ATUAL</span>
            <span className="text-xs font-bold text-primary uppercase">{processo.status?.replace(/_/g, ' ') || 'ATIVO'}</span>
          </div>
          
          <button onClick={() => setIsEditProcessoModalOpen(true)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-500 hover:text-primary">
            <Edit size={18} />
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all shadow-sm text-red-500">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* ── CLIENT & PROPERTY MINI CARD ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">CLIENTE</p>
            <p className="text-sm font-bold text-slate-800 truncate">{processo.cliente?.nome}</p>
          </div>
          <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all lg:col-span-2">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
            <MapPin size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">LOCALIZAÇÃO DO IMÓVEL</p>
            <p className="text-sm font-bold text-slate-800 truncate">{processo.imovel?.endereco}, {processo.imovel?.numero}</p>
          </div>
          <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-500">
            <Calendar size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">CRIADO EM</p>
            <p className="text-sm font-bold text-slate-800">{new Date(processo.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
              tab === t.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <t.icon size={14} />
            {t.label}
            {tab === t.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(45,91,255,0.6)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── VISÃO GERAL ── */}
            {tab === 'visao' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* WORKFLOW PROGRESS */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <GitBranch size={18} className="text-primary" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono">Status da Esteira</h3>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                        Etapa Atual: {processo.status?.replace(/_/g, ' ') || 'Entrada'}
                      </span>
                    </div>

                    <div className="relative pt-4 pb-8">
                      <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 rounded-full -translate-y-1/2" />
                      <div 
                        className="absolute top-1/2 left-0 h-1.5 bg-primary rounded-full -translate-y-1/2 transition-all duration-1000 shadow-[0_0_8px_rgba(45,91,255,0.4)]"
                        style={{ 
                          width: `${
                            processo.status === 'finalizado' ? 100 :
                            processo.status === 'cartorio' ? 80 :
                            processo.status === 'protocolo_prefeitura' ? 60 :
                            processo.status === 'projeto' ? 40 :
                            processo.status === 'levantamento' ? 20 : 5
                          }%` 
                        }}
                      />
                      <div className="flex justify-between relative z-10">
                        {['Entrada', 'Levantamento', 'Projeto', 'Prefeitura', 'Cartório', 'Conclusão'].map((s, i) => {
                          const steps = ['em_analise', 'levantamento', 'projeto', 'protocolo_prefeitura', 'cartorio', 'finalizado']
                          const currentIdx = steps.indexOf(processo.status || 'em_analise')
                          const isPast = i < currentIdx
                          const isCurrent = i === currentIdx
                          return (
                            <div key={s} className="flex flex-col items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                                isPast ? 'bg-primary border-primary' : 
                                isCurrent ? 'bg-white border-primary ring-4 ring-primary/10' : 
                                'bg-white border-slate-200'
                              }`}>
                                {isPast && <Check size={8} className="text-white mx-auto mt-0.5" />}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-tight ${isCurrent ? 'text-primary' : 'text-slate-400'}`}>{s}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* DOSSIÊ DO PROJETO */}
                    <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                          <Building2 size={120} />
                       </div>
                       
                       <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
                             <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                <Info size={20} />
                             </div>
                             <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest font-mono leading-none">Dossiê do Projeto</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Informações consolidadas</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                             <div className="space-y-6">
                                <div>
                                   <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                      <User size={12} className="text-primary" /> Cliente
                                   </p>
                                   <p className="text-sm font-black text-slate-900 leading-tight">{processo.cliente?.nome || '—'}</p>
                                   <p className="text-[10px] font-bold text-slate-500 font-mono mt-1">{processo.cliente?.cpf_cnpj || '—'}</p>
                                   <p className="text-[10px] font-bold text-slate-400 mt-0.5">{processo.cliente?.telefone || '—'}</p>
                                </div>
                                <div>
                                   <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                      <Briefcase size={12} className="text-primary" /> Serviço
                                   </p>
                                   <span className="inline-flex px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase rounded-lg border border-primary/10">
                                      {processo.tipo_regularizacao || 'Regularização'}
                                   </span>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div>
                                   <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                      <MapPin size={12} className="text-primary" /> Imóvel
                                   </p>
                                   <p className="text-sm font-black text-slate-900 leading-tight truncate">{processo.imovel?.endereco || '—'}</p>
                                   <p className="text-[10px] font-bold text-slate-500 font-mono mt-1">Nº {processo.imovel?.numero || 'S/N'}</p>
                                   <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                                      <div>
                                         <p className="text-[8px] font-bold text-slate-400 uppercase">Matrícula</p>
                                         <p className="text-[10px] font-bold text-slate-700 font-mono">{processo.imovel?.num_matricula || '—'}</p>
                                      </div>
                                      <div>
                                         <p className="text-[8px] font-bold text-slate-400 uppercase">Inscrição</p>
                                         <p className="text-[10px] font-bold text-slate-700 font-mono">{processo.imovel?.inscricao_imobiliaria || '—'}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* PRÓXIMA AÇÃO / PENDÊNCIA */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden group border-l-4 border-l-amber-400">
                       <div className="flex items-center gap-2 mb-6">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                             <Clock size={16} />
                          </div>
                          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Próxima Ação</h3>
                       </div>

                       <div className="space-y-6">
                          {processo.tarefas?.filter((t: any) => t.status === 'pendente').slice(0, 1).map((t: any, i: number) => (
                             <div key={i} className="space-y-4">
                                <div>
                                   <p className="text-sm font-black text-slate-900 leading-tight mb-2">{t.titulo}</p>
                                   <p className="text-[10px] text-slate-400 font-medium line-clamp-2">{t.descricao || 'Nenhuma descrição detalhada.'}</p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-bold text-slate-400 uppercase">Vencimento</span>
                                      <span className="text-[10px] font-bold text-amber-600 font-mono">{new Date(t.data).toLocaleDateString('pt-BR')}</span>
                                   </div>
                                   <div className="flex flex-col items-end">
                                      <span className="text-[8px] font-bold text-slate-400 uppercase">Prioridade</span>
                                      <span className={`text-[9px] font-black uppercase ${t.prioridade === 'urgente' ? 'text-red-500' : 'text-primary'}`}>{t.prioridade}</span>
                                   </div>
                                </div>
                             </div>
                          ))}
                          
                          {(!processo.tarefas || processo.tarefas.filter((t: any) => t.status === 'pendente').length === 0) && (
                             <div className="py-6 text-center space-y-2">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                                   <CheckCircle2 size={24} className="text-emerald-500" />
                                </div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Tudo em ordem!</p>
                                <p className="text-[10px] text-slate-400">Nenhuma tarefa pendente no momento.</p>
                             </div>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* METRIC GRID */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tarefas</p>
                       <p className="text-xl font-bold text-slate-900">{processo.tarefas?.length || 0}</p>
                       <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1">{processo.tarefas?.filter((t:any)=>t.status==='concluido').length || 0} CONCLUÍDAS</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Documentos</p>
                       <p className="text-xl font-bold text-slate-900">{processo.documentos?.length || 0}</p>
                       <p className="text-[9px] text-primary font-bold uppercase mt-1">EM ARQUIVO</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Protocolos</p>
                       <p className="text-xl font-bold text-slate-900">{processo.protocolos?.length || 0}</p>
                       <p className="text-[9px] text-amber-500 font-bold uppercase mt-1">ÓRGÃOS ATIVOS</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={120} />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                           <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                              <DollarSign size={16} />
                           </div>
                           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Performance Financeira</h3>
                        </div>

                        <div className="space-y-8">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Valor Total Contratado</p>
                            <p className="text-3xl font-bold tracking-tight text-white">{fmt(stats?.totalContratado || 0)}</p>
                          </div>

                          <div className="space-y-4">
                             <div className="flex justify-between items-end">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recolhimento</p>
                                <p className="text-xs font-bold text-emerald-400">{stats?.totalContratado && stats.totalContratado > 0 ? Math.round((stats.totalRecebido / stats.totalContratado) * 100) : 0}%</p>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-1000"
                                  style={{ width: `${stats?.totalContratado && stats.totalContratado > 0 ? Math.min(100, (stats.totalRecebido / stats.totalContratado) * 100) : 0}%` }}
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">RECEBIDO</p>
                              <p className="text-sm font-bold text-emerald-400">{fmt(stats?.totalRecebido || 0)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">SALDO</p>
                              <p className="text-sm font-bold text-slate-300">{fmt(stats?.totalAReceber || 0)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                   </div>

                   {/* QUICK INFO CARD */}
                   <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Informações Rápidas</h4>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Tempo Decorrido</span>
                            <span className="font-bold text-slate-700">{Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000)} dias</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Responsável</span>
                            <span className="font-bold text-slate-700 truncate max-w-[120px]">{processo.responsavel || 'Não definido'}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Prioridade</span>
                            <span className={`font-bold px-2 py-0.5 rounded uppercase text-[9px] ${processo.prioridade === 'urgente' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                               {processo.prioridade || 'Normal'}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}


            {/* ── FINANCEIRO ── */}
            {tab === 'financeiro' && (
              <div className="space-y-6">
                 {/* SUMMARY CARDS */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-[28px] shadow-sm relative overflow-hidden group">
                       <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:scale-110 transition-transform text-slate-900">
                          <FileText size={80} />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contrato Total</p>
                       <p className="text-xl font-black text-slate-900">{fmt(stats?.totalContratado || 0)}</p>
                       <div className="mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Valor Nominal</span>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-[28px] shadow-sm relative overflow-hidden group">
                       <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:scale-110 transition-transform text-emerald-600">
                          <TrendingUp size={80} />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recebido / Saldo</p>
                       <p className="text-xl font-black text-emerald-600">{fmt(stats?.totalRecebido || 0)}</p>
                       <div className="mt-2 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">A Receber:</span>
                          <span className="text-[10px] font-bold text-amber-600 font-mono">{fmt(stats?.totalAReceber || 0)}</span>
                       </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 p-5 rounded-[28px] shadow-sm relative overflow-hidden group">
                       <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:scale-110 transition-transform text-indigo-600">
                          <Users size={80} />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Repasses Totais</p>
                       <p className="text-xl font-black text-slate-900">{fmt(stats?.totalRepasses || 0)}</p>
                       <div className="mt-2 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Pagos:</span>
                          <span className="text-[10px] font-bold text-indigo-600 font-mono">{fmt(stats?.totalRepassesPagos || 0)}</span>
                       </div>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-[28px] shadow-xl relative overflow-hidden group">
                       <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform text-white">
                          <DollarSign size={80} />
                       </div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lucro Estimado</p>
                       <p className="text-xl font-black text-white">{fmt(stats?.lucroEstimadoFinal || 0)}</p>
                       <div className="mt-2 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-white/40 uppercase">Saldo Atual:</span>
                          <span className="text-[10px] font-bold text-emerald-400 font-mono">{fmt(stats?.saldoEmContaAtual || 0)}</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                             <Wallet size={20} />
                          </div>
                          <div>
                             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono leading-none">Fluxo de Caixa</h3>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Detalhamento de transações</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-2">
                          <AnimatePresence>
                            {selectedFinanceiro.length > 0 && (
                              <motion.button 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={handleBulkDeleteFinanceiro}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-100 mr-2"
                              >
                                <Trash2 size={12}/> EXCLUIR ({selectedFinanceiro.length})
                              </motion.button>
                            )}
                          </AnimatePresence>
                          <button onClick={() => { setFinanceiroToEdit(null); setIsFinanceiroModalOpen(true) }} className="btn-premium py-2 px-4 text-[10px]">
                            <Plus size={14} strokeWidth={2.5}/> NOVO LANÇAMENTO
                          </button>
                       </div>
                    </div>

                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-slate-400 text-[9px] font-bold uppercase tracking-widest bg-slate-50/20 border-b border-slate-100">
                                <th className="px-6 py-3 w-10">
                                  <input 
                                    type="checkbox" 
                                    className="accent-primary"
                                    checked={processo.financeiro?.length > 0 && selectedFinanceiro.length === processo.financeiro.length}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedFinanceiro(processo.financeiro.map((f: any) => f.id))
                                      else setSelectedFinanceiro([])
                                    }}
                                  />
                                </th>
                                <th className="px-6 py-3 font-mono">VENCIMENTO</th>
                                <th className="px-6 py-3 font-mono">DESCRIÇÃO / CATEGORIA</th>
                                <th className="px-6 py-3 font-mono text-center">STATUS</th>
                                <th className="px-6 py-3 font-mono text-right">VALOR</th>
                                <th className="px-6 py-3 w-20"></th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {(!processo.financeiro || processo.financeiro.length === 0) ? (
                                <tr><td colSpan={6} className="p-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhuma transação registrada</td></tr>
                             ) : processo.financeiro.map((f: any) => (
                               <tr key={f.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedFinanceiro.includes(f.id) ? 'bg-primary/5' : ''}`}>
                                  <td className="px-6 py-4">
                                    <input 
                                      type="checkbox" 
                                      className="accent-primary"
                                      checked={selectedFinanceiro.includes(f.id)}
                                      onChange={() => {
                                        if (selectedFinanceiro.includes(f.id)) setSelectedFinanceiro(selectedFinanceiro.filter(id => id !== f.id))
                                        else setSelectedFinanceiro([...selectedFinanceiro, f.id])
                                      }}
                                    />
                                  </td>
                                  <td className="px-6 py-4 text-xs font-medium text-slate-500 font-mono">
                                    {new Date(f.data_vencimento || f.createdAt).toLocaleDateString('pt-BR')}
                                  </td>
                                  <td className="px-6 py-4">
                                     <p className="text-xs font-bold text-slate-800 tracking-tight">{f.descricao}</p>
                                     <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">{f.categoria || f.tipo}</p>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                     <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${f.status === 'pago' || f.status === 'recebido' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                        {f.status}
                                     </span>
                                  </td>
                                  <td className={`px-6 py-4 text-right text-xs font-bold ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                                     {f.tipo === 'receita' ? '+' : '-'}{fmt(f.valor)}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => { setFinanceiroToEdit(f); setIsFinanceiroModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors"><Edit size={14}/></button>
                                      <button onClick={() => handleDeleteFinanceiro(f.id, f.descricao)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={14}/></button>
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

            {/* ── TAREFAS ── */}
            {tab === 'tarefas' && (
              <div className="max-w-3xl mx-auto space-y-6">
                 <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <ListTodo size={18} className="text-primary" />
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Backlog de Atividades</h3>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <AnimatePresence>
                            {selectedTasks.length > 0 && (
                              <motion.button 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={handleBulkDeleteTasks} 
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-100 mr-2"
                              >
                                <Trash2 size={12}/> EXCLUIR ({selectedTasks.length})
                              </motion.button>
                            )}
                          </AnimatePresence>
                          <button onClick={() => setIsTaskModalOpen(true)} className="btn-premium py-2 px-4 text-[10px]">
                            <Plus size={14} strokeWidth={2.5}/> NOVA TAREFA
                          </button>
                       </div>
                    </div>

                    <div className="space-y-3">
                       {(!processo.tarefas || processo.tarefas.length === 0) ? (
                          <div className="py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhuma tarefa cadastrada</div>
                       ) : processo.tarefas.map((t: any) => (
                          <div key={t.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedTasks.includes(t.id) ? 'border-primary bg-primary/5 shadow-md' : t.status === 'concluido' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-primary/20 hover:shadow-sm'}`}>
                             <input 
                               type="checkbox" 
                               checked={selectedTasks.includes(t.id)}
                               onChange={() => {
                                  if (selectedTasks.includes(t.id)) setSelectedTasks(selectedTasks.filter(id => id !== t.id))
                                  else setSelectedTasks([...selectedTasks, t.id])
                               }}
                               className="accent-primary w-4 h-4 cursor-pointer"
                             />
                             <button onClick={() => handleToggleTarefa(t.id, t.status)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${t.status === 'concluido' ? 'bg-primary border-primary' : 'border-slate-300 bg-white'}`}>
                                {t.status === 'concluido' && <Check size={12} className="text-white" />}
                             </button>
                             <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold tracking-tight ${t.status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.titulo}</p>
                                <div className="flex items-center gap-3 mt-1 text-[9px] font-bold uppercase tracking-tight font-mono">
                                   <span className={t.prioridade === 'urgente' ? 'text-red-500' : 'text-primary'}>{t.prioridade}</span>
                                   <span className="text-slate-400 flex items-center gap-1"><Calendar size={10}/> {new Date(t.data).toLocaleDateString('pt-BR')}</span>
                                </div>
                             </div>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setTarefaToEdit(t); setIsTaskModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors"><Edit size={14} /></button>
                                <button onClick={() => handleDeleteTarefa(t.id, t.titulo)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {/* ── ESTEIRA (TIMELINE) ── */}
            {tab === 'timeline' && (
              <div className="max-w-4xl mx-auto py-8">
                 <div className="relative border-l-2 border-slate-100 ml-4 space-y-12">
                    {/* Combine tasks and protocols chronologically */}
                    {[
                      ...(processo.tarefas || []).map((t: any) => ({ ...t, type: 'task' })),
                      ...(processo.protocolos || []).map((p: any) => ({ ...p, type: 'protocol' }))
                    ]
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((item, idx) => (
                      <div key={idx} className="relative pl-10">
                        <div className={`absolute left-[-11px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                          item.status === 'concluido' ? 'bg-emerald-500' : 'bg-primary'
                        }`}>
                           {item.type === 'task' ? <ListTodo size={8} className="text-white"/> : <Building2 size={8} className="text-white"/>}
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-all group">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                 {new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                item.status === 'concluido' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'
                              }`}>
                                 {item.status}
                              </span>
                           </div>
                           <h4 className="text-sm font-bold text-slate-800 mb-1">
                              {item.type === 'task' ? item.titulo : `Protocolo: ${item.orgao}`}
                           </h4>
                           <p className="text-xs text-slate-500 leading-relaxed">
                              {item.type === 'task' ? (item.descricao || 'Sem descrição detalhada') : `Número: ${item.numero_protocolo}`}
                           </p>
                           
                           {item.type === 'protocol' && item.prazo && (
                             <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase">
                                <Clock size={12}/> Previsão: {new Date(item.prazo).toLocaleDateString('pt-BR')}
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                    
                    {( (!processo.tarefas || processo.tarefas.length === 0) && (!processo.protocolos || processo.protocolos.length === 0) ) && (
                      <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                         <GitBranch className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A esteira ganha vida quando você adiciona tarefas e protocolos.</p>
                      </div>
                    )}
                 </div>
              </div>
            )}
            {tab === 'prefeitura' && (
              <div className="space-y-6">
                 <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <Building2 size={18} className="text-primary" />
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Trâmites em Órgãos Públicos</h3>
                       </div>
                       <div className="flex items-center gap-2">
                          <AnimatePresence>
                            {selectedProtocolos.length > 0 && (
                              <motion.button 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={handleBulkDeleteProtocolos} 
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-100 mr-2"
                              >
                                <Trash2 size={12}/> EXCLUIR ({selectedProtocolos.length})
                              </motion.button>
                            )}
                          </AnimatePresence>
                          <button onClick={() => setIsProtocoloModalOpen(true)} className="btn-premium py-2 px-4 text-[10px]">
                            <Plus size={14} strokeWidth={2.5}/> NOVO PROTOCOLO
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {(!processo.protocolos || processo.protocolos.length === 0) ? (
                          <div className="md:col-span-2 py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">Aguardando protocolos</div>
                       ) : processo.protocolos.map((prot: any) => (
                          <div key={prot.id} className={`p-6 rounded-2xl border transition-all ${selectedProtocolos.includes(prot.id) ? 'bg-primary/5 border-primary shadow-md' : 'bg-white border-slate-200 hover:border-primary/20 hover:shadow-sm'}`}>
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                   <input 
                                     type="checkbox" 
                                     checked={selectedProtocolos.includes(prot.id)}
                                     onChange={() => {
                                        if (selectedProtocolos.includes(prot.id)) setSelectedProtocolos(selectedProtocolos.filter(id => id !== prot.id))
                                        else setSelectedProtocolos([...selectedProtocolos, prot.id])
                                     }}
                                     className="accent-primary w-4 h-4 cursor-pointer"
                                   />
                                   <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center font-bold text-primary text-[10px] uppercase font-mono shadow-sm">
                                     {prot.orgao.substring(0, 2)}
                                   </div>
                                   <div>
                                      <p className="text-xs font-bold text-slate-800 tracking-tight uppercase">{prot.orgao}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">ID: {prot.numero_protocolo}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${prot.status === 'concluido' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-primary/5 text-primary border border-primary/10'}`}>{prot.status}</span>
                                   <button onClick={() => { setProtocoloToEdit(prot); setIsProtocoloModalOpen(true) }} className="p-1.5 text-slate-300 hover:text-primary transition-colors"><Edit size={14}/></button>
                                   <button onClick={() => handleDeleteProtocolo(prot.id, prot.orgao)} className="p-1.5 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
                                <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">ENTRADA</p><p className="text-xs font-bold text-slate-700">{new Date(prot.data).toLocaleDateString('pt-BR')}</p></div>
                                <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">PREVISÃO</p><p className="text-xs font-bold text-slate-700">{prot.prazo ? new Date(prot.prazo).toLocaleDateString('pt-BR') : 'EM ANÁLISE'}</p></div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── MODAIS ── */}
      <EditProcessoModal 
        isOpen={isEditProcessoModalOpen} 
        onClose={() => setIsEditProcessoModalOpen(false)} 
        processo={processo} 
        onSuccess={fetchProcesso} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProcesso}
        loading={isDeleting}
        title="Excluir Processo?"
        description={<p>Deseja remover <strong>{processo?.codigo_projeto}</strong> permanentemente?</p>}
      />

      <FinanceiroModal 
        isOpen={isFinanceiroModalOpen}
        onClose={() => { setIsFinanceiroModalOpen(false); setFinanceiroToEdit(null) }}
        processoId={params.id as string}
        processoTotal={processo.valor_total}
        item={financeiroToEdit}
        onSuccess={fetchProcesso}
        currentLançamentos={processo.financeiro}
      />

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setTarefaToEdit(null) }}
        processoId={params.id as string}
        item={tarefaToEdit}
        onSuccess={fetchProcesso}
      />

      <ProtocoloModal 
        isOpen={isProtocoloModalOpen}
        onClose={() => { setIsProtocoloModalOpen(false); setProtocoloToEdit(null) }}
        processoId={params.id as string}
        item={protocoloToEdit}
        onSuccess={fetchProcesso}
      />

    </div>
  )
}
