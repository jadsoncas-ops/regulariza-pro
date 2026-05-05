'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Trash2, 
  X, 
  PlusCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Edit,
  ArrowUpRight,
  TrendingDown,
  Check
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

// UI Components
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    />
  )
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    >
      {children}
    </select>
  )
}

export default function FinanceiroList({ initialLancamentos, processos }: FinanceiroListProps) {
  const [lancamentos, setLancamentos] = useState(initialLancamentos)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
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

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedLancamento(null)
    setIsModalOpen(true)
  }

  const openEditModal = (lancamento: Financeiro) => {
    setModalMode('edit')
    setSelectedLancamento(lancamento)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
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
      const url = modalMode === 'create' ? `/api/financeiro` : `/api/financeiro/${selectedLancamento?.id}`
      const method = modalMode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsModalOpen(false)
        router.refresh()
        setTimeout(() => window.location.reload(), 300)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este lançamento?')) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/financeiro/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLancamentos(prev => prev.filter(l => l.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pago': return 'badge-green'
      case 'pendente': return 'badge-amber'
      case 'atrasado': return 'badge-red'
      default: return 'badge-gray'
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="space-y-8">
      
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[hsl(var(--border))] p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Bruto</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalReceita)}</div>
          <p className="text-xs text-slate-500 mt-1">Valor total de contratos</p>
        </div>

        <div className="bg-white border border-[hsl(var(--border))] p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Recebido</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPago)}</div>
          <p className="text-xs text-slate-500 mt-1">Valores liquidados</p>
        </div>

        <div className="bg-white border border-[hsl(var(--border))] p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pendente</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPendente)}</div>
          <p className="text-xs text-slate-500 mt-1">Saldos em aberto</p>
        </div>
      </div>

      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-[hsl(var(--border))] rounded-xl shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por descrição ou cliente..."
            className="w-full bg-slate-50 border border-[hsl(var(--border))] pl-10 pr-4 py-2 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={openCreateModal}
          className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-[hsl(var(--border))] bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição / Cliente</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vínculo</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valores</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vencimento</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {filteredLancamentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 italic">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : (
              filteredLancamentos.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800 line-clamp-1">{l.descricao}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{l.cliente?.nome || 'Lançamento Avulso'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {l.processo ? (
                      <Link href={`/processos/${l.processo.id}`} className="group/link">
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <span className="text-xs">#{l.processo.id.substring(0,6).toUpperCase()}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{l.processo.tipo_regularizacao}</p>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sem processo</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{formatCurrency(l.valor)}</span>
                      {l.valor_pago > 0 && (
                        <span className="text-[10px] text-emerald-600 font-medium">Pago: {formatCurrency(l.valor_pago)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-medium">
                        {l.data_vencimento ? new Date(l.data_vencimento).toLocaleDateString('pt-BR') : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge ${getStatusBadge(l.status)} capitalize`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openEditModal(l)}
                        className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(l.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
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

      {/* MODAL (CREATE / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[hsl(var(--border))] w-full max-w-lg rounded-xl shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{modalMode === 'create' ? 'Novo Lançamento' : 'Editar Lançamento'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Gestão de entradas e saídas financeiras</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <Label>Vincular a Processo (Opcional)</Label>
                <Select name="processoId" defaultValue={selectedLancamento?.processoId || ''}>
                  <option value="">Lançamento Avulso</option>
                  {processos.map(p => (
                    <option key={p.id} value={p.id}>#{p.id.substring(0,6).toUpperCase()} - {p.cliente.nome} ({p.tipo_regularizacao})</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Descrição *</Label>
                <Input name="descricao" defaultValue={selectedLancamento?.descricao || ''} placeholder="Ex: Honorários 1ª Parcela" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total (R$) *</Label>
                  <Input name="valor" type="number" step="0.01" defaultValue={selectedLancamento?.valor || ''} required />
                </div>
                <div>
                  <Label>Valor Pago (R$)</Label>
                  <Input name="valor_pago" type="number" step="0.01" defaultValue={selectedLancamento?.valor_pago || 0} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data Vencimento</Label>
                  <Input name="data_vencimento" type="date" defaultValue={selectedLancamento?.data_vencimento ? selectedLancamento.data_vencimento.split('T')[0] : ''} />
                </div>
                <div>
                  <Label>Data Pagamento</Label>
                  <Input name="data_pagamento" type="date" defaultValue={selectedLancamento?.data_pagamento ? selectedLancamento.data_pagamento.split('T')[0] : ''} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status *</Label>
                  <Select name="status" defaultValue={selectedLancamento?.status || 'pendente'} required>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="cancelado">Cancelado</option>
                  </Select>
                </div>
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select name="forma_pagamento" defaultValue={selectedLancamento?.forma_pagamento || ''}>
                    <option value="">Não informada</option>
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="transferencia">Transferência</option>
                    <option value="cartao">Cartão</option>
                    <option value="dinheiro">Dinheiro</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : <><Check className="w-4 h-4" /> {modalMode === 'create' ? 'Salvar Lançamento' : 'Salvar Alterações'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
