'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Info, Building2, FileText,
  DollarSign, ListTodo, History,
  MapPin, User, Calendar, Edit, X, Check
} from 'lucide-react'

const TABS = [
  { id: 'geral',      label: 'Visão Geral',  icon: Info },
  { id: 'imovel',     label: 'Imóvel',       icon: Building2 },
  { id: 'documentos', label: 'Documentos',   icon: FileText },
  { id: 'financeiro', label: 'Financeiro',   icon: DollarSign },
  { id: 'tarefas',    label: 'Tarefas',      icon: ListTodo },
  { id: 'historico',  label: 'Histórico',    icon: History },
]

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  em_analise:            { label: "Análise Inicial",    className: "badge-blue" },
  documentacao_pendente: { label: "Doc. Pendente",      className: "badge-amber" },
  exigencia_tecnica:     { label: "Exigência Técnica",  className: "badge-red" },
  protocolo_prefeitura:  { label: "Protocolo",          className: "badge-gray" },
  em_aprovacao:          { label: "Em Aprovação",       className: "badge-blue" },
  aprovado:              { label: "Aprovado",           className: "badge-green" },
  finalizado:            { label: "Finalizado",         className: "badge-green" },
}

// UI Components
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    />
  )
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    >
      {children}
    </select>
  )
}

function InfoField({ label, value }: { label: string; value?: string | null | number }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value !== null && value !== undefined && value !== '' ? value : <span className="text-slate-400">—</span>}</p>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-5 pb-4 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  )
}

