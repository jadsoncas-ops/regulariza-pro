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
  MoreHorizontal, Copy, Trash, Archive, ShieldAlert,
  Activity, Tag
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
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
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
    <div className="min-h-screen -mt-10 -mx-10 bg-[#F4F7FB]">
      
      {/* HEADER PREMIUM DARK */}
      <div className="premium-dark text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-blue-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-8 pt-10 pb-16">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                 <Link href="/processos" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all border border-white/10 backdrop-blur-md">
                    <ArrowLeft size={20} className="text-white"/>
                 </Link>
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-lg border border-blue-400/20 backdrop-blur-md">
                          {processo.codigo_projeto || `#${processo.id.substring(0,8).toUpperCase()}`}
                       </span>
                       <span className="text-white/20 font-light">|</span>
                       <div className="flex items-center gap-1.5">
                          <Activity size={14} className="text-blue-400"/>
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{processo.categoria || 'Regularização'}</span>
                       </div>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1">{processo.tipo_regularizacao}</h1>
                    <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                       <MapPin size={14} className="text-slate-500"/> {processo.imovel?.endereco}, {processo.imovel?.cidade}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 pr-10 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-1">Status Atual</p>
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full animate-pulse bg-${STATUS_OPTIONS.find(o => o.value === processo.status)?.color}-500`} />
                       <p className="text-lg font-black text-white">{getStatusLabel(processo.status)}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => { setEditData(processo); setActiveModal('processo') }}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-3"
                 >
                    <Edit size={16} /> Editar
                 </button>
              </div>
           </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS PREMIUM */}
        <div className="max-w-[1600px] mx-auto px-8 -mt-8 relative z-20">
           <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-1 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xl">
              {TABS.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap ${
                    tab === t.id ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <t.icon size={15} strokeWidth={tab === t.id ? 2.5 : 1.5} />
                  {t.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-10">
        
        {/* --- VISÃO GERAL --- */}
        {tab === 'visao' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-up">
             
             {/* SITUAÇÃO DA OPERAÇÃO */}
             <div className="lg:col-span-3 space-y-8">
                <div className="card group">
                   <div className="card-header">
                      <h3 className="flex items-center gap-3 text-sm font-black text-slate-900">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Activity size={18}/>
                         </div>
                         Monitoramento em Tempo Real
                      </h3>
                      <button onClick={() => fetchProcesso()} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600"><RefreshCw size={16}/></button>
                   </div>
                   <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-6">
                         <div>
                            <p className="text-label mb-2">Última Movimentação</p>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                               <p className="text-sm font-bold text-slate-800 leading-snug mb-2">
                                  {processo.logs?.[0] ? `${processo.logs[0].acao}` : 'Aguardando início operacional.'}
                               </p>
                               <p className="text-xs text-slate-500 line-clamp-2">{processo.logs?.[0]?.detalhe}</p>
                               <p className="text-[10px] font-bold text-blue-600 mt-3 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Clock size={12}/> {processo.logs?.[0] ? new Date(processo.logs[0].createdAt).toLocaleString('pt-BR') : '—'}
                               </p>
                            </div>
                         </div>
                         <div className="pt-6 border-t border-slate-100">
                            <p className="text-label mb-3">Responsável Técnico</p>
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xs text-white font-bold shadow-lg">JC</div>
                               <div>
                                  <p className="text-sm font-bold text-slate-900">{processo.responsavel || 'Não Atribuído'}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sócio-Engenheiro</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle size={60}/></div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pendências Críticas</p>
                         <div className="space-y-4">
                            {/* Tarefas Atrasadas/Pendentes */}
                            {processo.tarefas?.filter((t: any) => t.status === 'pendente').slice(0, 3).map((t: any) => (
                               <div key={t.id} className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getTaskStatus(t) === 'atrasada' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-amber-500'}`}/>
                                  <div>
                                     <p className="text-[12px] font-bold text-white line-clamp-1">{t.titulo}</p>
                                     <p className="text-[10px] text-slate-500 font-medium">Até {new Date(t.data).toLocaleDateString('pt-BR')}</p>
                                  </div>
                               </div>
                            ))}
                            {processo.tarefas?.length === 0 && (
                               <p className="text-[12px] italic text-slate-500 py-4 text-center">Nenhuma pendência crítica identificada.</p>
                            )}
                         </div>
                      </div>

                      <div className="flex flex-col justify-between">
                         <div>
                            <p className="text-label mb-3">Situação em Órgãos</p>
                            {processo.protocolos?.[0] ? (
                               <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                     <span className="text-[12px] font-bold text-slate-900">{processo.protocolos[0].orgao}</span>
                                     <span className="badge badge-blue">{processo.protocolos[0].status}</span>
                                  </div>
                                  <p className="font-mono text-[10px] text-slate-400"># {processo.protocolos[0].numero_protocolo}</p>
                               </div>
                            ) : <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-[11px] text-slate-400 font-medium italic">Nenhum trâmite registrado.</div>}
                         </div>
                         <div className="pt-6 flex gap-3">
                            <button onClick={() => setTab('timeline')} className="flex-1 py-3 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 transition-all uppercase tracking-[0.1em]">Ver Timeline</button>
                            <button onClick={() => setTab('prefeitura')} className="flex-1 py-3 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 transition-all uppercase tracking-[0.1em]">Protocolos</button>
                         </div>
                      </div>
                   </div>
                </div>

                {/* MARCOS OPERACIONAIS */}
                <div className="card overflow-hidden">
                   <div className="card-header">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Principais Marcos Operacionais</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checklist de Aprovação</p>
                   </div>
                   <div className="p-2 bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-2">
                      {processo.tarefas?.filter((t: any) => t.status === 'pendente').sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()).slice(0, 4).map((m: any) => (
                         <div key={m.id} className="p-5 bg-white rounded-2xl border border-slate-200 group hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                               <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                  <ListTodo size={14}/>
                               </div>
                               <span className="text-[10px] font-mono font-bold text-slate-400">{new Date(m.data).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{m.titulo}</p>
                            <div className="flex items-center gap-2">
                               <span className={`w-1.5 h-1.5 rounded-full ${m.prioridade === 'alta' ? 'bg-red-500' : 'bg-slate-300'}`} />
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.prioridade}</span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* SIDEBAR OPERACIONAL */}
             <div className="space-y-8">
                {/* Entidades Relacionadas */}
                <div className="card p-6 space-y-6">
                   <div>
                      <p className="text-label mb-4">Contratante Principal</p>
                      <Link href={`/clientes/${processo.clienteId}`} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                         <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <User size={20}/>
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">{processo.cliente?.nome}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{processo.cliente?.cidade}</p>
                         </div>
                      </Link>
                   </div>
                   <div className="pt-6 border-t border-slate-100">
                      <p className="text-label mb-4">Objeto da Operação</p>
                      <Link href={`/imoveis/${processo.imovelId}`} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            <Building2 size={20}/>
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{processo.imovel?.endereco}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{processo.imovel?.bairro}</p>
                         </div>
                      </Link>
                   </div>
                </div>

                {/* KPI Financeiro Sidebar */}
                <div className="premium-dark rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                   <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-blue-500/20 blur-[60px] pointer-events-none" />
                   
                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Contrato Bruto</p>
                        <p className="text-3xl font-black tracking-tighter text-white">{fmt(processo.valor_total)}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                        <Wallet size={20} className="text-blue-400"/>
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <div>
                         <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                            <span className="text-blue-400">Eficiência de Recebimento</span>
                            <span className="text-white">{Math.round((processo.valor_pago / processo.valor_total) * 100) || 0}%</span>
                         </div>
                         <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                              style={{ width: `${(processo.valor_pago / processo.valor_total) * 100 || 0}%` }} 
                            />
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                         <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Recebido</p>
                            <p className="text-sm font-black text-emerald-400">{fmt(processo.valor_pago)}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Saldo Aberto</p>
                            <p className="text-sm font-black text-amber-400">{fmt(processo.valor_total - processo.valor_pago)}</p>
                         </div>
                      </div>
                      <button onClick={() => setTab('financeiro')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Gerenciar Financeiro</button>
                   </div>
                </div>
             </div>

          </div>
        )}

        {/* --- TIMELINE --- */}
        {tab === 'timeline' && (
          <div className="max-w-4xl mx-auto animate-fade-up">
             <div className="card overflow-hidden">
                <div className="card-header">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Histórico de Movimentações</h3>
                   <div className="flex items-center gap-3">
                      <button className="btn-ghost text-[10px]"><Filter size={14}/> Filtrar</button>
                      <button onClick={() => setActiveModal('log_manual')} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">+ Lançamento</button>
                   </div>
                </div>
                <div className="p-10 relative">
                   {/* Linha da Timeline - Premium Style */}
                   <div className="absolute left-[47px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-blue-500 via-slate-200 to-transparent" />
                   
                   <div className="space-y-10 relative">
                      {processo.logs?.length === 0 ? (
                         <div className="py-20 text-center italic text-slate-400 text-sm">Nenhum evento registrado nesta jornada.</div>
                      ) : processo.logs.map((log: any, i: number) => {
                        const isFin = log.modulo === 'FINANCEIRO'
                        const isDoc = log.modulo === 'DOCUMENTOS'
                        const isTask = log.modulo === 'TAREFAS'
                        
                        const Icon = isFin ? DollarSign : isTask ? ListTodo : isDoc ? FileText : GitBranch
                        const colorClass = isFin ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isTask ? 'bg-blue-50 text-blue-600 border-blue-100' : isDoc ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-100'

                        return (
                           <div key={log.id} className="flex gap-8 group">
                              <div className="w-16 text-right shrink-0 pt-2">
                                 <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{new Date(log.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                 <p className="text-[10px] text-slate-400 font-mono mt-1 font-bold">{new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 relative z-10 transition-all shadow-sm ${colorClass} group-hover:scale-110 group-hover:shadow-lg`}>
                                 <Icon size={18} strokeWidth={2.5}/>
                              </div>
                              <div className="flex-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm group-hover:border-blue-200 transition-all hover:shadow-md">
                                 <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{log.acao}</h4>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${colorClass}`}>{log.modulo}</span>
                                 </div>
                                 <p className="text-sm text-slate-500 leading-relaxed font-medium">{log.detalhe}</p>
                                 <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                                    <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[8px] text-white font-bold">JC</div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operador: {log.usuario}</p>
                                 </div>
                              </div>
                           </div>
                        )
                      })}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- TAREFAS --- */}
        {tab === 'tarefas' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
             <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Checklist Operacional</h3>
                   <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button className="px-4 py-2 text-[10px] font-black uppercase bg-white shadow-lg rounded-lg text-blue-600 transition-all">Pendentes</button>
                      <button className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Concluídas</button>
                   </div>
                </div>
                <button 
                  onClick={() => { setEditData(null); setActiveModal('tarefa') }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                   <Plus size={16} strokeWidth={3}/> Nova Tarefa
                </button>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {processo.tarefas?.length === 0 ? (
                   <div className="py-24 text-center border-3 border-dashed border-slate-200 rounded-[32px] text-slate-300 font-bold italic text-sm">Nenhuma tarefa registrada.</div>
                ) : processo.tarefas.sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()).map((t: any) => {
                   const status = getTaskStatus(t)
                   const isDone = status === 'concluido'
                   return (
                      <div key={t.id} className={`flex items-center gap-6 p-5 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 group ${isDone ? 'opacity-60 grayscale' : ''}`}>
                         <button 
                           onClick={() => handleAction('PATCH', 'tarefas', { id: t.id, status: isDone ? 'pendente' : 'concluido' })}
                           className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-200 bg-slate-50 hover:border-blue-500'}`}
                         >
                            {isDone && <Check size={18} className="text-white" strokeWidth={3}/>}
                         </button>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                               <p className={`text-sm font-black tracking-tight ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.titulo}</p>
                               {status === 'atrasada' && <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100 uppercase tracking-widest animate-pulse">Atrasada</span>}
                               {isDone && <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">Concluída</span>}
                            </div>
                            <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                               <div className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-300"/> {new Date(t.data).toLocaleDateString('pt-BR')}</div>
                               <div className="flex items-center gap-1.5"><User size={14} className="text-slate-300"/> {t.responsavel || 'Equipe Técnica'}</div>
                               <div className="flex items-center gap-1.5"><Tag size={14} className="text-slate-300"/> {t.prioridade}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-1">
                            <button 
                              onClick={() => { setEditData(t); setActiveModal('tarefa') }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                            >
                               <Edit size={16}/>
                            </button>
                            <button 
                              onClick={() => { if(confirm('Excluir tarefa?')) handleAction('DELETE', 'tarefas', { id: t.id, titulo: t.titulo }) }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                               <Trash2 size={16}/>
                            </button>
                         </div>
                      </div>
                   )
                })}
             </div>
          </div>
        )}

        {/* --- PREFEITURA --- */}
        {tab === 'prefeitura' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Status em Órgãos Públicos</h3>
                   <p className="text-xs text-slate-500 font-medium">Acompanhamento centralizado de protocolos e exigências.</p>
                </div>
                <button 
                  onClick={() => { setEditData(null); setActiveModal('protocolo') }}
                  className="btn-primary py-3 px-6 rounded-2xl"
                >
                   <Plus size={18} strokeWidth={3}/> Novo Protocolo
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processo.protocolos?.length === 0 ? (
                   <div className="col-span-full py-32 text-center border-3 border-dashed border-slate-200 rounded-[40px] bg-white shadow-inner">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-300">
                         <Building2 size={32}/>
                      </div>
                      <p className="text-slate-400 font-bold italic text-sm">Aguardando registro de protocolos.</p>
                   </div>
                ) : processo.protocolos.map((p: any) => (
                   <div key={p.id} className="card p-6 group hover:border-blue-500 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex flex-col gap-1 p-2 bg-slate-900 rounded-bl-2xl">
                            <button onClick={() => { setEditData(p); setActiveModal('protocolo') }} className="p-2 text-white hover:text-blue-400 transition-colors"><Edit size={14}/></button>
                            <button onClick={() => { if(confirm('Remover?')) handleAction('DELETE', 'protocolos', { id: p.id, orgao: p.orgao }) }} className="p-2 text-white hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-14 h-14 rounded-[20px] bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-slate-900/20">
                            {p.orgao.substring(0, 2).toUpperCase()}
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-slate-900 leading-tight mb-1">{p.orgao}</h4>
                            <div className="flex items-center gap-2">
                               <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">#{p.numero_protocolo}</span>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4 mb-6">
                         <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                            <span className={`badge ${p.status === 'aprovado' || p.status === 'concluido' ? 'badge-green' : p.status === 'exigencia' ? 'badge-red' : 'badge-blue'}`}>
                               {p.status.replace(/_/g, ' ')}
                            </span>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Abertura</p>
                               <p className="text-[11px] font-black text-slate-800">{new Date(p.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prazo / Revisão</p>
                               <p className="text-[11px] font-black text-slate-800">{p.prazo ? new Date(p.prazo).toLocaleDateString('pt-BR') : '—'}</p>
                            </div>
                         </div>
                      </div>

                      {p.observacao && (
                         <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <p className="text-[10px] text-blue-700 font-bold italic line-clamp-2 leading-relaxed">"{p.observacao}"</p>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* --- FINANCEIRO --- */}
        {tab === 'financeiro' && (
          <div className="space-y-8 animate-fade-up">
             
             {/* INDICADORES PREMIUM */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                   { label: 'Valor do Contrato', value: fmt(processo.valor_total), icon: Wallet, color: 'text-slate-900', bg: 'bg-white shadow-xl shadow-slate-200/50' },
                   { label: 'Total Recebido', value: fmt(processo.valor_pago), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100' },
                   { label: 'Saldo devedor', value: fmt(processo.valor_total - processo.valor_pago), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100' },
                   { label: 'Margem Líquida', value: `${Math.round((processo.valor_pago / processo.valor_total) * 100) || 0}%`, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50/50 border-blue-100' },
                ].map((k, i) => (
                   <div key={i} className={`p-8 rounded-[32px] border flex flex-col justify-between h-44 ${k.bg}`}>
                      <div className="flex items-center justify-between">
                         <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-100"><k.icon size={22}/></div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{k.label}</p>
                      </div>
                      <p className={`text-2xl font-black tracking-tighter ${k.color}`}>{k.value}</p>
                   </div>
                ))}
             </div>

             {/* FLUXO DE CAIXA */}
             <div className="card overflow-hidden">
                <div className="card-header bg-white border-b-2 border-slate-50">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Fluxo de Caixa Operacional</h3>
                   <div className="flex gap-3">
                      <button className="btn-ghost text-[10px]"><Download size={16}/> Relatório</button>
                      <button 
                        onClick={() => { setEditData(null); setActiveModal('financeiro') }}
                        className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all"
                      >
                         + Novo Lançamento
                      </button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left zebra-table">
                      <thead>
                         <tr className="table-header">
                            <th className="px-8">Vencimento</th>
                            <th className="px-8">Descrição / Categoria</th>
                            <th className="px-8 text-center">Status</th>
                            <th className="px-8 text-right">Valor Líquido</th>
                            <th className="px-8"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {processo.financeiro?.length === 0 ? (
                            <tr><td colSpan={5} className="p-24 text-center text-slate-300 font-bold italic">Nenhum registro financeiro.</td></tr>
                         ) : processo.financeiro.map((f: any) => (
                           <tr key={f.id} className="table-row group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-slate-200"/>
                                    <span className="font-mono text-[13px] font-black text-slate-600">{f.data_vencimento ? new Date(f.data_vencimento).toLocaleDateString('pt-BR') : '—'}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{f.descricao}</p>
                                 <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-blue-100">{f.categoria || f.tipo}</span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className={`badge ${f.status === 'pago' || f.status === 'recebido' ? 'badge-green' : 'badge-amber'}`}>
                                    {f.status}
                                 </span>
                              </td>
                              <td className={`px-8 py-6 text-right font-black text-base tracking-tighter ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                                 {f.tipo === 'receita' ? '+' : '-'}{fmt(f.valor)}
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditData(f); setActiveModal('financeiro') }} className="w-9 h-9 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl flex items-center justify-center transition-all border border-slate-100"><Edit size={14}/></button>
                                    <button onClick={() => { if(confirm('Excluir?')) handleAction('DELETE', 'financeiro', { id: f.id, descricao: f.descricao }) }} className="w-9 h-9 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all border border-slate-100"><Trash2 size={14}/></button>
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

        {/* --- DOCS --- */}
        {tab === 'documentos' && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-fade-up">
             <div 
               onClick={() => setActiveModal('upload')}
               className="col-span-full h-40 border-3 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center bg-white hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm"
             >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-all mb-4 border border-slate-100 group-hover:border-blue-500">
                   <Plus size={24} className="text-slate-400 group-hover:text-white transition-all"/>
                </div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Anexar Documento Técnico</p>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">PDF, DWG, PNG (Máx 50MB)</p>
             </div>

             {processo.documentos?.length === 0 ? (
                <div className="col-span-full py-32 text-center text-slate-300 font-bold italic text-sm">Aguardando upload de documentos.</div>
             ) : processo.documentos.map((doc: any) => (
                <div key={doc.id} className="card p-5 group hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Remover?')) handleAction('DELETE', 'documentos', { id: doc.id, processoId: params.id, nome: doc.nome }) }}
                        className="w-8 h-8 bg-red-500 text-white rounded-bl-xl flex items-center justify-center hover:bg-red-600 transition-all"
                      >
                         <Trash2 size={14}/>
                      </button>
                   </div>

                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm mb-4">
                      <FileText size={22} strokeWidth={2.5}/>
                   </div>
                   <h4 className="text-[11px] font-black text-slate-900 leading-tight mb-3 line-clamp-2 min-h-[2.4rem]" title={doc.nome}>{doc.nome}</h4>
                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-widest">{doc.tipo}</span>
                      <a href={doc.url} target="_blank" className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Abrir</a>
                   </div>
                </div>
             ))}
          </div>
        )}

        {/* --- HISTORICO --- */}
        {tab === 'historico' && (
          <div className="max-w-4xl mx-auto animate-fade-up">
             <div className="card overflow-hidden">
                <div className="card-header border-b-2 border-slate-50">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Logs de Auditoria de Sistema</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">UUID: {processo.id}</span>
                   </div>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                   {processo.logs?.length === 0 ? (
                      <div className="p-32 text-center text-slate-300 font-bold italic">Sem histórico para auditoria.</div>
                   ) : processo.logs.map((log: any) => (
                     <div key={log.id} className="px-8 py-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                              <User size={16}/>
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest">{log.modulo}</span>
                                 <p className="text-[13px] font-black text-slate-900">{log.acao}</p>
                              </div>
                              <p className="text-[12px] text-slate-500 font-medium">{log.detalhe}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-sm font-black text-slate-900">{log.usuario}</p>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

      </div>

      {/* --- MODAIS --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-fade-up border border-white/20">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                       {editData ? 'Atualizar' : 'Novo Registro'} — {activeModal}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gestão Operacional RegularizaPro</p>
                 </div>
                 <button onClick={() => { setActiveModal(null); setEditData(null) }} className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-100 rounded-2xl transition-all text-slate-400 border border-slate-100 shadow-sm"><X size={20}/></button>
              </div>
              
              <form onSubmit={async (e) => {
                 e.preventDefault()
                 const formData = new FormData(e.target as HTMLFormElement)
                 const data: any = {}
                 formData.forEach((val, key) => data[key] = val)
                 
                 const method = editData ? 'PATCH' : 'POST'
                 const endpoint = activeModal === 'processo' ? '' : activeModal
                 const body = editData ? { ...data, id: editData.id } : data
                 
                 if (activeModal === 'processo') {
                    await fetch(`/api/processos/${params.id}`, { method: 'PATCH', body: JSON.stringify(data) })
                    await fetchProcesso()
                    setActiveModal(null)
                    return
                 }

                 await handleAction(method, endpoint, body)
              }} className="p-8 space-y-6">
                 
                 {activeModal === 'processo' && (
                    <div className="space-y-6">
                       <div>
                          <label className="text-label mb-2 block">Tipo de Regularização / Título</label>
                          <input name="tipo_regularizacao" defaultValue={editData?.tipo_regularizacao} className="input-field" required />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="text-label mb-2 block">Código do Projeto</label>
                             <input name="codigo_projeto" defaultValue={editData?.codigo_projeto} className="input-field font-mono font-bold" />
                          </div>
                          <div>
                             <label className="text-label mb-2 block">Responsável Técnico</label>
                             <input name="responsavel" defaultValue={editData?.responsavel} className="input-field" />
                          </div>
                       </div>
                       <div>
                          <label className="text-label mb-2 block">Status Operacional</label>
                          <select name="status" defaultValue={editData?.status} className="select-field w-full">
                             {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                       </div>
                    </div>
                 )}

                 {activeModal === 'tarefa' && (
                    <div className="space-y-6">
                       <div>
                          <label className="text-label mb-2 block">Nome da Tarefa / Marco</label>
                          <input name="titulo" defaultValue={editData?.titulo} className="input-field" required />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="text-label mb-2 block">Data Limite de Execução</label>
                             <input name="data" type="date" defaultValue={editData?.data ? new Date(editData.data).toISOString().split('T')[0] : ''} className="input-field" required />
                          </div>
                          <div>
                             <label className="text-label mb-2 block">Nível de Prioridade</label>
                             <select name="prioridade" defaultValue={editData?.prioridade || 'normal'} className="select-field w-full">
                                <option value="baixa">Baixa</option>
                                <option value="normal">Normal</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeModal === 'protocolo' && (
                    <div className="space-y-6">
                       <div>
                          <label className="text-label mb-2 block">Órgão Competente</label>
                          <input name="orgao" defaultValue={editData?.orgao} className="input-field" required placeholder="Ex: Prefeitura de São Paulo" />
                       </div>
                       <div>
                          <label className="text-label mb-2 block">Nº de Protocolo / Registro</label>
                          <input name="numero_protocolo" defaultValue={editData?.numero_protocolo} className="input-field font-mono font-bold" required />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="text-label mb-2 block">Data do Protocolo</label>
                             <input name="data" type="date" defaultValue={editData?.data ? new Date(editData.data).toISOString().split('T')[0] : ''} className="input-field" required />
                          </div>
                          <div>
                             <label className="text-label mb-2 block">Situação Atual</label>
                             <select name="status" defaultValue={editData?.status || 'protocolado'} className="select-field w-full">
                                <option value="protocolado">Protocolado</option>
                                <option value="em_analise">Em Análise</option>
                                <option value="exigencia">Exigência Técnica</option>
                                <option value="aprovado">Aprovado</option>
                                <option value="concluido">Concluído / Finalizado</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeModal === 'financeiro' && (
                    <div className="space-y-6">
                       <div>
                          <label className="text-label mb-2 block">Descrição da Transação</label>
                          <input name="descricao" defaultValue={editData?.descricao} className="input-field" required />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="text-label mb-2 block">Tipo de Lançamento</label>
                             <select name="tipo" defaultValue={editData?.tipo || 'receita'} className="select-field w-full">
                                <option value="receita">Receita (Contrato)</option>
                                <option value="despesa">Despesa (Custos)</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-label mb-2 block">Valor Bruto (R$)</label>
                             <input name="valor" type="number" step="0.01" defaultValue={editData?.valor} className="input-field font-mono font-black text-base" required />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <label className="text-label mb-2 block">Vencimento Programado</label>
                             <input name="data_vencimento" type="date" defaultValue={editData?.data_vencimento ? new Date(editData.data_vencimento).toISOString().split('T')[0] : ''} className="input-field" />
                          </div>
                          <div>
                             <label className="text-label mb-2 block">Status de Recebimento</label>
                             <select name="status" defaultValue={editData?.status || 'pendente'} className="select-field w-full">
                                <option value="pendente">Aguardando Pagamento</option>
                                <option value="pago">Liquidado / Recebido</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeModal === 'upload' && (
                    <div className="space-y-6 text-center py-4">
                       <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto shadow-inner border border-blue-100">
                          <FileText size={32} strokeWidth={2.5}/>
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-slate-900 leading-tight">Simulação de Repositório</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">Selecione o arquivo técnico para upload seguro no banco de dados.</p>
                       </div>
                       <div className="space-y-4 text-left">
                          <div>
                             <label className="text-label mb-2 block">Identificação do Arquivo</label>
                             <input id="up_nome" className="input-field" placeholder="Ex: Projeto_Aprovado_V1.dwg" required />
                          </div>
                          <div>
                             <label className="text-label mb-2 block">Extensão / Tipo</label>
                             <select id="up_tipo" className="select-field w-full">
                                <option value="PDF">PDF (Documento)</option>
                                <option value="DWG">DWG (Projeto)</option>
                                <option value="JPG">JPG/PNG (Imagem)</option>
                             </select>
                          </div>
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
                         className="w-full btn-primary justify-center py-5 rounded-[24px]"
                       >
                          Executar Upload e Registrar
                       </button>
                    </div>
                 )}

                 {activeModal !== 'upload' && (
                    <div className="flex gap-4 pt-4">
                       <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all">Cancelar</button>
                       <button type="submit" disabled={isActionLoading} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20">
                          {isActionLoading ? <Loader2 size={18} className="animate-spin"/> : (editData ? 'Atualizar Dados' : 'Confirmar Registro')}
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
