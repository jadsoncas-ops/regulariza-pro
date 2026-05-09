'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, Search, Users, Building2, Briefcase, Phone, Mail, 
  MapPin, ChevronRight, MoreHorizontal, Edit2, Filter, 
  X, LayoutGrid, List, User, Globe, Wallet, History,
  ArrowUpRight, Command, ChevronLeft, Trash2, SlidersHorizontal,
  FileText, TrendingUp, ExternalLink, Sparkles
} from 'lucide-react'
import { EditClienteModal } from '@/components/EditClienteModal'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { id: 'dados', label: 'Dados', icon: User },
  { id: 'imoveis', label: 'Imóveis', icon: Building2 },
  { id: 'processos', label: 'Processos', icon: Briefcase },
  { id: 'financeiro', label: 'Financeiro', icon: Wallet },
]

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState('dados')
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [clienteToEdit, setClienteToEdit] = useState<any>(null)

  const fetchData = () => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(d => { 
        const data = Array.isArray(d) ? d : []
        setClientes(data)
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => clientes.filter(c =>
    c.nome?.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf_cnpj?.includes(search)
  ), [clientes, search])

  const selectedCliente = useMemo(() => 
    clientes.find(c => c.id === selectedId) || null
  , [clientes, selectedId])

  const financialStats = useMemo(() => {
    if (!selectedCliente) return { totalContrato: 0, recebido: 0, pendenteReceber: 0, pendentePagar: 0 }
    const totalContrato = (selectedCliente.processos || []).reduce((acc: number, p: any) => acc + (p.valor_total || 0), 0)
    const recebido = (selectedCliente.financeiro || []).filter((f: any) => f.tipo === 'receita').reduce((acc: number, f: any) => acc + (f.valor_pago || 0), 0)
    const pendenteReceber = Math.max(0, totalContrato - recebido)
    const pendentePagar = (selectedCliente.financeiro || []).filter((f: any) => f.tipo === 'despesa' && f.status === 'pendente').reduce((acc: number, f: any) => acc + (f.valor - (f.valor_pago || 0)), 0)
    return { totalContrato, recebido, pendenteReceber, pendentePagar }
  }, [selectedCliente])

  const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="flex h-full overflow-hidden">
      
      {/* ── CENTRAL WORKSPACE ── */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
        
        {/* Workspace Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono">Clientes</h1>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-md text-[10px] font-black text-slate-400 uppercase">
              Total: {clientes.length}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrar clientes..."
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[11px] font-medium outline-none focus:ring-2 focus:ring-primary/10 w-48 transition-all"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* O usuário mencionou que não há necessidade de botão Criar Cliente pois tudo vem do Novo Processo, mas deixaremos um compacto para emergências se necessário ou removeremos */}
            <Link href="/processos/novo" className="btn-premium py-1.5 px-3 text-[10px]">
              <Plus size={14} strokeWidth={2.5} />
              NOVO PROCESSO
            </Link>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto scroll-container p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="compact-card animate-pulse space-y-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-2 bg-slate-50 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : filtered.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedId(c.id)}
                className={`compact-card cursor-pointer transition-all border-t-2 ${selectedId === c.id ? 'border-t-primary bg-primary/5 ring-1 ring-primary/10 shadow-lg' : 'border-t-transparent hover:border-t-slate-300'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${selectedId === c.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {c.nome?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold text-slate-900 truncate leading-tight">{c.nome}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{c.cidade || 'Localização N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className="text-[9px] font-mono font-bold text-slate-400">{c.cpf_cnpj || '—'}</span>
                  <div className="flex items-center gap-1 text-primary">
                    <Briefcase size={10} />
                    <span className="text-[10px] font-black">{c.processos?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SIDE DETAIL PANEL ── */}
      <AnimatePresence>
        {selectedId && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[450px] border-l border-slate-200 bg-white shadow-2xl z-20 flex flex-col"
          >
            {selectedCliente ? (
              <>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors">
                      <ChevronLeft size={16} className="text-slate-500" />
                    </button>
                    <span className="text-[10px] font-black text-slate-900 font-mono uppercase tracking-widest">Dossiê do Cliente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setClienteToEdit(selectedCliente); setIsEditModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                      <SlidersHorizontal size={16} />
                    </button>
                    <Link href={`/clientes/${selectedCliente.id}`} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors">
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>

                {/* Tabs inside side panel */}
                <div className="flex items-center border-b border-slate-100 px-4">
                  {TABS.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-all relative ${tab === t.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t.label}
                      {tab === t.id && (
                        <motion.div layoutId="clientTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto scroll-container p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      {tab === 'dados' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                               <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-black shadow-lg">
                                 {selectedCliente.nome?.charAt(0)}
                               </div>
                               <div>
                                 <h2 className="text-lg font-black text-slate-900 leading-none">{selectedCliente.nome}</h2>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{selectedCliente.email || 'Email não cadastrado'}</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-4 pt-2">
                               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                                 <Phone size={12} className="text-slate-300" /> {selectedCliente.telefone || '—'}
                               </div>
                               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                                 <Globe size={12} className="text-slate-300" /> {selectedCliente.cidade}/{selectedCliente.estado}
                               </div>
                             </div>
                          </div>

                          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                             <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono border-b border-slate-50 pb-2">Identificação</h3>
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">CPF/CNPJ</p>
                                 <p className="text-[10px] font-mono font-bold text-slate-800">{selectedCliente.cpf_cnpj}</p>
                               </div>
                               <div>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">RG/IE</p>
                                 <p className="text-[10px] font-mono font-bold text-slate-800">{selectedCliente.rg_ie || '—'}</p>
                               </div>
                             </div>
                          </div>

                          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                             <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                               <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Endereço</h3>
                               <MapPin size={12} className="text-primary" />
                             </div>
                             <div className="space-y-2">
                               <p className="text-xs font-bold text-slate-700">{selectedCliente.endereco}{selectedCliente.numero ? `, ${selectedCliente.numero}` : ''}</p>
                               <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                 <div>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">Bairro</p>
                                   <p className="text-[10px] font-bold text-slate-600 truncate">{selectedCliente.bairro || '—'}</p>
                                 </div>
                                 <div>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">CEP</p>
                                   <p className="text-[10px] font-mono font-bold text-slate-600">{selectedCliente.cep || '—'}</p>
                                 </div>
                               </div>
                             </div>
                          </div>
                        </div>
                      )}

                      {tab === 'imoveis' && (
                        <div className="space-y-4">
                           {selectedCliente.imoveis?.map((im: any) => (
                             <div key={im.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                   <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded uppercase">Matrícula: {im.num_matricula || 'N/A'}</span>
                                   <Building2 size={12} className="text-slate-300" />
                                </div>
                                <p className="text-xs font-bold text-slate-800">{im.endereco}, {im.numero}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{im.cidade} / {im.estado}</p>
                             </div>
                           ))}
                           {(!selectedCliente.imoveis || selectedCliente.imoveis.length === 0) && (
                              <div className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum imóvel vinculado</div>
                           )}
                        </div>
                      )}

                      {tab === 'processos' && (
                        <div className="space-y-3">
                           {selectedCliente.processos?.map((pr: any) => (
                             <div key={pr.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                   <h4 className="text-[11px] font-bold text-slate-900 leading-tight flex-1 pr-4">{pr.tipo_regularizacao}</h4>
                                   <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase shrink-0">{pr.status}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">ID: {pr.codigo_projeto || pr.id.substring(0,8)}</span>
                                   <Link href={`/processos/${pr.id}`} className="text-primary"><ArrowUpRight size={14} /></Link>
                                </div>
                             </div>
                           ))}
                           {(!selectedCliente.processos || selectedCliente.processos.length === 0) && (
                              <div className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum processo iniciado</div>
                           )}
                        </div>
                      )}

                      {tab === 'financeiro' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-900 rounded-2xl text-white">
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Total Contrato</p>
                                 <p className="text-sm font-black">{fmt(financialStats.totalContrato)}</p>
                              </div>
                              <div className="p-4 bg-emerald-500 rounded-2xl text-white">
                                 <p className="text-[8px] font-bold text-emerald-100/60 uppercase mb-1">Total Recebido</p>
                                 <p className="text-sm font-black">{fmt(financialStats.recebido)}</p>
                              </div>
                              <div className="p-4 bg-blue-500 rounded-2xl text-white">
                                 <p className="text-[8px] font-bold text-blue-100/60 uppercase mb-1">A Receber</p>
                                 <p className="text-sm font-black">{fmt(financialStats.pendenteReceber)}</p>
                              </div>
                              <div className="p-4 bg-rose-500 rounded-2xl text-white">
                                 <p className="text-[8px] font-bold text-rose-100/60 uppercase mb-1">A Pagar</p>
                                 <p className="text-sm font-black">{fmt(financialStats.pendentePagar)}</p>
                              </div>
                           </div>
                           <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Últimos Lançamentos</h4>
                              <div className="space-y-2">
                                 {selectedCliente.financeiro?.slice(0, 5).map((f: any) => (
                                   <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                      <div>
                                         <p className="text-[11px] font-bold text-slate-800">{f.descricao}</p>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(f.data_vencimento || f.createdAt).toLocaleDateString('pt-BR')}</p>
                                      </div>
                                      <p className={`text-[11px] font-black ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                                         {fmt(f.valor)}
                                      </p>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center animate-spin">
                  <Sparkles size={24} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando perfil...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <EditClienteModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setClienteToEdit(null) }}
        cliente={clienteToEdit}
        onSuccess={fetchData}
      />
    </div>
  )
}
