'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Users, Building2, DollarSign, FileText,
  TrendingUp, ChevronRight, Briefcase, Phone, Mail,
  MapPin, MessageSquare, Activity, Plus, Calendar, Clock,
  Trash2, AlertTriangle, Loader2, Wallet, User, Info,
  Smartphone, ExternalLink, Hash, CheckCircle2, History, Edit2
} from 'lucide-react'
import { EditClienteModal } from '@/components/EditClienteModal'

const TABS = [
  { id: 'dashboard',   label: 'Visão CRM',      icon: Activity },
  { id: 'processos',   label: 'Processos',      icon: Briefcase },
  { id: 'imoveis',     label: 'Patrimônio',     icon: Building2 },
  { id: 'crm',         label: 'Relacionamento', icon: MessageSquare },
  { id: 'documentos',  label: 'Documentos',     icon: FileText },
  { id: 'dados',       label: 'Ficha Cadastral', icon: Users },
]

export default function ClienteDetailPage() {
  const { id } = useParams()
  const [cliente, setCliente] = useState<any>(null)
  const [tab, setTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const router = useRouter()

  const fetchCliente = () => {
    fetch(`/api/clientes/${id}`)
      .then(r => r.json())
      .then(d => { setCliente(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchCliente()
  }, [id])

  if (loading) return (
    <div className="space-y-6 animate-fade-up p-8">
      <div className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse"/><div className="h-8 w-64 bg-slate-100 rounded animate-pulse"/></div>
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="card p-6 h-28 animate-pulse bg-slate-50 border-0 shadow-sm"/>)}</div>
    </div>
  )

  if (!cliente) return (
    <div className="max-w-md mx-auto mt-20 card p-12 text-center border-0 shadow-xl">
      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4"><Info size={32}/></div>
      <h2 className="text-lg font-bold text-slate-800">Cliente não encontrado</h2>
      <p className="text-slate-500 text-sm mt-2">O registro que você procura não existe ou foi removido.</p>
      <Link href="/clientes" className="btn-primary mt-8 inline-flex px-8">Voltar para listagem</Link>
    </div>
  )

  const processos  = cliente.processos || []
  const imoveis    = cliente.imoveis   || []
  const financeiro = cliente.financeiro || []

  const totalReceita = financeiro.filter((f: any) => f.tipo === 'receita').reduce((s: number, f: any) => s + f.valor, 0)
  const totalRecebido = financeiro.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0)
  const totalPendente = totalReceita - totalRecebido

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  const handleDeleteCliente = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/clientes')
      else { alert('Erro ao excluir cliente.'); setIsDeleting(false); }
    } catch (e) { alert('Erro ao excluir cliente.'); setIsDeleting(false); }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in p-2 md:p-6 pb-20">

      {/* HEADER PREMIUM (ESTILO CRM) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-start gap-5">
          <Link href="/clientes" className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl transition-all shadow-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{cliente.nome}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cliente.status === 'ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                {cliente.status || 'Ativo'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> {cliente.cidade || 'Cidade não inf.'} / {cliente.estado || 'UF'}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {cliente.telefone || '—'}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest">{cliente.cpf_cnpj || '000.000.000-00'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="hidden lg:flex flex-col items-end mr-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desde</p>
             <p className="text-xs font-bold text-slate-700">{new Date(cliente.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
          <button onClick={() => setIsEditModalOpen(true)} className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
             <Edit2 size={16}/>
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2.5 bg-white border border-slate-200 text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      </div>

      {/* KPI GRID - ENXUTO E ESTRATÉGICO */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Processos', value: processos.length, icon: Briefcase, color: '#3b82f6', bg: 'bg-blue-50/50' },
          { label: 'Imóveis', value: imoveis.length, icon: Building2, color: '#8b5cf6', bg: 'bg-purple-50/50' },
          { label: 'Receita Total', value: fmt(totalReceita), icon: Wallet, color: '#10b981', bg: 'bg-emerald-50/50' },
          { label: 'Valor Recebido', value: fmt(totalRecebido), icon: DollarSign, color: '#10b981', bg: 'bg-emerald-50/50' },
          { label: 'Pendente', value: fmt(totalPendente), icon: Clock, color: '#f59e0b', bg: 'bg-amber-50/50' },
        ].map(s => (
          <div key={s.label} className="card p-5 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <div className={`p-1.5 rounded-lg ${s.bg}`}><s.icon size={14} style={{ color: s.color }} /></div>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* NAV TABS */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl w-fit overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-all rounded-xl ${
              tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD CRM ───────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           <div className="lg:col-span-2 space-y-6">
              {/* HISTÓRICO DE RELACIONAMENTO RESUMIDO */}
              <div className="card p-6 border-0 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                   <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={16} className="text-blue-500"/> Últimos Contatos</h3>
                   <button className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline" onClick={() => setTab('crm')}>Ver CRM completo</button>
                </div>
                <div className="space-y-6">
                   {[
                     { date: 'Hoje, 14:20', type: 'WhatsApp', text: 'Enviado link para assinatura do contrato de regularização.', user: 'Jadson' },
                     { date: 'Ontem, 09:15', type: 'Ligação', text: 'Cliente ligou tirando dúvidas sobre prazo da prefeitura.', user: 'Jadson' },
                     { date: '04 Mai 2026', type: 'E-mail', text: 'Recebida matrícula do imóvel central atualizada.', user: 'Automático' }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400"><History size={14}/></div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase">{item.type}</span>
                           </div>
                           <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                           <p className="text-[10px] text-slate-400 mt-1.5">Registro por: <strong>{item.user}</strong></p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* DADOS DE CONTATO RÁPIDO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="card p-6 border-0 shadow-sm bg-slate-900 text-white">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Informações de Contato</h3>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Celular</span>
                          <span className="text-sm font-medium flex items-center gap-2">{cliente.telefone || '—'} <Smartphone size={14} className="text-blue-400"/></span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">E-mail</span>
                          <span className="text-sm font-medium flex items-center gap-2 underline underline-offset-4 decoration-slate-700">{cliente.email || '—'}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Origem</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">Indicação</span>
                       </div>
                    </div>
                    <button className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                       <Smartphone size={14}/> Chamar no WhatsApp
                    </button>
                 </div>
                 <div className="card p-6 border-0 shadow-sm bg-white">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Anotação Fixada</h3>
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                       {cliente.observacoes || 'Nenhuma nota fixada para este cliente. Adicione observações estratégicas para o relacionamento.'}
                    </p>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              {/* RESUMO DO PATRIMÔNIO (IMÓVEIS) */}
              <div className="card p-6 border-0 shadow-sm bg-white">
                 <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Building2 size={16} className="text-purple-500"/> Patrimônio</h3>
                    <span className="badge badge-purple">{imoveis.length}</span>
                 </div>
                 <div className="space-y-3">
                    {imoveis.slice(0, 3).map((im: any) => (
                      <Link key={im.id} href={`/imoveis/${im.id}`} className="block p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all">
                         <p className="text-xs font-bold text-slate-800 truncate">{im.endereco}</p>
                         <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{im.bairro} · {im.cidade}</p>
                      </Link>
                    ))}
                    {imoveis.length > 3 && (
                      <button className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase hover:text-purple-600 transition-colors" onClick={() => setTab('imoveis')}>
                        + Ver outros {imoveis.length - 3} imóveis
                      </button>
                    )}
                    {imoveis.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">Nenhum imóvel vinculado</p>}
                 </div>
              </div>

              {/* DOCUMENTOS PESSOAIS CHECKLIST */}
              <div className="card p-6 border-0 shadow-sm bg-white">
                 <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText size={16} className="text-amber-500"/> Doc. Pessoais</h3>
                 <div className="space-y-3">
                    {[
                      { label: 'RG / CNH', ok: true },
                      { label: 'CPF / CNPJ', ok: true },
                      { label: 'Comprovante Residência', ok: false },
                      { label: 'Contrato Assinado', ok: false },
                      { label: 'Procuração', ok: false },
                    ].map(doc => (
                      <div key={doc.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50">
                         <span className="text-xs font-medium text-slate-600">{doc.label}</span>
                         {doc.ok ? <CheckCircle2 size={14} className="text-emerald-500"/> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200"/>}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      )}

      {/* ── PROCESSOS TAB (TABELA SIMPLES) ─────────────────────────── */}
      {tab === 'processos' && (
        <div className="card overflow-hidden border-0 shadow-sm bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-sm font-bold text-slate-800">Processos Contratados</h3>
              <Link href="/processos/novo" className="btn-primary py-1.5 px-4 text-[11px]">Novo Processo</Link>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50">
                       <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Serviço</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Investimento</th>
                       <th className="px-6 py-4"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {processos.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">Nenhum processo iniciado</td></tr>
                    ) : processos.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                         <td className="px-6 py-4 font-mono text-[10px] font-bold text-blue-600">{p.codigo_projeto || '—'}</td>
                         <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-800">{p.tipo_regularizacao}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{p.imovel?.endereco || 'Imóvel vincul.'}</p>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex justify-center">
                               <span className={`px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider`}>{p.status}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-[11px] text-slate-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                         <td className="px-6 py-4 text-right font-bold text-slate-700 text-xs">{fmt(p.valor_total || 0)}</td>
                         <td className="px-6 py-4 text-right">
                            <Link href={`/processos/${p.id}`} className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all inline-flex shadow-sm"><ExternalLink size={14}/></Link>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* ── IMÓVEIS TAB (CARDS) ────────────────────────────────────── */}
      {tab === 'imoveis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {imoveis.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <Building2 size={40} className="text-slate-200 mx-auto mb-4"/>
                <p className="text-slate-500 font-medium text-sm">Nenhum imóvel vinculado a este CPF/CNPJ</p>
                <Link href={`/imoveis/novo?clienteId=${cliente.id}`} className="mt-6 inline-flex btn-primary px-8">Cadastrar Imóvel</Link>
             </div>
           ) : imoveis.map((im: any) => (
             <div key={im.id} className="card p-6 border-0 shadow-sm bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                   <Building2 size={24} className="text-slate-400 group-hover:text-blue-600 transition-colors"/>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1">{im.endereco}{im.numero ? `, nº ${im.numero}` : ''}</h4>
                <p className="text-[11px] text-slate-500 font-medium mb-6 uppercase tracking-wider">{im.bairro} · {im.cidade}/{im.estado}</p>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-6">
                   <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Área Constr.</p>
                      <p className="text-xs font-bold text-slate-800">{im.area_construida ? `${im.area_construida} m²` : '—'}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Matrícula</p>
                      <p className="text-xs font-bold text-slate-800">{im.num_matricula || '—'}</p>
                   </div>
                </div>

                <Link href={`/imoveis/${im.id}`} className="w-full py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-100">
                   Ver Ficha Técnica <ChevronRight size={14}/>
                </Link>
             </div>
           ))}
        </div>
      )}

      {/* ── RELACIONAMENTO TAB (CRM) ────────────────────────────────── */}
      {tab === 'crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-2 space-y-6">
              <div className="card p-6 border-0 shadow-sm bg-white">
                 <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><History size={16} className="text-blue-500"/> Histórico de Contatos</h3>
                    <button className="btn-primary py-1.5 px-4 text-[10px]">+ Novo Registro</button>
                 </div>
                 
                 <div className="space-y-8 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-100"/>
                    {[
                      { date: '06 Mai 2026', time: '14:20', type: 'WhatsApp', text: 'Enviado link para assinatura do contrato de regularização via Clicksign.', user: 'Jadson', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                      { date: '05 Mai 2026', time: '09:15', type: 'Ligação', text: 'Cliente ligou tirando dúvidas sobre prazo da prefeitura. Informado que processo está em análise na vigilância.', user: 'Jadson', icon: Phone, color: 'text-blue-500', bg: 'bg-blue-50' },
                      { date: '04 Mai 2026', time: '18:00', type: 'WhatsApp', text: 'Cliente confirmou o pagamento da primeira parcela do projeto arquitetônico.', user: 'Automático', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-50' },
                      { date: '02 Mai 2026', time: '10:30', type: 'Reunião', text: 'Visita técnica realizada no imóvel. Coletadas fotos e medidas iniciais para o projeto As-Built.', user: 'Técnico Bruno', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 relative z-10">
                         <div className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                            <item.icon size={14}/>
                         </div>
                         <div className="flex-1 pb-8 border-b border-slate-50 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-900">{item.date} às {item.time}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${item.bg} ${item.color}`}>{item.type}</span>
                               </div>
                               <span className="text-[10px] text-slate-400 font-medium">Por: {item.user}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">{item.text}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="card p-6 border-0 shadow-sm bg-white">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Smartphone size={14}/> Follow-ups Agendados</h3>
                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                       <p className="text-xs font-bold text-amber-700 mb-1">Cobrar Documentos</p>
                       <p className="text-[11px] text-amber-600 leading-snug mb-3">Ligar para o cliente para cobrar o comprovante de endereço atualizado.</p>
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Amanhã, 10:00</span>
                          <button className="text-[9px] font-bold text-amber-700 hover:underline">Resolver</button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="card p-6 border-0 shadow-sm bg-blue-600 text-white shadow-blue-100">
                 <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-4">Notas Internas</h3>
                 <textarea 
                    className="w-full bg-blue-500/30 border border-blue-400/30 rounded-xl p-3 text-sm placeholder:text-blue-300 outline-none focus:bg-blue-500/50 transition-all resize-none min-h-[120px]"
                    placeholder="Escreva algo sobre este cliente..."
                    defaultValue={cliente.observacoes}
                 />
                 <button className="w-full mt-4 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-all">Salvar Notas</button>
              </div>
           </div>
        </div>
      )}

      {/* ── DOCUMENTOS TAB (PESSOAIS) ─────────────────────────────── */}
      {tab === 'documentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {[
             { label: 'RG / CNH', status: 'Enviado', date: '01/05/2026', size: '1.2 MB' },
             { label: 'CPF / CNPJ', status: 'Enviado', date: '01/05/2026', size: '0.8 MB' },
             { label: 'Comprovante Residência', status: 'Pendente', date: '—', size: '—' },
             { label: 'Contrato Assinado', status: 'Aguardando', date: '—', size: '—' },
             { label: 'Procuração', status: 'Pendente', date: '—', size: '—' },
             { label: 'Certidão Casamento', status: 'Não Nec.', date: '—', size: '—' },
           ].map(doc => (
             <div key={doc.label} className="card p-5 border-0 shadow-sm bg-white hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2.5 rounded-xl ${doc.status === 'Enviado' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      <FileText size={20}/>
                   </div>
                   <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${doc.status === 'Enviado' ? 'bg-emerald-50 text-emerald-600' : doc.status === 'Pendente' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                      {doc.status}
                   </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">{doc.label}</h4>
                <p className="text-[10px] text-slate-400">{doc.date !== '—' ? `${doc.date} · ${doc.size}` : 'Aguardando upload'}</p>
                
                <div className="mt-6 flex items-center gap-2">
                   {doc.status === 'Enviado' ? (
                     <>
                       <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">Ver</button>
                       <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-red-500">Excluir</button>
                     </>
                   ) : (
                     <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Plus size={12}/> Upload
                     </button>
                   )}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* ── FICHA CADASTRAL TAB (DADOS) ────────────────────────────── */}
      {tab === 'dados' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="card p-8 border-0 shadow-sm bg-white">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 pb-4 border-b border-slate-50 flex items-center gap-2"><User size={14}/> Informações Cadastrais</h3>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-8">
                    <DataField label="Nome Completo / Razão" value={cliente.nome} />
                    <DataField label="CPF / CNPJ" value={cliente.cpf_cnpj} fontMono />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <DataField label="Telefone / Celular" value={cliente.telefone} />
                    <DataField label="E-mail Principal" value={cliente.email} />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <DataField label="Origem do Cliente" value="Indicação Direta" />
                    <DataField label="Tipo de Cliente" value="Pessoa Física" />
                 </div>
              </div>
           </div>

           <div className="card p-8 border-0 shadow-sm bg-white">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 pb-4 border-b border-slate-50 flex items-center gap-2"><MapPin size={14}/> Endereço de Correspondência</h3>
              <div className="space-y-6">
                 <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                       <DataField label="Endereço / Logradouro" value={cliente.endereco} />
                    </div>
                    <DataField label="Número" value={cliente.numero || 'S/N'} />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <DataField label="Bairro" value={cliente.bairro} />
                    <DataField label="CEP" value={cliente.cep} fontMono />
                 </div>
                 <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                       <DataField label="Cidade" value={cliente.cidade} />
                    </div>
                    <DataField label="Estado / UF" value={cliente.estado} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 pb-0 flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 border border-red-100 shadow-sm shadow-red-50">
                  <AlertTriangle size={32} />
               </div>
               <h2 className="text-xl font-bold text-slate-900">Excluir {cliente.nome}?</h2>
               <p className="text-sm text-slate-500 mt-2">Esta ação apagará permanentemente o cliente e todos os dados vinculados, incluindo processos e históricos.</p>
            </div>
            <div className="p-8 pt-10 space-y-3">
               <button 
                  disabled={isDeleting}
                  onClick={handleDeleteCliente}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
               >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 size={18} />}
                  Confirmar Exclusão Definitiva
               </button>
               <button 
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm transition-all"
               >
                  Cancelar
               </button>
            </div>
          </div>
        </div>
      )}
      <EditClienteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cliente={cliente}
        onSuccess={fetchCliente}
      />
    </div>
  )
}

function DataField({ label, value, fontMono }: { label: string; value?: string; fontMono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-sm font-semibold text-slate-800 ${fontMono ? 'font-mono tracking-wider' : ''}`}>
        {value || <span className="text-slate-300 font-normal italic">— Não informado</span>}
      </p>
    </div>
  )
}
