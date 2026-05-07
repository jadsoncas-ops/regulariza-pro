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
  MoreVertical, Download, Trash2, RefreshCw, AlertCircle,
  MoreHorizontal, Copy, Trash, Archive, ShieldAlert
} from 'lucide-react'

// --- Configuração de Status Padronizada ---
const STATUS_OPTIONS = [
  { value: 'em_analise',           label: 'Análise Inicial',      color: 'blue' },
  { value: 'levantamento',         label: 'Levantamento Técnico', color: 'amber' },
  { value: 'projeto',              label: 'Projeto em Estudo',    color: 'purple' },
  { value: 'protocolo_prefeitura', label: 'Protocolo Prefeitura', color: 'blue' },
  { value: 'exigencia_tecnica',    label: 'Exigência Técnica',    color: 'red' },
  { value: 'em_aprovacao',         label: 'Em Aprovação',         color: 'emerald' },
  { value: 'cartorio',             label: 'Trâmite Cartorial',    color: 'indigo' },
  { value: 'finalizado',           label: 'Finalizado',           color: 'emerald' },
]

const TABS = [
  { id: 'visao',      label: 'Visão Geral',    icon: LayoutGrid },
  { id: 'timeline',   label: 'Timeline',       icon: GitBranch },
  { id: 'financeiro', label: 'Financeiro',     icon: DollarSign },
  { id: 'documentos', label: 'Documentos',     icon: FileText },
  { id: 'tarefas',    label: 'Tarefas',        icon: ListTodo },
  { id: 'prefeitura', label: 'Prefeitura',     icon: Building2 },
  { id: 'historico',  label: 'Auditoria',      icon: History },
]

