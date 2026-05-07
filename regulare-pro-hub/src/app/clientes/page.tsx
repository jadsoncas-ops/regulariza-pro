'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Users, Building2, Briefcase, Phone, Mail, MapPin, X, ArrowUpRight, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'

const STATUS_MAP: Record<string, { label: string; border: string; bg: string; color: string }> = {
  ativo:    { label: 'ATIVO',    border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
  inativo:  { label: 'INATIVO',  border: 'border-white/10',       bg: 'bg-white/5',        color: 'text-slate-500' },
  pendente: { label: 'PENDENTE', border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   color: 'text-amber-400' },
}

const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCliente, setSelectedCliente] = useState<any>(null)

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(d => {
        setClientes(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = clientes.filter(c =>
    c.nome?.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf_cnpj?.includes(search)
  )

  return (
    <div className="space-y-8 animate-fade">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Portfólio de Clientes</h1>
          <p className="text-xs text-slate-500 font-medium mt-2 tracking-wider uppercase">CRM & Gestão de Relacionamento</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group w-72 hidden md:block">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
             <input 
               placeholder="Buscar cliente..." 
               className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-slate-700 text-white"
               value={search} onChange={e => setSearch(e.target.value)}
             />
           </div>
           <button className="btn-primary py-2.5">
             <Plus size={18} strokeWidth={3} /> NOVO CLIENTE
           </button>
        </div>
      </div>

      {/* CRM GRID (Startup Style) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
           {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
           <Users size={48} className="mb-4 opacity-20" />
           <p className="text-sm font-medium">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
           {filtered.map(c => {
             // Simulando cálculos financeiros
             const valorContratado = (c.processos || []).reduce((acc: number, p: any) => acc + (p.valor_contrato || 0), 0)
             const valorRecebido = (c.financeiro || []).filter((f:any) => f.tipo==='receita' && f.status==='pago').reduce((acc: number, f: any) => acc + (f.valor || 0), 0)
             
             return (
               <div 
                 key={c.id} 
                 onClick={() => setSelectedCliente(c)}
                 className="card p-5 hover-glow cursor-pointer group flex flex-col justify-between"
               >
                 <div>
                   <div className="flex items-start justify-between mb-4">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-lg">
                       <Users size={18} strokeWidth={2} />
                     </div>
                     {(() => {
                        const st = STATUS_MAP[c.status || 'ativo']
                        return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${st.border} ${st.bg} ${st.color}`}>{st.label}</span>
                     })()}
                   </div>
                   
                   <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{c.nome}</h3>
                   <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-slate-500">
                     <span className="flex items-center gap-1"><Phone size={12} className="text-slate-600"/> {c.telefone || 'Sem contato'}</span>
                   </div>
                 </div>

                 <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Contratado</span>
                       <span className="text-xs font-bold text-slate-300">{fmt(valorContratado)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5">
                       <Briefcase size={12} className="text-slate-500" />
                       <span className="text-[10px] font-black text-slate-400">{c.processos?.length || 0}</span>
                    </div>
                 </div>
               </div>
             )
           })}
        </div>
      )}

      {/* DRAWER LATERAL (CRM View) */}
      <div className={`fixed inset-y-0 right-0 z-[100] w-full max-w-2xl bg-slate-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${selectedCliente ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {selectedCliente && (
          <>
            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-blue-500 shadow-2xl">
                    <Users size={24} strokeWidth={2} />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-white tracking-tight">{selectedCliente.nome}</h2>
                   <div className="flex items-center gap-3 mt-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>{selectedCliente.cpf_cnpj || 'DOCUMENTO NÃO INFORMADO'}</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full" />
                      <span>{selectedCliente.cidade || 'CIDADE NÃO INFORMADA'}</span>
                   </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button className="btn-outline px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">Editar</button>
                 <button onClick={() => setSelectedCliente(null)} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                   <X size={20} />
                 </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
               
               {/* CRM Stats */}
               <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Processos Ativos</span>
                     <span className="text-lg font-black text-white">{selectedCliente.processos?.length || 0}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                     <span className="text-[9px] font-black text-blue-500/70 uppercase tracking-widest block mb-1">Valor Contratado</span>
                     <span className="text-lg font-black text-blue-400">R$ 0</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                     <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest block mb-1">Recebido</span>
                     <span className="text-lg font-black text-emerald-400">R$ 0</span>
                  </div>
               </div>

               {/* Seções (Imóveis, Processos) */}
               <div className="space-y-6">
                  <div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Building2 size={14}/> Imóveis Vinculados</h3>
                     <div className="space-y-3">
                        {selectedCliente.imoveis?.length > 0 ? selectedCliente.imoveis.map((im: any) => (
                           <div key={im.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex justify-between items-center">
                              <div>
                                 <p className="text-xs font-bold text-slate-300">{im.endereco}</p>
                                 <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{im.tipo || 'Imóvel'}</p>
                              </div>
                              <ArrowUpRight size={14} className="text-slate-600" />
                           </div>
                        )) : (
                           <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">Nenhum imóvel cadastrado</div>
                        )}
                     </div>
                  </div>

                  <div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Briefcase size={14}/> Operações (Processos)</h3>
                     <div className="space-y-3">
                        {selectedCliente.processos?.length > 0 ? selectedCliente.processos.map((p: any) => (
                           <div key={p.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center group">
                              <div>
                                 <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{p.tipo_regularizacao}</p>
                                 <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">ID: {p.id.substring(0,8)}</p>
                              </div>
                              <Link href={`/processos/${p.id}`} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                 <ArrowUpRight size={14} />
                              </Link>
                           </div>
                        )) : (
                           <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">Nenhum processo ativo</div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </>
        )}
      </div>
      
      {/* Drawer Overlay */}
      {selectedCliente && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] animate-fade"
          onClick={() => setSelectedCliente(null)}
        />
      )}

    </div>
  )
}
