'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Info, Building2, FileText,
  DollarSign, ListTodo, History, GitBranch,
  MapPin, User, Calendar, Edit, X, Check,
  Loader2, ChevronRight, CheckCircle2, Circle, Clock
} from 'lucide-react'

const TABS = [
  { id: 'geral',      label: 'Visão Geral',  icon: Info },
  { id: 'timeline',   label: 'Timeline',     icon: GitBranch },
  { id: 'imovel',     label: 'Imóvel',       icon: Building2 },
  { id: 'documentos', label: 'Documentos',   icon: FileText },
  { id: 'financeiro', label: 'Financeiro',   icon: DollarSign },
  { id: 'tarefas',    label: 'Tarefas',      icon: ListTodo },
  { id: 'historico',  label: 'Histórico',    icon: History },
]

// ── Timeline Component ───────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { id: 'cliente',        label: 'Cliente Cadastrado',      desc: 'Dados do cliente registrados no sistema' },
  { id: 'imovel',         label: 'Imóvel Cadastrado',       desc: 'Imóvel vinculado ao processo' },
  { id: 'documentos',     label: 'Documentos Enviados',     desc: 'Documentação técnica e legal anexada' },
  { id: 'protocolo',      label: 'Protocolo Prefeitura',    desc: 'Processo protocolado no órgão competente' },
  { id: 'analise',        label: 'Em Análise',              desc: 'Aguardando análise do setor responsável' },
  { id: 'concluido',      label: 'Concluído',               desc: 'Processo aprovado e finalizado' },
]

