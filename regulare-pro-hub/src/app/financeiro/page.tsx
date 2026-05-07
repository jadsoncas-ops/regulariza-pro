'use client'

import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { 
  DollarSign, TrendingUp, TrendingDown, Clock, Plus, Search, 
  ArrowUpRight, ArrowDownRight, Filter, MoreHorizontal, 
  Trash2, Edit, X, Calendar, User, Briefcase, CheckCircle2 
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FinanceiroPage() {
  const [registros, setRegistros] = useState<any[]>([])
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReg, setSelectedReg] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [fRes, pRes] = await Promise.all([
        fetch('/api/financeiro'),
        fetch('/api/processos')
      ])
      const [fData, pData] = await Promise.all([fRes.json(), pRes.json()])
      setRegistros(Array.isArray(fData) ? fData : [])
      setProcessos(Array.isArray(pData) ? pData : [])
    } catch (e) {
      console.error('Erro ao buscar dados financeiros:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = registros.filter(r => {
    const matchSearch = r.descricao?.toLowerCase().includes(search.toLowerCase()) || 
                        r.processo?.codigo_projeto?.toLowerCase().includes(search.toLowerCase())
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
    { name: 'Receitas', valor: totais.receitas, fill: '#3B82F6' },
    { name: 'Recebido', valor: totais.pagas,    fill: '#10B981' },
    { name: 'Pendente', valor: totais.pendentes, fill: '#F59E0B' },
    { name: 'Despesas', valor: totais.despesas, fill: '#EF4444' },
  ]

  const handleOpenModal = (reg: any = null) => {
    setSelectedReg(reg)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    // Preparar dados
    const payload = {
      ...data,
      valor: parseFloat(data.valor as string),
      data_vencimento: new Date(data.data_vencimento as string).toISOString(),
      processoId: data.processoId || null,
    }

    try {
      const url = selectedReg ? `/api/financeiro/${selectedReg.id}` : '/api/financeiro'
      const method = selectedReg ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchData()
        router.refresh()
      }
    } catch (e) {
      console.error('Erro ao salvar registro financeiro:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este lançamento?')) return
    try {
      const res = await fetch(`/api/financeiro/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (e) {
      console.error('Erro ao excluir:', e)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl">Financeiro</h1>
          <p className="text-xs text-slate-500 font-medium">Controle de receitas, despesas e fluxo de caixa</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={16} strokeWidth={3} /> Novo Lançamento
        </button>
      </div>

      {/* KPIs COMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contratado', value: fmt(totais.receitas), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Recebido', value: fmt(totais.pagas), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'A Receber', value: fmt(totais.pendentes), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Lucro Realizado', value: fmt(lucro), icon: lucro >= 0 ? ArrowUpRight : ArrowDownRight, color: lucro >= 0 ? 'text-emerald-600' : 'text-red-600', bg: lucro >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3 border border-slate-100 shadow-sm`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{k.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Resumo de Operações</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={40} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* STATUS PIE / LEGEND */}
        <div className="card p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Status dos Lançamentos</h3>
          <div className="space-y-4">
            {chartData.map(d => (
              <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                   <span className="text-xs font-bold text-slate-600">{d.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{fmt(d.valor)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FILTER + TABLE */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex gap-3 flex-1 max-w-xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input placeholder="Buscar descrição ou projeto..." className="input-field pl-9 py-2" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select-field py-2 text-xs font-bold uppercase tracking-wider" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="">Todos Tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
          <button className="btn-outline py-2 text-xs font-bold uppercase tracking-widest gap-2">
            <Filter size={14} /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Descrição / Lançamento</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Projeto Vinculado</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Vencimento</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center text-sm text-slate-400 italic">Carregando registros financeiros...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center">
                  <DollarSign size={48} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
                  <p className="text-sm font-bold text-slate-900">Nenhum lançamento encontrado</p>
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="table-row group">
                  <td className="px-6 py-3.5">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{r.descricao}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID #{r.id.substring(0,6)}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`badge ${r.tipo === 'receita' ? 'badge-blue' : 'badge-red'} font-black`}>
                      {r.tipo === 'receita' ? 'ENTRADA' : 'SAÍDA'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {r.processo ? (
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                        <Briefcase size={12} className="text-slate-300" />
                        {r.processo.codigo_projeto}
                      </div>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className={`text-sm font-black ${r.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {r.tipo === 'receita' ? '+' : '-'} {fmt(r.valor)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`badge ${r.status === 'pago' ? 'badge-green' : 'badge-amber'}`}>{r.status === 'pago' ? 'Efetuado' : 'Pendente'}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-xs text-slate-600">
                    {r.data_vencimento ? new Date(r.data_vencimento).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FINANCEIRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-fade-up overflow-hidden border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedReg ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Informe os detalhes da movimentação</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Descrição *</label>
                <input name="descricao" defaultValue={selectedReg?.descricao || ''} placeholder="Ex: Pagamento 1ª Parcela" required className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tipo *</label>
                  <select name="tipo" defaultValue={selectedReg?.tipo || 'receita'} className="select-field w-full" required>
                    <option value="receita">Receita (Entrada)</option>
                    <option value="despesa">Despesa (Saída)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Status *</label>
                  <select name="status" defaultValue={selectedReg?.status || 'pendente'} className="select-field w-full" required>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago / Recebido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Valor (R$) *</label>
                  <input name="valor" type="number" step="0.01" defaultValue={selectedReg?.valor || ''} placeholder="0.00" required className="input-field" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Vencimento *</label>
                  <input name="data_vencimento" type="date" defaultValue={selectedReg?.data_vencimento?.split('T')[0] || ''} required className="input-field" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Vincular a Processo</label>
                <select name="processoId" defaultValue={selectedReg?.processoId || ''} className="select-field w-full">
                  <option value="">Nenhum processo</option>
                  {processos.map(p => (
                    <option key={p.id} value={p.id}>{p.codigo_projeto} - {p.tipo_regularizacao}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary min-w-[120px] justify-center">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
