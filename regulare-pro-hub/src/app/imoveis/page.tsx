'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Building2, MapPin, List, ArrowUpRight, Users, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'map'>('list')

  useEffect(() => {
    fetch('/api/imoveis')
      .then(r => r.json())
      .then(d => {
        setImoveis(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = imoveis.filter(im =>
    im.endereco?.toLowerCase().includes(search.toLowerCase()) ||
    im.cidade?.toLowerCase().includes(search.toLowerCase()) ||
    im.cliente?.nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Imóveis & Terrenos</h1>
          <p className="text-xs text-slate-500 font-medium mt-2 tracking-wider uppercase">Cadastro Físico e Localização</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
             <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}><List size={16}/></button>
             <button onClick={() => setView('map')} className={`p-2 rounded-lg transition-all ${view === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}><MapPin size={16}/></button>
           </div>
           
           <div className="relative group w-72 hidden md:block">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
             <input 
               placeholder="Buscar imóvel..." 
               className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-slate-700 text-white"
               value={search} onChange={e => setSearch(e.target.value)}
             />
           </div>
           
           <button className="btn-primary py-2.5">
             <Plus size={18} strokeWidth={3} /> NOVO IMÓVEL
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 rounded-2xl bg-white/5 animate-pulse min-h-[500px]" />
      ) : view === 'list' ? (
        <div className="card overflow-hidden border-white/5 bg-slate-900/40">
           <table className="w-full text-left">
             <thead>
               <tr className="bg-white/[0.01]">
                 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Endereço / Localização</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Cliente Vinculado</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Tipo & Área</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Processos</th>
                 <th className="px-8 py-5" />
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {filtered.length === 0 ? (
                 <tr><td colSpan={5} className="py-20 text-center text-slate-600 text-sm">Nenhum registro encontrado.</td></tr>
               ) : filtered.map(im => (
                 <tr key={im.id} className="table-row group">
                   <td className="px-8 py-5">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-emerald-500 shadow-lg">
                         <Building2 size={18} />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{im.endereco || 'Endereço não informado'}</p>
                         <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-1">{im.cidade || 'Cidade não informada'} - {im.estado}</p>
                       </div>
                     </div>
                   </td>
                   <td className="px-8 py-5">
                     <div className="flex items-center gap-2 text-slate-300 font-medium text-xs">
                       <Users size={14} className="text-slate-600" />
                       {im.cliente?.nome || '—'}
                     </div>
                   </td>
                   <td className="px-8 py-5">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">{im.tipo || 'Terreno'}</span>
                        {im.area_total && <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{im.area_total} m²</span>}
                     </div>
                   </td>
                   <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5 w-fit">
                         <Briefcase size={12} className="text-slate-500" />
                         <span className="text-[10px] font-black text-slate-400">{im.processos?.length || 0}</span>
                      </div>
                   </td>
                   <td className="px-8 py-5 text-right">
                     <button className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-white/5 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                        <ArrowUpRight size={18} />
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      ) : (
        /* MAP VIEW */
        <div className="flex-1 card overflow-hidden relative min-h-[600px] bg-slate-950 flex items-center justify-center border-white/10 group">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
           <div className="relative z-10 flex flex-col items-center">
              <MapPin size={48} className="text-emerald-500 mb-4 opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <p className="text-sm font-bold text-white uppercase tracking-widest">Integração Maps (Em breve)</p>
              <p className="text-xs text-slate-500 mt-2">Renderizando {filtered.length} imóveis no mapa.</p>
           </div>
        </div>
      )}

    </div>
  )
}
