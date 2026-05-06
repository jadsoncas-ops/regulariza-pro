'use client'

import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DollarSign, TrendingUp, TrendingDown, Clock, Plus, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function FinanceiroPage() {
  const [registros, setRegistros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('')

  useEffect(() => {
    fetch('/api/financeiro')
      .then(r => r.json())
      .then(d => { setRegistros(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = registros.filter(r => {
    const matchSearch = r.descricao?.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !tipo || r.tipo === tipo
    return matchSearch && matchTipo
  })

  const totais = useMemo(() => ({
    receitas:  registros.filter(r => r.tipo === 'receita').reduce((s, r) => s + r.valor, 0),
    pagas:     registros.filter(r => r.tipo === 'receita' && r.status === 'pago').reduce((s, r) => s + r.valor, 0),
    pendentes: registros.filter(r => r.tipo === 'receita' && r.status !== 'pago').reduce((s, r) => s + r.valor, 0),
    despesas:  registros.filter(r => r.tipo === 'despesa').reduce((s, r) => s + r.valor, 0),
  }), [registros])

  const lucro = totais.pagas - totais.despesas
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const chartData = [
    { name: 'Receitas', valor: totais.receitas, fill: '#16a34a' },
    { name: 'Recebido', valor: totais.pagas,    fill: '#2563eb' },
    { name: 'Pendente', valor: totais.pendentes, fill: '#d97706' },
    { name: 'Despesas', valor: totais.despesas, fill: '#ef4444' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Financeiro</h1><p className="page-subtitle">Controle de receitas e despesas</p></div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contratado', value: fmt(totais.receitas),  icon: DollarSign,    color: '#2563eb', bg: '#eff6ff' },
          { label: 'Total Recebido',   value: fmt(totais.pagas),     icon: TrendingUp,    color: '#16a34a', bg: '#f0fdf4' },
          { label: 'A Receber',        value: fmt(totais.pendentes), icon: Clock,         color: '#d97706', bg: '#fffbeb' },
          { label: 'Lucro Realizado',  value: fmt(lucro),            icon: lucro >= 0 ? ArrowUpRight : ArrowDownRight, color: lucro >= 0 ? '#16a34a' : '#ef4444', bg: lucro >= 0 ? '#f0fdf4' : '#fef2f2' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: k.bg }}>
              <k.icon className="w-5 h-5" style={{ color: k.color }} />
            </div>
            <p className="text-xl font-bold text-slate-900">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Resumo Financeiro</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
            <Tooltip formatter={(v: any) => [fmt(Number(v)), '']} />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter + Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select-field w-36" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left table-header">Descrição</th>
                <th className="px-6 py-3 text-left table-header">Tipo</th>
                <th className="px-6 py-3 text-left table-header">Processo</th>
                <th className="px-6 py-3 text-right table-header">Valor</th>
                <th className="px-6 py-3 text-left table-header">Status</th>
                <th className="px-6 py-3 text-left table-header">Vencimento</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">Nenhum registro encontrado</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-medium text-slate-800">{r.descricao}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`badge ${r.tipo === 'receita' ? 'badge-green' : 'badge-red'}`}>
                      {r.tipo === 'receita' ? '↑ Receita' : '↓ Despesa'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-xs text-slate-500 font-mono">{r.processo?.codigo_projeto || r.processo?.tipo_regularizacao?.slice(0,15) || '—'}</p>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className={`text-sm font-bold ${r.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {r.tipo === 'receita' ? '+' : '-'} {fmt(r.valor)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`badge ${r.status === 'pago' ? 'badge-green' : 'badge-amber'}`}>{r.status === 'pago' ? 'Pago' : 'Pendente'}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-xs text-slate-500">{r.data_vencimento ? new Date(r.data_vencimento).toLocaleDateString('pt-BR') : '—'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
