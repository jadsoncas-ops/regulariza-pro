'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Users, Building2, Briefcase, Phone, Mail, MapPin, ChevronRight, MoreHorizontal, Edit2 } from 'lucide-react'
import { EditClienteModal } from '@/components/EditClienteModal'

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  ativo:    { label: 'Ativo',    class: 'badge-green' },
  inativo:  { label: 'Inativo', class: 'badge-slate' },
  pendente: { label: 'Pendente', class: 'badge-amber' },
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [clienteToEdit, setClienteToEdit] = useState<any>(null)

  const fetchData = () => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(d => { setClientes(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

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
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <Link href="/clientes/novo" className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{clientes.length}</p>
            <p className="text-xs text-slate-500">Total de Clientes</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {clientes.reduce((s, c) => s + (c.processos?.length || 0), 0)}
            </p>
            <p className="text-xs text-slate-500">Processos Vinculados</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {clientes.reduce((s, c) => s + (c.imoveis?.length || 0), 0)}
            </p>
            <p className="text-xs text-slate-500">Imóveis Vinculados</p>
          </div>
        </div>
      </div>

      {/* SEARCH + TABLE */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Buscar por nome, cidade ou CPF..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left table-header">Cliente</th>
                <th className="px-6 py-3 text-left table-header">Contato</th>
                <th className="px-6 py-3 text-left table-header">Cidade</th>
                <th className="px-6 py-3 text-center table-header">Imóveis</th>
                <th className="px-6 py-3 text-center table-header">Processos</th>
                <th className="px-6 py-3 text-left table-header">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    Carregando clientes...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Nenhum cliente encontrado</p>
                    <Link href="/clientes/novo" className="btn-primary mt-4 inline-flex">
                      <Plus className="w-4 h-4" /> Cadastrar primeiro cliente
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const st = STATUS_MAP[c.status] || STATUS_MAP['ativo']
                  return (
                    <tr key={c.id} className="table-row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-600">{c.nome?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{c.nome}</p>
                            <p className="text-xs text-slate-400">{c.cpf_cnpj}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          {c.telefone && <p className="text-xs text-slate-600 flex items-center gap-1"><Phone className="w-3 h-3" />{c.telefone}</p>}
                          {c.email && <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{c.cidade || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="badge badge-purple">{c.imoveis?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="badge badge-blue">{c.processos?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${st.class}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setClienteToEdit(c); setIsEditModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <Link href={`/clientes/${c.id}`} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors" title="Abrir">
                            <ChevronRight size={16} />
                          </Link>
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
      
      <EditClienteModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setClienteToEdit(null) }}
        cliente={clienteToEdit}
        onSuccess={fetchData}
      />
    </div>
  )
}
