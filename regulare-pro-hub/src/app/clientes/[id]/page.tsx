'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  DollarSign,
  Briefcase,
  Edit,
  X,
  Check,
  Loader2
} from 'lucide-react'

// UI Components
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>
}

export default function ClienteDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSearchingCep, setIsSearchingCep] = useState(false)

  // Estado do Formulário
  const [formData, setFormData] = useState<any>({})

  const fetchCliente = () => {
    setLoading(true)
    fetch(`/api/clientes/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setCliente(d)
        setFormData({
          nome: d.nome,
          cpf_cnpj: d.cpf_cnpj,
          telefone: d.telefone || '',
          email: d.email || '',
          endereco: d.endereco || '',
          bairro: d.bairro || '',
          cidade: d.cidade || '',
          estado: d.estado || '',
          cep: d.cep || '',
          observacoes: d.observacoes || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchCliente()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    setFormData((prev: any) => ({ ...prev, cep: e.target.value }))

    if (cep.length === 8) {
      setIsSearchingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setFormData((prev: any) => ({
            ...prev,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      } finally {
        setIsSearchingCep(false)
      }
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/clientes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsEditModalOpen(false)
        fetchCliente()
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading && !cliente) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-sm text-slate-400 animate-pulse font-medium">Carregando dados do cliente...</div>
      </div>
    )
  }

  if (!cliente) return <div className="p-8">Cliente não encontrado.</div>

  // Cálculos financeiros
  let totalFaturado = 0
  let totalRecebido = 0
  cliente.processos?.forEach((p: any) => {
    p.financeiro?.forEach((f: any) => {
      totalFaturado += f.valor
      totalRecebido += f.valor_pago
    })
  })
  const receitaPendente = totalFaturado - totalRecebido

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center gap-4 mb-4 max-w-screen-xl mx-auto">
          <Link href="/clientes" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/clientes" className="hover:text-blue-600">Clientes</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600">{cliente.nome}</span>
          </div>
        </div>

        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">
              {cliente.nome.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{cliente.nome}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`badge ${cliente.cpf_cnpj.length > 14 ? 'badge-blue' : 'badge-gray'} capitalize text-[10px]`}>
                  {cliente.cpf_cnpj.length > 14 ? 'Pessoa Jurídica' : 'Pessoa Física'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Doc: {cliente.cpf_cnpj}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <Link 
              href={`/processos/novo?clienteId=${cliente.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Novo Processo
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <User className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">Informações de Contato</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone</p>
                  <p className="text-sm font-medium text-slate-800">{cliente.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-medium text-slate-800 truncate">{cliente.email || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Endereço Residencial</p>
                  <p className="text-sm font-medium text-slate-800">{cliente.endereco || 'Não informado'}</p>
                  <p className="text-xs text-slate-400 mt-1">{cliente.bairro} {cliente.cidade ? `• ${cliente.cidade}/${cliente.estado}` : ''}</p>
                </div>
                {cliente.observacoes && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Observações Internas</p>
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-4">
                      "{cliente.observacoes}"
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -translate-y-16 translate-x-16"></div>
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Visão Financeira</span>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Total em Contratos</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalFaturado)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Recebido</p>
                    <p className="text-base font-bold text-emerald-400">{formatCurrency(totalRecebido)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Pendente</p>
                    <p className="text-base font-bold text-amber-400">{formatCurrency(receitaPendente)}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Processos Vinculados</h2>
                    <p className="text-xs text-slate-500">Gestão de projetos ativos</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                  {cliente.processos?.length.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {cliente.processos?.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-sm">Nenhum processo registrado.</div>
                ) : (
                  cliente.processos?.map((p: any) => (
                    <div key={p.id} className="p-6 hover:bg-slate-50 transition-colors group">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Link href={`/processos/${p.id}`} className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                              {p.tipo_regularizacao}
                            </Link>
                            <span className={`badge ${p.status === 'finalizado' ? 'badge-green' : 'badge-blue'} capitalize text-[10px]`}>
                              {p.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5" /> 
                              {new Date(p.data_inicio).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <Link href={`/processos/${p.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[hsl(var(--border))] w-full max-w-2xl rounded-2xl shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Editar Cadastro do Cliente</h2>
                <p className="text-xs text-slate-500 mt-0.5">Atualize as informações de contato e endereço</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Nome Completo / Razão Social *</Label>
                  <input name="nome" value={formData.nome} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <Label>CPF / CNPJ *</Label>
                  <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <input name="telefone" value={formData.telefone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="md:col-span-2">
                  <Label>Email</Label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Endereço Residencial</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>CEP</Label>
                    <div className="relative">
                      <input name="cep" value={formData.cep} onChange={handleCepChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                      {isSearchingCep && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin absolute right-3 top-2.5" />}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Logradouro / Endereço</Label>
                    <input name="endereco" value={formData.endereco} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <input name="bairro" value={formData.bairro} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <input name="cidade" value={formData.cidade} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <Label>UF</Label>
                    <input name="estado" value={formData.estado} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
              </div>

              <div>
                <Label>Observações do Cliente</Label>
                <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" disabled={isUpdating} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                  {isUpdating ? 'Salvando...' : <><Check className="w-4 h-4" /> Salvar Alterações</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
