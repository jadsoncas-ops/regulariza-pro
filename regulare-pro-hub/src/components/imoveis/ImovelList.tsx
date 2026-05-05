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
  PlusCircle,
  Home,
  MapPin,
  FileText
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

export default function ImovelList({ initialImoveis, clientes }: ImovelListProps) {
  const [imoveis, setImoveis] = useState(initialImoveis)
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    endereco: '', bairro: '', cidade: '', estado: '', cep: ''
  })
  const [tempCli, setTempCli] = useState<any>(null)
  const [tempImoveis, setTempImoveis] = useState<Imovel[]>([])
  const router = useRouter()

  const filteredImoveis = imoveis.filter(i => 
    i.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.num_matricula?.includes(searchTerm) ||
    i.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (imovel: Imovel) => {
    setSelectedImovel(imovel)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (imovel: Imovel) => {
    setSelectedImovel(imovel)
    setIsDeleteModalOpen(true)
  }

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedImovel) return
    
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/imoveis/${selectedImovel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        const updated = await res.json()
        const clienteObj = clientes.find(c => c.id === updated.clienteId)
        setImoveis(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated, cliente: clienteObj || i.cliente } : i))
        setIsEditModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createImovel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/imoveis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        const created = await res.json()
        const clienteObj = clientes.find(c => c.id === created.clienteId)
        setImoveis(prev => [{ ...created, cliente: clienteObj, processos: [] }, ...prev])
        setIsCreateModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao criar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedImovel) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/imoveis/${selectedImovel.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setImoveis(prev => prev.filter(i => i.id !== selectedImovel.id))
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
      
      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/20 p-4 border border-border rounded-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="BUSCAR ENDEREÇO, MATRÍCULA OU CLIENTE..."
            className="w-full bg-background border border-border px-10 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 smooth-transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              setIsCreateModalOpen(true)
              setAutoFilled(false)
              setCreateFormData({ endereco: '', bairro: '', cidade: '', estado: '', cep: '' })
            }}
            className="flex-1 md:flex-none px-6 py-2.5 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-3.5 h-3.5" /> NOVO IMÓVEL
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-border bg-card shadow-md rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4">ENDEREÇO</th>
              <th className="px-6 py-4">PROPRIETÁRIO</th>
              <th className="px-6 py-4">DADOS TÉCNICOS</th>
              <th className="px-6 py-4 text-center">PROC.</th>
              <th className="px-6 py-4 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredImoveis.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic tracking-widest">
                  NENHUM IMÓVEL ENCONTRADO PARA "{searchTerm.toUpperCase()}"
                </td>
              </tr>
            ) : (
              filteredImoveis.map((i) => (
                <tr key={i.id} className="hover:bg-muted/10 smooth-transition group">
                  <td className="px-6 py-5 max-w-[300px]">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-sm text-foreground tracking-tight flex items-start gap-2">
                        <Home className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{i.endereco}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider ml-6">
                        {i.bairro} {i.bairro && i.cidade ? '-' : ''} {i.cidade}/{i.estado}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-xs">{i.cliente.nome}</span>
                      <span className="text-[9px] text-muted-foreground uppercase mt-1">DOC: {i.cliente.cpf_cnpj}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      {i.num_matricula ? (
                        <div className="text-[10px] font-bold bg-muted/50 w-fit px-1.5 py-0.5 rounded-sm border border-border">MAT: {i.num_matricula}</div>
                      ) : (
                        <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 w-fit px-1.5 py-0.5 rounded-sm border border-amber-500/20">SEM MATRÍCULA</div>
                      )}
                      <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
                        ÁREA: {i.area_terreno || '?'}m² | CONST: {i.area_construida || '?'}m²
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="bg-muted px-2 py-1 rounded-sm font-bold text-foreground">
                      {i.processos.length.toString().padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/imoveis/${i.id}`}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground smooth-transition"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleEdit(i)}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-blue-500 smooth-transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(i)}
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-3xl rounded-sm shadow-2xl my-8">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 sticky top-0">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest">Novo Imóvel</h2>
                <p className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">Cadastro no banco de dados</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-muted rounded-sm smooth-transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={createImovel} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cliente Proprietário *</label>
                  <select 
                    name="clienteId"
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    required
                    onChange={(e) => {
                      const cliId = e.target.value
                      const cli = clientes.find(c => c.id === cliId)
                      const existing = imoveis.filter(i => i.clienteId === cliId)
                      
                      setCreateFormData({ endereco: '', bairro: '', cidade: '', estado: '', cep: '' })
                      setAutoFilled(false)
                      setTempCli(cli || null)
                      setTempImoveis(existing)
                    }}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                {/* SELETOR DE ENDEREÇOS EXISTENTES */}
                {tempCli && (
                  <div className="md:col-span-2 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Endereços vinculados encontrados:</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setTempCli(null);
                          setTempImoveis([]);
                          setCreateFormData({ endereco: '', bairro: '', cidade: '', estado: '', cep: '' });
                          setAutoFilled(false);
                        }}
                        className="text-[8px] font-bold text-muted-foreground hover:text-foreground uppercase underline"
                      >
                        Limpar seleção
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {/* Opção 1: Endereço do Cadastro do Cliente */}
                      <button
                        type="button"
                        onClick={() => {
                          const endParts = (tempCli.endereco || '').split(',').map((s: string) => s.trim())
                          setCreateFormData({
                            endereco: (endParts.slice(0, 2).join(', ') || tempCli.endereco || '').toUpperCase(),
                            bairro: (tempCli.bairro || endParts[2] || '').toUpperCase(),
                            cidade: (tempCli.cidade || '').toUpperCase(),
                            estado: (tempCli.estado || '').toUpperCase(),
                            cep: (tempCli.cep || '').toUpperCase()
                          })
                          setAutoFilled(true)
                        }}
                        className="flex items-center gap-3 p-3 border border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5 rounded-sm transition-all text-left group"
                      >
                        <div className="p-2 bg-background border border-border rounded-sm group-hover:border-primary/30">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-tight">Endereço Principal (Cadastro)</div>
                          <div className="text-[9px] text-muted-foreground uppercase">{tempCli.endereco || 'SEM ENDEREÇO NO CADASTRO'}</div>
                        </div>
                      </button>

                      {/* Outras opções: Imóveis já cadastrados */}
                      {tempImoveis.map((imovel) => (
                        <button
                          key={imovel.id}
                          type="button"
                          onClick={() => {
                            setCreateFormData({
                              endereco: (imovel.endereco || '').toUpperCase(),
                              bairro: (imovel.bairro || '').toUpperCase(),
                              cidade: (imovel.cidade || '').toUpperCase(),
                              estado: (imovel.estado || '').toUpperCase(),
                              cep: (imovel.cep || '').toUpperCase()
                            })
                            setAutoFilled(true)
                          }}
                          className="flex items-center gap-3 p-3 border border-border bg-muted/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-sm transition-all text-left group"
                        >
                          <div className="p-2 bg-background border border-border rounded-sm group-hover:border-emerald-500/30">
                            <Home className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-tight">Imóvel/Lote já cadastrado</div>
                            <div className="text-[9px] text-muted-foreground uppercase">{imovel.endereco} • {imovel.bairro}</div>
                          </div>
                        </button>
                      ))}

                      {/* Opção Nova: Digitar do Zero */}
                      <button
                        type="button"
                        onClick={() => {
                          setCreateFormData({ endereco: '', bairro: '', cidade: '', estado: '', cep: '' });
                          setAutoFilled(false);
                          document.getElementsByName('endereco')[0]?.focus();
                        }}
                        className="flex items-center gap-3 p-3 border border-dashed border-border hover:border-foreground/30 hover:bg-muted/50 rounded-sm transition-all text-left group"
                      >
                        <div className="p-2 bg-background border border-border rounded-sm group-hover:border-foreground/30">
                          <PlusCircle className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-tight italic">Cadastrar Novo Endereço</div>
                          <div className="text-[9px] text-muted-foreground uppercase">Inserir dados manualmente abaixo</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 md:col-span-2 pt-4 border-t border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Localização</h3>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Endereço Principal *</label>
                  <input 
                    name="endereco"
                    value={createFormData.endereco}
                    onChange={e => setCreateFormData(p => ({ ...p, endereco: e.target.value.toUpperCase() }))}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase"
                    placeholder="RUA, NÚMERO, COMPLEMENTO"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bairro</label>
                  <input 
                    name="bairro"
                    value={createFormData.bairro}
                    onChange={e => setCreateFormData(p => ({ ...p, bairro: e.target.value.toUpperCase() }))}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cidade / UF</label>
                  <div className="flex gap-2">
                    <input 
                      name="cidade"
                      value={createFormData.cidade}
                      onChange={e => setCreateFormData(p => ({ ...p, cidade: e.target.value.toUpperCase() }))}
                      className="flex-1 bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase"
                      placeholder="CIDADE"
                    />
                    <select
                      name="estado"
                      value={createFormData.estado}
                      onChange={e => setCreateFormData(p => ({ ...p, estado: e.target.value.toUpperCase() }))}
                      className="w-20 bg-background border border-border px-2 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase"
                    >
                      <option value="">UF</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CEP</label>
                  <input 
                    name="cep"
                    value={createFormData.cep}
                    onChange={e => setCreateFormData(p => ({ ...p, cep: e.target.value.toUpperCase() }))}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 uppercase"
                    placeholder="00000-000"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 pt-4 border-t border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Dados Técnicos</h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Área do Terreno (m²)</label>
                  <input 
                    name="area_terreno"
                    type="number"
                    step="0.01"
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Área Construída (m²)</label>
                  <input 
                    name="area_construida"
                    type="number"
                    step="0.01"
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Número da Matrícula</label>
                  <input 
                    name="num_matricula"
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cartório / RGI</label>
                  <input 
                    name="cartorio"
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Inscrição Imobiliária / IPTU</label>
                  <input 
                    name="inscricao_imobiliaria"
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zoneamento Urbano</label>
                  <input 
                    name="zoneamento"
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="Ex: ZRM, ZEU, etc"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Observações Técnicas</label>
                  <textarea 
                    name="observacoes"
                    rows={3}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-card py-4">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'SALVANDO...' : <><Save className="w-3.5 h-3.5" /> CADASTRAR IMÓVEL</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL - Similiar to create, but pre-filled */}
      {isEditModalOpen && selectedImovel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-3xl rounded-sm shadow-2xl my-8">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 sticky top-0">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest">Editar Imóvel</h2>
                <p className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">ID: {selectedImovel.id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-muted rounded-sm smooth-transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveEdit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cliente Proprietário *</label>
                  <select 
                    name="clienteId"
                    defaultValue={selectedImovel.clienteId}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    required
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 pt-4 border-t border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Localização</h3>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Endereço Principal *</label>
                  <input 
                    name="endereco"
                    defaultValue={selectedImovel.endereco}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bairro</label>
                  <input 
                    name="bairro"
                    defaultValue={selectedImovel.bairro || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cidade / UF</label>
                  <div className="flex gap-2">
                    <input 
                      name="cidade"
                      defaultValue={selectedImovel.cidade || ''}
                      className="flex-1 bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <input 
                      name="estado"
                      defaultValue={selectedImovel.estado || ''}
                      className="w-16 bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 text-center uppercase"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 pt-4 border-t border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Dados Técnicos</h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Área do Terreno (m²)</label>
                  <input 
                    name="area_terreno"
                    type="number"
                    step="0.01"
                    defaultValue={selectedImovel.area_terreno || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Área Construída (m²)</label>
                  <input 
                    name="area_construida"
                    type="number"
                    step="0.01"
                    defaultValue={selectedImovel.area_construida || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Número da Matrícula</label>
                  <input 
                    name="num_matricula"
                    defaultValue={selectedImovel.num_matricula || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cartório / RGI</label>
                  <input 
                    name="cartorio"
                    defaultValue={selectedImovel.cartorio || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Inscrição Imobiliária / IPTU</label>
                  <input 
                    name="inscricao_imobiliaria"
                    defaultValue={selectedImovel.inscricao_imobiliaria || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zoneamento Urbano</label>
                  <input 
                    name="zoneamento"
                    defaultValue={selectedImovel.zoneamento || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Observações Técnicas</label>
                  <textarea 
                    name="observacoes"
                    rows={3}
                    defaultValue={selectedImovel.observacoes || ''}
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-card py-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'SALVANDO...' : <><Save className="w-3.5 h-3.5" /> SALVAR ALTERAÇÕES</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {isDeleteModalOpen && selectedImovel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Excluir Imóvel?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                VOCÊ ESTÁ PRESTES A EXCLUIR O IMÓVEL EM <span className="text-foreground font-bold">{selectedImovel.endereco.toUpperCase()}</span>.<br />
                ESTA AÇÃO É IRREVERSÍVEL E TODOS OS PROCESSOS VINCULADOS SERÃO DESVINCULADOS.
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