function ProcessTimeline({ processo }: { processo: any }) {
  const status = processo?.status || ''
  const hasImovel = !!processo?.imovel
  const hasDocumentos = (processo?.documentos?.length || 0) > 0
  const hasProtocolo = status.includes('protocolo') || status.includes('aprovacao') || status === 'finalizado'
  const hasAnalise = status.includes('analise') || status.includes('aprovacao') || status === 'finalizado'
  const hasFinished = status === 'finalizado' || status === 'aprovado'

  const stepStatus = [
    true,          // cliente sempre cadastrado
    hasImovel,
    hasDocumentos,
    hasProtocolo,
    hasAnalise,
    hasFinished,
  ]

  const currentStep = stepStatus.lastIndexOf(true)

  return (
    <div className="card p-8">
      <h3 className="text-sm font-bold text-slate-800 mb-8">Progresso do Processo</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-200" />
        <div
          className="absolute left-5 top-5 w-0.5 bg-blue-500 transition-all duration-1000"
          style={{ height: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
        />

        <div className="space-y-8">
          {TIMELINE_STEPS.map((step, i) => {
            const done    = stepStatus[i] === true
            const current = i === currentStep && done
            const pending = !done

            return (
              <div key={step.id} className="flex items-start gap-6">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 z-10 transition-all ${
                  done
                    ? current
                      ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200'
                      : 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-slate-300'
                }`}>
                  {done
                    ? current
                      ? <Clock className="w-4 h-4 text-white" />
                      : <CheckCircle2 className="w-4 h-4 text-white" />
                    : <Circle className="w-4 h-4 text-slate-300" />
                  }
                </div>

                {/* Content */}
                <div className={`flex-1 pb-2 ${ pending ? 'opacity-40' : '' }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-bold ${ current ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400' }`}>
                      {step.label}
                    </p>
                    {current && <span className="badge badge-blue text-[10px]">Atual</span>}
                    {done && !current && <span className="badge badge-green text-[10px]">Concluída</span>}
                  </div>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                  {done && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {i === 0 ? new Date(processo.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }) : ''}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-600">Progresso Geral</p>
          <p className="text-xs font-bold text-blue-600">{Math.round(((currentStep + 1) / TIMELINE_STEPS.length) * 100)}%</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${((currentStep + 1) / TIMELINE_STEPS.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-slate-400">Início</span>
          <span className="text-[10px] text-slate-400">Conclusão</span>
        </div>
      </div>
    </div>
  )
}

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

export default function ProcessoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tab, setTab] = useState('geral')
  const [processo, setProcesso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [formData, setFormData] = useState<any>({})
  const [isSearchingCep, setIsSearchingCep] = useState(false)

  const fetchProcesso = () => {
    setLoading(true)
    fetch(`/api/processos/${params.id}`)
      .then(r => r.json())
      .then(d => { 
        setProcesso(d)
        setLoading(false)
        setFormData({
          tipo_regularizacao: d.tipo_regularizacao,
          status: d.status,
          responsavel: d.responsavel || '',
          observacoes: d.observacoes || '',
          endereco: d.imovel?.endereco || '',
          numero: d.imovel?.numero || '',
          bairro: d.imovel?.bairro || '',
          cidade: d.imovel?.cidade || '',
          cep: d.imovel?.cep || '',
          area_terreno: d.imovel?.area_terreno || '',
          area_construida: d.imovel?.area_construida || '',
          num_matricula: d.imovel?.num_matricula || '',
          cartorio: d.imovel?.cartorio || '',
          inscricao_imobiliaria: d.imovel?.inscricao_imobiliaria || '',
          zoneamento: d.imovel?.zoneamento || '',
        })
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchProcesso()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    setFormData((prev: any) => ({ ...prev, cep: e.target.value }))

    if (cep.length === 8) {
      setIsSearchingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setFormData((prev: any) => ({
            ...prev,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
          }))
          // Foca no campo número após buscar o CEP
          const numeroInput = document.getElementsByName('numero')[0] as HTMLInputElement
          if (numeroInput) numeroInput.focus()
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      } finally {
        setIsSearchingCep(false)
      }
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    const payload = {
      tipo_regularizacao: formData.tipo_regularizacao,
      status: formData.status,
      responsavel: formData.responsavel,
      observacoes: formData.observacoes,
      imovel: {
        endereco: formData.endereco,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        cep: formData.cep,
        area_terreno: formData.area_terreno ? parseFloat(formData.area_terreno) : null,
        area_construida: formData.area_construida ? parseFloat(formData.area_construida) : null,
        num_matricula: formData.num_matricula,
        cartorio: formData.cartorio,
        inscricao_imobiliaria: formData.inscricao_imobiliaria,
        zoneamento: formData.zoneamento,
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
        {tab === 'timeline' && (
          <div className="max-w-xl animate-fade-up">
            <ProcessTimeline processo={processo} />
          </div>
        )}
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
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {processo.imovel.endereco}{processo.imovel.numero ? `, nº ${processo.imovel.numero}` : ''}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{processo.imovel.bairro} • {processo.imovel.cidade}</p>
                    </div>
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        )}

        {tab === 'imovel' && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Dados de Localização">
                <div className="grid grid-cols-1 gap-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                       <InfoField label="Endereço da Obra" value={processo.imovel?.endereco} />
                    </div>
                    <div>
                       <InfoField label="Número" value={processo.imovel?.numero} />
                    </div>
                  </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Tipo de Regularização *</Label>
                  <input name="tipo_regularizacao" value={formData.tipo_regularizacao} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" required />
                </div>
                <div>
                  <Label>Status Atual</Label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                    {Object.entries(STATUS_LABELS).map(([val, {label}]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Responsável Técnico</Label>
                  <input name="responsavel" value={formData.responsavel} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Informações do Imóvel</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label>CEP (Busca Automática)</Label>
                      <div className="relative">
                        <input name="cep" value={formData.cep} onChange={handleCepChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="00000-000" />
                        {isSearchingCep && <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-3 top-2.5" />}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                      <Label>Logradouro / Endereço</Label>
                      <input name="endereco" value={formData.endereco} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <input name="numero" value={formData.numero} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Ex: 123" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex-1">
                      <Label>Bairro</Label>
                      <input name="bairro" value={formData.bairro} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <input name="cidade" value={formData.cidade} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Área Terreno (m²)</Label>
                      <input name="area_terreno" type="number" step="0.01" value={formData.area_terreno} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <Label>Área Construída (m²)</Label>
                      <input name="area_construida" type="number" step="0.01" value={formData.area_construida} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Nº Matrícula</Label>
                      <input name="num_matricula" value={formData.num_matricula} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <Label>Cartório / RGI</Label>
                      <input name="cartorio" value={formData.cartorio} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <Label>Zoneamento</Label>
                      <input name="zoneamento" value={formData.zoneamento} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  <div>
                    <Label>Inscrição Imobiliária</Label>
                    <input name="inscricao_imobiliaria" value={formData.inscricao_imobiliaria} onChange={handleInputChange} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
              </div>

              <div>
                <Label>Observações de Operação</Label>
                <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" disabled={isUpdating} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-5 pb-4 border-b border-slate-100">{title}</h3>
      {children}
    </div>
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
