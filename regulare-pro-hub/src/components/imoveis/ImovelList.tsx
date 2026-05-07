'use client'

import { useState, useMemo } from 'react'
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
  Check,
  Maximize2,
  Layers,
  User,
  ArrowRight,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Imovel {
  id: string
  clienteId: string
  cliente: { nome: string; cpf_cnpj: string }
  endereco: string
  numero: string | null
  tipo: string | null
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
  return <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{children}</label>
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="input-field"
    />
  )
}

function TextArea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none bg-white"
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
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const router = useRouter()

  const filteredImoveis = useMemo(() => imoveis.filter(i => 
    i.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.num_matricula?.includes(searchTerm) ||
    i.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [imoveis, searchTerm])

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

  const getRegularizationStatus = (im: Imovel) => {
    if (!im.processos || im.processos.length === 0) return { label: 'Pendente', badge: 'badge-slate' }
    const isDone = im.processos.some(p => p.status === 'finalizado' || p.status === 'aprovado')
    if (isDone) return { label: 'Regularizado', badge: 'badge-green' }
    return { label: 'Em Trâmite', badge: 'badge-blue' }
  }

  return (
    <div className="space-y-6">
      
      {/* ── Actions Row ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
          <input 
            type="text"
            placeholder="Buscar por endereço, matrícula ou proprietário..."
            className="input-field pl-10 py-2.5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={openCreateModal}
            className="btn-primary flex-1 md:flex-none justify-center"
          >
            <Plus className="w-4 h-4" strokeWidth={3} /> Novo Imóvel
          </button>
        </div>
      </div>

      {/* ── Grid View (SaaS Modern) ── */}
      {filteredImoveis.length === 0 ? (
        <div className="card p-20 text-center">
          <Building2 size={48} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
          <p className="text-slate-400 font-medium">Nenhum imóvel encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
          {filteredImoveis.map((i) => {
            const status = getRegularizationStatus(i)
            return (
              <div key={i.id} className="card flex flex-col group overflow-hidden">
                {/* Image Placeholder / Icon Header */}
                <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-200 relative group-hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-200">
                    <Home size={24} strokeWidth={1.5} />
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button onClick={() => openEditModal(i)} className="p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(i.id)} className="p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className={`badge ${status.badge} backdrop-blur-md`}>{status.label}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{i.endereco}</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} /> {i.cidade || '—'} / {i.estado || '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Área Terreno</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                        <Maximize2 size={12} className="text-slate-300" />
                        {i.area_terreno ? `${i.area_terreno} m²` : '—'}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Área Const.</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                        <Building2 size={12} className="text-slate-300" />
                        {i.area_construida ? `${i.area_construida} m²` : '—'}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo de Uso</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                        <Layers size={12} className="text-slate-300" />
                        {i.tipo || 'Residencial'}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Matrícula</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                        <FileText size={12} className="text-slate-300" />
                        {i.num_matricula || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100">
                         {i.cliente?.nome?.charAt(0) || 'P'}
                       </div>
                       <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">{i.cliente?.nome}</span>
                    </div>
                    <button className="text-slate-300 group-hover:text-blue-500 transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL (CREATE / EDIT) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl my-auto animate-fade-up overflow-hidden border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">{modalMode === 'create' ? 'Novo Imóvel' : 'Editar Imóvel'}</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Cadastre as informações técnicas para regularização</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label>Proprietário / Cliente *</Label>
                  <select 
                    name="clienteId"
                    defaultValue={selectedImovel?.clienteId || ''}
                    className="select-field w-full"
                    required
                  >
                    <option value="">Selecione o proprietário...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Endereço Completo *</Label>
                  <Input name="endereco" defaultValue={selectedImovel?.endereco || ''} placeholder="Ex: Av. Brasil, 1234" required />
                </div>

                <div>
                  <Label>Bairro</Label>
                  <Input name="bairro" defaultValue={selectedImovel?.bairro || ''} />
                </div>

                <div>
                   <Label>Tipo de Uso</Label>
                   <select name="tipo" defaultValue={selectedImovel?.tipo || 'Residencial'} className="select-field w-full">
                      <option value="Residencial">Residencial</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Rural">Rural</option>
                   </select>
                </div>

                <div>
                  <Label>Cidade</Label>
                  <Input name="cidade" defaultValue={selectedImovel?.cidade || ''} />
                </div>
                <div>
                   <Label>UF</Label>
                   <Input name="estado" defaultValue={selectedImovel?.estado || ''} maxLength={2} className="uppercase text-center" />
                </div>

                <div>
                  <Label>Área Terreno (m²)</Label>
                  <Input type="number" step="0.01" name="area_terreno" defaultValue={selectedImovel?.area_terreno || ''} />
                </div>
                <div>
                  <Label>Área Constr. (m²)</Label>
                  <Input type="number" step="0.01" name="area_construida" defaultValue={selectedImovel?.area_construida || ''} />
                </div>

                <div>
                  <Label>Nº Matrícula</Label>
                  <Input name="num_matricula" defaultValue={selectedImovel?.num_matricula || ''} />
                </div>
                <div>
                  <Label>Inscrição Imobiliária</Label>
                  <Input name="inscricao_imobiliaria" defaultValue={selectedImovel?.inscricao_imobiliaria || ''} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Cancelar</button>
                <button type="submit" disabled={isLoading} className="btn-primary min-w-[140px] justify-center">
                  {isLoading ? 'Salvando...' : modalMode === 'create' ? 'Cadastrar' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
