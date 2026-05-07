'use client'

import { useEffect, useState, useMemo } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Clock, Plus, Search, Filter, Edit, Trash2, X, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react'
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

  // Cálculos Automáticos solicitados
  const totais = useMemo(() => {
    const contratos = registros.filter(r => r.tipo === 'receita').reduce((s, r) => s + r.valor, 0)
    const recebido = registros.filter(r => r.tipo === 'receita' && r.status === 'pago').reduce((s, r) => s + r.valor, 0)
    const aReceber = contratos - recebido
    
    const despesasTotal = registros.filter(r => r.tipo === 'despesa').reduce((s, r) => s + r.valor, 0)
    const despesasPagas = registros.filter(r => r.tipo === 'despesa' && r.status === 'pago').reduce((s, r) => s + r.valor, 0)
    const despesasAPagar = despesasTotal - despesasPagas
    
    const lucroRealizado = recebido - despesasPagas
    const lucroPrevisto = aReceber - despesasAPagar

    return {
      contratos,
      recebido,
      aReceber,
      despesasPagas,
      despesasAPagar,
      lucroRealizado,
      lucroPrevisto
    }
  }, [registros])

  const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

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
    <div className="space-y-8 animate-fade h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Financeiro</h1>
          <p className="text-xs text-slate-500 font-medium mt-2 tracking-wider uppercase">Receitas, Despesas e Lucro Líquido</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => handleOpenModal()} className="btn-primary py-2.5">
             <Plus size={18} strokeWidth={3} /> NOVO LANÇAMENTO
           </button>
        </div>
      </div>

      {/* INTELLIGENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card p-5 bg-gradient-to-br from-blue-900/20 to-blue-900/5 border-blue-500/20">
           <h3 className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest mb-1">Valor Contratado</h3>
           <p className="text-2xl font-black text-blue-400">{fmt(totais.contratos)}</p>
        </div>
        
        <div className="card p-5 bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 border-emerald-500/20">
           <div className="flex justify-between items-start mb-2">
             <div>
                <h3 className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-1">Lucro Realizado (Atual)</h3>
                <p className="text-2xl font-black text-emerald-400">{fmt(totais.lucroRealizado)}</p>
             </div>
           </div>
           <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-500/10 text-xs">
              <span className="text-emerald-500/70">Recebido: {fmt(totais.recebido)}</span>
              <span className="text-red-500/70">Desp. Pagas: {fmt(totais.despesasPagas)}</span>
           </div>
        </div>
        
        <div className="card p-5 bg-gradient-to-br from-amber-900/20 to-amber-900/5 border-amber-500/20">
           <div className="flex justify-between items-start mb-2">
             <div>
                <h3 className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-1">Lucro Previsto (Futuro)</h3>
                <p className="text-2xl font-black text-amber-400">{fmt(totais.lucroPrevisto)}</p>
             </div>
           </div>
           <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-500/10 text-xs">
              <span className="text-amber-500/70">A Receber: {fmt(totais.aReceber)}</span>
              <span className="text-red-500/70">A Pagar: {fmt(totais.despesasAPagar)}</span>
           </div>
        </div>

        <div className="card p-5 flex flex-col justify-center items-center bg-slate-900/40 hover-glow cursor-pointer text-slate-500 hover:text-white transition-colors">
           <TrendingUp size={24} className="mb-2" />
           <span className="text-xs font-bold uppercase tracking-widest">Ver Relatório Completo</span>
        </div>
      </div>

      {/* TRANSACTIONS LIST */}
      <div className="flex-1 card overflow-hidden flex flex-col border-white/5 bg-slate-900/40">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-sm">
          <div className="flex gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input placeholder="Buscar lançamentos..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-700 text-white" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="">Todos os Tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
          <button className="btn-outline py-2.5 text-[10px] font-black uppercase tracking-widest gap-2">
            <Filter size={14} /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Projeto</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest">Vencimento</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                 <tr><td colSpan={6} className="py-20 text-center text-xs text-slate-500 italic">Carregando movimentações...</td></tr>
              ) : filtered.length === 0 ? (
                 <tr><td colSpan={6} className="py-20 text-center text-slate-600 text-sm">Nenhum lançamento encontrado.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="table-row group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{r.descricao}</p>
                    <span className={`mt-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border inline-block ${r.tipo === 'receita' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                      {r.tipo === 'receita' ? 'RECEITA' : 'DESPESA'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.processo ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Briefcase size={12} className="text-slate-600" />
                        <span>{r.processo.codigo_projeto || `OP-${r.processo.id.substring(0,4).toUpperCase()}`}</span>
                      </div>
                    ) : <span className="text-xs text-slate-700">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-black font-mono ${r.tipo === 'receita' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {r.tipo === 'receita' ? '+' : '-'} {fmt(r.valor)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${r.status === 'pago' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}`}>
                      {r.status === 'pago' ? 'PAGO' : 'PENDENTE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {r.data_vencimento ? new Date(r.data_vencimento).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(r)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto animate-fade">
          <div className="bg-slate-900 w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden border border-white/10">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">{selectedReg ? 'Modificar Registro' : 'Novo Lançamento'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Descrição</label>
                <input name="descricao" defaultValue={selectedReg?.descricao || ''} placeholder="Ex: Recebimento Parcela 1" required className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Categoria</label>
                  <select name="tipo" defaultValue={selectedReg?.tipo || 'receita'} className="select-field w-full" required>
                    <option value="receita" className="bg-slate-900 text-white">RECEITA (+)</option>
                    <option value="despesa" className="bg-slate-900 text-white">DESPESA (-)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Status</label>
                  <select name="status" defaultValue={selectedReg?.status || 'pendente'} className="select-field w-full" required>
                    <option value="pendente" className="bg-slate-900 text-white">PENDENTE</option>
                    <option value="pago" className="bg-slate-900 text-white">PAGO/RECEBIDO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Valor (R$)</label>
                  <input name="valor" type="number" step="0.01" defaultValue={selectedReg?.valor || ''} placeholder="0.00" required className="input-field font-mono font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Vencimento</label>
                  <input name="data_vencimento" type="date" defaultValue={selectedReg?.data_vencimento?.split('T')[0] || ''} required className="input-field font-mono" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Vincular Projeto</label>
                <select name="processoId" defaultValue={selectedReg?.processoId || ''} className="select-field w-full">
                  <option value="" className="bg-slate-900 text-white">Sem vínculo</option>
                  {processos.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.codigo_projeto || `OP-${p.id.substring(0,4).toUpperCase()}`} - {p.tipo_regularizacao}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline px-6">Cancelar</button>
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
