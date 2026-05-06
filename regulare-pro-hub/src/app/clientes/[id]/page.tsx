'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Users, Building2, DollarSign, FileText,
  TrendingUp, ChevronRight, Briefcase, Phone, Mail,
  MapPin, MessageSquare, Activity, Plus, Calendar, Clock
} from 'lucide-react'

const TABS = [
  { id: 'crm',       label: 'Painel CRM',     icon: Activity },
  { id: 'imoveis',   label: 'Imóveis & Processos', icon: Building2 },
  { id: 'dados',     label: 'Dados',           icon: Users },
  { id: 'financeiro',label: 'Financeiro',      icon: DollarSign },
  { id: 'obs',       label: 'Observações',     icon: MessageSquare },
]

const PROCESS_STATUS: Record<string, { label: string; badge: string }> = {
  em_analise:           { label: 'Em Análise',   badge: 'badge-amber' },
  protocolo_prefeitura: { label: 'Protocolo',    badge: 'badge-blue' },
  finalizado:           { label: 'Finalizado',   badge: 'badge-green' },
  pendente:             { label: 'Pendente',      badge: 'badge-red' },
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ClienteDetailPage() {
  const { id } = useParams()
  const [cliente, setCliente] = useState<any>(null)
  const [tab, setTab] = useState('crm')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clientes/${id}`)
      .then(r => r.json())
      .then(d => { setCliente(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-4"><div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse"/><div className="h-8 w-48 bg-slate-100 rounded animate-pulse"/></div>
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="card p-5 h-24 animate-pulse bg-slate-50"/>)}</div>
    </div>
  )

  if (!cliente) return (
    <div className="card p-12 text-center">
      <p className="text-slate-500">Cliente não encontrado.</p>
      <Link href="/clientes" className="btn-primary mt-4 inline-flex">Voltar</Link>
    </div>
  )

  const processos  = cliente.processos || []
  const imoveis    = cliente.imoveis   || []
  const financeiro = cliente.financeiro || []

  const totalReceita = financeiro.filter((f: any) => f.tipo === 'receita').reduce((s: number, f: any) => s + f.valor, 0)
  const totalRecebido = financeiro.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0)
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  // Activity feed: combine processos + financeiro ordenados por data
  const activities = [
    ...processos.map((p: any) => ({ date: p.createdAt, type: 'process', label: `Processo criado: ${p.tipo_regularizacao}`, sub: p.codigo_projeto || p.status, icon: Briefcase, color: '#2563eb', bg: '#eff6ff' })),
    ...financeiro.map((f: any) => ({ date: f.createdAt, type: 'finance', label: f.descricao, sub: fmt(f.valor), icon: DollarSign, color: f.tipo === 'receita' ? '#10b981' : '#ef4444', bg: f.tipo === 'receita' ? '#ecfdf5' : '#fef2f2' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/clientes" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg border border-slate-200 transition-colors mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="page-title">{cliente.nome}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="badge badge-green">Ativo</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">{processos.length} processo(s)</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">{imoveis.length} imóvel(eis)</span>
                {cliente.cidade && <><span className="text-slate-300">•</span><span className="text-xs text-slate-500">{cliente.cidade}/{cliente.estado}</span></>}
              </div>
            </div>
            <Link href={`/clientes`} className="btn-secondary text-sm">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <button onClick={() => setTab('imoveis')} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Novo Imóvel
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Imóveis',        value: imoveis.length,             icon: Building2, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Processos',      value: processos.length,           icon: Briefcase, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Receita Gerada', value: fmt(totalReceita),          icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Valor Recebido', value: fmt(totalRecebido),         icon: DollarSign, color: '#f59e0b', bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 -mb-2">
        <div className="flex gap-0.5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CRM TAB ──────────────────────────────────────────────────── */}
      {tab === 'crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">

          {/* Imóveis vinculados */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Imóveis Vinculados</h3>
              <span className="badge badge-purple">{imoveis.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {imoveis.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum imóvel</p>
                ) : imoveis.map((im: any) => {
                  const imProcesses = processos.filter((p: any) => p.imovelId === im.id)
                  return (
                    <Link key={im.id} href={`/imoveis/${im.id}`} className="block p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{im.endereco}{im.numero ? `, ${im.numero}` : ''}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{im.bairro} · {im.cidade}/{im.estado}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="badge badge-purple text-[10px]">{imProcesses.length} processos</span>
                        {im.area_construida && <span className="badge badge-blue text-[10px]">{im.area_construida} m²</span>}
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>

          {/* Processos vinculados */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Processos</h3>
              <span className="badge badge-blue">{processos.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {processos.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum processo</p>
              ) : processos.map((p: any) => {
                const st = PROCESS_STATUS[p.status] || { label: p.status, badge: 'badge-slate' }
                return (
                  <Link key={p.id} href={`/processos/${p.id}`}
                    className="block p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-blue-600">{p.codigo_projeto || '—'}</span>
                      <span className={`badge ${st.badge} text-[10px]`}>{st.label}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{p.tipo_regularizacao}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Histórico de atividades */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Histórico de Atividades</h3>
            </div>
            <div className="p-4">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Sem atividades</p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                  <div className="space-y-5">
                    {activities.map((a, i) => (
                      <div key={i} className="flex items-start gap-4 pl-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm z-10" style={{ backgroundColor: a.bg }}>
                          <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-xs font-semibold text-slate-700 leading-tight">{a.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {a.sub} · {new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DADOS TAB ────────────────────────────────────────────────── */}
      {tab === 'dados' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Informações Pessoais</h3>
            <InfoItem icon={Users}  label="Nome Completo" value={cliente.nome} />
            <InfoItem icon={Users}  label="CPF / CNPJ"    value={cliente.cpf_cnpj} />
            <InfoItem icon={Phone}  label="Telefone"       value={cliente.telefone} />
            <InfoItem icon={Mail}   label="E-mail"         value={cliente.email} />
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Endereço</h3>
            <InfoItem icon={MapPin} label="CEP"       value={cliente.cep} />
            <InfoItem icon={MapPin} label="Endereço"  value={`${cliente.endereco || ''}${cliente.numero ? ', ' + cliente.numero : ''}`} />
            <InfoItem icon={MapPin} label="Bairro"    value={cliente.bairro} />
            <InfoItem icon={MapPin} label="Cidade/UF" value={`${cliente.cidade || ''} / ${cliente.estado || ''}`} />
          </div>
        </div>
      )}

      {/* ── IMÓVEIS & PROCESSOS TAB ──────────────────────────────────── */}
      {tab === 'imoveis' && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Imóveis & Seus Processos</h3>
            <Link href={`/imoveis/novo?clienteId=${cliente.id}`} className="btn-primary text-xs py-2">
              <Plus className="w-3.5 h-3.5" /> Adicionar Novo Imóvel
            </Link>
          </div>

          {imoveis.length === 0 ? (
            <div className="card p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4"/>
              <p className="text-slate-500 font-medium">Este cliente ainda não possui imóveis cadastrados.</p>
              <p className="text-sm text-slate-400 mt-1">Cadastre um imóvel para iniciar o fluxo de regularização.</p>
              <Link href={`/imoveis/novo?clienteId=${cliente.id}`} className="btn-primary mt-6 inline-flex">
                Cadastrar Primeiro Imóvel
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {imoveis.map((im: any) => {
                const imProcesses = processos.filter((p: any) => p.imovelId === im.id)
                return (
                  <div key={im.id} className="card overflow-hidden border-l-4 border-l-blue-500">
                    <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 leading-tight">
                            {im.endereco}{im.numero ? `, nº ${im.numero}` : ''}
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">{im.bairro} · {im.cidade}/{im.estado}</p>
                          <div className="flex gap-2 mt-3">
                            {im.area_construida && <span className="badge badge-blue">{im.area_construida} m²</span>}
                            {im.num_matricula && <span className="badge badge-slate">Mat: {im.num_matricula}</span>}
                            {im.zoneamento && <span className="badge badge-purple">Zona: {im.zoneamento}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link href={`/processos/novo?imovelId=${im.id}`} className="btn-primary text-xs py-2 px-4 shadow-blue-200 shadow-lg">
                          <Plus className="w-3.5 h-3.5" /> Novo Processo
                        </Link>
                        <Link href={`/imoveis/editar/${im.id}`} className="btn-ghost text-xs py-2 px-4">
                          Editar Imóvel
                        </Link>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Processos neste Imóvel</p>
                      {imProcesses.length === 0 ? (
                        <div className="bg-slate-50/50 rounded-xl p-6 text-center border-2 border-dashed border-slate-200">
                          <p className="text-xs text-slate-400">Nenhum processo iniciado para este imóvel.</p>
                          <button onClick={() => window.location.href=`/processos/novo?imovelId=${im.id}`} className="text-xs font-bold text-blue-600 hover:underline mt-2">
                            + Iniciar primeiro processo
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {imProcesses.map((p: any) => {
                            const st = PROCESS_STATUS[p.status] || { label: p.status, badge: 'badge-slate' }
                            return (
                              <Link key={p.id} href={`/processos/${p.id}`} className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{p.codigo_projeto || '—'}</span>
                                    <span className={`badge ${st.badge} text-[10px]`}>{st.label}</span>
                                  </div>
                                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                    {p.tipo_regularizacao}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Atualizado em {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── FINANCEIRO TAB ───────────────────────────────────────────── */}
      {tab === 'financeiro' && (
        <div className="space-y-3 animate-fade-up">
          {financeiro.length === 0 ? (
            <div className="card p-12 text-center">
              <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-3"/>
              <p className="text-sm text-slate-500">Nenhum registro financeiro</p>
            </div>
          ) : financeiro.map((f: any) => (
            <div key={f.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{f.descricao}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{f.tipo} · {new Date(f.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className={`text-base font-bold ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {f.tipo === 'receita' ? '+' : '-'} {fmt(f.valor)}
                </p>
                <span className={`badge ${f.status === 'pago' ? 'badge-green' : 'badge-amber'} text-[10px]`}>{f.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── OBSERVAÇÕES TAB ──────────────────────────────────────────── */}
      {tab === 'obs' && (
        <div className="card p-6 animate-fade-up">
          <textarea className="input-field min-h-[200px] resize-none"
            placeholder="Anotações internas sobre este cliente..."
            defaultValue={cliente.observacoes || ''} />
          <div className="flex justify-end mt-3">
            <button className="btn-primary text-sm">Salvar Observações</button>
          </div>
        </div>
      )}

    </div>
  )
}
