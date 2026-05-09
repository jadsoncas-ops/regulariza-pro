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
  FileCheck, ShieldCheck, Upload, Target, Activity, Layers, Zap
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
    
    // Repasses e Custos (Toda despesa vinculada ao processo)
    const totalRepasses = processo.financeiro?.filter((f:any)=>f.tipo === 'despesa' || f.is_repasse).reduce((a:number,b:any)=>a+b.valor,0) || 0;
    const totalRepassesPagos = processo.financeiro?.filter((f:any)=>(f.tipo === 'despesa' || f.is_repasse) && f.status === 'pago').reduce((a:number,b:any)=>a+b.valor,0) || 0;
    const totalRepassesPendentes = totalRepasses - totalRepassesPagos;
    
    // Lucro e Saldo
    // Lucro = Valor Total do Contrato - Total de Custos/Repasses
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
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-[hsl(231,100%,60%)] border-t-transparent rounded-full animate-spin" />
      <p className="text-[11px] font-semibold text-secondary uppercase tracking-widest">Carregando processo...</p>
    </div>
  )

  if (!processo) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <X size={32} className="text-slate-200" />
      <p className="text-[13px] font-semibold text-secondary">Processo não encontrado</p>
      <Link href="/processos" className="btn btn-primary btn-sm">Voltar para Processos</Link>
    </div>
  )

  const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const STATUS_LABELS: Record<string, string> = {
    em_analise: 'Entrada', levantamento: 'Levantamento', projeto: 'Projeto',
    protocolo_prefeitura: 'Prefeitura', cartorio: 'Cartório', finalizado: 'Conclusão'
  }
  const STATUS_COLORS: Record<string, string> = {
    em_analise: '#F59E0B', levantamento: '#3B82F6', projeto: '#6366F1',
    protocolo_prefeitura: '#8B5CF6', cartorio: '#F97316', finalizado: '#10B981'
  }
  const statusColor = STATUS_COLORS[processo.status] || '#64748B'
  const statusLabel = STATUS_LABELS[processo.status] || processo.status
  const diasAberto = Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000)

  return (
    <div className="flex flex-col" style={{ margin: '-20px', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>

      {/* ── PROCESS HEADER ── */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-4 shrink-0">
        <Link href="/processos" className="btn btn-ghost btn-xs p-1.5">
          <ArrowLeft size={15} />
        </Link>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-2 text-[11px] text-secondary">
          <Link href="/processos" className="hover:text-slate-700 transition-colors">Processos</Link>
          <ChevronRight size={11} />
          <span className="mono font-semibold text-[hsl(231,100%,60%)]">{processo.codigo_projeto || 'REG.000'}</span>
        </div>

        <div className="flex-1">
          <h1 className="text-[15px] font-bold text-slate-900 leading-tight">{processo.tipo_regularizacao}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-secondary">{processo.cliente?.nome}</span>
            <span className="text-slate-200">·</span>
            <span className="text-[11px] text-secondary flex items-center gap-1">
              <Calendar size={10} /> Aberto há {diasAberto} {diasAberto === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="badge"
            style={{ background: statusColor + '15', color: statusColor, borderColor: statusColor + '30', fontWeight: 600 }}
          >
            <div className="dot" style={{ background: statusColor }} />
            {statusLabel}
          </div>

          <button onClick={() => setIsEditProcessoModalOpen(true)} className="btn btn-secondary btn-xs gap-1.5">
            <Edit size={12} /> Editar
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="btn btn-xs btn-ghost p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── COMMAND CENTER: HIGH DENSITY 3-COLUMN LAYOUT ── */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 h-full min-h-0 bg-[#FDFDFD]">
        
        {/* LEFT COLUMN: IDENTITY & ACTIVITY (Col 3) */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                <Target size={14} className="text-slate-500" /> Identidade
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-500">{processo.codigo_projeto || 'N/A'}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-bold text-slate-900 leading-tight uppercase">{processo.tipo_regularizacao}</p>
                <div className="mt-2 p-3 bg-slate-50 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Cliente</p>
                   <p className="text-[11px] font-bold text-slate-800">{processo.cliente?.nome}</p>
                </div>
                <div className="mt-2 p-3 bg-slate-50 rounded-xl">
                   <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Localização</p>
                   <p className="text-[11px] font-bold text-slate-800">{processo.imovel?.endereco}, {processo.imovel?.numero}</p>
                   <p className="text-[9px] text-slate-500 mt-0.5">{processo.imovel?.cidade}/{processo.imovel?.estado}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tempo Ativo</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000) > 60 ? 'text-red-500' : 'text-slate-800'}`}>
                  {Math.floor((Date.now() - new Date(processo.createdAt).getTime()) / 86400000)} dias
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex-1 min-h-[250px] flex flex-col">
             <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  <Activity size={14} /> Activity Timeline
                </div>
             </div>
             <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar pl-2">
                {processo.logs?.slice(0, 15).map((log: any, i: number) => (
                  <div key={i} className="flex gap-4 relative">
                     {i !== (processo.logs?.length > 15 ? 14 : processo.logs?.length - 1) && <div className="absolute left-[5px] top-4 bottom-[-16px] w-[2px] bg-slate-100" />}
                     <div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-white relative z-10 shrink-0 mt-0.5 shadow-sm" />
                     <div>
                        <p className="text-[10px] font-bold text-slate-800 leading-tight uppercase">{log.acao}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-medium mt-0.5 font-mono">{new Date(log.createdAt).toLocaleDateString('pt-BR')} • {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                  </div>
                ))}
                {(!processo.logs || processo.logs.length === 0) && (
                  <p className="text-[9px] text-slate-400 font-bold uppercase text-center py-6">Sem atividades</p>
                )}
             </div>
          </div>

        </div>

        {/* CENTER COLUMN: WORKFLOW ENGINE (Col 5) */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
           
           <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shrink-0">
             <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">
                  <Layers size={14} className="text-blue-500" /> Pipeline Dinâmico
                </div>
             </div>
             <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                {['em_analise', 'levantamento', 'projeto', 'protocolo_prefeitura', 'cartorio', 'finalizado'].map((s, i, arr) => {
                  const currentIdx = arr.indexOf(processo.status || 'em_analise')
                  const isPast = i < currentIdx
                  const isCurrent = i === currentIdx
                  const label = STATUS_LABELS[s] || s
                  return (
                    <div key={s} className={`flex-1 min-w-[100px] flex flex-col p-3 rounded-xl border transition-all ${
                      isCurrent ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20 shadow-sm' : 
                      isPast ? 'bg-emerald-50/20 border-emerald-100' : 'bg-slate-50 border-transparent opacity-60'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isCurrent ? 'text-blue-600' : isPast ? 'text-emerald-600' : 'text-slate-400'}`}>0{i+1}</span>
                        {isPast && <CheckCircle2 size={10} className="text-emerald-500" />}
                        {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                      </div>
                      <p className={`text-[9px] font-bold leading-tight ${isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>{label}</p>
                    </div>
                  )
                })}
             </div>
           </div>

           <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex-1 flex flex-col min-h-[400px]">
             <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                  <Zap size={14} className="text-amber-500" /> Autonomous Workflow
                </div>
                <div className="flex gap-1">
                   <button onClick={() => { setTarefaToEdit(null); setIsTaskModalOpen(true) }} className="btn-secondary py-1 px-2 text-[8px] uppercase tracking-widest"><Plus size={10} className="mr-1"/> Tarefa</button>
                   <button onClick={() => { setProtocoloToEdit(null); setIsProtocoloModalOpen(true) }} className="btn-secondary py-1 px-2 text-[8px] uppercase tracking-widest"><Plus size={10} className="mr-1"/> Órgão</button>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-100 z-0" />
                <div className="space-y-4 relative z-10 pt-2">
                  {[
                    ...(processo.tarefas || []).map((t: any) => ({ ...t, type: 'task' })),
                    ...(processo.protocolos || []).map((p: any) => ({ ...p, type: 'protocol' }))
                  ]
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((item, idx) => (
                    <div key={idx} className="relative pl-10 group">
                      <div className={`absolute left-1 top-2 w-6 h-6 rounded-full shadow-sm flex items-center justify-center ${
                        item.status === 'concluido' ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-400 group-hover:border-primary group-hover:text-primary transition-colors'
                      }`}>
                         {item.type === 'task' ? <ListTodo size={10} /> : <Building2 size={10} />}
                      </div>
                      
                      <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm group-hover:border-primary/20 group-hover:shadow-md transition-all flex items-start gap-3">
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                 item.type === 'task' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'
                               }`}>
                                 {item.type === 'task' ? 'TAREFA' : 'PROTOCOLO'}
                               </span>
                               <span className="text-[8px] font-bold text-slate-400 font-mono">{new Date(item.data).toLocaleDateString('pt-BR')}</span>
                               <span className={`ml-auto text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${item.status === 'concluido' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>{item.status}</span>
                            </div>
                            <h4 className={`text-[11px] font-bold ${item.status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                               {item.type === 'task' ? item.titulo : `${item.orgao} - #${item.numero_protocolo}`}
                            </h4>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => item.type==='task' ? (setTarefaToEdit(item), setIsTaskModalOpen(true)) : (setProtocoloToEdit(item), setIsProtocoloModalOpen(true))} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><Edit size={12}/></button>
                            <button onClick={() => item.type==='task' ? handleDeleteTarefa(item.id, item.titulo) : handleDeleteProtocolo(item.id, item.orgao)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={12}/></button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           </div>

        </div>

        {/* RIGHT COLUMN: FINANCIAL & DOCS (Col 4) */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
           
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group shrink-0">
             <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform text-white">
                <Sparkles size={80} />
             </div>
             <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-2"><TrendingUp size={14}/> Financeiro</h3>
                <button onClick={() => { setFinanceiroToEdit(null); setIsFinanceiroModalOpen(true) }} className="text-slate-400 hover:text-white transition-colors p-1"><Plus size={14}/></button>
             </div>
             <div className="relative z-10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Contrato Total</p>
                <p className="text-xl font-black text-white leading-none mb-4">{fmt(stats?.totalContratado || 0)}</p>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                   <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Recebido</p>
                      <p className="text-[11px] font-bold text-emerald-400">{fmt(stats?.totalRecebido || 0)}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Custos/Repasses</p>
                      <p className="text-[11px] font-bold text-red-400">{fmt(stats?.totalRepasses || 0)}</p>
                   </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                   <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${stats?.totalContratado ? (stats.totalRecebido / stats.totalContratado) * 100 : 0}%` }} />
                   </div>
                   <span className="text-[8px] font-bold text-emerald-400 font-mono">{stats?.totalContratado ? Math.round((stats.totalRecebido / stats.totalContratado) * 100) : 0}%</span>
                </div>
             </div>
           </div>

           <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shrink-0">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Últimos Lançamentos</h3>
                <button onClick={() => setTab('financeiro')} className="text-[8px] uppercase font-bold text-primary hover:underline opacity-0">Ver Tudo</button>
             </div>
             <div className="space-y-2">
                {processo.financeiro?.slice(0,3).map((f:any) => (
                  <div key={f.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg group">
                     <div>
                        <p className="text-[10px] font-bold text-slate-800">{f.descricao}</p>
                        <p className="text-[8px] text-slate-400 font-mono">{new Date(f.data_vencimento || f.createdAt).toLocaleDateString('pt-BR')} • {f.status}</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                           {f.tipo === 'receita' ? '+' : '-'}{fmt(f.valor)}
                        </span>
                        <button onClick={() => handleDeleteFinanceiro(f.id, f.descricao)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"><Trash2 size={10}/></button>
                     </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex-1 flex flex-col min-h-[250px]">
             <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                  <FileText size={14} className="text-slate-500" /> Repositório (Docs)
                </div>
                <button onClick={() => { setDocumentoToEdit(null); setIsDocumentoModalOpen(true) }} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"><Plus size={14}/></button>
             </div>
             <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {processo.documentos?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                           {d.url.startsWith('http') ? <LinkIcon size={12}/> : <FileText size={12}/>}
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-slate-800 truncate uppercase">{d.nome}</p>
                           <p className="text-[8px] font-medium text-slate-400 uppercase">{d.categoria} • {d.status}</p>
                        </div>
                     </div>
                     <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white rounded shadow-sm text-slate-400 hover:text-primary"><ExternalLink size={10}/></a>
                        <button onClick={() => handleDeleteDocumento(d.id, d.nome)} className="p-1.5 hover:bg-white rounded shadow-sm text-slate-400 hover:text-red-500"><Trash2 size={10}/></button>
                     </div>
                  </div>
                ))}
                {(!processo.documentos || processo.documentos.length === 0) && (
                  <div className="text-center py-6 opacity-50">
                    <FileText size={20} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nenhum anexo</p>
                  </div>
                )}
             </div>
           </div>

        </div>

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
