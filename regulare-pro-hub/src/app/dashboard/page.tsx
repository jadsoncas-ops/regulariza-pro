'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, Building2, Briefcase, DollarSign, TrendingUp,
  Clock, CheckCircle2, ArrowRight, BarChart2, FileText,
  Wallet, Activity, ChevronRight, AlertCircle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'

function AnimatedNumber({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let f = 0; const total = 40
    const t = setInterval(() => {
      f++; const p = f / total; setN((1 - Math.pow(1 - p, 3)) * value)
      if (f >= total) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  const fmt = decimals > 0
    ? n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.floor(n).toLocaleString('pt-BR')
  return <span>{prefix}{fmt}</span>
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  em_analise:           { label: 'Em Andamento',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  protocolo_prefeitura: { label: 'Protocolado',   color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  pendente:             { label: 'Pendência',     color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  finalizado:           { label: 'Concluído',     color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
}

// MOCK removido - dados calculados dinamicamente

const PIE_CFG = [
  { id: 'finalizado', color: '#10B981' },
  { id: 'em_analise', color: '#F59E0B' },
  { id: 'protocolo_prefeitura', color: '#3B82F6' },
  { id: 'pendente', color: '#EF4444' },
]

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

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
        processos: Array.isArray(processos) ? processos : [],
        clientes: Array.isArray(clientes) ? clientes : [],
        imoveis: Array.isArray(imoveis) ? imoveis : [],
        financeiro: Array.isArray(financeiro) ? financeiro : [],
      })
      setLoading(false)
    })
  }, [])

  const { processos, clientes, imoveis, financeiro } = data
  const ativos = processos.filter((p: any) => p.status !== 'finalizado').length
  const concluidos = processos.filter((p: any) => p.status === 'finalizado').length
  const protocolo = processos.filter((p: any) => p.status === 'protocolo_prefeitura').length
  const pendentes = processos.filter((p: any) => p.status === 'pendente').length
  const receitas = financeiro.filter((f: any) => f.tipo === 'receita')
  const despesas = financeiro.filter((f: any) => f.tipo === 'despesa')
  const totalRec = receitas.reduce((s: number, f: any) => s + f.valor, 0)
  const recebido = receitas.filter((f: any) => f.status === 'pago' || f.status === 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const aReceber = receitas.filter((f: any) => f.status !== 'pago' && f.status !== 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const lucro = recebido - despesas.filter((f: any) => f.status === 'pago' || f.status === 'recebido').reduce((s: number, f: any) => s + f.valor, 0)
  const recent = [...processos].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 7)
  
  // Cálculo dinâmico do gráfico de área
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return {
      m: d.toLocaleDateString('pt-BR', { month: 'short' }),
      monthNum: d.getMonth(),
      year: d.getFullYear(),
      r: 0,
      d: 0
    }
  })

  financeiro.forEach((f: any) => {
    const date = new Date(f.createdAt)
    const m = last6Months.find(l => l.monthNum === date.getMonth() && l.year === date.getFullYear())
    if (m) {
      if (f.tipo === 'receita') m.r += f.valor
      else m.d += f.valor
    }
  })

  const chartData = last6Months

  const pieData = PIE_CFG.map(c => ({
    name: STATUS_LABEL[c.id]?.label || c.id,
    value: processos.filter((p: any) => p.status === c.id).length,
    color: c.color,
  })).filter(d => d.value > 0)

  const skel = (w = '70%') => (
    <div className="skeleton" style={{ height: 14, width: w, borderRadius: 7 }} />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-up">

      {/* ── Hero Card ── */}
      <div className="hero-card">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Visão Executiva
          </p>
          <h1 className="font-geist" style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 10, maxWidth: 650 }}>
            {loading ? 'Preparando cockpit...' : (
              <>Você possui <span className="text-blue-400 font-space">{ativos} processos ativos</span> e{' '}
              <span className="text-emerald-400 font-space">{fmt(aReceber)}</span> em recebimentos previstos.</>
            )}
          </h1>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Protocolados', value: protocolo, color: '#93C5FD' },
              { label: 'Pendências', value: pendentes, color: '#FCA5A5' },
              { label: 'Concluídos', value: concluidos, color: '#86EFAC' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div>
        <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 14 }}>
          Métricas Operacionais
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }} className="stagger">
          {[
            { label: 'Clientes', value: clientes.length, icon: Users, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', glow: 'kpi-glow-blue', href: '/clientes' },
            { label: 'Imóveis', value: imoveis.length, icon: Building2, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', glow: 'kpi-glow-purple', href: '/imoveis' },
            { label: 'Processos Ativos', value: ativos, icon: Activity, color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', glow: '', href: '/processos' },
            { label: 'Protocolados', value: protocolo, icon: FileText, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', glow: 'kpi-glow-amber', href: '/processos?status=protocolo_prefeitura' },
            { label: 'Concluídos', value: concluidos, icon: CheckCircle2, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', glow: 'kpi-glow-green', href: '/processos?status=finalizado' },
          ].map(k => (
            <Link key={k.label} href={k.href} className={`stat-card animate-fade-up ${k.glow} no-underline group`}>
              <div className="flex items-center justify-between mb-4">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: k.bg, border: `1px solid ${k.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <k.icon size={17} color={k.color} strokeWidth={1.75} />
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="font-space" style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {loading ? skel('50%') : <AnimatedNumber value={k.value} />}
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{k.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Financial KPIs ── */}
      <div>
        <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 14 }}>
          Painel Financeiro
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }} className="stagger">
          {[
            { label: 'Receita Total', value: totalRec, icon: BarChart2, color: '#2563EB', sub: 'Contrato acumulado', href: '/financeiro' },
            { label: 'Valor Recebido', value: recebido, icon: TrendingUp, color: '#059669', sub: 'Confirmado em conta', href: '/financeiro?status=recebido' },
            { label: 'A Receber', value: aReceber, icon: Clock, color: '#D97706', sub: 'Pagamentos pendentes', href: '/financeiro?status=pendente' },
            { label: 'Lucro Líquido', value: lucro, icon: Wallet, color: lucro >= 0 ? '#059669' : '#DC2626', sub: lucro >= 0 ? 'Resultado positivo' : 'Resultado negativo', href: '/financeiro' },
          ].map(f => (
            <Link key={f.label} href={f.href} className="card animate-fade-up no-underline group" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="flex items-center gap-2">
                   <f.icon size={15} color={f.color} strokeWidth={1.75} />
                   <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.01em' }}>{f.label}</span>
                </div>
                <ArrowRight size={12} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="font-space" style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.03em' }}>
                {loading ? skel('60%') : fmt(f.value)}
              </div>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5, fontWeight: 500 }}>{f.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Charts + Pipeline ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="lg:grid-cols-2">

        {/* Area Chart */}
        <div className="card" style={{ padding: '22px 22px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Receita vs Despesas</h3>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>Últimos 6 meses</p>
            </div>
            <span className="badge badge-green" style={{ fontSize: 11 }}>+18% este mês</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={chartData} margin={{ left: -16, right: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip
                formatter={(v: any, n: any) => [fmt(Number(v)), n === 'r' ? 'Receita' : 'Despesas']}
                contentStyle={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: 'rgba(0,0,0,0.06)', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="r" stroke="#2563EB" strokeWidth={2} fill="url(#gR)" dot={false} name="r" />
              <Area type="monotone" dataKey="d" stroke="#EF4444" strokeWidth={1.5} fill="url(#gD)" dot={false} name="d" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 18, marginTop: 8 }}>
            {[{ color: '#2563EB', label: 'Receita' }, { color: '#EF4444', label: 'Despesas' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 11, color: '#6B7280' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie + Status */}
        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>Status dos Projetos</h3>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Distribuição atual por etapa</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {pieData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, 'projetos']}
                    contentStyle={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pieData.map((d: any) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#6B7280' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB' }}>
              <BarChart2 size={32} strokeWidth={1.25} />
              <p style={{ fontSize: 12, marginTop: 8 }}>Nenhum processo ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>

        {/* Recent processes */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Processos Recentes</h3>
            <Link href="/processos" className="btn-ghost">Ver todos <ArrowRight size={13} strokeWidth={1.75} /></Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.045)', background: 'rgba(249,250,251,0.7)' }}>
                {['Cliente', 'Serviço', 'Cidade', 'Status', 'Data'].map(h => (
                  <th key={h} className="table-header" style={{ padding: '10px 16px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} style={{ padding: '12px 16px' }}>
                      <div className="skeleton" style={{ height: 12, width: `${55 + j * 8}%` }} />
                    </td>
                  ))}
                </tr>
              )) : recent.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                  <Briefcase size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} strokeWidth={1.25} />
                  Nenhum processo cadastrado
                </td></tr>
              ) : recent.map((p: any) => {
                const st = STATUS_LABEL[p.status]
                return (
                  <tr key={p.id} className="table-row">
                    <td style={{ padding: '11px 16px' }}>
                      <Link href={`/processos/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${((p.cliente?.nome?.charCodeAt(0) || 65) * 7) % 360}, 55%, 55%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#fff',
                        }}>
                          {p.cliente?.nome?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.cliente?.nome || '—'}
                        </span>
                      </Link>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 12, color: '#6B7280', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {p.tipo_regularizacao || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>{p.imovel?.cidade || '—'}</span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {st ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                          {st.label}
                        </span>
                      ) : <span style={{ fontSize: 12, color: '#9CA3AF' }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, color: '#9CA3AF', fontVariantNumeric: 'tabular-nums' }}>
                        {new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Client list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Clientes</h3>
            <Link href="/clientes" style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>Ver todos</Link>
          </div>
          <div style={{ padding: '8px 10px' }}>
            {loading ? [...Array(6)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px' }}>
                <div className="skeleton" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton" style={{ height: 11, width: '65%' }} />
                  <div className="skeleton" style={{ height: 9, width: '40%' }} />
                </div>
              </div>
            )) : clientes.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                <Users size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} strokeWidth={1.25} />
                Nenhum cliente ainda
              </div>
            ) : clientes.slice(0, 7).map((c: any) => (
              <Link key={c.id} href={`/clientes/${c.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, textDecoration: 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: `hsl(${((c.nome?.charCodeAt(0) || 65) * 7) % 360}, 55%, 55%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  {c.nome?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                    {c.processos?.length || 0} processo(s){c.cidade ? ` · ${c.cidade}` : ''}
                  </p>
                </div>
                <ChevronRight size={13} color="#D1D5DB" strokeWidth={1.75} />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
