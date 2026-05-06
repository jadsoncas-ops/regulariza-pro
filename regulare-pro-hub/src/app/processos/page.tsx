'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Briefcase, Clock, AlertTriangle, ChevronRight, Filter } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'finalizado', label: 'Finalizado' },
]

const STATUS_MAP: Record<string, string> = {
  em_analise: 'badge-amber',
  finalizado: 'badge-green',
  pendente: 'badge-red',
}

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetch('/api/processos')
      .then(r => r.json())
      .then(d => { setProcessos(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = processos.filter(p => {
    const matchSearch = 
      p.cliente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.tipo_regularizacao?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo_projeto?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const getDays = (d: string) => {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Processos</h1>
          <p className="page-subtitle">{processos.length} processo(s) no sistema</p>
        </div>
        <Link href="/processos/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Processo
        </Link>
      </div>

      {/* FILTERS */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Buscar por cliente, tipo ou código..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field sm:w-44"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left table-header">Código</th>
                <th className="px-6 py-3 text-left table-header">Serviço</th>
                <th className="px-6 py-3 text-left table-header">Cliente</th>
                <th className="px-6 py-3 text-left table-header">Imóvel</th>
                <th className="px-6 py-3 text-left table-header">Prazo</th>
                <th className="px-6 py-3 text-left table-header">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 mb-4">Nenhum processo encontrado</p>
                    <Link href="/processos/novo" className="btn-primary inline-flex">
                      <Plus className="w-4 h-4" /> Criar primeiro processo
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const days = getDays(p.data_deadline)
                  const isCritical = days !== null && days <= 3 && days >= 0
                  return (
                    <tr key={p.id} className="table-row">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {p.codigo_projeto || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">{p.tipo_regularizacao}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">{p.cliente?.nome?.charAt(0)}</span>
                          </div>
                          <p className="text-sm text-slate-700">{p.cliente?.nome || '—'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 max-w-xs truncate">{p.imovel?.endereco || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {days !== null ? (
                          <div className={`flex items-center gap-1.5 ${isCritical ? 'text-red-600' : 'text-slate-500'}`}>
                            {isCritical && <AlertTriangle className="w-3.5 h-3.5" />}
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">
                              {days < 0 ? 'Vencido' : `${days} dias`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Sem prazo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${STATUS_MAP[p.status] || 'badge-slate'}`}>
                          {p.status?.replace('_', ' ') || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/processos/${p.id}`} className="btn-ghost text-xs py-1.5 px-3">
                          Abrir <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
