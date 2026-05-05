"use client";

import { useState } from 'react'
import { Search, PlusCircle, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface Cliente {
  id: string
  nome: string
  cpf_cnpj: string
  telefone: string | null
  email: string | null
  cidade: string | null
  estado: string | null
  processos: any[]
}

interface ClientListProps {
  initialClientes: Cliente[]
}

export default function ClientList({ initialClientes }: ClientListProps) {
  const [search, setSearch] = useState('')

  const filtered = initialClientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf_cnpj.includes(search)
  )

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Clientes</h1>
            <p className="text-sm text-slate-500 mt-0.5">Requerentes, parceiros e proprietários</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[hsl(var(--border))] rounded-md text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 bg-white"
              />
            </div>
            <Link
              href="/clientes/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Novo Cliente
            </Link>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="px-8 py-5 bg-white border-b border-[hsl(var(--border))]">
        <div className="grid grid-cols-3 gap-8 max-w-sm">
          <div>
            <p className="text-2xl font-bold text-slate-900">{initialClientes.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total de clientes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{initialClientes.reduce((acc, c) => acc + c.processos.length, 0)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Processos ativos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{initialClientes.filter(c => c.processos.length > 0).length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Com projetos</p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-8 py-6">
        <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-[hsl(var(--border))] bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome / Documento</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contato</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Localização</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Projetos</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-400">
                    {search ? `Nenhum cliente encontrado para "${search}"` : 'Nenhum cliente cadastrado ainda.'}
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-blue-600">{c.nome.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{c.nome}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{c.cpf_cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600">{c.telefone || '—'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.email || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {c.cidade ? `${c.cidade}, ${c.estado || 'BA'}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${c.processos.length > 0 ? 'badge-blue' : 'badge-gray'}`}>
                      {c.processos.length} {c.processos.length === 1 ? 'projeto' : 'projetos'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Ver detalhes <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
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
