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
  MoreVertical, Download, Trash2, RefreshCw, Sparkles, Command,
  Link as LinkIcon, FileCode, FileImage, FileIcon, Eye, Paperclip, 
  FileCheck, ShieldCheck, Upload, Target, Activity
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
  const [selectedDocumentos, setSelectedDocumentos] = useState<string[]>([])
  const [isDocumentoModalOpen, setIsDocumentoModalOpen] = useState(false)
  const [documentoToEdit, setDocumentoToEdit] = useState<any>(null)
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

  const handleDeleteDocumento = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir o documento "${nome}"?`)) return
    try {
      await fetch(`/api/documentos/${id}`, { method: 'DELETE' })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  const handleBulkDeleteDocumentos = async () => {
    if (!confirm(`Deseja excluir os ${selectedDocumentos.length} documentos selecionados?`)) return
    try {
      await Promise.all(selectedDocumentos.map(id => fetch(`/api/documentos/${id}`, { method: 'DELETE' })))
      setSelectedDocumentos([])
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
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/processos" className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group">
            <ArrowLeft size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 uppercase tracking-wider">
                {processo.codigo_projeto || `#${processo.id.substring(0,8).toUpperCase()}`}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">/ OPERAÇÃO EM CURSO</span>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Aberto há {Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000)} dias</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">{processo.tipo_regularizacao}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end pr-4 border-r border-slate-200">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">STATUS ATUAL</span>
            <span className="text-[11px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{processo.status?.replace(/_/g, ' ') || 'ATIVO'}</span>
          </div>
          
          <button onClick={() => setIsEditProcessoModalOpen(true)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-500 hover:text-primary shadow-sm">
            <Edit size={16} />
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all text-red-500 shadow-sm">
            <Trash2 size={16} />
          </button>
        </div>
      </div>


      {/* ── TABS ── */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-hide shrink-0">
        {TABS.map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative ${
              tab === t.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <t.icon size={13} strokeWidth={tab === t.id ? 3 : 2} />
            {t.label}
            {tab === t.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_12px_rgba(45,91,255,0.8)]"
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
            {/* ── VISÃO GERAL: COMMAND CENTER ── */}
            {tab === 'visao' && (
              <div className="flex flex-col gap-6 h-full min-h-0">
                
                {/* ROW 1: PIPELINE E PROGRESSO */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shrink-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Esteira Operacional</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-slate-900 uppercase">
                          {processo.status === 'finalizado' ? 'Concluído' : 
                           processo.status === 'cartorio' ? 'Registro em Cartório' :
                           processo.status === 'protocolo_prefeitura' ? 'Protocolo Prefeitura' :
                           processo.status === 'projeto' ? 'Elaboração de Projeto' :
                           processo.status === 'levantamento' ? 'Levantamento Técnico' : 'Análise Inicial'}
                        </span>
                        <div className="h-5 w-px bg-slate-200" />
                        <span className="text-sm font-black text-blue-600">
                          {Math.round((
                             (processo.status === 'finalizado' ? 100 :
                              processo.status === 'cartorio' ? 80 :
                              processo.status === 'protocolo_prefeitura' ? 60 :
                              processo.status === 'projeto' ? 40 :
                              processo.status === 'levantamento' ? 20 : 5)
                          ))}% COMPLETO
                        </span>
                      </div>
                    </div>
                    <div className="w-64 space-y-2">
                       <div className="flex justify-between items-end text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <span>Progresso Geral</span>
                          <span>{Math.round(((processo.status === 'finalizado' ? 100 : processo.status === 'cartorio' ? 80 : processo.status === 'protocolo_prefeitura' ? 60 : processo.status === 'projeto' ? 40 : processo.status === 'levantamento' ? 20 : 5)))}%</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(processo.status === 'finalizado' ? 100 : processo.status === 'cartorio' ? 80 : processo.status === 'protocolo_prefeitura' ? 60 : processo.status === 'projeto' ? 40 : processo.status === 'levantamento' ? 20 : 5)}%` }}
                            className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {['Entrada', 'Levantamento', 'Projeto', 'Prefeitura', 'Cartório', 'Conclusão'].map((s, i) => {
                      const steps = ['em_analise', 'levantamento', 'projeto', 'protocolo_prefeitura', 'cartorio', 'finalizado']
                      const currentIdx = steps.indexOf(processo.status || 'em_analise')
                      const isPast = i < currentIdx
                      const isCurrent = i === currentIdx
                      const timeAvg = i === 1 ? '5 dias' : i === 2 ? '10 dias' : i === 3 ? '45 dias' : i === 4 ? '30 dias' : '--'
                      
                      return (
                        <div key={s} className={`relative flex flex-col p-4 rounded-xl border transition-all ${
                          isCurrent ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/5 shadow-sm' : 
                          isPast ? 'bg-emerald-50/20 border-emerald-100' : 'bg-slate-50 border-transparent opacity-60'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-blue-600' : isPast ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
                            {isPast && <CheckCircle2 size={12} className="text-emerald-500" />}
                            {isCurrent && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                          </div>
                          <p className={`text-[10px] font-black ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>{isCurrent ? 'EM CURSO' : isPast ? 'CONCLUÍDO' : 'PENDENTE'}</p>
                          {isCurrent && <p className="text-[8px] font-bold text-blue-500 uppercase mt-1">Média: {timeAvg}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ROW 2: PAINEL OPERACIONAL */}
                <div className="grid grid-cols-3 gap-6 h-[25vh] min-h-0 shrink-0">
                  {/* CARD 1: PRÓXIMA AÇÃO */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-amber-200 transition-all border-l-4 border-l-amber-400">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                          <Target size={16} />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] font-mono">Próxima Ação</h3>
                      </div>
                      
                      {processo.tarefas?.filter((t: any) => t.status === 'pendente').slice(0, 1).map((t: any) => (
                        <div key={t.id} className="space-y-1">
                          <p className="text-sm font-black text-slate-900 leading-tight uppercase line-clamp-2">{t.titulo}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Sugestão: {new Date(t.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )) || (
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900 leading-tight uppercase">
                            {processo.status === 'em_analise' ? 'Iniciar levantamento cadastral' :
                             processo.status === 'levantamento' ? 'Elaborar relatório fotográfico' :
                             processo.status === 'projeto' ? 'Finalizar memorial descritivo' :
                             processo.status === 'protocolo_prefeitura' ? 'Acompanhar deferimento' : 'Aguardar registro final'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Ação sugerida pelo sistema</p>
                        </div>
                      )}
                    </div>
                    
                    <button onClick={() => { setTarefaToEdit(null); setIsTaskModalOpen(true) }} className="w-full mt-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                       Executar Ação
                    </button>
                  </div>

                  {/* CARD 2: PERFORMANCE FINANCEIRA */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                          <TrendingUp size={16} />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] font-mono">Performance Financeira</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Contratado</p>
                          <p className="text-[12px] font-black text-slate-900">{fmt(stats?.totalContratado || 0)}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Recebido</p>
                          <p className="text-[12px] font-black text-emerald-600">{fmt(stats?.totalRecebido || 0)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-end text-[9px] font-black text-slate-400 uppercase">
                        <span>Progresso</span>
                        <span className="text-emerald-600">{stats?.totalContratado && stats.totalContratado > 0 ? Math.round((stats.totalRecebido / stats.totalContratado) * 100) : 0}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats?.totalContratado && stats.totalContratado > 0 ? Math.min(100, (stats.totalRecebido / stats.totalContratado) * 100) : 0}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: SAÚDE DO PROCESSO */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                          <Activity size={16} />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] font-mono">Saúde do Projeto</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Tempo em andamento</span>
                          <span className="text-[11px] font-black text-slate-900">{Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000)} dias</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Prazo esperado</span>
                          <span className="text-[11px] font-black text-slate-900">60 dias</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 p-2 bg-slate-50 rounded-xl">
                      <div className={`w-2 h-2 rounded-full ${
                        Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000) > 60 ? 'bg-red-500 animate-pulse' :
                        Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000) > 45 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000) > 60 ? 'text-red-600' :
                        Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000) > 45 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000) > 60 ? 'Operação Atrasada' :
                         Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000) > 45 ? 'Atenção ao Prazo' : 'Dentro do Prazo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ROW 3: DETALHES E HISTÓRICO */}
                <div className="grid grid-cols-3 gap-6 h-[30vh] min-h-0 overflow-hidden shrink-0">
                  {/* CARD 1: DOSSIÊ DO PROJETO */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-0">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-4 border-b border-slate-50 pb-2">Dossiê de Ativos</h3>
                     <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Cliente / Proprietário</p>
                          <p className="text-[11px] font-black text-slate-900 truncate uppercase">{processo.cliente?.nome}</p>
                          <p className="text-[9px] font-bold text-slate-500 font-mono">{processo.cliente?.cpf_cnpj}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Localização</p>
                          <p className="text-[11px] font-black text-slate-900 truncate uppercase">{processo.imovel?.endereco}, {processo.imovel?.numero}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Matrícula</p>
                            <p className="text-[10px] font-black text-slate-700 font-mono">{processo.imovel?.num_matricula || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Inscrição</p>
                            <p className="text-[10px] font-black text-slate-700 font-mono">{processo.imovel?.inscricao_imobiliaria || 'N/A'}</p>
                          </div>
                        </div>
                     </div>
                  </div>

                  {/* CARD 2: DOCUMENTOS DO PROCESSO */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-0">
                     <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Repositório ({processo.documentos?.length || 0})</h3>
                        <button onClick={() => setTab('documentos')} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Ver Todos</button>
                     </div>
                     <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                        {processo.documentos?.slice(0, 3).map((d: any) => (
                          <div key={d.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl group hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <FileText size={14} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-800 truncate uppercase">{d.nome}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</p>
                             </div>
                          </div>
                        ))}
                        {(!processo.documentos || processo.documentos.length === 0) && (
                          <p className="text-[9px] text-slate-300 font-black uppercase text-center py-8">Nenhum documento</p>
                        )}
                     </div>
                  </div>

                  {/* CARD 3: ATIVIDADES RECENTES */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-0">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-4 border-b border-slate-50 pb-2">Log de Operação</h3>
                     <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                        {processo.logs?.slice(0, 5).map((log: any, i: number) => (
                          <div key={i} className="flex gap-3 relative">
                             {i !== 4 && <div className="absolute left-1.5 top-3 bottom-0 w-px bg-slate-100" />}
                             <div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-white relative z-10 shrink-0 mt-0.5" />
                             <div>
                                <p className="text-[10px] font-bold text-slate-800 leading-tight uppercase">{log.acao}</p>
                                <p className="text-[8px] text-slate-400 uppercase font-bold">{new Date(log.createdAt).toLocaleDateString('pt-BR')} • {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                          </div>
                        ))}
                        {(!processo.logs || processo.logs.length === 0) && (
                           processo.tarefas?.slice(0, 5).map((t: any, i: number) => (
                             <div key={i} className="flex gap-3 relative">
                                {i !== 4 && <div className="absolute left-1.5 top-3 bottom-0 w-px bg-slate-100" />}
                                <div className="w-3 h-3 rounded-full bg-blue-100 border-2 border-white relative z-10 shrink-0 mt-0.5" />
                                <div>
                                   <p className="text-[10px] font-bold text-slate-800 leading-tight uppercase">TAREFA: {t.titulo}</p>
                                   <p className="text-[8px] text-slate-400 uppercase font-bold">{t.status}</p>
                                </div>
                             </div>
                           ))
                        )}
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
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 shrink-0">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm group hover:border-blue-200 transition-all">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Contrato Total</p>
                       <p className="text-2xl font-black text-slate-900 leading-none">{fmt(stats?.totalContratado || 0)}</p>
                       <div className="mt-4 flex items-center gap-2">
                          <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500" style={{ width: '100%' }} />
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">100%</span>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm group hover:border-emerald-200 transition-all">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Recebido</p>
                       <p className="text-2xl font-black text-emerald-600 leading-none">{fmt(stats?.totalRecebido || 0)}</p>
                       <div className="mt-4 flex items-center gap-2">
                          <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500" style={{ width: `${stats?.totalContratado ? (stats.totalRecebido / stats.totalContratado) * 100 : 0}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600">{stats?.totalContratado ? Math.round((stats.totalRecebido / stats.totalContratado) * 100) : 0}%</span>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm group hover:border-red-200 transition-all">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Custos / Repasses</p>
                       <p className="text-2xl font-black text-red-500 leading-none">{fmt(stats?.totalRepasses || 0)}</p>
                       <div className="mt-4 flex items-center gap-2">
                          <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-red-500" style={{ width: `${stats?.totalContratado ? (stats.totalRepasses / stats.totalContratado) * 100 : 0}%` }} />
                          </div>
                          <span className="text-[9px] font-bold text-red-500">{stats?.totalContratado ? Math.round((stats.totalRepasses / stats.totalContratado) * 100) : 0}%</span>
                       </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                       <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform text-white">
                          <Sparkles size={80} />
                       </div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">Lucro Estimado</p>
                       <p className="text-2xl font-black text-white leading-none">{fmt(stats?.lucroEstimadoFinal || 0)}</p>
                       <div className="mt-4 flex items-center justify-between">
                          <span className="text-[9px] font-black text-white/40 uppercase">Saldo em Conta:</span>
                          <span className="text-[10px] font-black text-emerald-400 font-mono tracking-tight">{fmt(stats?.saldoEmContaAtual || 0)}</span>
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

            {/* ── DOCUMENTOS ── */}
            {tab === 'documentos' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono leading-none">Repositório de Arquivos</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Documentação técnica e links externos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AnimatePresence>
                        {selectedDocumentos.length > 0 && (
                          <motion.button 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={handleBulkDeleteDocumentos}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-100 mr-2"
                          >
                            <Trash2 size={12}/> EXCLUIR ({selectedDocumentos.length})
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <button onClick={() => { setDocumentoToEdit(null); setIsDocumentoModalOpen(true) }} className="btn-premium py-2 px-4 text-[10px]">
                        <Plus size={14} strokeWidth={2.5}/> ADICIONAR DOCUMENTO
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
                              checked={processo.documentos?.length > 0 && selectedDocumentos.length === processo.documentos.length}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedDocumentos(processo.documentos.map((d: any) => d.id))
                                else setSelectedDocumentos([])
                              }}
                            />
                          </th>
                          <th className="px-6 py-3 font-mono">ARQUIVO / NOME</th>
                          <th className="px-6 py-3 font-mono">CATEGORIA</th>
                          <th className="px-6 py-3 font-mono text-center">STATUS</th>
                          <th className="px-6 py-3 font-mono text-right">DATA</th>
                          <th className="px-6 py-3 w-20"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(!processo.documentos || processo.documentos.length === 0) ? (
                          <tr><td colSpan={6} className="p-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhum documento anexado</td></tr>
                        ) : processo.documentos.map((d: any) => (
                          <tr key={d.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedDocumentos.includes(d.id) ? 'bg-primary/5' : ''}`}>
                            <td className="px-6 py-4">
                              <input 
                                type="checkbox" 
                                className="accent-primary"
                                checked={selectedDocumentos.includes(d.id)}
                                onChange={() => {
                                  if (selectedDocumentos.includes(d.id)) setSelectedDocumentos(selectedDocumentos.filter(id => id !== d.id))
                                  else setSelectedDocumentos([...selectedDocumentos, d.id])
                                }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {d.url.startsWith('http') ? (
                                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shadow-sm border border-amber-100/50">
                                    <LinkIcon size={16} />
                                  </div>
                                ) : (
                                  <div className="p-2 bg-primary/5 text-primary rounded-lg shadow-sm border border-primary/10">
                                    <FileText size={16} />
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-bold text-slate-800 tracking-tight leading-none mb-1">{d.nome}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                    {d.url.startsWith('http') ? <span className="text-amber-600">LINK DRIVE</span> : <span>ARQUIVO LOCAL</span>} 
                                    • {d.tipo.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                {d.categoria || 'Geral'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${d.status === 'verificado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-xs font-medium text-slate-500 font-mono">
                              {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors" title="Ver Arquivo">
                                  {d.url.startsWith('http') ? <ExternalLink size={14}/> : <Eye size={14}/>}
                                </a>
                                <button onClick={() => handleDeleteDocumento(d.id, d.nome)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Excluir">
                                  <Trash2 size={14}/>
                                </button>
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

                    <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 max-h-[60vh] custom-scrollbar">
                       {(!processo.tarefas || processo.tarefas.length === 0) ? (
                          <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                             <ListTodo size={40} className="text-slate-100 mb-4" />
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aguardando definição operacional</p>
                          </div>
                       ) : processo.tarefas.map((t: any) => (
                          <div key={t.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${selectedTasks.includes(t.id) ? 'border-primary bg-primary/5 shadow-md' : t.status === 'concluido' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-primary/20 hover:shadow-sm'}`}>
                             <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox" 
                                  checked={selectedTasks.includes(t.id)}
                                  onChange={() => {
                                     if (selectedTasks.includes(t.id)) setSelectedTasks(selectedTasks.filter(id => id !== t.id))
                                     else setSelectedTasks([...selectedTasks, t.id])
                                  }}
                                  className="accent-primary w-4 h-4 cursor-pointer"
                                />
                                <button onClick={() => handleToggleTarefa(t.id, t.status)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${t.status === 'concluido' ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-200 bg-white group-hover:border-primary'}`}>
                                   {t.status === 'concluido' && <Check size={14} className="text-white" strokeWidth={3} />}
                                </button>
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-black tracking-tight uppercase leading-none ${t.status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{t.titulo}</p>
                                <div className="flex items-center gap-4 mt-2">
                                   <div className="flex items-center gap-1">
                                      <div className={`w-1.5 h-1.5 rounded-full ${t.prioridade === 'urgente' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${t.prioridade === 'urgente' ? 'text-red-500' : 'text-slate-400'}`}>{t.prioridade}</span>
                                   </div>
                                   <div className="h-3 w-px bg-slate-200" />
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      <Calendar size={10} strokeWidth={2.5}/> {new Date(t.data).toLocaleDateString('pt-BR')}
                                   </span>
                                </div>
                             </div>

                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setTarefaToEdit(t); setIsTaskModalOpen(true) }} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit size={14} /></button>
                                <button onClick={() => handleDeleteTarefa(t.id, t.titulo)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={14} /></button>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {(!processo.protocolos || processo.protocolos.length === 0) ? (
                          <div className="lg:col-span-3 py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                             <Building2 size={40} className="text-slate-100 mb-4" />
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum protocolo ativo em órgãos</p>
                          </div>
                       ) : processo.protocolos.map((prot: any) => (
                          <div key={prot.id} className={`p-6 rounded-3xl border transition-all group ${selectedProtocolos.includes(prot.id) ? 'bg-primary/5 border-primary shadow-lg' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/40'}`}>
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white text-xs uppercase shadow-lg shadow-slate-900/20">
                                      {prot.orgao.substring(0, 2)}
                                   </div>
                                   <div>
                                      <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{prot.orgao}</p>
                                      <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest font-mono">#{prot.numero_protocolo}</p>
                                   </div>
                                </div>
                                <input 
                                  type="checkbox" 
                                  checked={selectedProtocolos.includes(prot.id)}
                                  onChange={() => {
                                     if (selectedProtocolos.includes(prot.id)) setSelectedProtocolos(selectedProtocolos.filter(id => id !== prot.id))
                                     else setSelectedProtocolos([...selectedProtocolos, prot.id])
                                  }}
                                  className="accent-primary w-5 h-5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                             </div>

                             <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                                   <span className="text-[9px] font-black text-slate-400 uppercase">Status do Protocolo</span>
                                   <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${prot.status === 'concluido' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}>{prot.status}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                   <div className="p-3 border border-slate-50 rounded-2xl">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Abertura</p>
                                      <p className="text-[11px] font-black text-slate-900 font-mono">{new Date(prot.data).toLocaleDateString('pt-BR')}</p>
                                   </div>
                                   <div className="p-3 border border-slate-50 rounded-2xl">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Prazo</p>
                                      <p className={`text-[11px] font-black font-mono ${prot.prazo && new Date(prot.prazo) < new Date() ? 'text-red-500' : 'text-slate-900'}`}>
                                         {prot.prazo ? new Date(prot.prazo).toLocaleDateString('pt-BR') : 'ANÁLISE'}
                                      </p>
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-50">
                                <button onClick={() => { setProtocoloToEdit(prot); setIsProtocoloModalOpen(true) }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Editar</button>
                                <button onClick={() => handleDeleteProtocolo(prot.id, prot.orgao)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
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

      {/* ── DOCUMENTO MODAL (GOOGLE DRIVE / UPLOAD) ── */}
      <DocumentoModal 
        isOpen={isDocumentoModalOpen}
        onClose={() => { setIsDocumentoModalOpen(false); setDocumentoToEdit(null) }}
        processoId={params.id as string}
        onSuccess={fetchProcesso}
      />

    </div>
  )
}

function DocumentoModal({ isOpen, onClose, processoId, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'link' | 'upload'>('link')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/processos/${processoId}/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.nome,
          tipo: data.tipo,
          categoria: data.categoria,
          url: mode === 'link' ? data.url : `/mock/upload/${data.nome}`, // Placeholder for real upload
          status: 'verificado'
        })
      })

      if (res.ok) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono">Adicionar Documento</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Anexe arquivos ou links externos (Drive)</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              type="button" 
              onClick={() => setMode('link')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'link' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
            >
              Link Externo (Drive)
            </button>
            <button 
              type="button" 
              onClick={() => setMode('upload')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'upload' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
            >
              Upload Local
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Nome do Documento</label>
              <input name="nome" required className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Ex: Projeto Arquitetônico Final" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Tipo / Extensão</label>
                <select name="tipo" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none appearance-none">
                  <option value="pdf">PDF</option>
                  <option value="dwg">DWG (AutoCAD)</option>
                  <option value="docx">Word / DOCX</option>
                  <option value="xlsx">Excel / XLSX</option>
                  <option value="png">Imagem / PNG</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Categoria</label>
                <select name="categoria" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none appearance-none">
                  <option value="Projeto">Projeto</option>
                  <option value="Certidão">Certidão</option>
                  <option value="Alvará">Alvará</option>
                  <option value="ART/RRT">ART / RRT</option>
                  <option value="Contrato">Contrato</option>
                </select>
              </div>
            </div>

            {mode === 'link' ? (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">URL do Google Drive / Dropbox</label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="url" required className="w-full bg-slate-50 border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="https://drive.google.com/..." />
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                <Upload size={24} className="text-slate-300 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clique ou arraste o arquivo</p>
                <p className="text-[9px] text-slate-300 mt-1 uppercase">Máximo 10MB para upload direto</p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-premium py-4 font-mono uppercase tracking-widest text-xs"
            >
              {loading ? 'Processando...' : 'Salvar Documento'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
