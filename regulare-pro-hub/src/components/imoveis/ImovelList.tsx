'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, PlusCircle, MapPin, Maximize2, X, ChevronRight, 
  MapIcon, FileText, ArrowUpRight, Trash2, LayoutGrid, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import LocationPicker from './LocationPicker'
import GoogleMapEmbed from './GoogleMapEmbed'
import ImoveisGlobalMap from './ImoveisGlobalMap'
import { DeleteConfirmModal } from '../DeleteConfirmModal'

interface Imovel {
  id: string
  clienteId: string
  cliente: { id: string; nome: string; cpf_cnpj: string }
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
  latitude: number | null
  longitude: number | null
  processos: any[]
}

interface ImovelListProps {
  initialImoveis: Imovel[]
  clientes: { id: string; nome: string; endereco: string | null; bairro: string | null; cidade: string | null; estado: string | null; cep: string | null }[]
}

export default function ImovelList({ initialImoveis, clientes }: ImovelListProps) {
  const [imoveis, setImoveis] = useState(initialImoveis)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('list')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // States for reactive form fields
  const [formAddress, setFormAddress] = useState({
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  })
  const [coords, setCoords] = useState<{lat: number | null, lng: number | null}>({ lat: null, lng: null })
  const [isSearchingCep, setIsSearchingCep] = useState(false)

  const router = useRouter()

  const filteredImoveis = imoveis.filter(i => 
    i.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.num_matricula?.includes(searchTerm) ||
    i.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openDrawer = (imovel: Imovel) => {
    setSelectedImovel(imovel)
    setDrawerOpen(true)
  }

  const handleCEPBlur = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, '')
    if (cleaned.length !== 8) return
    
    setIsSearchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setFormAddress({
          cep: data.cep,
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        })
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e)
    } finally {
      setIsSearchingCep(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedImovel) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/imoveis/${selectedImovel.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDrawerOpen(false)
        setShowDeleteModal(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao excluir imóvel:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    const payload = {
      ...data,
      latitude: coords.lat,
      longitude: coords.lng
    }

    try {
      const url = modalMode === 'create' ? '/api/imoveis' : `/api/imoveis/${selectedImovel?.id}`
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
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const initModal = (imovel: Imovel | null) => {
    if (imovel) {
      setModalMode('edit')
      setSelectedImovel(imovel)
      setFormAddress({
        endereco: imovel.endereco || '',
        bairro: imovel.bairro || '',
        cidade: imovel.cidade || '',
        estado: imovel.estado || '',
        cep: imovel.cep || ''
      })
      setCoords({ lat: imovel.latitude, lng: imovel.longitude })
    } else {
      setModalMode('create')
      setSelectedImovel(null)
      setFormAddress({ endereco: '', bairro: '', cidade: '', estado: '', cep: '' })
      setCoords({ lat: null, lng: null })
    }
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* ── TOOLBAR ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 flex-1 w-full max-w-4xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por matrícula, endereço ou proprietário..."
              className="w-full bg-white border border-slate-200 pl-12 pr-6 py-4 rounded-[20px] text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-[20px] shrink-0 shadow-inner">
             <button onClick={() => setViewMode('list')} className={`px-6 py-2.5 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-lg ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>Lista</button>
             <button onClick={() => setViewMode('grid')} className={`px-6 py-2.5 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-lg ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>Grelha</button>
             <button onClick={() => setViewMode('map')} className={`px-6 py-2.5 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-primary shadow-lg ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>Mapa</button>
          </div>
        </div>
        <button 
          onClick={() => initModal(null)}
          className="btn-premium px-8"
        >
          <PlusCircle size={18} /> NOVO IMÓVEL
        </button>
      </div>

      {/* ── CONTENT AREA ── */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proprietário</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Processos</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cadastro</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredImoveis.map(i => (
                <tr key={i.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <MapPin size={14} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">{i.endereco}, {i.numero || 'S/N'}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase">{i.bairro}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">{i.cliente.nome}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{i.cliente.cpf_cnpj}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 uppercase">{i.cidade}/{i.estado}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-tighter ${i.processos.length > 0 ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                      {i.processos.length} VINCULADOS
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500">{(i as any).createdAt ? new Date((i as any).createdAt).toLocaleDateString('pt-BR') : '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Link href={`/imoveis/${i.id}`} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 rounded-xl transition-all shadow-sm">
                          <ArrowUpRight size={14} />
                       </Link>
                       <button onClick={() => initModal(i)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all shadow-sm">
                          <LayoutGrid size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredImoveis.length === 0 && (
            <div className="py-20 text-center">
               <AlertCircle size={32} className="text-slate-200 mx-auto mb-4" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum imóvel localizado</p>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredImoveis.map((i, idx) => (
            <motion.div 
              key={i.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-[32px] p-2 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col cursor-pointer overflow-hidden"
              onClick={() => openDrawer(i)}
            >
              <div className="relative h-48 rounded-[24px] overflow-hidden bg-slate-100 mb-6 group-hover:shadow-lg transition-all">
                 <GoogleMapEmbed 
                    address={`${i.endereco}, ${i.bairro}, ${i.cidade} - ${i.estado}`}
                    latitude={i.latitude}
                    longitude={i.longitude}
                    zoom={14}
                    className="w-full h-full"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                 <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="text-[10px] font-bold text-white bg-primary px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {i.zoneamento || 'RESIDENCIAL'}
                    </span>
                 </div>
                 <div className="absolute bottom-4 left-4 text-white pointer-events-none">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">MATRÍCULA</p>
                    <p className="text-sm font-bold font-mono">{i.num_matricula || 'N/A'}</p>
                 </div>
                 <div className="absolute bottom-4 right-4 text-white flex items-center gap-2 pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Maximize2 size={14} />
                    </div>
                 </div>
              </div>

              <div className="px-4 pb-6 space-y-4">
                 <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-1">{i.endereco}</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">{i.bairro} • {i.cidade}/{i.estado}</p>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ÁREA TERRENO</span>
                       <span className="text-sm font-bold text-slate-800">{i.area_terreno || '—'} m²</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROCESSOS</span>
                       <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${i.processos.length > 0 ? 'bg-primary' : 'bg-slate-300'}`} />
                          <span className="text-sm font-bold text-slate-800">{i.processos.length} ativos</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                      {i.cliente.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROPRIETÁRIO</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{i.cliente.nome}</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <ImoveisGlobalMap imoveis={filteredImoveis as any} />
      )}

      {/* ── LATERAL DRAWER ── */}
      <AnimatePresence>
        {drawerOpen && selectedImovel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-[110] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                       <MapIcon size={20} />
                    </div>
                    <div>
                       <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Ficha da Propriedade</h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedImovel.num_matricula || 'REGISTRO PENDENTE'}</p>
                    </div>
                 </div>
                 <button onClick={() => setDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-all">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                 <div className="relative h-64 bg-slate-100 rounded-[40px] overflow-hidden border-8 border-white shadow-xl group">
                    <GoogleMapEmbed 
                       address={`${selectedImovel.endereco}, ${selectedImovel.bairro}, ${selectedImovel.cidade} - ${selectedImovel.estado}`}
                       latitude={selectedImovel.latitude}
                       longitude={selectedImovel.longitude}
                       zoom={18}
                       mapType="h"
                       className="w-full h-full"
                    />
                    <div className="absolute top-4 left-4">
                       <button 
                          onClick={() => { setDrawerOpen(false); initModal(selectedImovel) }}
                          className="bg-primary text-white p-3 rounded-2xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                       >
                          <MapPin size={16} /> MARCAR LOCALIZAÇÃO
                       </button>
                    </div>
                    <div className="absolute top-4 right-4">
                       <a 
                          href={selectedImovel.latitude ? `https://www.google.com/maps/search/?api=1&query=${selectedImovel.latitude},${selectedImovel.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedImovel.endereco + ', ' + selectedImovel.cidade)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg text-primary hover:bg-white transition-all flex items-center justify-center"
                       >
                          <Maximize2 size={18} />
                       </a>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/80 backdrop-blur-xl rounded-[24px] border border-white/50 flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LOCALIZAÇÃO</p>
                          <p className="text-xs font-mono font-bold text-slate-800 truncate max-w-[200px]">{selectedImovel.endereco}</p>
                       </div>
                       <a 
                          href={selectedImovel.latitude ? `https://www.google.com/maps/search/?api=1&query=${selectedImovel.latitude},${selectedImovel.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedImovel.endereco + ', ' + selectedImovel.cidade)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-xl"
                       >
                          Google Maps
                       </a>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">PROPRIETÁRIO</p>
                          <p className="text-sm font-bold text-slate-800">{selectedImovel.cliente.nome}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{selectedImovel.cliente.cpf_cnpj}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">CARTÓRIO / RGI</p>
                          <p className="text-sm font-bold text-slate-800">{selectedImovel.cartorio || 'NÃO INFORMADO'}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">DADOS TÉCNICOS</p>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Terreno</p>
                             <p className="text-sm font-bold text-slate-800">{selectedImovel.area_terreno}m²</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Construído</p>
                             <p className="text-sm font-bold text-slate-800">{selectedImovel.area_construida}m²</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ZONA</p>
                             <p className="text-sm font-bold text-slate-800 truncate">{selectedImovel.zoneamento || 'R1'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">PROCESSOS VINCULADOS ({selectedImovel.processos.length})</p>
                       <div className="space-y-2">
                          {selectedImovel.processos.map((pr: any) => (
                             <Link key={pr.id} href={`/processos/${pr.id}`} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all group">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                      <FileText size={16} />
                                   </div>
                                   <p className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">{pr.tipo_regularizacao}</p>
                                </div>
                                <ChevronRight size={14} className="text-slate-300" />
                             </Link>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                 <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="p-4 bg-white border border-red-200 text-red-500 rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                  title="Excluir Imóvel"
                >
                   <Trash2 size={20} />
                </button>
                 <button 
                    onClick={() => { setDrawerOpen(false); initModal(selectedImovel) }}
                    className="flex-[2] py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                     EDITAR IMÓVEL
                  </button>
                  <Link href={`/imoveis/${selectedImovel.id}`} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                     VER FICHA COMPLETA <ArrowUpRight size={16} />
                  </Link>
               </div>
             </motion.div>
           </>
         )}
       </AnimatePresence>

       {/* ── MODAL (CREATE / EDIT) ── */}
       <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200"
             >
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                   <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest font-mono">{modalMode === 'create' ? 'Novo Imóvel' : 'Editar Imóvel'}</h2>
                   <p className="text-xs text-slate-500 font-medium tracking-tight">Preencha as informações técnicas da propriedade.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-all">
                   <X size={20} />
                 </button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                 <div className="space-y-4">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">PROPRIETÁRIO</p>
                   <select 
                     name="clienteId" defaultValue={selectedImovel?.clienteId || ''} required
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                   >
                     <option value="">Selecione um proprietário...</option>
                     {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                   </select>
                 </div>

                 <div className="space-y-4">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">LOCALIZAÇÃO</p>
                   <div className="grid grid-cols-2 gap-4">
                     <input 
                        name="cep" 
                        value={formAddress.cep}
                        onChange={(e) => setFormAddress({...formAddress, cep: e.target.value})}
                        onBlur={(e) => handleCEPBlur(e.target.value)}
                        placeholder="CEP" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                     />
                     <input 
                        name="estado" 
                        value={formAddress.estado}
                        onChange={(e) => setFormAddress({...formAddress, estado: e.target.value})}
                        placeholder="UF" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all uppercase" maxLength={2} 
                     />
                     <input 
                        name="endereco" 
                        value={formAddress.endereco}
                        onChange={(e) => setFormAddress({...formAddress, endereco: e.target.value})}
                        placeholder="Endereço" required 
                        className="col-span-2 w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                     />
                     <input 
                        name="bairro" 
                        value={formAddress.bairro}
                        onChange={(e) => setFormAddress({...formAddress, bairro: e.target.value})}
                        placeholder="Bairro" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                     />
                     <input 
                        name="cidade" 
                        value={formAddress.cidade}
                        onChange={(e) => setFormAddress({...formAddress, cidade: e.target.value})}
                        placeholder="Cidade" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                     />
                   </div>
                 </div>

                 <LocationPicker 
                   initialLat={coords.lat}
                   initialLng={coords.lng}
                   onChange={(lat, lng) => setCoords({ lat, lng })}
                 />

                 <div className="space-y-4">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">DADOS TÉCNICOS</p>
                   <div className="grid grid-cols-2 gap-4">
                     <input name="num_matricula" defaultValue={selectedImovel?.num_matricula || ''} placeholder="Nº Matrícula" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                     <input name="area_terreno" type="number" step="0.01" defaultValue={selectedImovel?.area_terreno || ''} placeholder="Área Terreno (m²)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                     <input name="area_construida" type="number" step="0.01" defaultValue={selectedImovel?.area_construida || ''} placeholder="Área Constr. (m²)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                     <input name="zoneamento" defaultValue={selectedImovel?.zoneamento || ''} placeholder="ZONA" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                   </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">Cancelar</button>
                   <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-800">
                     {isLoading ? 'SALVANDO...' : 'SALVAR IMÓVEL'}
                   </button>
                 </div>
               </form>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       <DeleteConfirmModal 
         isOpen={showDeleteModal}
         onClose={() => setShowDeleteModal(false)}
         onConfirm={handleDelete}
         title="Imóvel"
         loading={isDeleting}
         description={
           <p>Tem certeza que deseja excluir o imóvel em <strong>{selectedImovel?.endereco}</strong>? Esta ação não pode ser desfeita.</p>
         }
       />

    </div>
  )
}
