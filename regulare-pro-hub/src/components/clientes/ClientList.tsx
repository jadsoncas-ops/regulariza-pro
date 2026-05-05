'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  Save, 
  AlertTriangle,
  MoreHorizontal,
  PlusCircle,
  TrendingUp,
  Users,
  FolderOpen
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Cliente {
  id: string
  nome: string
  cpf_cnpj: string
  telefone: string | null
  email: string | null
  endereco: string | null
  observacoes: string | null
  processos: any[]
}

interface ClientListProps {
  initialClientes: Cliente[]
  stats: {
    totalClientes: number
    totalProcessos: number
    receitaTotal: number
    ticketMedio: number
  }
}

export default function ClientList({ initialClientes, stats }: ClientListProps) {
  const [clientes, setClientes] = useState(initialClientes)
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf_cnpj.includes(searchTerm) ||
    (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsDeleteModalOpen(true)
  }

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCliente) return
    
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/clientes/${selectedCliente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        const updated = await res.json()
        setClientes(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
        setIsEditModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedCliente) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/clientes/${selectedCliente.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setClientes(prev => prev.filter(c => c.id !== selectedCliente.id))
        setIsDeleteModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 font-mono">
      
      {/* INDICATORS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm hover:shadow-md smooth-transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Clientes</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalClientes.toString().padStart(2, '0')}</div>
          <div className="mt-2 text-[9px] text-emerald-500 font-bold uppercase tracking-tighter flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% ESTE MÊS
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ativos / Proc.</span>
            <FolderOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalProcessos.toString().padStart(2, '0')}</div>
          <div className="mt-2 text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">EM TRAMITAÇÃO ATIVA</div>
        </div>

        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Receita Total</span>
            <div className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-sm">BRL</div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(stats.receitaTotal)}
          </div>
          <div className="mt-2 text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">FATURAMENTO ACUMULADO</div>
        </div>

        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ticket Médio</span>
            <div className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded-sm">AVG</div>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(stats.ticketMedio)}
          </div>
          <div className="mt-2 text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">POR PROCESSO</div>
        </div>
      </div>

      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/20 p-4 border border-border rounded-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="BUSCAR CLIENTE, CPF OU EMAIL..."
            className="w-full bg-background border border-border px-10 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 smooth-transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2.5 border border-border bg-card rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition flex items-center justify-center gap-2">
            IMPORTAR CSV
          </button>
          <Link href="/clientes/novo" className="flex-1 md:flex-none px-6 py-2.5 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center justify-center gap-2">
            <PlusCircle className="w-3.5 h-3.5" /> NOVO CLIENTE
          </Link>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-border bg-card shadow-md rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4">CLIENTE</th>
              <th className="px-6 py-4">CONTATO / DOCS</th>
              <th className="px-6 py-4">STATUS</th>
              <th className="px-6 py-4 text-center">PROC.</th>
              <th className="px-6 py-4 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredClientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic tracking-widest">
                  NENHUM RESULTADO ENCONTRADO PARA "{searchTerm.toUpperCase()}"
                </td>
              </tr>
            ) : (
              filteredClientes.map((c) => (
                <tr key={c.id} className="hover:bg-muted/10 smooth-transition group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground tracking-tight">{c.nome}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                        {c.cpf_cnpj} • {c.cpf_cnpj.length > 14 ? 'PJ' : 'PF'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-medium text-foreground">{c.email || 'SEM EMAIL'}</div>
                      <div className="text-[10px] text-muted-foreground">{c.telefone || 'SEM TELEFONE'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                      ATIVO
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="bg-muted px-2 py-1 rounded-sm font-bold text-foreground">
                      {c.processos.length.toString().padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/clientes/${c.id}`}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground smooth-transition"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleEdit(c)}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-blue-500 smooth-transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(c)}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-red-500 smooth-transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedCliente && (() => {
        // Parsear telefone existente: "(73) 98842-7977" → ddd=73, numero=98842-7977
        const telRaw = selectedCliente.telefone || ''
        const telMatch = telRaw.match(/\(?\s*(\d{2})\s*\)?\s*(.+)/)
        const telDdd = telMatch ? telMatch[1] : ''
        const telNumero = telMatch ? telMatch[2].trim() : telRaw

        // Parsear endereço existente: "Rua X, 143, Bairro, Cidade/UF" → campos
        const endParts = (selectedCliente.endereco || '').split(',').map(s => s.trim())
        const endRua = endParts[0] || ''
        const endNumero = endParts[1] || ''
        const endBairro = endParts[2] || ''
        const endCidadeUF = endParts[3] || ''
        const endCidade = endCidadeUF.split('/')[0]?.trim() || ''
        const endEstado = endCidadeUF.split('/')[1]?.trim() || ''

        return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest">Editar Cliente</h2>
                <p className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">ID: {selectedCliente.id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-muted rounded-sm smooth-transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              // Montar telefone composto
              const ddd = (fd.get('tel_ddd') as string || '').replace(/\D/g, '')
              const num = (fd.get('tel_numero') as string || '').trim()
              const telFinal = ddd && num ? `(${ddd}) ${num}` : (ddd || num || '')
              // Montar endereço composto
              const rua = fd.get('end_rua') as string || ''
              const numero = fd.get('end_numero') as string || ''
              const bairro = fd.get('end_bairro') as string || ''
              const cidade = fd.get('end_cidade') as string || ''
              const estado = fd.get('end_estado') as string || ''
              const cep = fd.get('end_cep') as string || ''
              const endFinal = [rua, numero, bairro, cidade && estado ? `${cidade}/${estado}` : cidade].filter(Boolean).join(', ')

              // Criar FormData limpo para o saveEdit
              const cleanForm = new FormData()
              cleanForm.set('nome', fd.get('nome') as string)
              cleanForm.set('cpf_cnpj', fd.get('cpf_cnpj') as string)
              cleanForm.set('email', fd.get('email') as string)
              cleanForm.set('telefone', telFinal)
              cleanForm.set('endereco', endFinal)
              cleanForm.set('cidade', cidade)
              cleanForm.set('estado', estado)
              cleanForm.set('cep', cep)
              cleanForm.set('observacoes', fd.get('observacoes') as string)

              // Chamar saveEdit diretamente com o evento modificado
              if (!selectedCliente) return
              setIsLoading(true)
              const payload = Object.fromEntries(cleanForm.entries())
              fetch(`/api/clientes/${selectedCliente.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(res => res.json()).then(updated => {
                setClientes(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
                setIsEditModalOpen(false)
                router.refresh()
              }).catch(console.error).finally(() => setIsLoading(false))
            }} className="p-6 space-y-5 overflow-y-auto flex-1">

              {/* IDENTIFICAÇÃO */}
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 pb-1 border-b border-border">Identificação</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome Completo *</label>
                    <input name="nome" defaultValue={selectedCliente.nome} required
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CPF / CNPJ *</label>
                    <input name="cpf_cnpj" defaultValue={selectedCliente.cpf_cnpj} required
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                </div>
              </div>

              {/* CONTATO */}
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 pb-1 border-b border-border">Contato</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                    <input name="email" type="email" defaultValue={selectedCliente.email || ''}
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Telefone</label>
                    <div className="flex gap-2">
                      {/* País fixo Brasil */}
                      <div className="flex items-center gap-1.5 px-2.5 py-2 bg-muted/40 border border-border rounded-sm text-xs font-bold text-muted-foreground shrink-0 whitespace-nowrap">
                        🇧🇷 +55
                      </div>
                      <input
                        name="tel_ddd"
                        defaultValue={telDdd}
                        placeholder="DDD"
                        maxLength={2}
                        className="w-16 bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 text-center font-bold"
                      />
                      <input
                        name="tel_numero"
                        defaultValue={telNumero}
                        placeholder="9 9999-9999"
                        className="flex-1 bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ENDEREÇO */}
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 pb-1 border-b border-border">Endereço</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logradouro (Rua / Av.)</label>
                    <input name="end_rua" defaultValue={endRua} placeholder="Ex: Rua das Flores"
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Número</label>
                    <input name="end_numero" defaultValue={endNumero} placeholder="143"
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bairro</label>
                    <input name="end_bairro" defaultValue={endBairro} placeholder="Centro"
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cidade</label>
                    <input name="end_cidade" defaultValue={endCidade} placeholder="São Paulo"
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado (UF)</label>
                    <select name="end_estado" defaultValue={endEstado}
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30">
                      <option value="">Selecione...</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CEP</label>
                    <input name="end_cep" defaultValue={selectedCliente.endereco?.match(/\d{5}-?\d{3}/)?.[0] || ''} placeholder="00000-000"
                      className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                </div>
              </div>

              {/* OBSERVAÇÕES */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Observações</label>
                <textarea name="observacoes" defaultValue={selectedCliente.observacoes || ''} rows={3}
                  className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading}
                  className="px-8 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center gap-2 disabled:opacity-50">
                  {isLoading ? 'SALVANDO...' : <><Save className="w-3.5 h-3.5" /> SALVAR ALTERAÇÕES</>}
                </button>
              </div>
            </form>
          </div>
        </div>
        )
      })()}


      {/* DELETE CONFIRMATION */}
      {isDeleteModalOpen && selectedCliente && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Excluir Cliente?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                VOCÊ ESTÁ PRESTES A EXCLUIR <span className="text-foreground font-bold">{selectedCliente.nome.toUpperCase()}</span>.<br />
                ESTA AÇÃO É IRREVERSÍVEL E TODOS OS PROCESSOS VINCULADOS SERÃO PERDIDOS.
              </p>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 smooth-transition disabled:opacity-50"
                >
                  {isLoading ? 'EXCLUINDO...' : 'CONFIRMAR EXCLUSÃO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
