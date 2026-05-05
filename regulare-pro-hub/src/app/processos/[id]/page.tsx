'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Info, Building2, FileText,
  DollarSign, ListTodo, History,
  MapPin, User, Calendar, Edit
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

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value || <span className="text-slate-400">—</span>}</p>
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
  const [tab, setTab] = useState('geral')
  const [processo, setProcesso] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/processos/${params.id}`)
      .then(r => r.json())
      .then(d => { setProcesso(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
      <div className="text-sm text-slate-400 animate-pulse">Carregando processo...</div>
    </div>
  )

  if (!processo) return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
      <div className="text-sm text-red-500">Processo não encontrado.</div>
    </div>
  )

  const status = STATUS_LABELS[processo.status] || { label: processo.status, className: "badge-gray" }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-start justify-between">
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
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-[hsl(var(--border))] text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50 transition-colors">
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <Link
              href={`/clientes/${processo.clienteId}`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              Ver Cliente
            </Link>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-0 mt-6 -mb-5 border-t border-[hsl(var(--border))] pt-1 overflow-x-auto scrollbar-thin">
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <SectionCard title="Informações do Processo">
                <div className="grid grid-cols-2 gap-5">
                  <InfoField label="Tipo de Regularização" value={processo.tipo_regularizacao} />
                  <InfoField label="Etapa Atual" value={processo.etapa_atual || 'Iniciado'} />
                  <InfoField label="Data de Início" value={new Date(processo.createdAt).toLocaleDateString('pt-BR')} />
                  <InfoField label="Responsável" value={processo.responsavel} />
                </div>
              </SectionCard>
              {processo.observacoes && (
                <SectionCard title="Observações">
                  <p className="text-sm text-slate-600 leading-relaxed">{processo.observacoes}</p>
                </SectionCard>
              )}
            </div>
            <div className="space-y-6">
              <SectionCard title="Cliente Vinculado">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">{processo.cliente.nome.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{processo.cliente.nome}</p>
                    <p className="text-xs text-slate-400 font-mono">{processo.cliente.cpf_cnpj}</p>
                  </div>
                </div>
                <Link href={`/clientes/${processo.clienteId}`} className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Ver ficha completa →
                </Link>
              </SectionCard>
              {processo.imovel && (
                <SectionCard title="Imóvel Vinculado">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{processo.imovel.endereco}</p>
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        )}

        {/* TAB: IMÓVEL */}
        {tab === 'imovel' && (
          <div className="space-y-6 max-w-3xl">
            <SectionCard title="Dados de Localização">
              <div className="grid grid-cols-2 gap-5">
                <InfoField label="Endereço da Obra" value={processo.imovel?.endereco} />
                <InfoField label="Bairro" value={processo.imovel?.bairro} />
                <InfoField label="Cidade" value={processo.imovel?.cidade} />
                <InfoField label="CEP" value={processo.imovel?.cep} />
              </div>
            </SectionCard>
            <SectionCard title="Dados Técnicos e Registro">
              <div className="grid grid-cols-2 gap-5">
                <InfoField label="Área do Terreno" value={processo.imovel?.area_terreno ? `${processo.imovel.area_terreno} m²` : null} />
                <InfoField label="Área Construída" value={processo.imovel?.area_construida ? `${processo.imovel.area_construida} m²` : null} />
                <InfoField label="Nº Matrícula" value={processo.imovel?.num_matricula} />
                <InfoField label="Inscrição Imobiliária" value={processo.imovel?.inscricao_imobiliaria} />
                <InfoField label="Cartório / RGI" value={processo.imovel?.cartorio} />
                <InfoField label="Zoneamento" value={processo.imovel?.zoneamento} />
              </div>
            </SectionCard>
          </div>
        )}

        {/* TAB: DOCUMENTOS */}
        {tab === 'documentos' && (
          <div className="max-w-3xl">
            <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Repositório de Documentos</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Arquivos vinculados a este processo</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                  + Upload
                </button>
              </div>
              <div className="px-6 py-12 text-center">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">Nenhum documento anexado</p>
                <p className="text-xs text-slate-400 mt-1">Faça upload dos documentos do processo</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FINANCEIRO */}
        {tab === 'financeiro' && (
          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total do Contrato", value: "R$ 0,00", color: "text-slate-900" },
                { label: "Recebido", value: "R$ 0,00", color: "text-emerald-600" },
                { label: "Pendente", value: "R$ 0,00", color: "text-amber-600" },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[hsl(var(--border))] rounded-xl p-5 shadow-sm">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{item.label}</p>
                  <p className={`text-2xl font-bold mt-2 ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm px-6 py-12 text-center">
              <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">Nenhum lançamento registrado</p>
            </div>
          </div>
        )}

        {/* TAB: TAREFAS */}
        {tab === 'tarefas' && (
          <div className="max-w-3xl">
            <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Checklist de Operação</h3>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                  + Nova Tarefa
                </button>
              </div>
              <div className="px-6 py-12 text-center">
                <ListTodo className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">Nenhuma tarefa cadastrada</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HISTÓRICO */}
        {tab === 'historico' && (
          <div className="max-w-2xl">
            <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Linha do Tempo</h3>
              <div className="relative pl-5 border-l-2 border-slate-100 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[1.375rem] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Processo criado</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(processo.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
