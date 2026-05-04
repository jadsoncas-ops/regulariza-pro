'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Trash2, 
  X, 
  Save, 
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Edit2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Financeiro {
  id: string
  processoId: string | null
  clienteId: string | null
  descricao: string
  valor: number
  valor_pago: number
  data_vencimento: string | null
  data_pagamento: string | null
  forma_pagamento: string | null
  status: string
  createdAt: string
  processo: { id: string, tipo_regularizacao: string } | null
  cliente: { id: string, nome: string } | null
}

interface FinanceiroListProps {
  initialLancamentos: Financeiro[]
  processos: { id: string, tipo_regularizacao: string, cliente: { id: string, nome: string } }[]
}

export default function FinanceiroList({ initialLancamentos, processos }: FinanceiroListProps) {
  const [lancamentos, setLancamentos] = useState(initialLancamentos)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLancamento, setSelectedLancamento] = useState<Financeiro | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredLancamentos = lancamentos.filter(l => 
    l.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalReceita = filteredLancamentos.reduce((acc, l) => acc + l.valor, 0)
  const totalPago = filteredLancamentos.reduce((acc, l) => acc + l.valor_pago, 0)
  const totalPendente = totalReceita - totalPago

  const handleEditClick = (lancamento: Financeiro) => {
    setSelectedLancamento(lancamento)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (lancamento: Financeiro) => {
    setSelectedLancamento(lancamento)
    setIsDeleteModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedLancamento(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    // Process form data
    const processoId = data.processoId as string
    const selectedProcesso = processos.find(p => p.id === processoId)
    const clienteId = selectedProcesso ? selectedProcesso.cliente.id : (data.clienteId as string)

    const payload = {
      descricao: data.descricao,
      valor: parseFloat(data.valor as string),
      valor_pago: parseFloat(data.valor_pago as string) || 0,
      data_vencimento: data.data_vencimento ? new Date(data.data_vencimento as string).toISOString() : null,
      data_pagamento: data.data_pagamento ? new Date(data.data_pagamento as string).toISOString() : null,
      forma_pagamento: data.forma_pagamento,
      status: data.status,
      processoId: processoId || null,
      clienteId: clienteId || null,
    }

    try {
      const url = selectedLancamento ? `/api/financeiro/${selectedLancamento.id}` : `/api/financeiro`
      const method = selectedLancamento ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const saved = await res.json()
        const procObj = processos.find(p => p.id === saved.processoId)
        const enriched = { 
          ...saved, 
          processo: procObj ? { id: procObj.id, tipo_regularizacao: procObj.tipo_regularizacao } : null,
          cliente: procObj ? procObj.cliente : null 
        }

        if (selectedLancamento) {
          setLancamentos(prev => prev.map(l => l.id === saved.id ? enriched : l))
        } else {
          setLancamentos(prev => [enriched, ...prev])
        }
        setIsModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedLancamento) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/financeiro/${selectedLancamento.id}`, { method: 'DELETE' })
      if (res.ok) {
        setLancamentos(prev => prev.filter(l => l.id !== selectedLancamento.id))
        setIsDeleteModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'pago': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'pendente': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'atrasado': return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      case 'cancelado': return 'bg-muted text-muted-foreground border-border'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-8 font-mono">
      
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Faturado</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceita)}
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recebido (Pago)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">A Receber</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
          </div>
        </div>
      </div>

      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/20 p-4 border border-border rounded-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="BUSCAR DESCRIÇÃO OU CLIENTE..."
            className="w-full bg-background border border-border px-10 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 smooth-transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={handleCreateNew}
            className="flex-1 md:flex-none px-6 py-2.5 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-3.5 h-3.5" /> NOVO LANÇAMENTO
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-border bg-card shadow-md rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4">DESCRIÇÃO / CLIENTE</th>
              <th className="px-6 py-4">VÍNCULO</th>
              <th className="px-6 py-4">VALORES</th>
              <th className="px-6 py-4">VENCIMENTO</th>
              <th className="px-6 py-4 text-center">STATUS</th>
              <th className="px-6 py-4 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLancamentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground italic tracking-widest">
                  NENHUM LANÇAMENTO ENCONTRADO
                </td>
              </tr>
            ) : (
              filteredLancamentos.map((l) => (
                <tr key={l.id} className="hover:bg-muted/10 smooth-transition group">
                  <td className="px-6 py-5 max-w-[250px]">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-sm text-foreground tracking-tight line-clamp-2">{l.descricao}</div>
                      <div className="text-[9px] text-muted-foreground uppercase">{l.cliente?.nome || 'Sem Cliente'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {l.processo ? (
                      <Link href={`/processos/${l.processo.id}`} className="flex flex-col hover:text-primary smooth-transition">
                        <div className="text-[10px] font-bold">PRC-{l.processo.id.substring(0,8).toUpperCase()}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">{l.processo.tipo_regularizacao}</div>
                      </Link>
                    ) : (
                      <span className="text-[9px] text-muted-foreground uppercase">LANÇAMENTO AVULSO</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-bold text-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(l.valor)}
                      </div>
                      {l.valor_pago > 0 && (
                        <div className="text-[9px] text-emerald-500 uppercase font-bold tracking-widest">
                          PAGO: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(l.valor_pago)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {l.data_vencimento ? new Date(l.data_vencimento).toLocaleDateString('pt-BR') : '--'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${getStatusStyle(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(l)}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-blue-500 smooth-transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(l)}
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

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-2xl rounded-sm shadow-2xl my-8">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 sticky top-0">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> {selectedLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-sm smooth-transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vincular a Processo (Opcional)</label>
                  <select 
                    name="processoId" 
                    defaultValue={selectedLancamento?.processoId || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="">Lançamento Avulso (Sem Processo)</option>
                    {processos.map(p => (
                      <option key={p.id} value={p.id}>PRC-{p.id.substring(0,6).toUpperCase()} - {p.cliente.nome} ({p.tipo_regularizacao})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Descrição do Lançamento *</label>
                  <input 
                    name="descricao"
                    defaultValue={selectedLancamento?.descricao || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="Ex: Honorários 1ª Parcela - Habite-se"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Valor Total (R$) *</label>
                  <input 
                    name="valor"
                    type="number"
                    step="0.01"
                    defaultValue={selectedLancamento?.valor || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Valor Pago (R$)</label>
                  <input 
                    name="valor_pago"
                    type="number"
                    step="0.01"
                    defaultValue={selectedLancamento?.valor_pago || 0}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data de Vencimento</label>
                  <input 
                    name="data_vencimento"
                    type="date"
                    defaultValue={selectedLancamento?.data_vencimento ? selectedLancamento.data_vencimento.split('T')[0] : ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data de Pagamento</label>
                  <input 
                    name="data_pagamento"
                    type="date"
                    defaultValue={selectedLancamento?.data_pagamento ? selectedLancamento.data_pagamento.split('T')[0] : ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status *</label>
                  <select 
                    name="status" 
                    defaultValue={selectedLancamento?.status || 'pendente'}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    required
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Forma de Pagamento</label>
                  <select 
                    name="forma_pagamento" 
                    defaultValue={selectedLancamento?.forma_pagamento || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="">Não informada</option>
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="transferencia">Transferência Bancária</option>
                    <option value="cartao">Cartão de Crédito/Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'SALVANDO...' : <><Save className="w-3.5 h-3.5" /> SALVAR LANÇAMENTO</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {isDeleteModalOpen && selectedLancamento && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Excluir Lançamento?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                VOCÊ ESTÁ PRESTES A EXCLUIR O REGISTRO <span className="text-foreground font-bold">{selectedLancamento.descricao}</span>.<br />
                ESTA AÇÃO É IRREVERSÍVEL.
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
