'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  FileText, Upload, Search, Eye, Download, Tag, Folder, 
  Plus, MoreHorizontal, ChevronRight, Filter, Grid, List,
  Clock, Share2, Trash2, Info, HardDrive, File, FileCode,
  Image as ImageIcon, FileArchive, ArrowUpRight, X, Layers
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIAS = [
  { id: '',           label: 'Todos Arquivos',       icon: HardDrive },
  { id: 'certidoes',  label: 'Certidões',            icon: FileText },
  { id: 'art',        label: 'ART / RRT',            icon: FileCode },
  { id: 'projetos',   label: 'Projetos Arquitet.',  icon: Layers },
  { id: 'alvaras',    label: 'Alvarás',              icon: File },
  { id: 'habite_se',  label: 'Habite-se',            icon: CheckCircle2 },
  { id: 'fotos',      label: 'Fotos & Vistorias',    icon: ImageIcon },
  { id: 'outros',     label: 'Documentos Diversos',  icon: FileArchive },
]

function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetch('/api/documentos')
      .then(r => r.json())
      .then(d => { setDocs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => docs.filter(d =>
    (!cat || d.categoria === cat) &&
    (d.nome?.toLowerCase().includes(search.toLowerCase()) || !search)
  ), [docs, cat, search])

  const selectedDoc = useMemo(() => docs.find(d => d.id === selectedId) || null, [docs, selectedId])

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      
      {/* ── SIDEBAR CATEGORIES ── */}
      <div className="w-64 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">Categorias</h2>
           <button className="p-1.5 text-slate-400 hover:text-primary transition-all"><Plus size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {CATEGORIAS.map(c => (
            <button 
              key={c.id} onClick={() => setCat(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight transition-all ${
                cat === c.id ? 'bg-primary/5 text-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <c.icon size={16} className={cat === c.id ? 'text-primary' : 'text-slate-300'} /> 
              {c.label}
              {cat === c.id && <motion.div layoutId="catActive" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Storage</span>
              <span className="text-[10px] font-bold text-slate-600">82%</span>
           </div>
           <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '82%' }} />
           </div>
        </div>
      </div>

      {/* ── MAIN EXPLORER ── */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-6">
              <div className="relative w-80">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   placeholder="Pesquisar em documentos..." 
                   className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                   value={search} onChange={e => setSearch(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={14}/></button>
                 <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><List size={14}/></button>
              </div>
           </div>
           <button className="btn-premium px-6 py-2.5">
              <Upload size={16} /> UPLOAD
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
           {loading ? (
             <div className="grid grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-slate-50 rounded-3xl" />)}
             </div>
           ) : filtered.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-4 border-2 border-dashed border-slate-100">
                   <Folder size={40} />
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum arquivo encontrado</h3>
             </div>
           ) : view === 'grid' ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filtered.map((d, idx) => (
                  <motion.div 
                    key={d.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => setSelectedId(d.id)}
                    className={`group relative flex flex-col items-center p-6 rounded-[32px] border transition-all cursor-pointer ${
                      selectedId === d.id ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg'
                    }`}
                  >
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={16} className="text-slate-400 hover:text-primary" />
                     </div>
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                       selectedId === d.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg shadow-primary/20'
                     }`}>
                        <FileText size={32} />
                     </div>
                     <p className="text-[11px] font-bold text-slate-800 text-center line-clamp-2 leading-snug px-2">{d.nome}</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 font-mono">{d.categoria || 'geral'}</p>
                  </motion.div>
                ))}
             </div>
           ) : (
             <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                         <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Arquivo</th>
                         <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Categoria</th>
                         <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Vínculo</th>
                         <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Data</th>
                         <th className="px-6 py-4"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filtered.map(d => (
                         <tr key={d.id} onClick={() => setSelectedId(d.id)} className={`group cursor-pointer transition-all ${selectedId === d.id ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <FileText size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                  <span className="text-xs font-bold text-slate-800">{d.nome}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{d.categoria || '—'}</span></td>
                            <td className="px-6 py-4"><span className="text-[10px] font-bold text-slate-400 font-mono uppercase">{d.processo?.codigo_projeto || 'GERAL'}</span></td>
                            <td className="px-6 py-4 text-[10px] font-bold text-slate-400 font-mono">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a href={d.url} target="_blank" className="p-1.5 text-slate-400 hover:text-primary transition-all"><Eye size={16} /></a>
                                  <a href={d.url} download className="p-1.5 text-slate-400 hover:text-primary transition-all"><Download size={16} /></a>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      </div>

      {/* ── RIGHT PANEL: METADATA ── */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-80 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden shrink-0"
          >
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">Detalhes</h2>
                <button onClick={() => setSelectedId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-all"><X size={16}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 space-y-10">
                <div className="flex flex-col items-center text-center space-y-4">
                   <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center text-primary shadow-inner">
                      <FileText size={48} />
                   </div>
                   <div className="space-y-1 px-4">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{selectedDoc.nome}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">1.4 MB · PDF</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">INFORMAÇÕES</p>
                      <div className="space-y-2">
                         <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400">Categoria</span>
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">{selectedDoc.categoria || 'Outros'}</span>
                         </div>
                         <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400">Criado em</span>
                            <span className="text-[10px] font-bold text-slate-800 font-mono">{new Date(selectedDoc.createdAt).toLocaleDateString('pt-BR')}</span>
                         </div>
                         <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400">Status</span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Verificado</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">VÍNCULO</p>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm"><Layers size={14}/></div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-800 truncate">{selectedDoc.processo?.tipo_regularizacao || 'Lançamento Geral'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: {selectedDoc.processo?.codigo_projeto || '—'}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                <a 
                  href={selectedDoc.url} target="_blank"
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                >
                   ABRIR ARQUIVO <ArrowUpRight size={14} />
                </a>
                <div className="flex gap-2">
                   <button className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-all flex items-center justify-center"><Download size={16}/></button>
                   <button className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-all flex items-center justify-center"><Share2 size={16}/></button>
                   <button className="flex-1 py-2.5 bg-white border border-slate-200 text-rose-400 rounded-xl hover:text-rose-600 transition-all flex items-center justify-center"><Trash2 size={16}/></button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
