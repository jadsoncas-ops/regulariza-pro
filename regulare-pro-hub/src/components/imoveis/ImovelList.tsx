'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  PlusCircle,
  Home,
  MapPin,
  FileText,
  Building2,
  Check
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Imovel {
  id: string
  clienteId: string
  cliente: { nome: string; cpf_cnpj: string }
  endereco: string
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  area_terreno: number | null
  area_construida: number | null
  num_matricula: string | null
  cartorio: string | null
  inscricao_imobiliaria: string | null
  zoneamento: string | null
  observacoes: string | null
  processos: any[]
}

interface ImovelListProps {
  initialImoveis: Imovel[]
  clientes: { id: string; nome: string; endereco: string | null; bairro: string | null; cidade: string | null; estado: string | null; cep: string | null }[]
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

function TextArea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-white"
    />
  )
}

export default function ImovelList({ initialImoveis, clientes }: ImovelListProps) {
  const [imoveis, setImoveis] = useState(initialImoveis)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredImoveis = imoveis.filter(i => 
    i.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.num_matricula?.includes(searchTerm) ||
    i.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedImovel(null)
    setIsModalOpen(true)
  }

  const openEditModal = (imovel: Imovel) => {
    setModalMode('edit')
    setSelectedImovel(imovel)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const url = modalMode === 'create' ? '/api/imoveis' : `/api/imoveis/${selectedImovel?.id}`
      const method = modalMode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setIsModalOpen(false)
        router.refresh()
        // Force update local state or just let refresh do its job
        setTimeout(() => window.location.reload(), 300)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este imóvel?')) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/imoveis/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setImoveis(prev => prev.filter(i => i.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-[hsl(var(--border))] rounded-xl shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por endereço, matrícula ou proprietário..."
            className="w-full bg-slate-50 border border-[hsl(var(--border))] pl-10 pr-4 py-2 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={openCreateModal}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Novo Imóvel
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-[hsl(var(--border))] bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Imóvel / Localização</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Proprietário</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dados Técnicos</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Processos</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {filteredImoveis.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic">
                  Nenhum imóvel encontrado.
                </td>
              </tr>
            ) : (
              filteredImoveis.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 line-clamp-1">{i.endereco}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{i.bairro} • {i.cidade}/{i.estado}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{i.cliente.nome}</span>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5">{i.cliente.cpf_cnpj}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {i.num_matricula ? (
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600">Mat: {i.num_matricula}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 font-medium uppercase">Sem Matrícula</span>
                      )}
                      <p className="text-[11px] text-slate-500">
                        {i.area_terreno || '?'}m² total | {i.area_construida || '?'}m² const.
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i.processos.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                      {i.processos.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => openEditModal(i)}
                        className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(i.id)}
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
          <div className="bg-white border border-[hsl(var(--border))] w-full max-w-2xl rounded-xl shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{modalMode === 'create' ? 'Novo Imóvel' : 'Editar Imóvel'}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Preencha as informações técnicas da propriedade</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SEÇÃO: PROPRIETÁRIO */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <Label>Cliente Proprietário *</Label>
                <select 
                  name="clienteId"
                  defaultValue={selectedImovel?.clienteId || ''}
                  className="w-full bg-white border border-[hsl(var(--border))] px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* SEÇÃO: LOCALIZAÇÃO */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Localização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Endereço Completo *</Label>
                    <Input name="endereco" defaultValue={selectedImovel?.endereco || ''} placeholder="Ex: Av. Brasil, 1234, Centro" required />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input name="bairro" defaultValue={selectedImovel?.bairro || ''} />
                  </div>
                  <div>
                    <Label>Cidade / UF</Label>
                    <div className="flex gap-2">
                      <Input name="cidade" defaultValue={selectedImovel?.cidade || ''} placeholder="Cidade" />
                      <Input name="estado" defaultValue={selectedImovel?.estado || ''} className="w-16 uppercase text-center" maxLength={2} placeholder="UF" />
                    </div>
                  </div>
                  <div>
                    <Label>CEP</Label>
                    <Input name="cep" defaultValue={selectedImovel?.cep || ''} placeholder="00000-000" />
                  </div>
                </div>
              </div>

              {/* SEÇÃO: DADOS TÉCNICOS */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Dados Técnicos & Registro
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label>Nº Matrícula</Label>
                    <Input name="num_matricula" defaultValue={selectedImovel?.num_matricula || ''} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Cartório / RGI</Label>
                    <Input name="cartorio" defaultValue={selectedImovel?.cartorio || ''} />
                  </div>
                  <div>
                    <Label>Área Terreno (m²)</Label>
                    <Input type="number" step="0.01" name="area_terreno" defaultValue={selectedImovel?.area_terreno || ''} />
                  </div>
                  <div>
                    <Label>Área Constr. (m²)</Label>
                    <Input type="number" step="0.01" name="area_construida" defaultValue={selectedImovel?.area_construida || ''} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Inscrição Imobiliária</Label>
                    <Input name="inscricao_imobiliaria" defaultValue={selectedImovel?.inscricao_imobiliaria || ''} />
                  </div>
                </div>
              </div>

              <div>
                <Label>Observações Técnicas</Label>
                <TextArea name="observacoes" defaultValue={selectedImovel?.observacoes || ''} rows={3} placeholder="Notas sobre zoneamento, restrições, etc..." />
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
                  {isLoading ? 'Salvando...' : <><Check className="w-4 h-4" /> {modalMode === 'create' ? 'Cadastrar Imóvel' : 'Salvar Alterações'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
