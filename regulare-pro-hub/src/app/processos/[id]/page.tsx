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
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) // Timeline custom edit
  const [isEditProcessoModalOpen, setIsEditProcessoModalOpen] = useState(false) // Full edit
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isUpdating, setIsUpdating] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [tarefaToEdit, setTarefaToEdit] = useState<any>(null)
  const [isProtocoloModalOpen, setIsProtocoloModalOpen] = useState(false)
  const [protocoloToEdit, setProtocoloToEdit] = useState<any>(null)

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

  const handleAddDocument = async () => {
    // Simulação de upload para testes operacionais
    const nome = prompt('Nome do Documento:')
    if (!nome) return
    const tipo = prompt('Tipo do Arquivo (PDF, DWG, PNG):', 'PDF')
    
    try {
      await fetch(`/api/processos/${params.id}/documentos`, {
        method: 'POST',
        body: JSON.stringify({
          nome,
          tipo: tipo || 'PDF',
          tamanho: Math.floor(Math.random() * 5000000), // Simula tamanho aleatório
          categoria: 'técnico',
          responsavel: 'JADSON CASTRO SANTANA'
        })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  const handleDeleteDocument = async (docId: string, nome: string) => {
    if (!confirm(`Deseja remover o documento "${nome}"?`)) return
    try {
      await fetch(`/api/processos/${params.id}/documentos`, {
        method: 'DELETE',
        body: JSON.stringify({ id: docId, processoId: params.id, nome })
      })
      await fetchProcesso()
    } catch (e) { console.error(e) }
  }

  const fetchProcesso = async () => {
    try {
      const r = await fetch(`/api/processos/${params.id}`)
      const d = await r.json()
      setProcesso(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProcesso()
  }, [params.id])

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
         <p className="text-sm text-slate-500 mt-2">O código de rastreio não corresponde a nenhum processo ativo.</p>
         <Link href="/processos" className="btn-primary mt-8 inline-flex px-8">Voltar para Central</Link>
      </div>
    </div>
  )

  const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

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
                       <span className="text-white/20">•</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criado em {new Date(processo.createdAt).toLocaleDateString('pt-BR')}</span>
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
                       <span className="text-white/10">|</span>
                       <div className="flex items-center gap-2">
                          <User size={14}/> Resp: <span className="text-blue-400 font-bold uppercase text-[10px] tracking-widest">{processo.responsavel || 'Não Atribuído'}</span>
                       </div>
                    </div>
                 </div>
              </div>

               <div className="flex items-center gap-3 self-end md:self-auto">
                 <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-right">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Status da Operação</p>
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

           {/* PROCESS TABS */}
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

      {/* CONTENT AREA */}
      <div className="max-w-[1500px] mx-auto px-6 py-10">
        
        {/* ── VISÃO GERAL ───────────────────────────────────────────── */}
        {tab === 'visao' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-2 space-y-8">
                
                {/* RESUMO EXECUTIVO */}
                <div className="card p-8 border-0 shadow-sm bg-white overflow-hidden relative">
                   <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-10 -mt-10" />
                   <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><LayoutGrid size={18} className="text-blue-500"/> Situação da Operação</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Última Atualização</p>
                         <p className="text-sm font-medium text-slate-700">
                            {processo.logs?.[0] ? `${processo.logs[0].acao}: ${processo.logs[0].detalhe || 'Sem detalhes'}` : 'Nenhuma movimentação registrada.'}
                         </p>
                         <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <Clock size={12}/> {processo.logs?.[0] ? `${new Date(processo.logs[0].createdAt).toLocaleDateString('pt-BR')} às ${new Date(processo.logs[0].createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} por ${processo.logs[0].usuario}` : 'Aguardando início'}
                         </div>
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

                {/* PRÓXIMAS AÇÕES */}
                <div className="card p-8 border-0 shadow-sm bg-white">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-slate-800">Próximos Marcos do Projeto</h3>
                      <button onClick={() => setTab('tarefas')} className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline">+ Adicionar Marco</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {processo.eventos?.length === 0 ? (
                         <div className="col-span-3 py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                            <p className="text-xs text-slate-400 italic">Nenhum evento agendado para este processo.</p>
                         </div>
                      ) : (
                        processo.eventos.slice(0, 3).map((m: any, i: number) => (
                           <div key={i} className={`p-4 rounded-2xl border-2 transition-all border-slate-50 bg-slate-50/30`}>
                              <div className="flex items-center justify-between mb-3">
                                 <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-500`}>{m.status}</span>
                                 <span className="text-[10px] font-bold text-slate-400 font-mono">{new Date(m.data_inicio).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 truncate">{m.titulo}</p>
                           </div>
                        ))
                      )}
                   </div>
                </div>

             </div>

             <div className="space-y-8">
                {/* ENTIDADES VINCULADAS */}
                <div className="card p-6 border-0 shadow-sm bg-white">
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Base da Operação</h3>
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <User size={20}/>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Contratante</p>
                            <Link href={`/clientes/${processo.clienteId}`} className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">{processo.cliente?.nome}</Link>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <Building2 size={20}/>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Objeto / Imóvel</p>
                            <Link href={`/imoveis/${processo.imovelId}`} className="text-sm font-bold text-slate-800 hover:text-purple-600 transition-colors line-clamp-1">{processo.imovel?.endereco}</Link>
                         </div>
                      </div>
                   </div>
                </div>

                {/* KPI RÁPIDO FINANCEIRO */}
                <div className="card p-6 border-0 shadow-sm bg-white">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financeiro</h3>
                      <button onClick={() => setTab('financeiro')} className="text-blue-600"><ArrowUpRight size={16}/></button>
                   </div>
                   <div className="space-y-4">
                      <div>
                         <p className="text-2xl font-bold tracking-tight text-blue-600">{fmt(Number(processo.valor_total) || 0)}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Valor do Contrato</p>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-blue-500 transition-all duration-1000" 
                           style={{ width: `${(Number(processo.valor_total) || 0) > 0 ? (Number(processo.valor_pago) || 0) / (Number(processo.valor_total) || 1) * 100 : 0}%` }} 
                         />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                            Recebido ({((Number(processo.valor_total) || 0) > 0 ? Math.round(((Number(processo.valor_pago) || 0) / (Number(processo.valor_total) || 1)) * 100) : 0)}%)
                         </span>
                         <span className="text-xs font-bold text-blue-600">{fmt(Number(processo.valor_pago) || 0)}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ── TIMELINE OPERACIONAL ─────────────────────────────────── */}
        {tab === 'timeline' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="card p-10 border-0 shadow-sm bg-white relative">
                <div className="flex items-center justify-between mb-12">
                   <div>
                      <h3 className="text-lg font-bold text-slate-900">Jornada da Operação</h3>
                      <p className="text-sm text-slate-500">Log inteligente de todas as movimentações técnicas</p>
                   </div>
                   <button onClick={() => setIsEditModalOpen(true)} className="btn-primary py-2 px-6 text-xs shadow-lg shadow-blue-100">Atualizar Status</button>
                </div>

                <div className="relative space-y-12 pl-10">
                   <div className="absolute left-[59px] top-4 bottom-4 w-0.5 bg-slate-100" />
                   
                   {processo.eventos?.length === 0 ? (
                      <div className="py-20 text-center italic text-slate-400">Nenhum evento registrado na timeline.</div>
                   ) : processo.eventos.map((item: any, i: number) => {
                      const Icon = item.tipo === 'tarefas' ? ListTodo : item.tipo === 'financeiro' ? DollarSign : GitBranch
                      return (
                        <div key={i} className="flex gap-8 relative z-10">
                           <div className="w-10 text-right shrink-0 pt-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 {new Date(item.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              </p>
                           </div>
                           <div className={`w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center shrink-0 bg-slate-50 text-slate-600`}>
                              <Icon size={16} />
                           </div>
                           <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[24px] flex-1 hover:bg-white hover:shadow-xl transition-all group">
                              <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">{item.titulo}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">{item.descricao}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Por: {item.responsavel}</p>
                           </div>
                        </div>
                      )
                   })}
                </div>
             </div>
          </div>
        )}

        {/* ── FINANCEIRO OPERACIONAL ───────────────────────────────── */}
        {tab === 'financeiro' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* FINANCE OVERVIEW */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-8 border-0 shadow-sm bg-white">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Wallet size={20}/></div>
                      <div><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receitas do Contrato</h3></div>
                   </div>
                   <div className="space-y-4">
                      <div><p className="text-3xl font-bold tracking-tight text-blue-600">{fmt(processo.valor_total)}</p><p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Valor Bruto Contratado</p></div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                         <div><p className="text-sm font-bold text-emerald-600">{fmt(processo.valor_pago)}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Já Recebido</p></div>
                         <div><p className="text-sm font-bold text-amber-600">{fmt(processo.valor_total - processo.valor_pago)}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Pendente</p></div>
                      </div>
                   </div>
                </div>

                <div className="card p-8 border-0 shadow-sm bg-white">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><Users size={20}/></div>
                      <div><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo com Parceiros</h3></div>
                   </div>
                   <div className="space-y-4">
                      <div><p className="text-3xl font-bold tracking-tight text-slate-800">{fmt(processo.financeiro?.filter((f: any) => f.tipo === 'despesa').reduce((acc: any, curr: any) => acc + curr.valor, 0) || 0)}</p><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total de Despesas Lançadas</p></div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                         <div><p className="text-sm font-bold text-red-500">{fmt(processo.financeiro?.filter((f: any) => f.tipo === 'despesa' && f.status === 'pago').reduce((acc: any, curr: any) => acc + curr.valor, 0) || 0)}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Pago</p></div>
                         <div><p className="text-sm font-bold text-slate-700">{fmt(processo.financeiro?.filter((f: any) => f.tipo === 'despesa' && f.status === 'pendente').reduce((acc: any, curr: any) => acc + curr.valor, 0) || 0)}</p><p className="text-[9px] text-slate-400 font-bold uppercase">A Pagar</p></div>
                      </div>
                   </div>
                </div>

                <div className="card p-8 border-0 shadow-sm bg-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-600"><TrendingUp size={120}/></div>
                   <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100"><TrendingUp size={20}/></div>
                      <div><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultado do Processo</h3></div>
                   </div>
                   <div className="space-y-4 relative z-10">
                      <div>
                         <p className="text-3xl font-bold tracking-tight text-slate-900">
                            {fmt(processo.valor_total - (processo.financeiro?.filter((f: any) => f.tipo === 'despesa').reduce((acc: any, curr: any) => acc + curr.valor, 0) || 0))}
                         </p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Margem Líquida Estimada</p>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 mt-4">
                         <span className="text-xs font-bold text-slate-500">Eficiência Financeira</span>
                         <span className="text-sm font-bold text-blue-600">
                            {Math.round(((processo.valor_total - (processo.financeiro?.filter((f: any) => f.tipo === 'despesa').reduce((acc: any, curr: any) => acc + curr.valor, 0) || 0)) / (processo.valor_total || 1)) * 100) || 0}%
                         </span>
                      </div>
                   </div>
                </div>
             </div>

             {/* DETALHAMENTO TABLE */}
             <div className="card border-0 shadow-sm bg-white overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                   <h3 className="text-sm font-bold text-slate-800">Fluxo de Caixa Operacional</h3>
                   <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase border border-slate-100">Exportar PDF</button>
                      <button className="btn-primary py-2 px-6 text-[10px] uppercase">+ Nova Transação</button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-8 py-4">Data</th>
                            <th className="px-8 py-4">Categoria / Descrição</th>
                            <th className="px-8 py-4 text-center">Status</th>
                            <th className="px-8 py-4 text-right">Valor (R$)</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                         {processo.financeiro?.length === 0 ? (
                            <tr><td colSpan={4} className="p-10 text-center italic text-slate-400">Nenhuma transação financeira registrada.</td></tr>
                         ) : processo.financeiro.map((f: any, i: number) => (
                           <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-5 text-slate-500">{new Date(f.createdAt).toLocaleDateString('pt-BR')}</td>
                              <td className="px-8 py-5">
                                 <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{f.descricao}</p>
                                 <p className="text-[9px] text-slate-400 uppercase mt-0.5">{f.categoria || f.tipo}</p>
                              </td>
                              <td className="px-8 py-5 text-center">
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${f.status === 'pago' || f.status === 'recebido' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {f.status}
                                 </span>
                              </td>
                              <td className={`px-8 py-5 text-right font-bold ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                                 {f.tipo === 'receita' ? '+' : '-'}{fmt(f.valor)}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

          </div>
        )}

        {/* ── DOCUMENTOS TÉCNICOS ──────────────────────────────────── */}
        {tab === 'documentos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* UPLOAD AREA */}
             <div 
               onClick={handleAddDocument}
               className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
             >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                   <Plus size={32}/>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Upload de Arquivos Técnicos</h3>
                <p className="text-xs text-slate-400 mt-2">Clique aqui para simular o upload de PDFs, plantas ou memoriais.</p>
             </div>

             {processo.documentos?.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-400 italic">Nenhum documento anexado.</div>
             ) : processo.documentos.map((doc: any, i: number) => (
               <div key={i} className="card p-6 border-0 shadow-sm bg-white group hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={20}/>
                     </div>
                     <div className="relative">
                        <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical size={18}/></button>
                     </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1 truncate" title={doc.nome}>{doc.nome}</h4>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{doc.tipo}</span>
                     <span className="text-[10px] text-slate-400 font-mono">{(doc.tamanho / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex gap-2">
                     <a 
                       href={doc.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex-1 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 text-[10px] font-bold uppercase rounded-lg transition-all border border-slate-100 flex items-center justify-center gap-1"
                     >
                        <Download size={12}/> Abrir
                     </a>
                     <button 
                       onClick={() => handleDeleteDocument(doc.id, doc.nome)}
                       className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-100"
                     >
                        <Trash2 size={14}/>
                     </button>
                  </div>
               </div>
             ))}

          </div>
        )}

        {/* ── TAREFAS OPERACIONAIS ─────────────────────────────────── */}
        {tab === 'tarefas' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="card p-8 border-0 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                   <div>
                      <h3 className="text-base font-bold text-slate-800">Checklist Operacional</h3>
                      <p className="text-xs text-slate-400">Tarefas críticas para finalização do processo</p>
                   </div>
                   <button onClick={() => setIsTaskModalOpen(true)} className="btn-primary py-2 px-6 text-[10px] uppercase tracking-widest">+ Nova Tarefa</button>
                </div>

                <div className="space-y-4">
                   {processo.tarefas?.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 italic">Nenhuma tarefa cadastrada.</div>
                   ) : processo.tarefas.map((t: any, i: number) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${t.status === 'concluido' ? 'bg-slate-50 border-slate-50 opacity-60' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}>
                         <button 
                           onClick={() => handleToggleTarefa(t.id, t.status)}
                           className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${t.status === 'concluido' ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white hover:border-blue-400'}`}
                         >
                            {t.status === 'concluido' && <Check size={14} className="text-white" />}
                         </button>
                         <div className="flex-1">
                            <p className={`text-sm font-bold ${t.status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{t.titulo}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <span className={`text-[9px] font-bold uppercase tracking-widest ${t.prioridade === 'urgente' ? 'text-red-500' : 'text-blue-500'}`}>{t.prioridade}</span>
                               <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10}/> {new Date(t.data).toLocaleDateString('pt-BR')}</span>
                               <span className="text-[10px] text-slate-400 flex items-center gap-1"><User size={10}/> {t.responsavel}</span>
                            </div>
                         </div>
                         <div className="flex gap-1">
                            <button 
                              onClick={() => { setTarefaToEdit(t); setIsTaskModalOpen(true) }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                               <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTarefa(t.id, t.titulo)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
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
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Building2 size={16} className="text-blue-500"/> Protocolos nos Órgãos Públicos</h3>
                      <button onClick={() => setIsProtocoloModalOpen(true)} className="btn-primary py-2 px-6 text-[10px] uppercase">+ Novo Protocolo</button>
                   </div>
                   
                   <div className="space-y-6">
                      {processo.protocolos?.length === 0 ? (
                         <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[32px] text-slate-400 italic">Nenhum protocolo externo registrado.</div>
                      ) : processo.protocolos.map((prot: any, i: number) => (
                        <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm font-bold text-blue-600">
                                    {prot.orgao.substring(0, 2).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-800">{prot.orgao}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nº {prot.numero_protocolo}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${prot.status === 'concluido' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {prot.status}
                                 </span>
                                 <button onClick={() => { setProtocoloToEdit(prot); setIsProtocoloModalOpen(true) }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-all"><Edit size={14}/></button>
                                 <button onClick={() => handleDeleteProtocolo(prot.id, prot.orgao)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-all"><Trash2 size={14}/></button>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Data Início</p><p className="text-xs font-bold text-slate-700">{new Date(prot.data).toLocaleDateString('pt-BR')}</p></div>
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Prazo Previsto</p><p className="text-xs font-bold text-slate-700">{prot.prazo ? new Date(prot.prazo).toLocaleDateString('pt-BR') : '—'}</p></div>
                              <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Última Movimentação</p><p className="text-xs font-bold text-slate-700">{new Date(prot.updatedAt).toLocaleDateString('pt-BR')}</p></div>
                           </div>
                           {prot.observacao && (
                             <div className="bg-white rounded-2xl p-4 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Notas do Protocolo</p>
                                <p className="text-xs text-slate-500 italic">{prot.observacao}</p>
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="card p-6 border-0 shadow-sm bg-slate-900 text-white">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Central de Trâmites</h3>
                   <p className="text-sm text-slate-400 mb-6">Gerencie o fluxo burocrático em prefeituras, cartórios e órgãos de classe.</p>
                   <button onClick={() => setIsProtocoloModalOpen(true)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20">Registrar Novo Trâmite</button>
                   <button onClick={() => fetchProcesso()} className="w-full mt-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Sincronizar Dados
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* ── HISTÓRICO DE LOG ─────────────────────────────────────── */}
        {tab === 'historico' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="card border-0 shadow-sm bg-white overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                   <h3 className="text-sm font-bold text-slate-800">Log de Auditoria</h3>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rastreabilidade Total</span>
                </div>
                <div className="divide-y divide-slate-50">
                   {processo.logs?.length === 0 ? (
                      <div className="p-20 text-center text-slate-400 italic">Sem registros de auditoria.</div>
                   ) : processo.logs.map((log: any, i: number) => (
                     <div key={i} className="px-8 py-5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{log.modulo}</span>
                              <p className="text-xs font-bold text-slate-800">{log.acao}</p>
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {new Date(log.createdAt).toLocaleDateString('pt-BR')} às {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{log.detalhe}</p>
                        <p className="text-[9px] font-bold text-blue-600 mt-2">Agente: {log.usuario}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

      </div>

      {/* MODAL: EDITAR STATUS / PROCESSO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Atualizar Status Operacional</h2>
                <p className="text-xs text-slate-500 font-medium">Isso registrará um evento na timeline e log de auditoria</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-colors"><X/></button>
            </div>
            <form onSubmit={(e) => {
               e.preventDefault()
               const form = e.target as HTMLFormElement
               handleUpdateStatus(
                 (form.elements.namedItem('status') as HTMLSelectElement).value,
                 (form.elements.namedItem('observacoes') as HTMLTextAreaElement).value
               )
            }} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Novo Status</label>
                     <select name="status" defaultValue={processo.status} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold">
                        <option value="em_analise">Análise Inicial</option>
                        <option value="levantamento">Levantamento Técnico</option>
                        <option value="projeto">Elaboração de Projeto</option>
                        <option value="protocolo_prefeitura">Protocolo Prefeitura</option>
                        <option value="exigencia_tecnica">Exigência Técnica</option>
                        <option value="em_aprovacao">Em Aprovação</option>
                        <option value="cartorio">Trâmite Cartorial</option>
                        <option value="finalizado">Finalizado / Concluído</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Responsável Técnico</label>
                     <input type="text" name="responsavel" defaultValue={processo.responsavel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Notas da Movimentação (Detalhes)</label>
                  <textarea name="observacoes" rows={4} placeholder="Descreva o que foi feito nesta etapa..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
               </div>
               <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all">Cancelar</button>
                  <button type="submit" disabled={isUpdating} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                     {isUpdating ? <Loader2 size={18} className="animate-spin"/> : 'Confirmar Atualização'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA TAREFA */}
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
                  prioridade: (form.elements.namedItem('prioridade') as HTMLSelectElement).value,
                  responsavel: (form.elements.namedItem('responsavel') as HTMLInputElement).value,
                  data: (form.elements.namedItem('data') as HTMLInputElement).value,
                  processoId: params.id
               }
               
               const method = tarefaToEdit ? 'PATCH' : 'POST'
               await fetch(`/api/processos/${params.id}/tarefas`, { method, body: JSON.stringify(data) })
               await fetchProcesso()
               setIsTaskModalOpen(false)
               setTarefaToEdit(null)
            }} className="p-8 space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Título da Tarefa</label>
                  <input name="titulo" required type="text" defaultValue={tarefaToEdit?.titulo} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Prioridade</label>
                     <select name="prioridade" defaultValue={tarefaToEdit?.prioridade || 'normal'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="baixa">Baixa</option>
                        <option value="normal">Normal</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Data Limite</label>
                     <input name="data" required type="date" defaultValue={tarefaToEdit?.data ? new Date(tarefaToEdit.data).toISOString().split('T')[0] : ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Responsável</label>
                  <input name="responsavel" required type="text" defaultValue={tarefaToEdit?.responsavel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
               </div>
               <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => { setIsTaskModalOpen(false); setTarefaToEdit(null) }} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl">{tarefaToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PROTOCOLO */}
      {isProtocoloModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h2 className="text-lg font-bold text-slate-900">{protocoloToEdit ? 'Editar Protocolo' : 'Registrar Trâmite Externo'}</h2>
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
                  observacao: (form.elements.namedItem('observacao') as HTMLTextAreaElement).value,
                  processoId: params.id
               }
               
               const method = protocoloToEdit ? 'PATCH' : 'POST'
               await fetch(`/api/processos/${params.id}/protocolos`, { method, body: JSON.stringify(data) })
               await fetchProcesso()
               setIsProtocoloModalOpen(false)
               setProtocoloToEdit(null)
            }} className="p-8 space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Órgão Público</label>
                  <input name="orgao" required placeholder="Ex: Prefeitura, Cartório, CREA..." type="text" defaultValue={protocoloToEdit?.orgao} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nº Protocolo / Processo</label>
                  <input name="numero_protocolo" required type="text" defaultValue={protocoloToEdit?.numero_protocolo} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Data de Entrada</label>
                     <input name="data" required type="date" defaultValue={protocoloToEdit?.data ? new Date(protocoloToEdit.data).toISOString().split('T')[0] : ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Prazo Previsto</label>
                     <input name="prazo" type="date" defaultValue={protocoloToEdit?.prazo ? new Date(protocoloToEdit.prazo).toISOString().split('T')[0] : ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Status do Trâmite</label>
                  <select name="status" defaultValue={protocoloToEdit?.status || 'em_analise'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold">
                     <option value="em_analise">Em Análise</option>
                     <option value="exigencia">Com Exigência</option>
                     <option value="aprovado">Aprovado</option>
                     <option value="concluido">Concluído / Retirado</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Observações do Protocolo</label>
                  <textarea name="observacao" rows={3} defaultValue={protocoloToEdit?.observacao} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
               </div>
               <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => { setIsProtocoloModalOpen(false); setProtocoloToEdit(null) }} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl">{protocoloToEdit ? 'Salvar Alterações' : 'Registrar Protocolo'}</button>
               </div>
            </form>
          </div>
        </div>
      )}
      {/* MODALS */}
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
        title="Tem certeza que deseja excluir este processo?"
        description={<p>Esta ação removerá o processo <strong>{processo?.codigo_projeto}</strong> permanentemente.</p>}
      />

    </div>
  )
}
