'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, User, Building2, Briefcase, DollarSign, 
  FileText, MessageSquare, Phone, Mail, MapPin, 
  Plus, Edit, ChevronRight, Clock, TrendingUp
} from 'lucide-react'

const TABS = [
  { id: 'dados',      label: 'Dados do Cliente', icon: User },
  { id: 'imoveis',    label: 'Imóveis',          icon: Building2 },
  { id: 'processos',  label: 'Processos',        icon: Briefcase },
  { id: 'financeiro', label: 'Financeiro',       icon: DollarSign },
  { id: 'documentos', label: 'Documentos',       icon: FileText },
  { id: 'obs',        label: 'Observações',      icon: MessageSquare },
]

export default function ClienteDetailPage() {
  const { id } = useParams()
  const [cliente, setCliente] = useState<any>(null)
  const [tab, setTab] = useState('dados')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clientes/${id}`)
      .then(r => r.json())
      .then(d => { setCliente(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
  if (!cliente) return <div className="card p-12 text-center"><p className="text-slate-500">Cliente não encontrado.</p></div>

  const processos = cliente.processos || []
  const imoveis = cliente.imoveis || []
  const financeiro = cliente.financeiro || []
  const totalRecebido = financeiro.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <Link href="/clientes" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg border border-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">{cliente.nome}</h1>
              <p className="page-subtitle flex items-center gap-2">
                <span className="badge badge-green">Ativo</span>
                <span>•</span>
                <span>{processos.length} processo(s)</span>
                <span>•</span>
                <span>{imoveis.length} imóvel(eis)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/processos/novo?clienteId=${cliente.id}`} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Novo Processo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Imóveis', value: imoveis.length, icon: Building2, color: 'text-purple-600 bg-purple-50' },
          { label: 'Processos', value: processos.length, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
          { label: 'Recebido', value: `R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Documentos', value: cliente.documentos?.length || 0, icon: FileText, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color.split(' ')[1]}`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color.split(' ')[0]}`} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="animate-fade-up">

        {/* DADOS DO CLIENTE */}
        {tab === 'dados' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-700">Informações Pessoais</h3>
              <div className="space-y-4">
                <InfoRow icon={User} label="Nome Completo" value={cliente.nome} />
                <InfoRow icon={User} label="CPF / CNPJ" value={cliente.cpf_cnpj} />
                <InfoRow icon={Phone} label="Telefone" value={cliente.telefone} />
                <InfoRow icon={Mail} label="E-mail" value={cliente.email} />
              </div>
            </div>
            <div className="card p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-700">Endereço</h3>
              <div className="space-y-4">
                <InfoRow icon={MapPin} label="CEP" value={cliente.cep} />
                <InfoRow icon={MapPin} label="Endereço" value={`${cliente.endereco || ''}${cliente.numero ? ', ' + cliente.numero : ''}`} />
                <InfoRow icon={MapPin} label="Bairro" value={cliente.bairro} />
                <InfoRow icon={MapPin} label="Cidade / UF" value={`${cliente.cidade || ''} / ${cliente.estado || ''}`} />
              </div>
            </div>
          </div>
        )}

        {/* IMÓVEIS */}
        {tab === 'imoveis' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link href={`/processos/novo?clienteId=${cliente.id}`} className="btn-secondary text-sm">
                <Plus className="w-4 h-4" /> Vincular Imóvel
              </Link>
            </div>
            {imoveis.length === 0 ? (
              <EmptyState icon={Building2} label="Nenhum imóvel vinculado" />
            ) : (
              imoveis.map((im: any) => (
                <div key={im.id} className="card p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{im.endereco}, {im.numero}</p>
                    <p className="text-xs text-slate-500">{im.bairro} • {im.cidade}/{im.estado}</p>
                    <div className="flex gap-2 mt-2">
                      {im.num_matricula && <span className="badge badge-slate">Matrícula: {im.num_matricula}</span>}
                      {im.area_construida && <span className="badge badge-blue">{im.area_construida} m²</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))
            )}
          </div>
        )}

        {/* PROCESSOS */}
        {tab === 'processos' && (
          <div className="space-y-4">
            {processos.length === 0 ? (
              <EmptyState icon={Briefcase} label="Nenhum processo vinculado" />
            ) : (
              processos.map((p: any) => (
                <Link key={p.id} href={`/processos/${p.id}`}>
                  <div className="card-hover p-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-blue">{p.codigo_projeto || 'SEM CÓDIGO'}</span>
                        <span className={`badge ${p.status === 'finalizado' ? 'badge-green' : 'badge-amber'}`}>{p.status}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{p.tipo_regularizacao}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* FINANCEIRO */}
        {tab === 'financeiro' && (
          <div className="space-y-4">
            {financeiro.length === 0 ? (
              <EmptyState icon={DollarSign} label="Nenhum registro financeiro" />
            ) : (
              financeiro.map((f: any) => (
                <div key={f.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{f.descricao}</p>
                    <p className="text-xs text-slate-500">{f.tipo} • {new Date(f.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-bold ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {f.tipo === 'receita' ? '+' : '-'} R$ {f.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`badge ${f.status === 'pago' ? 'badge-green' : 'badge-amber'}`}>{f.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* OBS */}
        {tab === 'obs' && (
          <div className="card p-6">
            <textarea
              className="input-field min-h-[200px] resize-none"
              placeholder="Anotações internas sobre este cliente..."
              defaultValue={cliente.observacoes || ''}
            />
          </div>
        )}

      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
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

function EmptyState({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="card p-12 text-center">
      <Icon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
