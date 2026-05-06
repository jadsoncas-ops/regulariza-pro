'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Briefcase, Users, DollarSign, Clock, TrendingUp,
  AlertTriangle, CheckCircle2, ArrowRight, Plus,
  Building2, Calendar, FileText
} from 'lucide-react'

const KANBAN_COLS = [
  { id: 'levantamento',   label: 'Levantamento',   color: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50' },
  { id: 'documentacao',   label: 'Documentação',   color: 'bg-purple-400', text: 'text-purple-700', bg: 'bg-purple-50' },
  { id: 'protocolo',      label: 'Protocolo',      color: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50' },
  { id: 'pendencia',      label: 'Pendência',      color: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50' },
  { id: 'cartorio',       label: 'Cartório',       color: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  { id: 'finalizado',     label: 'Finalizado',     color: 'bg-slate-400',  text: 'text-slate-700',  bg: 'bg-slate-100' },
]

function getDaysRemaining(dateStr: string) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function DashboardPage() {
  const [processos, setProcessos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [financeiro, setFinanceiro] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/clientes').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
    ]).then(([p, c, f]) => {
      setProcessos(Array.isArray(p) ? p : [])
      setClientes(Array.isArray(c) ? c : [])
      setFinanceiro(Array.isArray(f) ? f : [])
      setLoading(false)
    })
  }, [])

  const totalRecebido = financeiro.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0)
  const totalAPagar = financeiro.filter((f: any) => f.tipo === 'receita' && f.status !== 'pago').reduce((s: number, f: any) => s + f.valor, 0)
  const processosAtivos = processos.filter((p: any) => p.status !== 'finalizado').length
  const criticos = processos.filter((p: any) => {
    const d = getDaysRemaining(p.data_deadline)
    return d !== null && d <= 3 && d >= 0
  }).length

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-8 animate-fade-up">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral dos seus projetos de regularização</p>
        </div>
        <Link href="/processos/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Processo
        </Link>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <span className="badge badge-blue">Ativos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : processosAtivos}</p>
          <p className="text-xs text-slate-500 mt-1">Processos em andamento</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="badge badge-green">Recebido</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : fmt(totalRecebido)}</p>
          <p className="text-xs text-slate-500 mt-1">Total recebido em receitas</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <span className="badge badge-amber">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : fmt(totalAPagar)}</p>
          <p className="text-xs text-slate-500 mt-1">A receber de clientes</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            {criticos > 0 ? <span className="badge badge-red">Urgente</span> : <span className="badge badge-green">OK</span>}
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : criticos}</p>
          <p className="text-xs text-slate-500 mt-1">Prazos críticos (≤3 dias)</p>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Fluxo de Processos</h2>
          <Link href="/processos" className="btn-ghost text-xs">Ver todos <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>

        <div className="overflow-x-auto pb-4 -mx-2 px-2">
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLS.map(col => {
              const cards = processos.filter((p: any) => (p.etapa_atual || 'levantamento').toLowerCase().includes(col.id.split('ã')[0].split('é')[0]))
              return (
                <div key={col.id} className="w-72 flex-shrink-0">
                  <div className={`flex items-center gap-2 mb-3 px-1`}>
                    <div className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{col.label}</span>
                    <span className="ml-auto text-xs text-slate-400 font-semibold">{cards.length}</span>
                  </div>
                  <div className="space-y-3 min-h-24">
                    {cards.slice(0, 3).map((p: any) => {
                      const days = getDaysRemaining(p.data_deadline)
                      const isCritical = days !== null && days <= 3
                      return (
                        <Link key={p.id} href={`/processos/${p.id}`}>
                          <div className="card-hover p-4 cursor-pointer">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${col.bg} ${col.text}`}>
                                {p.codigo_projeto || p.tipo_regularizacao?.slice(0, 8)}
                              </span>
                              {isCritical && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                            </div>
                            <p className="text-sm font-semibold text-slate-800 mb-1">{p.cliente?.nome || 'Cliente'}</p>
                            <p className="text-xs text-slate-500 truncate">{p.imovel?.endereco || '—'}</p>
                            {days !== null && (
                              <div className={`flex items-center gap-1 mt-3 ${isCritical ? 'text-red-500' : 'text-slate-400'}`}>
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-semibold">{days < 0 ? 'Vencido' : `${days}d restantes`}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                    {cards.length === 0 && (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl h-20 flex items-center justify-center">
                        <p className="text-xs text-slate-400">Nenhum projeto</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* RECENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Clientes Recentes</h3>
            <Link href="/clientes" className="text-xs text-blue-600 font-semibold hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-4">Carregando...</p>
            ) : clientes.slice(0, 5).map((c: any) => (
              <Link key={c.id} href={`/clientes/${c.id}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">{c.nome?.charAt(0)}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.nome}</p>
                  <p className="text-xs text-slate-500">{c.cidade || 'Sem cidade'}</p>
                </div>
                <span className="badge badge-slate text-xs">{c.processos?.length || 0} processos</span>
              </Link>
            ))}
            {!loading && clientes.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum cliente cadastrado</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Atividade Recente</h3>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-4">Carregando...</p>
            ) : processos.slice(0, 4).map((p: any) => (
              <div key={p.id} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{p.tipo_regularizacao}</p>
                  <p className="text-xs text-slate-500">{p.cliente?.nome} • {new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
            {!loading && processos.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum processo ainda</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
