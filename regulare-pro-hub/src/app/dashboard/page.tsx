'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp,
  Clock, CheckCircle2, ArrowRight, BarChart2,
  FileText, Wallet, Activity, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame = 0
    const total = 45
    const timer = setInterval(() => {
      frame++
      const progress = frame / total
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * value)
      if (frame >= total) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  const formatted = decimals > 0
    ? display.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.floor(display).toLocaleString('pt-BR')

  return <span>{prefix}{formatted}{suffix}</span>
}

// ─── KPI Stat Card ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent, prefix = '', suffix = '', decimals = 0, loading }: {
  label: string; value: number; sub?: string; icon: any;
  accent: { color: string; bg: string; border: string };
  prefix?: string; suffix?: string; decimals?: number; loading?: boolean
}) {
  return (
    <div className="ds-surface p-5 flex flex-col gap-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: accent.bg }}>
          <Icon className="w-[18px] h-[18px]" style={{ color: accent.color }} strokeWidth={1.75} />
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
          style={{ backgroundColor: accent.bg, color: accent.color, borderColor: accent.border }}>
          {label}
        </span>
      </div>
      <div>
        <div className="text-[28px] font-bold tracking-tight leading-none" style={{ color: '#0D1117' }}>
          {loading
            ? <div className="h-8 w-20 rounded-lg animate-pulse" style={{ backgroundColor: '#F3F4F6' }} />
            : <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          }
        </div>
        {sub && <p className="text-[12px] mt-1.5" style={{ color: '#9CA3AF' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Finance Card ────────────────────────────────────────────────────────────
function FinCard({ label, value, icon: Icon, color, sub, loading }: any) {
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
  return (
    <div className="ds-surface p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.75} />
        <span className="text-[12px] font-medium" style={{ color: '#6B7280' }}>{label}</span>
      </div>
      <p className="text-[22px] font-bold tracking-tight" style={{ color: '#0D1117' }}>
        {loading ? <span className="inline-block h-6 w-28 rounded-md animate-pulse bg-slate-100" /> : fmt(value)}
      </p>
      {sub && <p className="text-[11px] mt-1" style={{ color: '#9CA3AF' }}>{sub}</p>}
    </div>
  )
}

// ─── Status Map ──────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, { label: string; badge: string }> = {
  em_analise:            { label: 'Em Análise',    badge: 'ds-badge-amber' },
  protocolo_prefeitura:  { label: 'Protocolado',   badge: 'ds-badge-blue' },
  finalizado:            { label: 'Concluído',      badge: 'ds-badge-green' },
  pendente:              { label: 'Pendência',      badge: 'ds-badge-red' },
  em_andamento:          { label: 'Em Andamento',   badge: 'ds-badge-purple' },
  levantamento:          { label: 'Levantamento',   badge: 'ds-badge-slate' },
}

const PIE_COLORS = [
  { id: 'finalizado',     color: '#10B981' },
  { id: 'em_analise',     color: '#F59E0B' },
  { id: 'protocolo',      color: '#6366F1' },
  { id: 'pendente',       color: '#EF4444' },
  { id: 'em_andamento',   color: '#8B5CF6' },
]

const MONTHLY_MOCK = [
  { m: 'Jan', r: 8000,  d: 2500 }, { m: 'Fev', r: 14000, d: 4000 },
  { m: 'Mar', r: 11000, d: 3500 }, { m: 'Abr', r: 19000, d: 5000 },
  { m: 'Mai', r: 16000, d: 4500 }, { m: 'Jun', r: 24000, d: 6000 },
]

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`
  return (
    <div className="ds-surface px-3 py-2 text-[12px]" style={{ minWidth: 140 }}>
      <p className="font-semibold mb-1" style={{ color: '#374151' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name === 'r' ? 'Receita' : 'Despesas'}</span>
          <span className="font-semibold" style={{ color: '#0D1117' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<any>({ processos: [], clientes: [], imoveis: [], financeiro: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/processos').then(r => r.json()).catch(() => []),
      fetch('/api/clientes').then(r => r.json()).catch(() => []),
      fetch('/api/imoveis').then(r => r.json()).catch(() => []),
      fetch('/api/financeiro').then(r => r.json()).catch(() => []),
    ]).then(([processos, clientes, imoveis, financeiro]) => {
      setData({
        processos:  Array.isArray(processos)  ? processos  : [],
        clientes:   Array.isArray(clientes)   ? clientes   : [],
        imoveis:    Array.isArray(imoveis)    ? imoveis    : [],
        financeiro: Array.isArray(financeiro) ? financeiro : [],
      })
      setLoading(false)
    })
  }, [])

  const { processos, clientes, imoveis, financeiro } = data

  const ativos     = processos.filter((p: any) => p.status !== 'finalizado').length
  const concluidos = processos.filter((p: any) => p.status === 'finalizado').length
  const protocolo  = processos.filter((p: any) =>
    p.status === 'protocolo_prefeitura' || p.etapa_atual?.toLowerCase().includes('protocolo')
  ).length

  const receitas  = financeiro.filter((f: any) => f.tipo === 'receita')
  const despesas  = financeiro.filter((f: any) => f.tipo === 'despesa')
  const totalRec  = receitas.reduce((s: number, f: any) => s + f.valor, 0)
  const recebido  = receitas.filter((f: any) => f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0)
  const aReceber  = receitas.filter((f: any) => f.status !== 'pago').reduce((s: number, f: any) => s + f.valor, 0)
  const lucro     = recebido - despesas.filter((f: any) => f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0)

  const recent = [...processos]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  const pieData = PIE_COLORS.map(c => ({
    name: STATUS_LABEL[c.id]?.label || c.id,
    value: processos.filter((p: any) =>
      p.status?.includes(c.id.split('_')[0]) || p.etapa_atual?.toLowerCase().includes(c.id.slice(0, 5))
    ).length,
    color: c.color,
  })).filter(d => d.value > 0)

  const now = new Date()
  const timeStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: '#0D1117', letterSpacing: '-0.025em' }}>
            Dashboard
          </h1>
          <p className="text-[13px] mt-0.5 capitalize" style={{ color: '#9CA3AF' }}>{timeStr}</p>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: '#9CA3AF' }}>Visão Geral</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 stagger">
          <StatCard label="Clientes"    value={clientes.length}  icon={Users}        loading={loading}
            accent={{ color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' }} />
          <StatCard label="Imóveis"     value={imoveis.length}   icon={Building2}    loading={loading}
            accent={{ color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD' }} />
          <StatCard label="Ativos"      value={ativos}           icon={Activity}     loading={loading}
            sub={`${processos.length} total`}
            accent={{ color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' }} />
          <StatCard label="Protocolados" value={protocolo}       icon={FileText}     loading={loading}
            accent={{ color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' }} />
          <StatCard label="Concluídos"  value={concluidos}       icon={CheckCircle2} loading={loading}
            accent={{ color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' }} />
        </div>
      </section>

      {/* ── Financial KPIs ── */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: '#9CA3AF' }}>Financeiro</p>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <FinCard label="Receita Total"  value={totalRec} icon={BarChart2}  color="#2563EB" loading={loading} sub="Contrato acumulado" />
          <FinCard label="Valor Recebido" value={recebido} icon={TrendingUp} color="#059669" loading={loading} sub="Já confirmado" />
          <FinCard label="A Receber"      value={aReceber} icon={Clock}      color="#D97706" loading={loading} sub="Pendente de pagamento" />
          <FinCard label="Lucro Líquido"  value={lucro}    icon={Wallet}     color={lucro >= 0 ? '#059669' : '#EF4444'} loading={loading}
            sub={lucro >= 0 ? 'Resultado positivo' : 'Resultado negativo'} />
        </div>
      </section>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area Chart */}
        <div className="ds-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[14px] font-semibold" style={{ color: '#0D1117' }}>Receita vs Despesas</h3>
              <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF' }}>Evolução mensal — últimos 6 meses</p>
            </div>
            <span className="ds-badge ds-badge-green text-[11px]">+18% este mês</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_MOCK} margin={{ left: -16, right: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.07} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#E4E7EC', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="r" stroke="#2563EB" strokeWidth={2} fill="url(#gR)" name="r" dot={false} />
              <Area type="monotone" dataKey="d" stroke="#EF4444" strokeWidth={2} fill="url(#gD)" name="d" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563EB' }} />
              <span className="text-[11px]" style={{ color: '#6B7280' }}>Receita</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <span className="text-[11px]" style={{ color: '#6B7280' }}>Despesas</span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="ds-surface p-6">
          <h3 className="text-[14px] font-semibold mb-1" style={{ color: '#0D1117' }}>Status dos Projetos</h3>
          <p className="text-[12px] mb-5" style={{ color: '#9CA3AF' }}>Distribuição por etapa</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={65}
                    dataKey="value" stroke="none" strokeWidth={0}>
                    {pieData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, 'projetos']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E4E7EC', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {pieData.map((d: any) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-[12px]" style={{ color: '#6B7280' }}>{d.name}</span>
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: '#0D1117' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center" style={{ color: '#D1D5DB' }}>
              <BarChart2 className="w-8 h-8 mb-2" strokeWidth={1.25} />
              <p className="text-[12px]">Sem dados ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Recent Processes + Clients ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Processes Table */}
        <div className="ds-surface lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <h3 className="text-[14px] font-semibold" style={{ color: '#0D1117' }}>Processos Recentes</h3>
            <Link href="/processos" className="ds-btn-ghost text-[12px] py-1.5 px-2.5">
              Ver todos <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #F9FAFB', backgroundColor: '#FAFAFA' }}>
                  {['Cliente', 'Serviço', 'Cidade', 'Status', 'Data'].map(h => (
                    <th key={h} className="px-5 py-3 text-left ds-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-3.5 rounded-md animate-pulse" style={{ backgroundColor: '#F3F4F6', width: `${60 + (j % 3) * 15}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[13px]" style={{ color: '#9CA3AF' }}>
                      <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" strokeWidth={1.25} />
                      Nenhum processo cadastrado
                    </td>
                  </tr>
                ) : recent.map((p: any) => {
                  const badge = STATUS_LABEL[p.status] || { label: p.status || '—', badge: 'ds-badge-slate' }
                  return (
                    <tr key={p.id} className="ds-tr group">
                      <td className="px-5 py-3.5">
                        <Link href={`/processos/${p.id}`} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
                            {p.cliente?.nome?.charAt(0) || '?'}
                          </div>
                          <span className="text-[13px] font-medium truncate max-w-[100px] group-hover:text-blue-600 transition-colors"
                            style={{ color: '#0D1117' }}>
                            {p.cliente?.nome || '—'}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] truncate max-w-[140px] block" style={{ color: '#6B7280' }}>
                          {p.tipo_regularizacao || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-[12px]" style={{ color: '#9CA3AF' }}>{p.imovel?.cidade || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`ds-badge ${badge.badge}`}>{badge.label}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-[12px] tabular-nums" style={{ color: '#9CA3AF' }}>
                          {new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="ds-surface overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <h3 className="text-[14px] font-semibold" style={{ color: '#0D1117' }}>Clientes</h3>
            <Link href="/clientes" className="text-[12px] font-semibold transition-colors"
              style={{ color: '#2563EB' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1D4ED8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#2563EB')}>
              Ver todos
            </Link>
          </div>
          <div className="p-3 space-y-0.5">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <div className="w-8 h-8 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: '#F3F4F6' }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded-md animate-pulse" style={{ backgroundColor: '#F3F4F6', width: '70%' }} />
                    <div className="h-2.5 rounded-md animate-pulse" style={{ backgroundColor: '#F9FAFB', width: '45%' }} />
                  </div>
                </div>
              ))
            ) : clientes.length === 0 ? (
              <div className="py-10 text-center">
                <Users className="w-7 h-7 mx-auto mb-2 opacity-30" strokeWidth={1.25} />
                <p className="text-[12px]" style={{ color: '#9CA3AF' }}>Nenhum cliente ainda</p>
              </div>
            ) : clientes.slice(0, 7).map((c: any) => (
              <Link key={c.id} href={`/clientes/${c.id}`}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-[8px] transition-colors group"
                style={{ color: 'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold text-white"
                  style={{ background: `hsl(${(c.nome?.charCodeAt(0) || 0) * 7 % 360}, 60%, 50%)` }}>
                  {c.nome?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: '#0D1117' }}>{c.nome}</p>
                  <p className="text-[11px] truncate" style={{ color: '#9CA3AF' }}>
                    {c.processos?.length || 0} processo(s)
                    {c.cidade ? ` · ${c.cidade}` : ''}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  style={{ color: '#9CA3AF' }} strokeWidth={1.75} />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
