'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Users, Building2, Briefcase, Phone, Mail, MapPin, ChevronRight, MoreHorizontal, ArrowUpRight } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  ativo:    { label: 'Ativo',    class: 'badge-green' },
  inativo:  { label: 'Inativo', class: 'badge-slate' },
  pendente: { label: 'Pendente', class: 'badge-amber' },
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(d => { setClientes(Array.isArray(d) ? d : []); setLoading(false) })
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
    c.cpf_cnpj?.includes(search)
  )

  return (
    <div className="space-y-6 animate-fade-up">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl">Clientes</h1>
          <p className="text-xs text-slate-500 font-medium">Gestão de relacionamento e portfólio de clientes</p>
        </div>
        <Link href="/clientes/novo" className="btn-primary">
          <Plus className="w-4 h-4" strokeWidth={3} /> Novo Cliente
        </Link>
      </div>

      {/* STATS COMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total de Clientes', value: clientes.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Processos Ativos', value: clientes.reduce((s, c) => s + (c.processos?.length || 0), 0), icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Imóveis Cadastrados', value: clientes.reduce((s, c) => s + (c.imoveis?.length || 0), 0), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center border border-slate-100 shadow-sm`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH + TABLE */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              placeholder="Buscar por nome, cidade ou CPF..."
              className="input-field pl-9 py-2"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-outline py-2 text-xs font-bold uppercase tracking-widest gap-2">
            <Filter size={14} /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Contato</th>
                <th className="px-6 py-3">Localização</th>
                <th className="px-6 py-3 text-center">Ativos</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 italic">
                    Carregando base de clientes...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" strokeWidth={1} />
                    <p className="text-sm font-bold text-slate-900">Nenhum cliente localizado</p>
                    <p className="text-xs text-slate-400 mt-1">Tente ajustar seus filtros de busca</p>
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const st = STATUS_MAP[c.status] || STATUS_MAP['ativo']
                  return (
                    <tr key={c.id} className="table-row group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/10">
                            <span className="text-xs font-black">{c.nome?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{c.nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.cpf_cnpj}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {c.telefone && <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-300" />{c.telefone}</p>}
                          {c.email && <p className="text-[11px] text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-300" />{c.email}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                           <MapPin size={12} className="text-slate-300" />
                           <span className="text-[11px] font-medium text-slate-600">{c.cidade || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                           <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-slate-900">{c.imoveis?.length || 0}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase">Imóveis</span>
                           </div>
                           <div className="w-px h-6 bg-slate-100" />
                           <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-slate-900">{c.processos?.length || 0}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase">Procs</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${st.class}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/clientes/${c.id}`} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                             <ArrowUpRight size={18} />
                          </Link>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg">
                             <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
