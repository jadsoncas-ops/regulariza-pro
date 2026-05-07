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
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  const chartData = [
    { name: 'Contratado', valor: totais.receitas, fill: '#3B82F6' },
    { name: 'Liquidado', valor: totais.pagas,    fill: '#10B981' },
    { name: 'Aberto', valor: totais.pendentes, fill: '#F59E0B' },
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
      console.error('Erro ao salvar:', e)
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
    <div className="space-y-10 animate-fade">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fluxo Financeiro</h1>
          <p className="text-xs text-slate-500 font-medium mt-1 tracking-wider uppercase">Gestão de Receitas e Custos Operacionais</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary py-2.5">
          <Plus size={18} strokeWidth={3} /> NOVO LANÇAMENTO
        </button>
      </div>

      {/* KPIs BENTO STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <FinanceStatCard label="Total Contratado" value={totais.receitas} icon={DollarSign} color="text-blue-500" bg="bg-blue-500/10" />
        <FinanceStatCard label="Total Liquidado" value={totais.pagas} icon={TrendingUp} color="text-emerald-500" bg="bg-emerald-500/10" />
        <FinanceStatCard label="Saldo Pendente" value={totais.pendentes} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
        <FinanceStatCard label="Lucratividade" value={lucro} icon={lucro >= 0 ? ArrowUpRight : ArrowDownRight} color={lucro >= 0 ? 'text-emerald-500' : 'text-red-500'} bg={lucro >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'} highlight={lucro < 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART GLASS */}
        <div className="card p-8 lg:col-span-2 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Visão Geral de Tesouraria</h3>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500" />
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barSize={32} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#020617' }} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* STATUS SUMMARY */}
        <div className="card p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Saúde Financeira</h3>
            <div className="space-y-4">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: d.fill, background: d.fill }} />
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{d.name}</span>
                  </div>
                  <span className="text-sm font-black text-white">{fmt(d.valor)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Lucro Estimado</span>
                <span className={`text-lg font-black ${lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmt(lucro)}</span>
             </div>
          </div>
        </div>

      </div>

      {/* TABLE DARK TECH */}
      <div className="card overflow-hidden border-white/5">
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-sm">
          <div className="flex gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input placeholder="Filtrar lançamentos ou projetos..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-700 text-white" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="">TODOS OS TIPOS</option>
              <option value="receita">RECEITAS</option>
              <option value="despesa">DESPESAS</option>
            </select>
          </div>
          <button className="btn-outline py-3 text-[10px] font-black uppercase tracking-widest gap-3">
            <Filter size={16} /> FILTROS
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Descrição / Item</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Projeto</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">Valor</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">Vencimento</th>
                <th className="px-8 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(r => (
                <tr key={r.id} className="table-row group">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{r.descricao}</p>
                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-1">REF: {r.id.substring(0,8)}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${r.tipo === 'receita' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                      {r.tipo === 'receita' ? 'ENTRADA' : 'SAÍDA'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {r.processo ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Briefcase size={14} className="text-slate-700" />
                        <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{r.processo.codigo_projeto}</span>
                      </div>
                    ) : <span className="text-xs text-slate-700 italic">—</span>}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-sm font-black font-mono ${r.tipo === 'receita' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {r.tipo === 'receita' ? '+' : '-'} {fmt(r.valor)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${r.status === 'pago' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}`}>
                      {r.status === 'pago' ? 'LIQUIDADO' : 'PENDENTE'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {r.data_vencimento ? new Date(r.data_vencimento).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(r)} className="p-2 text-slate-600 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-white/5 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TECH GLASS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto animate-fade">
          <div className="bg-slate-900 w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden border border-white/10">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{selectedReg ? 'Modificar Registro' : 'Novo Lançamento Financeiro'}</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Escrituração de Caixa Técnica</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Descrição da Operação</label>
                <input name="descricao" defaultValue={selectedReg?.descricao || ''} placeholder="Ex: Pagamento 1ª Parcela Projetos" required className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Categoria</label>
                  <select name="tipo" defaultValue={selectedReg?.tipo || 'receita'} className="select-field w-full" required>
                    <option value="receita" className="bg-slate-900 text-white">RECEITA (ENTRADA)</option>
                    <option value="despesa" className="bg-slate-900 text-white">DESPESA (SAÍDA)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Status de Caixa</label>
                  <select name="status" defaultValue={selectedReg?.status || 'pendente'} className="select-field w-full" required>
                    <option value="pendente" className="bg-slate-900 text-white">AGUARDANDO</option>
                    <option value="pago" className="bg-slate-900 text-white">LIQUIDADO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Valor Bruto (R$)</label>
                  <input name="valor" type="number" step="0.01" defaultValue={selectedReg?.valor || ''} placeholder="0.00" required className="input-field font-mono font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Vencimento Técnico</label>
                  <input name="data_vencimento" type="date" defaultValue={selectedReg?.data_vencimento?.split('T')[0] || ''} required className="input-field font-mono" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Vínculo de Projeto</label>
                <select name="processoId" defaultValue={selectedReg?.processoId || ''} className="select-field w-full">
                  <option value="" className="bg-slate-900 text-white">NENHUM VÍNCULO</option>
                  {processos.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.codigo_projeto} - {p.tipo_regularizacao.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline font-black text-[10px] tracking-widest px-8">CANCELAR</button>
                <button type="submit" disabled={saving} className="btn-primary min-w-[140px] justify-center font-black text-[10px] tracking-widest">
                  {saving ? 'PROCESSANDO...' : 'CONFIRMAR ESCRITURAÇÃO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

function FinanceStatCard({ label, value, icon: Icon, color, bg, highlight }: any) {
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
  return (
    <div className={`bento-card relative overflow-hidden group ${highlight ? 'border-red-500/50 bg-red-500/5' : ''}`}>
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`p-2 rounded-xl ${bg} ${color} border border-white/5 shadow-sm`}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="relative z-10">
        <p className={`text-2xl font-black text-white tracking-tighter ${highlight ? 'text-red-500' : ''}`}>
          {fmt(value)}
        </p>
        <div className="flex items-center gap-2 mt-2">
           <div className="h-0.5 w-6 rounded-full bg-slate-800" />
           <span className="text-[9px] font-bold text-slate-600 uppercase">Audit Verified</span>
        </div>
      </div>
    </div>
  )
}
