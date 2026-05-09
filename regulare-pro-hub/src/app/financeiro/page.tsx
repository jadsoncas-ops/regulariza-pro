'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts'
import { 
  DollarSign, TrendingUp, TrendingDown, Clock, Plus, 
  Search, ArrowUpRight, ArrowDownRight, Wallet, 
  AlertCircle, CheckCircle2, MoreHorizontal, Filter,
  Calendar, FileText, ChevronRight, LayoutGrid, ArrowLeft,
  SearchIcon, Calculator, ArrowUpCircle, ArrowDownCircle, Briefcase
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function FinanceiroPage() {
  const [registros, setRegistros] = useState<any[]>([])
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('')

  useEffect(() => {
    fetch('/api/financeiro')
      .then(r => r.json())
      .then(d => { 
        setRegistros(Array.isArray(d.financeiro) ? d.financeiro : []); 
        setProcessos(Array.isArray(d.processos) ? d.processos : []);
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => registros.filter(r => {
    const matchSearch = r.descricao?.toLowerCase().includes(search.toLowerCase()) || 
                        r.processo?.codigo_projeto?.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !tipo || r.tipo === tipo
    return matchSearch && matchTipo
  }), [registros, search, tipo])

  const totais = useMemo(() => {
    const recebido = registros.filter(r => r.tipo === 'receita' && r.status === 'pago').reduce((s, r) => s + r.valor, 0);
    const aReceberProcessos = processos.reduce((acc, p) => {
      const recebidoNoProcesso = p.financeiro?.filter((f: any) => f.tipo === 'receita' && f.status === 'pago').reduce((s: number, f: any) => s + f.valor, 0) || 0;
      return acc + Math.max(0, (p.valor_total || 0) - recebidoNoProcesso);
    }, 0);
    const aReceberAvulso = registros.filter(r => r.tipo === 'receita' && r.status !== 'pago' && !r.processoId).reduce((s, r) => s + r.valor, 0);
    const aReceberTotal = aReceberProcessos + aReceberAvulso;
    const aPagar = registros.filter(r => r.tipo === 'despesa' && r.status !== 'pago').reduce((s, r) => s + (r.valor - (r.valor_pago || 0)), 0);
    const inadimplente = registros.filter(r => r.tipo === 'receita' && r.status !== 'pago' && r.data_vencimento && new Date(r.data_vencimento) < new Date()).reduce((s, r) => s + r.valor, 0);

    return { recebido, aReceber: aReceberTotal, despesas: aPagar, inadimplente };
  }, [registros, processos])

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F8FAFC]">
      
      {/* ── KPI HEADER ── */}
      <div className="grid grid-cols-4 border-b border-slate-200 bg-white shrink-0">
        {[
          { label: 'A Receber', value: totais.aReceber, icon: ArrowDownCircle, color: 'text-blue-600', border: 'border-r' },
          { label: 'Recebido', value: totais.recebido, icon: CheckCircle2, color: 'text-emerald-600', border: 'border-r' },
          { label: 'A Pagar', value: totais.despesas, icon: ArrowUpCircle, color: 'text-rose-600', border: 'border-r' },
          { label: 'Atrasados', value: totais.inadimplente, icon: AlertCircle, color: 'text-amber-600', border: '' },
        ].map((k, i) => (
          <div key={i} className={`p-6 ${k.border} border-slate-100 flex flex-col gap-1`}>
            <div className="flex items-center gap-2 mb-1">
              <k.icon size={14} className={k.color} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
            </div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{fmt(k.value)}</h4>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-6">
          <div className="relative w-64">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Buscar por descrição ou código..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-[11px] font-bold uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
             <button onClick={() => setTipo('')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!tipo ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
             <button onClick={() => setTipo('receita')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${tipo === 'receita' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Receitas</button>
             <button onClick={() => setTipo('despesa')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${tipo === 'despesa' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Despesas</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
              <Plus size={14} strokeWidth={3} /> Lançamento Avulso
           </button>
        </div>
      </div>

      {/* ── TABLE AREA ── */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="flex-1 overflow-y-auto scroll-container">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Descrição / Vínculo</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Tipo</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono text-right">Valor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono text-center">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                       <td colSpan={6} className="px-6 py-5"><div className="h-4 bg-slate-50 rounded w-1/3" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum lançamento no radar</td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.tipo === 'receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {r.tipo === 'receita' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[11px] font-black text-slate-900 uppercase truncate">{r.descricao}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <Briefcase size={10} className="text-slate-300" />
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight font-mono">{r.processo?.codigo_projeto || 'AVULSO'}</p>
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${r.tipo === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {r.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase">
                         <Calendar size={12} className="text-slate-300" />
                         {r.data_vencimento ? new Date(r.data_vencimento).toLocaleDateString('pt-BR') : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-[12px] font-black ${r.tipo === 'receita' ? 'text-slate-900' : 'text-rose-600'}`}>
                        {r.tipo === 'receita' ? '' : '- '} {fmt(r.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                         <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                           r.status === 'pago' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 
                           new Date(r.data_vencimento) < new Date() ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {r.status === 'pago' ? 'Liquidado' : new Date(r.data_vencimento) < new Date() ? 'Vencido' : 'Pendente'}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Baixar">
                            <CheckCircle2 size={16} strokeWidth={2.5} />
                         </button>
                         <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                            <MoreHorizontal size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-8 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Radar operacional: {filtered.length} lançamentos detectados</p>
             <div className="flex items-center gap-2">
                <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled><ChevronRight size={14} className="rotate-180" /></button>
                <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled><ChevronRight size={14} /></button>
             </div>
          </div>
        </div>
      </div>

    </div>
  )
}
