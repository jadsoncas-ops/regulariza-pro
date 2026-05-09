'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus, Search, Users, Building2, Briefcase, Phone, Mail, 
  MapPin, ChevronRight, MoreHorizontal, Edit2, Filter, 
  X, LayoutGrid, List, User, Globe, Wallet, History,
  ArrowUpRight, Command
} from 'lucide-react'
import { EditClienteModal } from '@/components/EditClienteModal'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { id: 'dados', label: 'Dados Gerais', icon: User },
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
        if (data.length > 0 && !selectedId) setSelectedId(data[0].id)
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
    
    // O valor total do contrato vem da soma do campo valor_total de todos os processos do cliente
    const totalContrato = (selectedCliente.processos || [])
      .reduce((acc: number, p: any) => acc + (p.valor_total || 0), 0)
      
    // O total recebido é a soma do valor_pago de todos os registros de receita
    const recebido = (selectedCliente.financeiro || [])
      .filter((f: any) => f.tipo === 'receita')
      .reduce((acc: number, f: any) => acc + (f.valor_pago || 0), 0)
      
    // Pendente a receber é a diferença entre o total do contrato e o que já foi recebido
    const pendenteReceber = Math.max(0, totalContrato - recebido)
      
    // Pendente a pagar são as despesas lançadas que ainda não foram totalmente pagas
    const pendentePagar = (selectedCliente.financeiro || [])
      .filter((f: any) => f.tipo === 'despesa' && f.status === 'pendente')
      .reduce((acc: number, f: any) => acc + (f.valor - (f.valor_pago || 0)), 0)

    return { totalContrato, recebido, pendenteReceber, pendentePagar }
  }, [selectedCliente])

  const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      
      {/* ── SIDEBAR LIST (LINEAR STYLE) ── */}
      <div className="w-80 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Clientes</h2>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="p-3 rounded-xl flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-2 bg-slate-50 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-10">
              Nenhum cliente
            </div>
          ) : filtered.map(c => (
            <button 
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all group relative ${
                selectedId === c.id ? 'bg-primary/5 border border-primary/10 shadow-sm' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform ${
                selectedId === c.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-500 group-hover:scale-105'
              }`}>
                {c.nome?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${selectedId === c.id ? 'text-primary' : 'text-slate-800'}`}>
                  {c.nome}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{c.cidade || '—'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[9px] font-bold text-slate-400 font-mono">{c.cpf_cnpj?.substring(0, 14)}</span>
                </div>
              </div>
              {selectedId === c.id && (
                 <motion.div layoutId="activeBorder" className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── DETAIL PANEL ── */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedCliente ? (
            <motion.div 
              key={selectedCliente.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              {/* Detail Header */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase tracking-[0.2em] font-mono">CLIENTE ID: {selectedCliente.id.substring(0, 8)}</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Ativo" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter text-slate-900">{selectedCliente.nome}</h1>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-300" /> {selectedCliente.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-300" /> {selectedCliente.telefone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setClienteToEdit(selectedCliente); setIsEditModalOpen(true) }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-500 hover:text-primary">
                      <Edit2 size={18} />
                    </button>
                    <Link href={`/clientes/${selectedCliente.id}`} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4">
                      EXPLORAR <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-8 mt-10">
                  {TABS.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all relative pb-4 ${
                        tab === t.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <t.icon size={14} />
                      {t.label}
                      {tab === t.id && (
                        <motion.div layoutId="tabBorder" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(45,91,255,0.6)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-white">
                {tab === 'dados' && (
                  <div className="max-w-2xl space-y-10">
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">DADOS DE CADASTRO</p>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-xs font-bold text-slate-500">CPF/CNPJ</span>
                            <span className="text-xs font-bold text-slate-800 font-mono">{selectedCliente.cpf_cnpj}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-xs font-bold text-slate-500">Data Nasc.</span>
                            <span className="text-xs font-bold text-slate-800">{selectedCliente.data_nascimento ? new Date(selectedCliente.data_nascimento).toLocaleDateString('pt-BR') : '—'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-xs font-bold text-slate-500">RG/IE</span>
                            <span className="text-xs font-bold text-slate-800 font-mono">{selectedCliente.rg_ie || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ENDEREÇO COMPLETO</p>
                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-2 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MapPin size={40} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{selectedCliente.endereco || 'Endereço não informado'}{selectedCliente.numero ? `, ${selectedCliente.numero}` : ''}</p>
                            {selectedCliente.complemento && <p className="text-[11px] font-medium text-slate-500 italic mt-0.5">{selectedCliente.complemento}</p>}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span className="text-slate-300 mr-1">BAIRRO:</span> {selectedCliente.bairro || '—'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span className="text-slate-300 mr-1">CIDADE:</span> {selectedCliente.cidade || '—'} / {selectedCliente.estado || '—'}</p>
                          </div>
                          <div className="pt-2 flex items-center gap-2">
                             <div className="h-px flex-1 bg-slate-200/50" />
                             <p className="text-[10px] font-black text-primary font-mono tracking-[0.2em]">{selectedCliente.cep || '00000-000'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">OBSERVAÇÕES TÉCNICAS</p>
                      <div className="p-6 bg-white border border-slate-200 rounded-3xl text-sm text-slate-600 leading-relaxed italic">
                        {selectedCliente.observacoes || 'Nenhuma observação registrada para este cliente.'}
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'imoveis' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">PATRIMÔNIO VINCULADO ({selectedCliente.imoveis?.length || 0})</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {(selectedCliente.imoveis || []).map((im: any) => (
                         <div key={im.id} className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-primary/20 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                                  <Building2 size={18} />
                               </div>
                               <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">MATRÍCULA: {im.num_matricula || 'NÃO INFORMADA'}</p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{im.endereco}, {im.numero}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{im.cidade} / {im.estado}</p>
                         </div>
                       ))}
                       {(!selectedCliente.imoveis || selectedCliente.imoveis.length === 0) && (
                          <div className="col-span-2 py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-3xl">Nenhum imóvel vinculado</div>
                       )}
                    </div>
                  </div>
                )}

                {tab === 'processos' && (
                  <div className="space-y-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ESTEIRA OPERACIONAL ({selectedCliente.processos?.length || 0})</p>
                    <div className="space-y-3">
                       {(selectedCliente.processos || []).map((pr: any) => (
                         <Link key={pr.id} href={`/processos/${pr.id}`} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                               <Briefcase size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-slate-800 truncate uppercase">{pr.tipo_regularizacao}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {pr.codigo_projeto || pr.id.substring(0,8)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                               <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">{pr.status?.replace(/_/g, ' ')}</span>
                               <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">{new Date(pr.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                         </Link>
                       ))}
                       {(!selectedCliente.processos || selectedCliente.processos.length === 0) && (
                          <div className="py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-3xl">Nenhum processo iniciado</div>
                       )}
                    </div>
                  </div>
                )}

                {tab === 'financeiro' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="p-5 bg-slate-900 rounded-[24px] text-white shadow-lg border border-slate-800">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">TOTAL CONTRATOS</p>
                          <p className="text-xl font-bold tracking-tight">{fmt(financialStats.totalContrato)}</p>
                       </div>
                       <div className="p-5 bg-emerald-500 rounded-[24px] text-white shadow-lg border border-emerald-400">
                          <p className="text-[9px] font-bold text-emerald-100/60 uppercase tracking-widest font-mono mb-2">TOTAL RECEBIDO</p>
                          <p className="text-xl font-bold tracking-tight">{fmt(financialStats.recebido)}</p>
                       </div>
                       <div className="p-5 bg-white rounded-[24px] text-slate-900 shadow-sm border border-slate-200">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">PENDENTE RECEBER</p>
                          <p className="text-xl font-bold tracking-tight text-primary">{fmt(financialStats.pendenteReceber)}</p>
                       </div>
                       <div className="p-5 bg-white rounded-[24px] text-slate-900 shadow-sm border border-slate-200">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">PENDENTE PAGAR</p>
                          <p className="text-xl font-bold tracking-tight text-red-500">{fmt(financialStats.pendentePagar)}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">HISTÓRICO DE LANÇAMENTOS</p>
                        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                           <table className="w-full text-left">
                              <tbody className="divide-y divide-slate-50">
                                 {(!selectedCliente.financeiro || selectedCliente.financeiro.length === 0) ? (
                                   <tr><td className="p-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhum lançamento financeiro</td></tr>
                                 ) : selectedCliente.financeiro.map((f: any) => (
                                   <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 font-mono uppercase">
                                        {new Date(f.data_vencimento || f.createdAt).toLocaleDateString('pt-BR')}
                                      </td>
                                      <td className="px-6 py-4">
                                         <p className="text-xs font-bold text-slate-800">{f.descricao}</p>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase">{f.categoria || 'Geral'}</p>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                         <p className={`text-xs font-bold ${f.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                                           {f.tipo === 'receita' ? '+' : '-'} {fmt(f.valor)}
                                         </p>
                                         <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${f.status === 'pago' || f.status === 'recebido' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {f.status}
                                         </span>
                                      </td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-20">
               <Users size={48} className="text-slate-100 mb-4" />
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Selecione um cliente para visualizar</h3>
            </div>
          )}
        </AnimatePresence>
      </div>

      <EditClienteModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setClienteToEdit(null) }}
        cliente={clienteToEdit}
        onSuccess={fetchData}
      />
    </div>
  )
}