export default function ProcessoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tab, setTab] = useState('visao')
  const [processo, setProcesso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Modais
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const fetchProcesso = async () => {
    try {
      const r = await fetch(`/api/processos/${params.id}`)
      if (!r.ok) throw new Error()
      const d = await r.json()
      setProcesso(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProcesso() }, [params.id])

  // --- Helpers Operacionais ---
  const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  
  const getStatusLabel = (val: string) => STATUS_OPTIONS.find(o => o.value === val)?.label || val
  
  const getTaskStatus = (t: any) => {
    if (t.status === 'concluido') return 'concluido'
    if (new Date(t.data) < new Date() && t.status !== 'concluido') return 'atrasada'
    return t.status
  }

  // --- CRUD Actions ---
  const handleAction = async (method: string, endpoint: string, body: any) => {
    setIsActionLoading(true)
    try {
      const r = await fetch(`/api/processos/${params.id}/${endpoint}`, {
        method,
        body: JSON.stringify(body)
      })
      if (r.ok) {
        await fetchProcesso()
        setActiveModal(null)
        setEditData(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsActionLoading(false)
    }
  }

  if (loading && !processo) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sincronizando Módulos...</p>
    </div>
  )

  if (!processo) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="card p-10 text-center max-w-sm">
         <ShieldAlert size={40} className="text-red-500 mx-auto mb-4"/>
         <h2 className="text-lg font-bold text-slate-900">Operação não localizada</h2>
         <p className="text-xs text-slate-500 mt-2">O identificador informado não corresponde a nenhum processo ativo no banco Neon.</p>
         <Link href="/processos" className="btn-primary mt-6 w-full justify-center">Voltar para Listagem</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* HEADER CORPORATIVO DENSO */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <Link href="/processos" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
                    <ArrowLeft size={16} className="text-slate-500"/>
                 </Link>
                 <div>
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className="protocol-id text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {processo.codigo_projeto || `#${processo.id.substring(0,8).toUpperCase()}`}
                       </span>
                       <span className="text-slate-300">/</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{processo.categoria || 'Regularização'}</span>
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">{processo.tipo_regularizacao}</h1>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="hidden md:flex flex-col items-end border-r border-slate-100 pr-4 mr-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status Atual</p>
                    <p className="text-sm font-bold text-slate-800">{getStatusLabel(processo.status)}</p>
                 </div>
                 <button 
                   onClick={() => { setEditData(processo); setActiveModal('processo') }}
                   className="btn-primary py-2 px-4 text-xs"
                 >
                    <Edit size={14} /> Editar Operação
                 </button>
              </div>
           </div>

           {/* NAVEGAÇÃO DE ABAS COMPACTA */}
           <div className="flex items-center gap-1 mt-4 -mb-3 overflow-x-auto no-scrollbar">
              {TABS.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold transition-all border-b-2 whitespace-nowrap ${
                    tab === t.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        
        {/* --- VISÃO GERAL (PAINEL DINÂMICO) --- */}
        {tab === 'visao' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-up">
             
             {/* SITUAÇÃO DA OPERAÇÃO */}
             <div className="lg:col-span-3 space-y-6">
                <div className="card overflow-hidden">
                   <div className="card-header bg-slate-50/50">
                      <h3 className="card-title flex items-center gap-2"><Activity size={14} className="text-blue-500"/> Situação em Tempo Real</h3>
                      <button onClick={() => fetchProcesso()} className="text-slate-400 hover:text-blue-600"><RefreshCw size={12}/></button>
                   </div>
                   <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                         <div>
                            <p className="text-label mb-1">Última Movimentação</p>
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                               {processo.logs?.[0] ? `${processo.logs[0].acao}: ${processo.logs[0].detalhe}` : 'Aguardando início operacional.'}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1 font-medium">{processo.logs?.[0] ? new Date(processo.logs[0].createdAt).toLocaleString('pt-BR') : '—'}</p>
                         </div>
                         <div className="pt-4 border-t border-slate-50">
                            <p className="text-label mb-1">Responsável Técnico</p>
                            <div className="flex items-center gap-2">
                               <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[8px] text-white font-bold">JC</div>
                               <span className="text-xs font-bold text-slate-700">{processo.responsavel || 'Não Atribuído'}</span>
                            </div>
                         </div>
                      </div>

                      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                         <p className="text-label mb-3">Principais Pendências</p>
                         <div className="space-y-3">
                            {/* Tarefas Atrasadas/Pendentes */}
                            {processo.tarefas?.filter((t: any) => t.status === 'pendente').slice(0, 2).map((t: any) => (
                               <div key={t.id} className="flex items-start gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${getTaskStatus(t) === 'atrasada' ? 'bg-red-500' : 'bg-amber-500'}`}/>
                                  <div>
                                     <p className="text-[11px] font-bold text-slate-700 line-clamp-1">{t.titulo}</p>
                                     <p className="text-[9px] text-slate-400">Prazo: {new Date(t.data).toLocaleDateString('pt-BR')}</p>
                                  </div>
                               </div>
                            ))}
                            {/* Documentos Pendentes */}
                            {processo.documentos?.filter((d: any) => d.status === 'pendente').slice(0, 1).map((d: any) => (
                               <div key={d.id} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-blue-500"/>
                                  <div>
                                     <p className="text-[11px] font-bold text-slate-700">Doc: {d.nome}</p>
                                     <p className="text-[9px] text-slate-400">Aguardando upload</p>
                                  </div>
                               </div>
                            ))}
                            {processo.tarefas?.length === 0 && processo.documentos?.length === 0 && (
                               <p className="text-[10px] italic text-slate-400">Nenhuma pendência crítica.</p>
                            )}
                         </div>
                      </div>

                      <div className="flex flex-col justify-between">
                         <div>
                            <p className="text-label mb-1">Último Protocolo</p>
                            {processo.protocolos?.[0] ? (
                               <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-800">{processo.protocolos[0].orgao}</span>
                                  <span className="badge badge-blue">{processo.protocolos[0].status}</span>
                               </div>
                            ) : <p className="text-[11px] text-slate-400">Nenhum trâmite registrado.</p>}
                         </div>
                         <div className="pt-4 border-t border-slate-50 flex gap-2">
                            <button onClick={() => setTab('timeline')} className="flex-1 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-all uppercase tracking-wider">Timeline</button>
                            <button onClick={() => setTab('prefeitura')} className="flex-1 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-all uppercase tracking-wider">Protocolos</button>
                         </div>
                      </div>
                   </div>
                </div>

                {/* PRÓXIMOS MARCOS (DINÂMICOS) */}
                <div className="card">
                   <div className="card-header">
                      <h3 className="card-title">Próximos Marcos Operacionais</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Projeção Baseada em Prazos</p>
                   </div>
                   <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                      {processo.tarefas?.filter((t: any) => t.status === 'pendente').sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()).slice(0, 4).map((m: any) => (
                         <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
                            <div className="flex items-center justify-between mb-2">
                               <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">TAREFA</span>
                               <span className="text-[10px] font-mono text-slate-400">{new Date(m.data).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-700 truncate mb-1">{m.titulo}</p>
                            <div className="flex items-center gap-1">
                               <Clock size={10} className="text-slate-300"/>
                               <span className="text-[9px] text-slate-400 uppercase font-bold">{m.prioridade}</span>
                            </div>
                         </div>
                      ))}
                      {processo.protocolos?.filter((p: any) => p.status !== 'concluido').slice(0, 2).map((m: any) => (
                         <div key={m.id} className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="flex items-center justify-between mb-2">
                               <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">PROTOCOLO</span>
                               <span className="text-[10px] font-mono text-slate-400">{m.prazo ? new Date(m.prazo).toLocaleDateString('pt-BR') : 'S/P'}</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-700 truncate mb-1">{m.orgao}</p>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Acompanhamento</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* SIDEBAR OPERACIONAL */}
             <div className="space-y-6">
                {/* Entidades Relacionadas */}
                <div className="card p-4 space-y-4">
                   <div>
                      <p className="text-label mb-2">Contratante</p>
                      <Link href={`/clientes/${processo.clienteId}`} className="flex items-center gap-3 group">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <User size={16}/>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{processo.cliente?.nome}</p>
                            <p className="text-[10px] text-slate-400">{processo.cliente?.cidade}</p>
                         </div>
                      </Link>
                   </div>
                   <div className="pt-4 border-t border-slate-50">
                      <p className="text-label mb-2">Objeto da Regularização</p>
                      <Link href={`/imoveis/${processo.imovelId}`} className="flex items-center gap-3 group">
                         <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <Building2 size={16}/>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-1">{processo.imovel?.endereco}</p>
                            <p className="text-[10px] text-slate-400">{processo.imovel?.bairro}</p>
                         </div>
                      </Link>
                   </div>
                </div>

                {/* KPI Financeiro Sidebar */}
                <div className="card bg-slate-900 p-5 text-white">
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contrato Financeiro</p>
                      <button onClick={() => setTab('financeiro')} className="text-blue-400 hover:text-white transition-colors"><ArrowUpRight size={14}/></button>
                   </div>
                   <div className="space-y-4">
                      <div>
                         <p className="text-xl font-bold tracking-tight text-white">{fmt(processo.valor_total)}</p>
                         <p className="text-[9px] text-slate-500 font-bold uppercase">Valor Total do Serviço</p>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-blue-500 transition-all duration-1000" 
                           style={{ width: `${(processo.valor_pago / processo.valor_total) * 100 || 0}%` }} 
                         />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                         <span className="text-emerald-400 uppercase">Recebido ({Math.round((processo.valor_pago / processo.valor_total) * 100) || 0}%)</span>
                         <span className="text-white">{fmt(processo.valor_pago)}</span>
                      </div>
                   </div>
                </div>
             </div>

          </div>
        )}

        {/* --- TIMELINE (COMPACTA) --- */}
        {tab === 'timeline' && (
          <div className="max-w-3xl mx-auto animate-fade-up">
             <div className="card overflow-hidden">
                <div className="card-header bg-slate-50/50">
                   <h3 className="card-title">Jornada do Processo</h3>
                   <div className="flex items-center gap-2">
                      <button className="btn-ghost text-[10px] h-7 px-2"><Filter size={12}/> Filtrar</button>
                      <button onClick={() => setActiveModal('log_manual')} className="btn-primary py-1 px-3 text-[10px] uppercase">+ Lançamento Manual</button>
                   </div>
                </div>
                <div className="p-8 relative">
                   <div className="absolute left-[39px] top-8 bottom-8 w-px bg-slate-100" />
                   
                   <div className="space-y-6 relative">
                      {processo.logs?.length === 0 ? (
                         <div className="py-20 text-center italic text-slate-400 text-xs">Nenhum evento registrado nesta jornada.</div>
                      ) : processo.logs.map((log: any, i: number) => {
                        const Icon = log.modulo === 'FINANCEIRO' ? DollarSign : log.modulo === 'TAREFAS' ? ListTodo : log.modulo === 'DOCUMENTOS' ? FileText : GitBranch
                        return (
                           <div key={log.id} className="flex gap-6 group">
                              <div className="w-12 text-right shrink-0 pt-1.5">
                                 <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">{new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                 <p className="text-[8px] text-slate-300 font-mono mt-1">{new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <div className="w-6 h-6 rounded-lg bg-white border-2 border-slate-100 flex items-center justify-center shrink-0 relative z-10 group-hover:border-blue-500 group-hover:text-blue-600 transition-all shadow-sm">
                                 <Icon size={12}/>
                              </div>
                              <div className="flex-1 pb-2">
                                 <div className="flex items-center gap-2 mb-0.5">
                                    <h4 className="text-[11px] font-bold text-slate-800">{log.acao}</h4>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{log.modulo}</span>
                                 </div>
                                 <p className="text-[11px] text-slate-500 leading-tight">{log.detalhe}</p>
                                 <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">Operador: {log.usuario}</p>
                              </div>
                           </div>
                        )
                      })}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- TAREFAS (SISTEMA PROFISSIONAL) --- */}
        {tab === 'tarefas' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-fade-up">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <h3 className="text-sm font-bold text-slate-800">Checklist Operacional</h3>
                   <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button className="px-2 py-1 text-[9px] font-bold uppercase bg-white shadow-sm rounded-md text-blue-600">Pendentes</button>
                      <button className="px-2 py-1 text-[9px] font-bold uppercase text-slate-400">Concluídas</button>
                   </div>
                </div>
                <button 
                  onClick={() => { setEditData(null); setActiveModal('tarefa') }}
                  className="btn-primary py-1.5 px-4 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/5"
                >
                   <Plus size={14}/> Criar Nova Tarefa
                </button>
             </div>

             <div className="grid grid-cols-1 gap-2">
                {processo.tarefas?.length === 0 ? (
                   <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 italic text-xs">Nenhuma tarefa operacional cadastrada.</div>
                ) : processo.tarefas.sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()).map((t: any) => {
                   const status = getTaskStatus(t)
                   return (
                      <div key={t.id} className={`flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-all group ${status === 'concluido' ? 'opacity-50' : ''}`}>
                         <button 
                           onClick={() => handleAction('PATCH', 'tarefas', { id: t.id, status: status === 'concluido' ? 'pendente' : 'concluido' })}
                           className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${status === 'concluido' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-blue-500'}`}
                         >
                            {status === 'concluido' && <Check size={12} className="text-white"/>}
                         </button>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                               <p className={`text-xs font-bold ${status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.titulo}</p>
                               {status === 'atrasada' && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 uppercase">Atrasada</span>}
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                               <div className="flex items-center gap-1"><Calendar size={10}/> {new Date(t.data).toLocaleDateString('pt-BR')} {t.hora || ''}</div>
                               <div className="flex items-center gap-1"><User size={10}/> {t.responsavel || '—'}</div>
                               <div className="flex items-center gap-1"><Tag size={10}/> {t.prioridade}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <button 
                              onClick={() => { setEditData(t); setActiveModal('tarefa') }}
                              className="p-1.5 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                            >
                               <Edit size={14}/>
                            </button>
                            <button 
                              onClick={() => { if(confirm('Excluir tarefa?')) handleAction('DELETE', 'tarefas', { id: t.id, titulo: t.titulo }) }}
                              className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                               <Trash2 size={14}/>
                            </button>
                            <button className="p-1.5 text-slate-300 hover:text-slate-900">
                               <MoreVertical size={16}/>
                            </button>
                         </div>
                      </div>
                   )
                })}
             </div>
          </div>
        )}

        {/* --- PREFEITURA / ÓRGÃOS --- */}
        {tab === 'prefeitura' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Trâmites em Órgãos Públicos</h3>
                <button 
                  onClick={() => { setEditData(null); setActiveModal('protocolo') }}
                  className="btn-primary py-1.5 px-4 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/5"
                >
                   <Plus size={14}/> Registrar Trâmite
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processo.protocolos?.length === 0 ? (
                   <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 italic text-xs">Nenhum protocolo registrado.</div>
                ) : processo.protocolos.map((p: any) => (
                   <div key={p.id} className="card p-4 group hover:border-blue-400 transition-all">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                               {p.orgao.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                               <h4 className="text-xs font-bold text-slate-800">{p.orgao}</h4>
                               <p className="protocol-id text-[9px] font-bold text-blue-600 uppercase">Nº {p.numero_protocolo}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className={`badge ${p.status === 'aprovado' || p.status === 'concluido' ? 'badge-green' : p.status === 'exigencia' ? 'badge-red' : 'badge-blue'}`}>
                               {p.status.replace(/_/g, ' ')}
                            </span>
                            <div className="relative">
                               <button className="p-1 text-slate-300 hover:text-slate-600"><MoreHorizontal size={16}/></button>
                            </div>
                         </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 mb-3">
                         <div><p className="text-label mb-1">Abertura</p><p className="text-[10px] font-bold text-slate-700">{new Date(p.data).toLocaleDateString('pt-BR')}</p></div>
                         <div><p className="text-label mb-1">Prazo</p><p className="text-[10px] font-bold text-slate-700">{p.prazo ? new Date(p.prazo).toLocaleDateString('pt-BR') : '—'}</p></div>
                         <div><p className="text-label mb-1">Ataliz.</p><p className="text-[10px] font-bold text-slate-700">{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</p></div>
                      </div>
                      {p.observacao && <p className="text-[10px] text-slate-500 italic line-clamp-2 mb-3">"{p.observacao}"</p>}
                      <div className="flex gap-2">
                         <button 
                           onClick={() => { setEditData(p); setActiveModal('protocolo') }}
                           className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded-lg border border-slate-200 transition-all"
                         >
                            Editar
                         </button>
                         <button 
                           onClick={() => { if(confirm('Remover protocolo?')) handleAction('DELETE', 'protocolos', { id: p.id, orgao: p.orgao }) }}
                           className="px-3 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 text-[9px] font-bold uppercase rounded-lg border border-red-100 transition-all"
                         >
                            <Trash2 size={12}/>
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* --- FINANCEIRO (CRUD COMPLETO) --- */}
        {tab === 'financeiro' && (
          <div className="space-y-6 animate-fade-up">
             
             {/* INDICADORES COMPACTOS */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                   { label: 'Contrato Bruto', value: fmt(processo.valor_total), icon: DollarSign, color: 'text-slate-900', bg: 'bg-white' },
                   { label: 'Recebido / Pago', value: fmt(processo.valor_pago), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/30' },
                   { label: 'Pendente', value: fmt(processo.valor_total - processo.valor_pago), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/30' },
                   { label: 'Margem Líquida', value: `${Math.round((processo.valor_pago / processo.valor_total) * 100) || 0}%`, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50/30' },
                ].map((k, i) => (
                   <div key={i} className={`card p-4 flex flex-col justify-between ${k.bg}`}>
                      <div className="flex items-center justify-between mb-3">
                         <div className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 shadow-sm"><k.icon size={14}/></div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{k.label}</p>
                      </div>
                      <p className={`text-lg font-bold tracking-tight ${k.color}`}>{k.value}</p>
                   </div>
                ))}
             </div>

             {/* FLUXO DE CAIXA OPERACIONAL */}
             <div className="card overflow-hidden">
                <div className="card-header bg-slate-50/50">
                   <h3 className="card-title">Fluxo de Caixa da Operação</h3>
                   <div className="flex gap-2">
                      <button className="btn-ghost text-[10px] h-7 px-2"><Download size={12}/> Exportar</button>
                      <button 
                        onClick={() => { setEditData(null); setActiveModal('financeiro') }}
                        className="btn-primary py-1 px-4 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/5"
                      >
                         + Novo Lançamento
                      </button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-6 py-3">Vencimento</th>
                            <th className="px-6 py-3">Descrição / Categoria</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-right">Valor (R$)</th>
                            <th className="px-6 py-3"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                         {processo.financeiro?.length === 0 ? (
                            <tr><td colSpan={5} className="p-16 text-center italic text-slate-400">Nenhum lançamento financeiro registrado.</td></tr>
                         ) : processo.financeiro.map((f: any) => (
                           <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-4 font-mono text-slate-500">{f.data_vencimento ? new Date(f.data_vencimento).toLocaleDateString('pt-BR') : '—'}</td>
                              <td className="px-6 py-4">
                                 <p className="font-bold text-slate-800">{f.descricao}</p>
                                 <p className="text-[9px] text-slate-400 uppercase mt-0.5">{f.categoria || f.tipo}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`badge ${f.status === 'pago' || f.status === 'recebido' ? 'badge-green' : 'badge-amber'}`}>
                                    {f.status}
                                 </span>
                              </td>
                              <td className={`px-6 py-4 text-right font-bold ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                                 {f.tipo === 'receita' ? '+' : '-'}{fmt(f.valor)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-1">
                                    <button 
                                      onClick={() => { setEditData(f); setActiveModal('financeiro') }}
                                      className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors"
                                    >
                                       <Edit size={14}/>
                                    </button>
                                    <button 
                                      onClick={() => { if(confirm('Excluir lançamento?')) handleAction('DELETE', 'financeiro', { id: f.id, descricao: f.descricao }) }}
                                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                    >
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

        {/* --- DOCS TÉCNICOS --- */}
        {tab === 'documentos' && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-up">
             <div 
               onClick={() => setActiveModal('upload')}
               className="col-span-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-white hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer group shadow-sm"
             >
                <Plus size={24} className="text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-2"/>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Anexar Documento Técnico</p>
                <p className="text-[9px] text-slate-400 mt-1">PDF, DWG, PNG, JPG (Máx 50MB)</p>
             </div>

             {processo.documentos?.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-300 text-xs italic">Nenhum documento anexado ao processo.</div>
             ) : processo.documentos.map((doc: any) => (
                <div key={doc.id} className="card p-3 group hover:border-blue-400 transition-all">
                   <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                         <FileText size={16}/>
                      </div>
                      <button 
                        onClick={() => { if(confirm('Remover arquivo?')) handleAction('DELETE', 'documentos', { id: doc.id, processoId: params.id, nome: doc.nome }) }}
                        className="p-1 text-slate-200 hover:text-red-500 transition-colors"
                      >
                         <Trash2 size={14}/>
                      </button>
                   </div>
                   <h4 className="text-[10px] font-bold text-slate-800 truncate mb-1" title={doc.nome}>{doc.nome}</h4>
                   <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 uppercase">{doc.tipo}</span>
                      <a href={doc.url} target="_blank" className="text-blue-600 hover:underline text-[9px] font-bold">ABRIR</a>
                   </div>
                </div>
             ))}
          </div>
        )}

        {/* --- AUDITORIA / LOGS --- */}
        {tab === 'historico' && (
          <div className="max-w-4xl mx-auto animate-fade-up">
             <div className="card overflow-hidden">
                <div className="card-header bg-slate-50/50">
                   <h3 className="card-title">Log de Auditoria Completo</h3>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {processo.id}</span>
                </div>
                <div className="divide-y divide-slate-50">
                   {processo.logs?.length === 0 ? (
                      <div className="p-20 text-center text-slate-400 italic text-xs">Sem registros de auditoria.</div>
                   ) : processo.logs.map((log: any) => (
                     <div key={log.id} className="px-6 py-3.5 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <User size={14}/>
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                 <span className="text-[9px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase">{log.modulo}</span>
                                 <p className="text-[11px] font-bold text-slate-800">{log.acao}</p>
                              </div>
                              <p className="text-[10px] text-slate-500">{log.detalhe}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-[10px] font-bold text-slate-800">{log.usuario}</p>
                           <p className="text-[9px] text-slate-400 font-mono">{new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

      </div>

      {/* --- MODAIS DE EDIÇÃO / CRIAÇÃO --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                 <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                    {editData ? 'Editar' : 'Novo(a)'} {activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}
                 </h2>
                 <button onClick={() => { setActiveModal(null); setEditData(null) }} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={18}/></button>
              </div>
              
              <form onSubmit={async (e) => {
                 e.preventDefault()
                 const formData = new FormData(e.target as HTMLFormElement)
                 const data: any = {}
                 formData.forEach((val, key) => data[key] = val)
                 
                 const method = editData ? 'PATCH' : 'POST'
                 const endpoint = activeModal === 'processo' ? '' : activeModal
                 const body = editData ? { ...data, id: editData.id } : data
                 
                 // Para o processo, o endpoint é o ID do params
                 if (activeModal === 'processo') {
                    await fetch(`/api/processos/${params.id}`, { method: 'PATCH', body: JSON.stringify(data) })
                    await fetchProcesso()
                    setActiveModal(null)
                    return
                 }

                 await handleAction(method, endpoint, body)
              }} className="p-6 space-y-4">
                 
                 {/* MODAL: PROCESSO */}
                 {activeModal === 'processo' && (
                    <div className="space-y-4">
                       <div>
                          <label className="text-label mb-1.5 block">Título do Serviço</label>
                          <input name="tipo_regularizacao" defaultValue={editData?.tipo_regularizacao} className="input-field" required />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-label mb-1.5 block">Código / Protocolo</label>
                             <input name="codigo_projeto" defaultValue={editData?.codigo_projeto} className="input-field font-mono" />
                          </div>
                          <div>
                             <label className="text-label mb-1.5 block">Responsável</label>
                             <input name="responsavel" defaultValue={editData?.responsavel} className="input-field" />
                          </div>
                       </div>
                       <div>
                          <label className="text-label mb-1.5 block">Status da Operação</label>
                          <select name="status" defaultValue={editData?.status} className="select-field w-full">
                             {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                       </div>
                    </div>
                 )}

                 {/* MODAL: TAREFA */}
                 {activeModal === 'tarefa' && (
                    <div className="space-y-4">
                       <div>
                          <label className="text-label mb-1.5 block">Título da Tarefa</label>
                          <input name="titulo" defaultValue={editData?.titulo} className="input-field" required />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-label mb-1.5 block">Data Limite</label>
                             <input name="data" type="date" defaultValue={editData?.data ? new Date(editData.data).toISOString().split('T')[0] : ''} className="input-field" required />
                          </div>
                          <div>
                             <label className="text-label mb-1.5 block">Prioridade</label>
                             <select name="prioridade" defaultValue={editData?.prioridade || 'normal'} className="select-field w-full">
                                <option value="baixa">Baixa</option>
                                <option value="normal">Normal</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="text-label mb-1.5 block">Responsável</label>
                          <input name="responsavel" defaultValue={editData?.responsavel} className="input-field" />
                       </div>
                    </div>
                 )}

                 {/* MODAL: PROTOCOLO */}
                 {activeModal === 'protocolo' && (
                    <div className="space-y-4">
                       <div>
                          <label className="text-label mb-1.5 block">Órgão Público</label>
                          <input name="orgao" defaultValue={editData?.orgao} className="input-field" required placeholder="Ex: Prefeitura, Cartório..." />
                       </div>
                       <div>
                          <label className="text-label mb-1.5 block">Nº Protocolo / Processo</label>
                          <input name="numero_protocolo" defaultValue={editData?.numero_protocolo} className="input-field font-mono" required />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-label mb-1.5 block">Data Entrada</label>
                             <input name="data" type="date" defaultValue={editData?.data ? new Date(editData.data).toISOString().split('T')[0] : ''} className="input-field" required />
                          </div>
                          <div>
                             <label className="text-label mb-1.5 block">Status</label>
                             <select name="status" defaultValue={editData?.status || 'protocolado'} className="select-field w-full">
                                <option value="protocolado">Protocolado</option>
                                <option value="em_analise">Em Análise</option>
                                <option value="exigencia">Exigência</option>
                                <option value="aprovado">Aprovado</option>
                                <option value="concluido">Concluído</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* MODAL: FINANCEIRO */}
                 {activeModal === 'financeiro' && (
                    <div className="space-y-4">
                       <div>
                          <label className="text-label mb-1.5 block">Descrição do Lançamento</label>
                          <input name="descricao" defaultValue={editData?.descricao} className="input-field" required />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-label mb-1.5 block">Tipo</label>
                             <select name="tipo" defaultValue={editData?.tipo || 'receita'} className="select-field w-full">
                                <option value="receita">Receita</option>
                                <option value="despesa">Despesa</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-label mb-1.5 block">Valor (R$)</label>
                             <input name="valor" type="number" step="0.01" defaultValue={editData?.valor} className="input-field font-mono font-bold" required />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-label mb-1.5 block">Vencimento</label>
                             <input name="data_vencimento" type="date" defaultValue={editData?.data_vencimento ? new Date(editData.data_vencimento).toISOString().split('T')[0] : ''} className="input-field" />
                          </div>
                          <div>
                             <label className="text-label mb-1.5 block">Status</label>
                             <select name="status" defaultValue={editData?.status || 'pendente'} className="select-field w-full">
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago / Recebido</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* MODAL: UPLOAD (SIMULADO) */}
                 {activeModal === 'upload' && (
                    <div className="space-y-4">
                       <p className="text-xs text-slate-500">A simulação de upload registrará o arquivo no banco de dados e na timeline operacional.</p>
                       <div>
                          <label className="text-label mb-1.5 block">Nome do Documento</label>
                          <input id="up_nome" className="input-field" placeholder="Ex: Planta Baixa A1" required />
                       </div>
                       <div>
                          <label className="text-label mb-1.5 block">Tipo</label>
                          <select id="up_tipo" className="select-field w-full">
                             <option value="PDF">PDF</option>
                             <option value="DWG">DWG</option>
                             <option value="JPG">Imagem (JPG/PNG)</option>
                          </select>
                       </div>
                       <button 
                         type="button"
                         onClick={async () => {
                            const nome = (document.getElementById('up_nome') as HTMLInputElement).value
                            const tipo = (document.getElementById('up_tipo') as HTMLSelectElement).value
                            if(!nome) return alert('Nome obrigatório')
                            await handleAction('POST', 'documentos', {
                               nome, tipo, tamanho: 2500000, categoria: 'técnico', responsavel: 'SISTEMA'
                            })
                         }}
                         className="w-full btn-primary justify-center py-3"
                       >
                          Simular Upload e Salvar
                       </button>
                    </div>
                 )}

                 {activeModal !== 'upload' && (
                    <div className="flex gap-2 pt-4">
                       <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase transition-all">Cancelar</button>
                       <button type="submit" disabled={isActionLoading} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2">
                          {isActionLoading ? <Loader2 size={16} className="animate-spin"/> : (editData ? 'Salvar Alterações' : 'Confirmar Cadastro')}
                       </button>
                    </div>
                 )}
              </form>
           </div>
        </div>
      )}

    </div>
  )
}
