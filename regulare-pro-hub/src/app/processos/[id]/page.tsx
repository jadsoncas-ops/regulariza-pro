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
  Search, Plus, Filter, LayoutGrid, List, TrendingUp
} from 'lucide-react'

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
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchProcesso = () => {
    setLoading(true)
    fetch(`/api/processos/${params.id}`)
      .then(r => r.json())
      .then(d => { 
        setProcesso(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchProcesso()
  }, [params.id])

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
                          <User size={14} className="group-hover:text-blue-400"/> {processo.cliente.nome}
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
                    <p className="text-sm font-bold text-emerald-500">{processo.status || 'Ativo'}</p>
                 </div>
                 <button onClick={() => setIsEditModalOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10">
                    <Edit size={18} />
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
                         <p className="text-sm font-medium text-slate-700">Protocolo realizado na Prefeitura Municipal. Aguardando emissão do boleto de taxas.</p>
                         <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <Clock size={12}/> {new Date().toLocaleDateString('pt-BR')} às 10:30 por Jadson
                         </div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Principais Pendências</p>
                         <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-red-500"/>
                               <span className="text-xs font-bold text-slate-600">Assinatura da Procuração</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>
                               <span className="text-xs font-bold text-slate-600">Pagamento da ART Técnica</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* PRÓXIMAS AÇÕES */}
                <div className="card p-8 border-0 shadow-sm bg-white">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-slate-800">Próximos Marcos do Projeto</h3>
                      <button className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline">+ Adicionar Marco</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Levantamento', status: 'Concluído', date: '01/05', active: false },
                        { label: 'Protocolo', status: 'Em Curso', date: '08/05', active: true },
                        { label: 'Análise PM', status: 'Pendente', date: '15/05', active: false },
                      ].map((m, i) => (
                        <div key={i} className={`p-4 rounded-2xl border-2 transition-all ${m.active ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100' : 'border-slate-50 bg-slate-50/30'}`}>
                           <div className="flex items-center justify-between mb-3">
                              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${m.active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{m.status}</span>
                              <span className="text-[10px] font-bold text-slate-400 font-mono">{m.date}</span>
                           </div>
                           <p className="text-xs font-bold text-slate-800">{m.label}</p>
                        </div>
                      ))}
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
                            <Link href={`/clientes/${processo.clienteId}`} className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">{processo.cliente.nome}</Link>
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
                <div className="card p-6 border-0 shadow-sm bg-slate-900 text-white">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financeiro</h3>
                      <button onClick={() => setTab('financeiro')} className="text-blue-400"><ArrowUpRight size={16}/></button>
                   </div>
                   <div className="space-y-4">
                      <div>
                         <p className="text-2xl font-bold tracking-tight">{fmt(processo.valor_total)}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">Valor do Contrato</p>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Recebido (60%)</span>
                         <span className="text-xs font-bold">{fmt(processo.valor_total * 0.6)}</span>
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
                   <button className="btn-primary py-2 px-6 text-xs shadow-lg shadow-blue-100">+ Atualizar Status</button>
                </div>

                <div className="relative space-y-12 pl-10">
                   <div className="absolute left-[59px] top-4 bottom-4 w-0.5 bg-slate-100" />
                   
                   {[
                     { date: 'Hoje', title: 'Mudança de Status: Protocolo Prefeitura', desc: 'Processo enviado para análise da prefeitura através do sistema online.', icon: GitBranch, color: 'text-blue-600', bg: 'bg-blue-50' },
                     { date: '05 Mai', title: 'Upload de Arquivos Técnicos', desc: 'Adicionados: Memorial Descritivo, Projeto As-Built e Levantamento Cadastral.', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                     { date: '04 Mai', title: 'Entrada Financeira Confirmada', desc: 'Pagamento da primeira parcela do contrato (50%) identificado.', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                     { date: '02 Mai', title: 'Processo Inicializado', desc: 'Abertura do dossiê técnico para regularização imobiliária.', icon: Briefcase, color: 'text-slate-900', bg: 'bg-slate-100' },
                   ].map((item, i) => (
                     <div key={i} className="flex gap-8 relative z-10">
                        <div className="w-10 text-right shrink-0 pt-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                           <item.icon size={16} />
                        </div>
                        <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[24px] flex-1 hover:bg-white hover:shadow-xl transition-all group">
                           <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">{item.title}</h4>
                           <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* ── FINANCEIRO OPERACIONAL ───────────────────────────────── */}
        {tab === 'financeiro' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* FINANCE OVERVIEW */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-8 border-0 shadow-lg bg-blue-600 text-white">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Wallet size={20}/></div>
                      <div><h3 className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Receitas do Contrato</h3></div>
                   </div>
                   <div className="space-y-4">
                      <div><p className="text-3xl font-bold tracking-tight">{fmt(processo.valor_total)}</p><p className="text-[10px] text-blue-200 font-bold uppercase mt-1">Valor Bruto Contratado</p></div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                         <div><p className="text-sm font-bold text-emerald-300">{fmt(processo.valor_total * 0.7)}</p><p className="text-[9px] text-blue-200 font-bold uppercase">Já Recebido</p></div>
                         <div><p className="text-sm font-bold text-amber-300">{fmt(processo.valor_total * 0.3)}</p><p className="text-[9px] text-blue-200 font-bold uppercase">Pendente</p></div>
                      </div>
                   </div>
                </div>

                <div className="card p-8 border-0 shadow-sm bg-white">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><Users size={20}/></div>
                      <div><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo com Parceiros</h3></div>
                   </div>
                   <div className="space-y-4">
                      <div><p className="text-3xl font-bold tracking-tight text-slate-800">{fmt(processo.valor_total * 0.25)}</p><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Estimativa de Pagamentos</p></div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                         <div><p className="text-sm font-bold text-red-500">{fmt(processo.valor_total * 0.1)}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Pago</p></div>
                         <div><p className="text-sm font-bold text-slate-700">{fmt(processo.valor_total * 0.15)}</p><p className="text-[9px] text-slate-400 font-bold uppercase">A Pagar</p></div>
                      </div>
                   </div>
                </div>

                <div className="card p-8 border-0 shadow-lg bg-slate-900 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={120}/></div>
                   <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 border border-white/10"><TrendingUp size={20}/></div>
                      <div><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultado do Processo</h3></div>
                   </div>
                   <div className="space-y-4 relative z-10">
                      <div><p className="text-3xl font-bold tracking-tight text-blue-400">{fmt(processo.valor_total * 0.75)}</p><p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Lucro Total Estimado (Gross)</p></div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 mt-4">
                         <span className="text-xs font-bold text-slate-400">Eficiência (Margem)</span>
                         <span className="text-sm font-bold text-blue-400">75%</span>
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
                            <th className="px-8 py-4">Entidade</th>
                            <th className="px-8 py-4 text-center">Status</th>
                            <th className="px-8 py-4 text-right">Valor (R$)</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                         <tr className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 text-slate-500">04 Mai 2026</td>
                            <td className="px-8 py-5">
                               <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Parcela 01/02 - Contrato</p>
                               <p className="text-[9px] text-slate-400 uppercase mt-0.5">Receita de Contrato</p>
                            </td>
                            <td className="px-8 py-5 font-medium text-slate-600">{processo.cliente.nome}</td>
                            <td className="px-8 py-5 text-center"><span className="badge badge-green text-[9px]">Recebido</span></td>
                            <td className="px-8 py-5 text-right font-bold text-emerald-600">{fmt(processo.valor_total * 0.5)}</td>
                         </tr>
                         <tr className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 text-slate-500">06 Mai 2026</td>
                            <td className="px-8 py-5">
                               <p className="font-bold text-slate-800 group-hover:text-red-600 transition-colors">Taxas de Protocolo Prefeitura</p>
                               <p className="text-[9px] text-slate-400 uppercase mt-0.5">Custos Operacionais</p>
                            </td>
                            <td className="px-8 py-5 font-medium text-slate-600">Prefeitura Municipal</td>
                            <td className="px-8 py-5 text-center"><span className="badge badge-amber text-[9px]">Pendente</span></td>
                            <td className="px-8 py-5 text-right font-bold text-red-500">-{fmt(350)}</td>
                         </tr>
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
             <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                   <Plus size={32}/>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Upload de Arquivos Técnicos</h3>
                <p className="text-xs text-slate-400 mt-2">Arraste seus PDFs, plantas ou memoriais aqui para anexar à operação.</p>
             </div>

             {[
               { label: 'ART de Projeto', type: 'Engenharia', size: '1.2 MB', date: '05/05' },
               { label: 'Memorial Descritivo', type: 'Técnico', size: '2.5 MB', date: '04/05' },
               { label: 'Planta Baixa (DWG)', type: 'Projeto', size: '18.4 MB', date: '03/05' },
               { label: 'Protocolo PM', type: 'Legal', size: '0.4 MB', date: '06/05' },
             ].map((doc, i) => (
               <div key={i} className="card p-6 border-0 shadow-sm bg-white group hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={20}/>
                     </div>
                     <button className="text-slate-300 hover:text-red-500 transition-colors"><X size={16}/></button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1 truncate">{doc.label}</h4>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{doc.type}</span>
                     <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                  </div>
                  <button className="w-full py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 text-[10px] font-bold uppercase rounded-lg transition-all border border-slate-100">Abrir Documento</button>
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
                   <button className="btn-primary py-2 px-6 text-[10px] uppercase tracking-widest">+ Nova Tarefa</button>
                </div>

                <div className="space-y-4">
                   {[
                     { label: 'Realizar vistoria final no imóvel', priority: 'Alta', due: 'Amanhã', done: false },
                     { label: 'Emitir ART técnica de regularização', priority: 'Média', due: '12/05', done: true },
                     { label: 'Coletar assinatura do cliente na planta', priority: 'Urgente', due: 'Hoje', done: false },
                     { label: 'Conferir zoneamento no plano diretor', priority: 'Baixa', due: '15/05', done: true },
                   ].map((t, i) => (
                     <label key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${t.done ? 'bg-slate-50 border-slate-50 opacity-60' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${t.done ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                           {t.done && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={t.done} readOnly />
                        <div className="flex-1">
                           <p className={`text-sm font-bold ${t.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{t.label}</p>
                           <div className="flex items-center gap-3 mt-1">
                              <span className={`text-[9px] font-bold uppercase tracking-widest ${t.priority === 'Urgente' ? 'text-red-500' : 'text-blue-500'}`}>{t.priority}</span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10}/> {t.due}</span>
                           </div>
                        </div>
                     </label>
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
                   <h3 className="text-sm font-bold text-slate-800 mb-8 flex items-center gap-2"><Building2 size={16} className="text-blue-500"/> Protocolos nos Órgãos Públicos</h3>
                   <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm font-bold text-blue-600">PM</div>
                               <div><p className="text-sm font-bold text-slate-800">Prefeitura Municipal</p><p className="text-[10px] text-slate-400 font-bold uppercase">Secretaria de Obras</p></div>
                            </div>
                            <span className="badge badge-blue">Em Análise</span>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Nº Protocolo</p><p className="text-xs font-mono font-bold text-blue-600">2026.000452-1</p></div>
                            <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Data Início</p><p className="text-xs font-bold text-slate-700">06/05/2026</p></div>
                            <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Último Retorno</p><p className="text-xs font-bold text-slate-700">—</p></div>
                            <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Responsável</p><p className="text-xs font-bold text-slate-700">Setor Técnico</p></div>
                         </div>
                         <div className="bg-white rounded-2xl p-4 border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Exigências / Observações</p>
                            <p className="text-xs text-slate-500 italic">Nenhuma exigência técnica cadastrada até o momento.</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="card p-6 border-0 shadow-sm bg-slate-900 text-white">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ação Rápida</h3>
                   <p className="text-sm text-slate-400 mb-6">Atualize a situação do protocolo ou responda exigências técnicas.</p>
                   <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20">Registrar Movimentação</button>
                   <button className="w-full mt-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10">Histórico Completo</button>
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
                   {[
                     { user: 'Jadson', action: 'Mudança de status para "Protocolo"', time: 'Hoje, 10:30', detail: 'De: Análise Inicial → Para: Protocolo Prefeitura' },
                     { user: 'Bruno', action: 'Upload de Documento', time: 'Ontem, 16:45', detail: 'Memorial_Descritivo_V1.pdf' },
                     { user: 'Automático', action: 'Confirmação Financeira', time: '04 Mai, 09:12', detail: 'Parcela 1 confirmada via API' },
                     { user: 'Jadson', action: 'Criação do Processo', time: '02 Mai, 08:00', detail: 'Operação iniciada com sucesso' },
                   ].map((log, i) => (
                     <div key={i} className="px-8 py-5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                           <p className="text-xs font-bold text-slate-800">{log.action}</p>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{log.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{log.detail}</p>
                        <p className="text-[9px] font-bold text-blue-600 mt-2">Agente: {log.user}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

      </div>

      {/* EDIT MODAL — simplificado para operação técnica */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Editar Detalhes Técnicos</h2>
                <p className="text-xs text-slate-500 font-medium">Gestão operacional do processo</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-colors"><X/></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Status Operacional</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option>Análise Inicial</option>
                        <option>Protocolo Prefeitura</option>
                        <option>Exigência Técnica</option>
                        <option>Em Aprovação</option>
                        <option>Finalizado</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Responsável Técnico</label>
                     <input type="text" defaultValue={processo.responsavel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Notas de Execução</label>
                  <textarea rows={4} defaultValue={processo.observacoes} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
               </div>
               <div className="flex gap-3 pt-6">
                  <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all">Cancelar</button>
                  <button className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 transition-all">Salvar Alterações</button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
