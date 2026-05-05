"use client";

import { useState } from 'react'
import { 
  Search, 
  UserPlus, 
  ArrowRight,
  Users,
  MapPin,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface Cliente {
  id: string
  nome: string
  cpf_cnpj: string
  telefone: string | null
  email: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  processos: any[]
}

interface ClientListProps {
  initialClientes: Cliente[]
}

export default function ClientList({ initialClientes }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClientes = initialClientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf_cnpj.includes(searchTerm)
  )

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full font-mono space-y-10">
      
      {/* HEADER DA TELA - REGRA DE 3 AÇÕES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">Clientes</h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Gestão de Requerentes e Parceiros</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="BUSCAR CLIENTE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border pl-10 pr-4 py-2.5 rounded-sm text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <button className="bg-foreground text-background px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5" /> Novo Cliente
          </button>
        </div>
      </div>

      {/* TABELA MINIMALISTA */}
      <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted/30 border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">IDENTIFICAÇÃO</th>
              <th className="px-6 py-5">CONTATO</th>
              <th className="px-6 py-5">ESTADO OPERACIONAL</th>
              <th className="px-6 py-5 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-[11px]">
            {filteredClientes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground uppercase font-bold text-[10px]">
                  Nenhum cliente encontrado na base de dados.
                </td>
              </tr>
            ) : (
              filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-muted/10 smooth-transition group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center text-[10px] font-black text-muted-foreground border border-border group-hover:bg-foreground group-hover:text-background transition-all">
                        {cliente.nome.substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-foreground uppercase tracking-tight">{cliente.nome}</span>
                        <span className="text-[9px] text-muted-foreground font-bold tracking-tighter">{cliente.cpf_cnpj}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-muted-foreground font-bold uppercase tracking-tight">
                    {cliente.email || '---'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
                       <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                       <span className="text-[9px] font-black uppercase text-primary">{cliente.processos.length} PROJETOS</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link href={`/clientes/${cliente.id}`} className="p-2.5 hover:bg-muted rounded-sm inline-flex transition-all">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
