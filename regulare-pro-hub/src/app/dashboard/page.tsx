'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users, Building2, DollarSign, TrendingUp, TrendingDown,
  Clock, CheckCircle2, ArrowRight, FileText,
  Wallet, Activity, ChevronRight, AlertCircle,
  ArrowUpRight, Zap, Calendar, MapPin, Receipt,
  MoreHorizontal, Plus, Circle, Layers
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtK = (v: number) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : fmt(v)

const STATUS = {
  em_analise:           { label: 'Entrada',      color: '#F59E0B', bg: '#FFF7ED' },
  levantamento:         { label: 'Levantamento', color: '#3B82F6', bg: '#EFF6FF' },
  projeto:              { label: 'Projeto',       color: '#6366F1', bg: '#EEF2FF' },
  protocolo_prefeitura: { label: 'Prefeitura',   color: '#8B5CF6', bg: '#F5F3FF' },
  cartorio:             { label: 'Cartório',      color: '#F97316', bg: '#FFF7ED' },
  finalizado:           { label: 'Conclusão',     color: '#10B981', bg: '#ECFDF5' },
}

function KpiCard({ label, value, sub, icon: Icon, trend, accent = '#3358FF' }: any) {
  const positive = trend >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="kpi-card"
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent + '14' }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="kpi-label">{label}</p>
        <p className="kpi-value mt-1" style={{ color: accent === '#64748B' ? '#0f172a' : accent }}>{value}</p>
        {sub && <p className="text-[11px] text-secondary mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-[11px] shadow-lg">
      <p className="font-semibold text-slate-500 mb-2 uppercase tracking-wider" style={{fontSize:9}}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-900">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<any>({ processos: [], clientes: [], financeiro: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/clientes').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
    ]).then(([processos, clientes, financeData]) => {
      setData({
        processos: Array.isArray(processos) ? processos : [],
        clientes: Array.isArray(clientes) ? clientes : [],
        financeiro: Array.isArray(financeData?.financeiro) ? financeData.financeiro : [],
      })
      setLoading(false)
    })
  }, [])

  const { processos, clientes, financeiro } = data

  const receitas = financeiro.filter((f: any) => f.tipo === 'receita')
  const despesas = financeiro.filter((f: any) => f.tipo === 'despesa' || f.is_repasse)
  const ativos   = processos.filter((p: any) => p.status !== 'finalizado')

  const totalContratos  = processos.reduce((s: number, p: any) => s + (p.valor_total || 0), 0)
  const totalRecebido   = receitas.reduce((s: number, f: any) => s + (f.status === 'pago' ? f.valor : 0), 0)
  const totalCustos     = despesas.reduce((s: number, f: any) => s + f.valor, 0)
  const lucroEstimado   = totalContratos - totalCustos
  const pendentePagar   = despesas.reduce((s: number, f: any) => s + (f.status !== 'pago' ? f.valor : 0), 0)

  /* Chart: last 6 months */
  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
      return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.','').toUpperCase(), r: 0, d: 0 }
    })
    receitas.forEach((f: any) => {
      const dt = new Date(f.data_pagamento || f.data_vencimento || f.createdAt)
      const m = months.find(mo => mo.month === dt.getMonth() && mo.year === dt.getFullYear())
      if (m) m.r += (f.status === 'pago' ? f.valor : 0)
    })
    despesas.forEach((f: any) => {
      const dt = new Date(f.data_pagamento || f.data_vencimento || f.createdAt)
      const m = months.find(mo => mo.month === dt.getMonth() && mo.year === dt.getFullYear())
      if (m) m.d += f.valor
    })
    return months
  }, [receitas, despesas])

  /* Funnel */
  const funnel = Object.entries(STATUS).map(([key, val]) => ({
    ...val, key,
    count: processos.filter((p: any) => p.status === key).length
  }))

  /* Recent */
  const recentProcessos = [...processos]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-[hsl(231,100%,60%)] border-t-transparent rounded-full animate-spin" />
      <p className="text-[11px] font-semibold text-secondary uppercase tracking-widest">Carregando...</p>
    </div>
  )

  return (
    <div className="space-y-6 pb-8">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-[12px] text-secondary mt-0.5">Visão geral operacional e financeira</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/processos/novo" className="btn btn-primary btn-sm">
            <Plus size={13} strokeWidth={2.5} /> Novo Processo
          </Link>
        </div>
      </div>

      {/* ── KPI ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Processos Ativos" value={ativos.length}            sub={`${processos.length} total`}        icon={Layers}       accent="#6366F1" />
        <KpiCard label="Receita Bruta"    value={fmtK(totalContratos)}    sub="carteira total"                     icon={FileText}     accent="#0f172a" />
        <KpiCard label="Total Recebido"   value={fmtK(totalRecebido)}     sub={`${totalContratos > 0 ? Math.round(totalRecebido/totalContratos*100) : 0}% coletado`} icon={CheckCircle2} accent="#10B981" />
        <KpiCard label="Lucro Estimado"   value={fmtK(lucroEstimado)}     sub="receita – custos"                   icon={TrendingUp}   accent="#3358FF" />
        <KpiCard label="A Pagar"          value={fmtK(pendentePagar)}     sub="repasses pendentes"                 icon={Receipt}      accent="#EF4444" />
      </div>

      {/* ── ROW 2: CHART + FUNNEL ───────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Cash flow chart */}
        <div className="col-span-12 lg:col-span-8 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Fluxo de Caixa</h3>
              <p className="text-[11px] text-secondary mt-0.5">Receitas × Despesas — últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold text-secondary uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Receita</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-400" />Despesa</div>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="r" name="Receita" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#gr)" />
                <Area type="monotone" dataKey="d" name="Despesa" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#gd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline funnel */}
        <div className="col-span-12 lg:col-span-4 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-slate-900">Pipeline</h3>
            <Link href="/processos" className="text-[11px] font-semibold text-[hsl(231,100%,60%)] hover:underline">
              Ver todos <ArrowUpRight size={10} className="inline" />
            </Link>
          </div>
          <div className="space-y-2">
            {funnel.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="flex-1 text-[12px] text-slate-700 font-medium truncate">{s.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${processos.length > 0 ? (s.count / processos.length) * 100 : 0}%`, background: s.color }}
                    />
                  </div>
                  <span className="text-[12px] font-bold w-4 text-right text-slate-800">{s.count}</span>
                </div>
              </div>
            ))}
          </div>

          {processos.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-secondary">Taxa de conclusão</span>
                <span className="font-bold text-slate-900">
                  {Math.round((processos.filter((p:any) => p.status === 'finalizado').length / processos.length) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: PROCESSES + CLIENTS ──────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Active processes */}
        <div className="col-span-12 lg:col-span-7 card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-slate-900">Processos Recentes</h3>
            <Link href="/processos" className="btn btn-ghost btn-xs gap-1 text-[hsl(231,100%,60%)]">
              Ver pipeline <ArrowRight size={10} />
            </Link>
          </div>
          <div>
            {recentProcessos.length === 0 ? (
              <div className="p-12 text-center">
                <Layers size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-[12px] font-medium text-secondary">Nenhum processo ainda</p>
                <Link href="/processos/novo" className="btn btn-primary btn-sm mt-3 mx-auto">
                  <Plus size={12} /> Criar Processo
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Processo</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Contrato</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentProcessos.map((p: any) => {
                    const s = STATUS[p.status as keyof typeof STATUS]
                    return (
                      <tr key={p.id}>
                        <td>
                          <span className="mono text-[10px] font-semibold text-[hsl(231,100%,60%)]">
                            {p.codigo_projeto || '—'}
                          </span>
                        </td>
                        <td>
                          <p className="font-semibold text-slate-900 leading-tight">{p.tipo_regularizacao}</p>
                        </td>
                        <td>
                          <p className="text-secondary truncate max-w-[120px]">{p.cliente?.nome}</p>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <div className="dot" style={{ background: s?.color }} />
                            <span className="text-[11px] font-medium" style={{ color: s?.color }}>{s?.label}</span>
                          </div>
                        </td>
                        <td>
                          <span className="font-semibold text-slate-800">
                            {p.valor_total ? fmtK(p.valor_total) : '—'}
                          </span>
                        </td>
                        <td>
                          <Link href={`/processos/${p.id}`} className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">

          {/* Financial summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-slate-900">Saúde Financeira</h3>
              <Link href="/financeiro" className="btn btn-ghost btn-xs text-[hsl(231,100%,60%)]">
                Detalhes <ArrowUpRight size={10} className="inline" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Receita Bruta',   value: totalContratos, color: '#0f172a', pct: 100 },
                { label: 'Total Recebido',  value: totalRecebido,  color: '#10B981', pct: totalContratos > 0 ? (totalRecebido / totalContratos) * 100 : 0 },
                { label: 'Custos / Repasses', value: totalCustos,  color: '#EF4444', pct: totalContratos > 0 ? (totalCustos / totalContratos) * 100 : 0 },
                { label: 'Lucro Estimado',  value: lucroEstimado,  color: '#3358FF', pct: totalContratos > 0 ? (lucroEstimado / totalContratos) * 100 : 0 },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-[12px] mb-1.5">
                    <span className="text-secondary font-medium">{row.label}</span>
                    <span className="font-bold" style={{ color: row.color }}>{fmtK(row.value)}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, row.pct))}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent clients */}
          <div className="card p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-slate-900">Clientes Recentes</h3>
              <Link href="/clientes" className="btn btn-ghost btn-xs text-[hsl(231,100%,60%)]">
                <ArrowUpRight size={10} />
              </Link>
            </div>
            <div className="space-y-2">
              {clientes.slice(0, 5).map((c: any, i: number) => (
                <Link key={c.id} href={`/clientes/${c.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ background: `hsl(${(i * 47 + 200) % 360}, 60%, 55%)` }}
                  >
                    {c.nome.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-800 truncate">{c.nome}</p>
                    <p className="text-[10px] text-secondary truncate">{c.cidade || '—'}</p>
                  </div>
                  <ChevronRight size={12} className="text-slate-200 group-hover:text-slate-400 transition-colors shrink-0" />
                </Link>
              ))}
              {clientes.length === 0 && (
                <p className="text-[12px] text-center text-secondary py-4">Nenhum cliente ainda</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
