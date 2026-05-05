"use client";

import { useState } from 'react'
import { Search, PlusCircle, ArrowUpRight, LayoutGrid, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Processo {
  id: string
  tipo_regularizacao: string
  etapa_atual: string | null
  status: string
  cliente: { nome: string }
  imovel: { endereco: string } | null
  financeiro: any[]
}

interface ProcessoKanbanProps {
  initialProcessos: Processo[]
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; colLabel: string }> = {
  em_analise:             { label: "Análise Inicial",  badgeClass: "badge-blue",  colLabel: "Análise" },
  documentacao_pendente:  { label: "Documentação",     badgeClass: "badge-amber", colLabel: "Documentação" },
  protocolo_prefeitura:   { label: "Protocolo",        badgeClass: "badge-gray",  colLabel: "Em Andamento" },
  em_aprovacao:           { label: "Em Aprovação",     badgeClass: "badge-blue",  colLabel: "Em Andamento" },
  exigencia_tecnica:      { label: "Exigência",        badgeClass: "badge-red",   colLabel: "Exigência" },
  aprovado:               { label: "Aprovado",         badgeClass: "badge-green", colLabel: "Concluído" },
  finalizado:             { label: "Finalizado",       badgeClass: "badge-green", colLabel: "Concluído" },
}

const COLUMNS = [
  { id: "analise",    label: "Análise",       statuses: ["em_analise"] },
  { id: "andamento",  label: "Em Andamento",  statuses: ["documentacao_pendente", "protocolo_prefeitura", "em_aprovacao"] },
  { id: "exigencia",  label: "Exigência",     statuses: ["exigencia_tecnica"] },
  { id: "concluido",  label: "Concluído",     statuses: ["aprovado", "finalizado"] },
]

const COL_COLORS: Record<string, string> = {
  analise:   "border-t-blue-500",
  andamento: "border-t-amber-500",
  exigencia: "border-t-red-500",
  concluido: "border-t-emerald-500",
}

export default function ProcessoKanban({ initialProcessos }: ProcessoKanbanProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  const filtered = initialProcessos.filter(p =>
    p.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.tipo_regularizacao.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Processos</h1>
            <p className="text-sm text-slate-500 mt-0.5">Fluxo operacional de regularizações</p>
          </div>
          <div className="flex items-center gap-3">
            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar processo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 bg-white"
              />
            </div>
            {/* VIEW TOGGLE */}
            <div className="flex items-center border border-[hsl(var(--border))] rounded-md overflow-hidden bg-white">
              <button
                onClick={() => setView('kanban')}
                className={`p-2 transition-colors ${view === 'kanban' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 transition-colors ${view === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            {/* CTA */}
            <Link
              href="/processos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Novo Processo
            </Link>
          </div>
        </div>
      </div>

      <div className="p-8">
        {view === 'kanban' ? (
          /* KANBAN BOARD */
          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-thin items-start">
            {COLUMNS.map(col => {
              const items = filtered.filter(p => col.statuses.includes(p.status))
              return (
                <div key={col.id} className="min-w-[280px] w-[280px] flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{col.label}</span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{items.length}</span>
                  </div>

                  <div className="space-y-3">
                    {items.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                        <p className="text-xs text-slate-400">Nenhum processo</p>
                      </div>
                    ) : items.map(p => {
                      const s = STATUS_CONFIG[p.status] || { label: p.status, badgeClass: "badge-gray" }
                      return (
                        <div
                          key={p.id}
                          onClick={() => router.push(`/processos/${p.id}`)}
                          className={`bg-white border border-[hsl(var(--border))] border-t-2 ${COL_COLORS[col.id]} rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className={`badge ${s.badgeClass}`}>{s.label}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5" />
                          </div>
                          <h3 className="text-sm font-medium text-slate-800 leading-snug mb-1">{p.tipo_regularizacao}</h3>
                          <p className="text-xs text-slate-500 truncate">{p.cliente.nome}</p>
                          {p.imovel?.endereco && (
                            <p className="text-[11px] text-slate-400 mt-2 truncate">{p.imovel.endereco}</p>
                          )}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono">#{p.id.substring(0, 6).toUpperCase()}</span>
                            <span className="text-[10px] text-slate-400">{p.etapa_atual || 'Iniciado'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-[hsl(var(--border))] bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Processo</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Etapa</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-400">
                      Nenhum processo encontrado para "{search}"
                    </td>
                  </tr>
                ) : filtered.map(p => {
                  const s = STATUS_CONFIG[p.status] || { label: p.status, badgeClass: "badge-gray" }
                  return (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/processos/${p.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{p.tipo_regularizacao}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">#{p.id.substring(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{p.cliente.nome}</td>
                      <td className="px-6 py-4"><span className={`badge ${s.badgeClass}`}>{s.label}</span></td>
                      <td className="px-6 py-4 text-xs text-slate-500">{p.etapa_atual || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors inline" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
