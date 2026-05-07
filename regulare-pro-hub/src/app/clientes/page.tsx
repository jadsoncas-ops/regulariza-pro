'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Users, Building2, Briefcase, Phone, Mail, MapPin, ChevronRight, MoreHorizontal, ArrowUpRight, Trash2 } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; border: string; bg: string; color: string }> = {
  ativo:    { label: 'ATIVO',    border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
  inativo:  { label: 'INATIVO',  border: 'border-white/10',       bg: 'bg-white/5',        color: 'text-slate-500' },
  pendente: { label: 'PENDENTE', border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   color: 'text-amber-400' },
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(d => {
        setClientes(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cliente? Todos os dados vinculados podem ser afetados.')) return
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setClientes(prev => prev.filter(c => c.id !== id))
      }
    } catch (e) {
      console.error('Erro ao excluir cliente:', e)
    }
  }

  const filtered = clientes.filter(c =>
    c.nome?.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-fade">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Base de Clientes</h1>
          <p className="text-xs text-slate-500 font-medium mt-1 tracking-wider uppercase">Relacionamento e Gestão de Portfólio</p>
        </div>
        <button className="btn-primary py-2.5">
          <Plus size={18} strokeWidth={3} /> NOVO CADASTRO
        </button>
      </div>

      {/* FILTER BAR GLASS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            placeholder="Pesquisar por nome, e-mail ou cidade..." 
            className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all placeholder:text-slate-700 text-white"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-outline py-3 text-[10px] font-black uppercase tracking-[0.2em] px-8">
          <Filter size={16} /> FILTRAR LISTA
        </button>
      </div>

      {/* CLIENTS LIST DARK TECH */}
      <div className="card overflow-hidden border-white/5 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Titular / Identificação</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Localização</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Contato</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Projetos</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-xs text-slate-500 italic">Processando base de dados...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-600 text-sm">Nenhum registro encontrado.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="table-row group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-blue-500 shadow-lg group-hover:scale-105 transition-transform">
                        <Users size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{c.nome}</p>
                        <p className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-widest mt-0.5">{c.cpf_cnpj || 'DOCUMENTO NÃO INF.'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={14} className="text-slate-700" />
                      <span className="text-xs font-semibold">{c.cidade || '—'} / {c.estado || '—'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-300 flex items-center gap-2"><Phone size={12} className="text-slate-600" /> {c.telefone || '—'}</p>
                      <p className="text-[10px] font-medium text-slate-500 flex items-center gap-2 truncate max-w-[150px]"><Mail size={12} className="text-slate-700" /> {c.email || '—'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <Briefcase size={14} className="text-slate-700" />
                       <span className="text-[10px] font-black text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">{c.processos?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {(() => {
                      const st = STATUS_MAP[c.status || 'ativo']
                      return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${st.border} ${st.bg} ${st.color}`}>{st.label}</span>
                    })()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <Link href={`/clientes/${c.id}`} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all">
                         <ArrowUpRight size={18} />
                      </Link>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-white/5 rounded-xl transition-all">
                         <Trash2 size={16} />
                      </button>
                    </div>
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
