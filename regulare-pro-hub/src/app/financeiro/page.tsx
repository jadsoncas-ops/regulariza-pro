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
  Calendar, FileText, ChevronRight, LayoutGrid
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
    const matchSearch = r.descricao?.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !tipo || r.tipo === tipo
    return matchSearch && matchTipo
  }), [registros, search, tipo])

  const totais = useMemo(() => {
    // 1. Recebido Total (Todas as receitas pagas)
    const recebido = registros.filter(r => r.tipo === 'receita' && r.status === 'pago').reduce((s, r) => s + r.valor, 0);
    
    // 2. A Receber (Lógica dos processos: Valor Total - Recebido do Processo)
    // Mais as receitas avulsas (sem processoId) que estão pendentes
    const aReceberProcessos = processos.reduce((acc, p) => {
      const recebidoNoProcesso = p.financeiro
        ?.filter((f: any) => f.tipo === 'receita' && f.status === 'pago')
        .reduce((s: number, f: any) => s + f.valor, 0) || 0;
      return acc + Math.max(0, (p.valor_total || 0) - recebidoNoProcesso);
    }, 0);
    
    const aReceberAvulso = registros
      .filter(r => r.tipo === 'receita' && r.status !== 'pago' && !r.processoId)
      .reduce((s, r) => s + r.valor, 0);
    
    const aReceberTotal = aReceberProcessos + aReceberAvulso;

    // 3. A Pagar (Todas as despesas pendentes)
    const aPagar = registros.filter(r => r.tipo === 'despesa' && r.status !== 'pago').reduce((s, r) => s + r.valor, 0);

    // 4. Inadimplência (Receitas pendentes com vencimento passado)
    const inadimplente = registros
      .filter(r => r.tipo === 'receita' && r.status !== 'pago' && r.data_vencimento && new Date(r.data_vencimento) < new Date())
      .reduce((s, r) => s + r.valor, 0);

    return {
      recebido,
      aReceber: aReceberTotal,
      despesas: aPagar,
      inadimplente
    };
  }, [registros, processos])

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="flex flex-col gap-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão Financeira</h1>
           <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
              CAIXA.OPEN / 2024
           </span>
        </div>
        <p className="text-sm text-slate-500 font-medium tracking-tight">Fluxo de caixa consolidado e previsibilidade de recebíveis.</p>
      </div>

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'A Receber', value: totais.aReceber, icon: Wallet, color: 'text-primary', bg: 'bg-primary/5', trend: '+5.2%' },
          { label: 'Recebido no Mês', value: totais.recebido, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5', trend: '+12.8%' },
          { label: 'A Pagar', value: totais.despesas, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/5', trend: '-2.1%' },
          { label: 'Inadimplência', value: totais.inadimplente, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/5', trend: 'CRÍTICO' },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-[24px] shadow-sm hover:border-primary/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center ${k.color}`}>
                <k.icon size={18} />
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${k.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                 {k.trend}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">{k.label}</p>
            <h4 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
              {fmt(k.value)}
            </h4>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-6">
              <div className="relative w-80">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   placeholder="Buscar lançamento..." 
                   className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                   value={search} onChange={e => setSearch(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-2">
                 <button className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!tipo ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`} onClick={() => setTipo('')}>Todos</button>
                 <button className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tipo === 'receita' ? 'bg-primary text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`} onClick={() => setTipo('receita')}>Receitas</button>
                 <button className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tipo === 'despesa' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`} onClick={() => setTipo('despesa')}>Despesas</button>
              </div>
           </div>
           <button className="btn-premium px-6 py-2.5">
              <Plus size={16} /> NOVO LANÇAMENTO
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Descrição / Vínculo</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Tipo</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Vencimento</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono text-right">Valor</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono text-center">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan={6} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-1/3" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Nenhum registro encontrado</td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.tipo === 'receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {r.tipo === 'receita' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">{r.descricao}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight font-mono">{r.processo?.codigo_projeto || 'GERAL'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${r.tipo === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {r.tipo}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                       <Calendar size={12} className="text-slate-300" />
                       {r.data_vencimento ? new Date(r.data_vencimento).toLocaleDateString('pt-BR') : '—'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-sm font-bold ${r.tipo === 'receita' ? 'text-slate-900' : 'text-rose-600'}`}>
                      {r.tipo === 'receita' ? '' : '- '} {fmt(r.valor)}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                       <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                         r.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 
                         new Date(r.data_vencimento) < new Date() ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {r.status === 'pago' ? 'Liquidado' : new Date(r.data_vencimento) < new Date() ? 'Vencido' : 'Pendente'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Baixar">
                          <CheckCircle2 size={16} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                          <MoreHorizontal size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exibindo {filtered.length} de {registros.length} lançamentos</p>
           <div className="flex items-center gap-2">
              <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled><ChevronRight size={16} className="rotate-180" /></button>
              <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled><ChevronRight size={16} /></button>
           </div>
        </div>
      </div>

    </div>
  )
}