export default function ProcessoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tab, setTab] = useState('geral')
  const [processo, setProcesso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchProcesso = () => {
    setLoading(true)
    fetch(`/api/processos/${params.id}`)
      .then(r => r.json())
      .then(d => { setProcesso(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchProcesso()
  }, [params.id])

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdating(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    const payload = {
      tipo_regularizacao: data.tipo_regularizacao,
      status: data.status,
      responsavel: data.responsavel,
      observacoes: data.observacoes,
      imovel: {
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: data.cidade,
        cep: data.cep,
        area_terreno: data.area_terreno ? parseFloat(data.area_terreno as string) : null,
        area_construida: data.area_construida ? parseFloat(data.area_construida as string) : null,
        num_matricula: data.num_matricula,
        cartorio: data.cartorio,
        inscricao_imobiliaria: data.inscricao_imobiliaria,
        zoneamento: data.zoneamento,
      }
    }

    try {
      const res = await fetch(`/api/processos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsEditModalOpen(false)
        fetchProcesso()
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading && !processo) return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
      <div className="text-sm text-slate-400 animate-pulse font-medium">Carregando detalhes do processo...</div>
    </div>
  )

  if (!processo) return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
      <div className="text-sm text-red-500 font-medium">Processo não encontrado.</div>
    </div>
  )

  const status = STATUS_LABELS[processo.status] || { label: processo.status, className: "badge-gray" }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-start justify-between max-w-screen-xl mx-auto">
          <div className="flex items-start gap-4">
            <Link href="/processos" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              {/* BREADCRUMB */}
              <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                <Link href="/processos" className="hover:text-slate-600 transition-colors">Processos</Link>
                <span>/</span>
                <span className="text-slate-600 font-medium font-mono">#{processo.id.substring(0, 8).toUpperCase()}</span>
              </nav>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-semibold text-slate-900">{processo.tipo_regularizacao}</h1>
                <span className={`badge ${status.className}`}>{status.label}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> {processo.cliente.nome}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[hsl(var(--border))] text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <Link
              href={`/clientes/${processo.clienteId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              Ver Cliente
            </Link>
          </div>
        </div>

        {/* TABS */}
        <div className="max-w-screen-xl mx-auto flex items-center gap-0 mt-6 -mb-5 border-t border-[hsl(var(--border))] pt-1 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="px-8 py-7 max-w-screen-xl mx-auto">

        {/* TAB: VISÃO GERAL */}
        {tab === 'geral' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="xl:col-span-2 space-y-6">
              <SectionCard title="Informações do Processo">
                <div className="grid grid-cols-2 gap-5">
                  <InfoField label="Tipo de Regularização" value={processo.tipo_regularizacao} />
                  <InfoField label="Etapa Atual" value={processo.etapa_atual || 'Análise Inicial'} />
                  <InfoField label="Data de Início" value={new Date(processo.createdAt).toLocaleDateString('pt-BR')} />
                  <InfoField label="Responsável Técnico" value={processo.responsavel || 'Não definido'} />
                </div>
              </SectionCard>
              <SectionCard title="Observações Estratégicas">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {processo.observacoes || 'Nenhuma observação interna registrada para este processo.'}
                </p>
              </SectionCard>
            </div>
            <div className="space-y-6">
              <SectionCard title="Cliente Proprietário">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 font-bold">
                    {processo.cliente.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{processo.cliente.nome}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider">{processo.cliente.cpf_cnpj}</p>
                  </div>
                </div>
                <Link href={`/clientes/${processo.clienteId}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Acessar ficha completa <ChevronRight className="w-3 h-3" />
                </Link>
              </SectionCard>
              {processo.imovel && (
                <SectionCard title="Localização do Imóvel">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{processo.imovel.endereco}</p>
                      <p className="text-xs text-slate-400 mt-1">{processo.imovel.bairro} • {processo.imovel.cidade}</p>
                    </div>
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        )}

        {/* TAB: IMÓVEL */}
        {tab === 'imovel' && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Dados de Localização">
                <div className="grid grid-cols-1 gap-5">
                  <InfoField label="Endereço da Obra" value={processo.imovel?.endereco} />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Bairro" value={processo.imovel?.bairro} />
                    <InfoField label="CEP" value={processo.imovel?.cep} />
                  </div>
                  <InfoField label="Cidade / UF" value={processo.imovel?.cidade ? `${processo.imovel.cidade} / ${processo.imovel.estado || '—'}` : null} />
                </div>
              </SectionCard>
              <SectionCard title="Áreas e Dimensões">
                <div className="grid grid-cols-1 gap-5">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Área Terreno</span>
                    <span className="text-sm font-bold text-slate-800">{processo.imovel?.area_terreno ? `${processo.imovel.area_terreno} m²` : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Área Construída</span>
                    <span className="text-sm font-bold text-slate-800">{processo.imovel?.area_construida ? `${processo.imovel.area_construida} m²` : '—'}</span>
                  </div>
                  <InfoField label="Zoneamento" value={processo.imovel?.zoneamento} />
                </div>
              </SectionCard>
            </div>
            <SectionCard title="Dados Técnicos e Registro">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoField label="Nº Matrícula" value={processo.imovel?.num_matricula} />
                <InfoField label="Inscrição Imobiliária" value={processo.imovel?.inscricao_imobiliaria} />
                <InfoField label="Cartório / RGI" value={processo.imovel?.cartorio} />
              </div>
            </SectionCard>
          </div>
        )}

        {/* TAB: DOCUMENTOS, FINANCEIRO, TAREFAS, HISTORICO (Mantidos com visual limpo) */}
        {(tab === 'documentos' || tab === 'financeiro' || tab === 'tarefas' || tab === 'historico') && (
           <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-20 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 {tab === 'documentos' && <FileText className="w-8 h-8 text-slate-300" />}
                 {tab === 'financeiro' && <DollarSign className="w-8 h-8 text-slate-300" />}
                 {tab === 'tarefas' && <ListTodo className="w-8 h-8 text-slate-300" />}
                 {tab === 'historico' && <History className="w-8 h-8 text-slate-300" />}
              </div>
              <p className="text-sm font-semibold text-slate-900">Módulo em preenchimento</p>
              <p className="text-xs text-slate-400 mt-1">Utilize a aba "Visão Geral" ou "Imóvel" para organizar os dados iniciais.</p>
           </div>
        )}

      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[hsl(var(--border))] w-full max-w-2xl rounded-2xl shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Editar Dados do Processo</h2>
                <p className="text-xs text-slate-500 mt-0.5">Atualize as informações técnicas e de localização</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              
              {/* DADOS DO PROCESSO */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Tipo de Regularização *</Label>
                  <Input name="tipo_regularizacao" defaultValue={processo.tipo_regularizacao} required />
                </div>
                <div>
                  <Label>Status Atual</Label>
                  <Select name="status" defaultValue={processo.status}>
                    {Object.entries(STATUS_LABELS).map(([val, {label}]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Responsável Técnico</Label>
                  <Input name="responsavel" defaultValue={processo.responsavel || ''} placeholder="Nome do profissional" />
                </div>
              </div>

              {/* DADOS DO IMÓVEL */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Informações do Imóvel</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Endereço Completo</Label>
                    <Input name="endereco" defaultValue={processo.imovel?.endereco || ''} placeholder="Rua, Número, Complemento..." />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label>Bairro</Label>
                      <Input name="bairro" defaultValue={processo.imovel?.bairro || ''} />
                    </div>
                    <div>
                      <Label>CEP</Label>
                      <Input name="cep" defaultValue={processo.imovel?.cep || ''} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex-1">
                      <Label>Cidade</Label>
                      <Input name="cidade" defaultValue={processo.imovel?.cidade || ''} />
                    </div>
                    <div>
                      <Label>Zoneamento</Label>
                      <Input name="zoneamento" defaultValue={processo.imovel?.zoneamento || ''} placeholder="Ex: ZRE" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Área Terreno (m²)</Label>
                      <Input name="area_terreno" type="number" step="0.01" defaultValue={processo.imovel?.area_terreno || ''} />
                    </div>
                    <div>
                      <Label>Área Construída (m²)</Label>
                      <Input name="area_construida" type="number" step="0.01" defaultValue={processo.imovel?.area_construida || ''} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nº Matrícula</Label>
                      <Input name="num_matricula" defaultValue={processo.imovel?.num_matricula || ''} />
                    </div>
                    <div>
                      <Label>Cartório / RGI</Label>
                      <Input name="cartorio" defaultValue={processo.imovel?.cartorio || ''} />
                    </div>
                  </div>
                  <div>
                    <Label>Inscrição Imobiliária</Label>
                    <Input name="inscricao_imobiliaria" defaultValue={processo.imovel?.inscricao_imobiliaria || ''} />
                  </div>
                </div>
              </div>

              <div>
                <Label>Observações de Operação</Label>
                <textarea 
                  name="observacoes"
                  defaultValue={processo.observacoes || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? 'Salvando...' : <><Check className="w-4 h-4" /> Atualizar Dados</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
