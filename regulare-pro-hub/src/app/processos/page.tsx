'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Users, DollarSign, Clock, LayoutGrid, List } from 'lucide-react'

// Novas colunas solicitadas
const KANBAN_COLUMNS: Record<string, { label: string; color: string; border: string; bg: string }> = {
  proposta:      { label: 'Proposta',       color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  documentacao:  { label: 'Documentação',   color: 'text-blue-400',  border: 'border-blue-500/30',  bg: 'bg-blue-500/10' },
  projeto:       { label: 'Projeto',        color: 'text-purple-400',border: 'border-purple-500/30',bg: 'bg-purple-500/10' },
  protocolo:     { label: 'Protocolo',      color: 'text-indigo-400',border: 'border-indigo-500/30',bg: 'bg-indigo-500/10' },
  finalizacao:   { label: 'Finalização',    color: 'text-emerald-400',border:'border-emerald-500/30',bg: 'bg-emerald-500/10' },
}

const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'board' | 'list'>('board')

  useEffect(() => {
    fetch('/api/processos')
      .then(r => r.json())
      .then(d => {
        // Mapeia os status antigos para os novos temporariamente até atualizar o banco
        const list = (Array.isArray(d) ? d : []).map(p => {
           let newStatus = p.status
           if (p.status === 'em_analise' || p.status === 'levantamento') newStatus = 'proposta'
           else if (p.status === 'protocolo_prefeitura') newStatus = 'protocolo'
           else if (p.status === 'finalizado') newStatus = 'finalizacao'
           else if (p.status === 'exigencia_tecnica') newStatus = 'documentacao'
           else if (!KANBAN_COLUMNS[newStatus]) newStatus = 'proposta'
           return { ...p, status: newStatus }
        })
        setProcessos(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setProcessos(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    try {
      await fetch(`/api/processos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (e) {
      console.error('Erro na requisição de status:', e)
    }
  }

  const filtered = processos.filter(p =>
    !search ||
    p.cliente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.tipo_regularizacao?.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo_projeto?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Operations (Processos)</h1>
          <p className="text-xs text-slate-500 font-medium mt-2 tracking-wider uppercase">Esteira de Produção & Entregas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
            <button onClick={() => setView('board')} className={`p-2 rounded-lg transition-all ${view === 'board' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}><LayoutGrid size={16}/></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}><List size={16}/></button>
          </div>
          
          <div className="relative group w-72 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              placeholder="Pesquisar operação..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-slate-700 text-white"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Link href="/processos/novo" className="btn-primary py-2.5">
            <Plus size={18} strokeWidth={3} /> NOVA OPERAÇÃO
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-6 overflow-hidden animate-pulse">
           {[1,2,3,4,5].map(i => <div key={i} className="w-[300px] h-[600px] bg-white/5 rounded-2xl shrink-0" />)}
        </div>
      ) : view === 'board' ? (
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide -mx-1 px-1 flex-1">
          {Object.entries(KANBAN_COLUMNS).map(([statusId, config]) => {
            const colProcs = filtered.filter(p => p.status === statusId)
            return (
              <div key={statusId} className="flex-shrink-0 w-[320px] flex flex-col gap-4">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.25em] ${config.color}`}>{config.label}</h3>
                    <span className="text-[10px] font-black text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">{colProcs.length}</span>
                  </div>
                  <button className="text-slate-600 hover:text-white transition-colors"><Plus size={16}/></button>
                </div>
                
                <div className="flex-1 space-y-4 p-3 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-sm min-h-[500px]">
                  {colProcs.map(p => {
                    // Mocks de financeiro para o visual da startup
                    const valorContrato = p.valor_contrato || 5000
                    const pendente = Math.random() > 0.5
                    
                    return (
                      <div key={p.id} className="card p-5 hover-glow group cursor-grab active:cursor-grabbing border-white/10 hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2 py-1 bg-slate-900 rounded border border-white/5">
                            {p.codigo_projeto || `OP-${p.id.substring(0,4).toUpperCase()}`}
                          </span>
                          
                          <select 
                            className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            value={p.status}
                            onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                          >
                            {Object.entries(KANBAN_COLUMNS).map(([v, c]) => (
                              <option key={v} value={v} className="bg-slate-900 text-white">{c.label.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug mb-3 group-hover:text-blue-400 transition-colors">
                          {p.tipo_regularizacao}
                        </h4>

                        <div className="space-y-2 mb-4">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                             <Users size={12} className="text-slate-600" />
                             <span className="truncate">{p.cliente?.nome || 'Cliente não definido'}</span>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-300">{fmt(valorContrato)}</span>
                           <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${pendente ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'}`}>
                              {pendente ? 'Pendente' : 'Pago'}
                           </span>
                        </div>
                      </div>
                    )
                  })}
                  {colProcs.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-slate-700">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">Drop Here</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Código / Serviço</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p => (
                <tr key={p.id} className="table-row group">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white group-hover:text-blue-400">{p.tipo_regularizacao}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">{p.codigo_projeto || `OP-${p.id.substring(0,4).toUpperCase()}`}</p>
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-300 font-bold">
                    {p.cliente?.nome || '—'}
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-300 font-bold">
                    {fmt(p.valor_contrato || 5000)}
                  </td>
                  <td className="px-8 py-5">
                    {(() => {
                      const st = KANBAN_COLUMNS[p.status] || KANBAN_COLUMNS.proposta
                      return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${st.border} ${st.bg} ${st.color}`}>{st.label}</span>
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
