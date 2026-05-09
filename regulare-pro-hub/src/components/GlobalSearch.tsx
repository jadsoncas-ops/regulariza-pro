'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Users, Briefcase, Building2, X, Command, 
  Plus, LayoutGrid, FileText, DollarSign, Map, UserPlus,
  ArrowRight, Sparkles, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: 'processo' | 'cliente' | 'imovel' | 'documento' | 'financeiro' | 'acao'
  href: string
  icon: any
}

export default function GlobalSearch({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({ 
    clientes: [], processos: [], imoveis: [], 
    documentos: [], financeiro: [], acoes: [] 
  })
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const debounce = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Fetch results
  useEffect(() => {
    clearTimeout(debounce.current)
    if (query.length < 2) {
      setResults({ clientes: [], processos: [], imoveis: [], documentos: [], financeiro: [], acoes: [] })
      return
    }
    setLoading(true)
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/busca?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
        setSelectedIndex(0)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }, 200)
  }, [query])

  // Flatten results for keyboard navigation
  const flattenedResults = useMemo(() => {
    const list: SearchResult[] = []
    
    // Actions first
    results.acoes?.forEach((a: any) => list.push({ 
      id: a.id, title: a.title, type: 'acao', href: a.action, icon: a.icon === 'Plus' ? Plus : a.icon === 'LayoutGrid' ? LayoutGrid : a.icon === 'UserPlus' ? UserPlus : Map 
    }))
    
    // Processes
    results.processos?.forEach((p: any) => list.push({ 
      id: p.id, title: p.tipo_regularizacao, subtitle: `${p.codigo_projeto} • ${p.cliente?.nome}`, type: 'processo', href: `/processos/${p.id}`, icon: Briefcase 
    }))
    
    // Clients
    results.clientes?.forEach((c: any) => list.push({ 
      id: c.id, title: c.nome, subtitle: c.cidade, type: 'cliente', href: `/clientes/${c.id}`, icon: Users 
    }))
    
    // Docs
    results.documentos?.forEach((d: any) => list.push({ 
      id: d.id, title: d.nome, subtitle: d.tipo, type: 'documento', href: `/processos/${d.processoId}`, icon: FileText 
    }))

    // Finance
    results.financeiro?.forEach((f: any) => list.push({ 
      id: f.id, title: f.descricao, subtitle: `R$ ${f.valor.toLocaleString()}`, type: 'financeiro', href: `/processos/${f.processoId}`, icon: DollarSign 
    }))

    return list
  }, [results])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % (flattenedResults.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + (flattenedResults.length || 1)) % (flattenedResults.length || 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = flattenedResults[selectedIndex]
        if (selected) {
          router.push(selected.href)
          onClose()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, flattenedResults, selectedIndex, router, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Palette */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        className="relative w-full max-w-[640px] bg-[#1a1c23] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
      >
        {/* Search Bar */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search processes, clients, documents or type commands..."
            className="flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-slate-600 font-medium"
          />
          <div className="flex items-center gap-1.5 shrink-0">
             {loading && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
             <kbd className="text-[10px] bg-white/5 text-slate-500 border border-white/5 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[450px] overflow-y-auto py-2 custom-palette-scroll">
          {flattenedResults.length > 0 ? (
            <div className="px-2 space-y-1">
              {flattenedResults.map((res, i) => (
                <div
                  key={`${res.type}-${res.id}-${i}`}
                  onClick={() => { router.push(res.href); onClose() }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    i === selectedIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    i === selectedIndex ? 'bg-white/20' : 'bg-white/5 text-slate-500'
                  }`}>
                    <res.icon size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className={`text-[13px] font-bold truncate ${i === selectedIndex ? 'text-white' : 'text-slate-200'}`}>
                         {res.title}
                       </span>
                       <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 px-1.5 py-0.5 rounded ${
                         i === selectedIndex ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                       }`}>
                         {res.type}
                       </span>
                    </div>
                    {res.subtitle && (
                      <p className={`text-[11px] truncate mt-0.5 ${i === selectedIndex ? 'text-blue-100' : 'text-slate-500'}`}>
                        {res.subtitle}
                      </p>
                    )}
                  </div>

                  {i === selectedIndex && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter opacity-80">
                       Open <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : query.length >= 2 && !loading ? (
            <div className="py-12 text-center">
               <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-3" />
               <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">No matching results found</p>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4">
               <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3">Suggested Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <QuickActionButton icon={Plus} label="New Process" onClick={() => { router.push('/processos/novo'); onClose() }} />
                    <QuickActionButton icon={Users} label="Clients" onClick={() => { router.push('/clientes'); onClose() }} />
                    <QuickActionButton icon={LayoutGrid} label="Dashboard" onClick={() => { router.push('/dashboard'); onClose() }} />
                    <QuickActionButton icon={FileText} label="Documents" onClick={() => { router.push('/documentos'); onClose() }} />
                  </div>
               </div>
               <div className="pt-2">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3">Shortcuts</p>
                  <div className="flex gap-4">
                     <ShortcutItem keys={['↑', '↓']} label="Navigate" />
                     <ShortcutItem keys={['↵']} label="Select" />
                     <ShortcutItem keys={['esc']} label="Close" />
                  </div>
               </div>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-palette-scroll::-webkit-scrollbar { width: 4px; }
        .custom-palette-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-palette-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-palette-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  )
}

function QuickActionButton({ icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-[12px] font-bold text-slate-300 uppercase tracking-tighter">{label}</span>
    </button>
  )
}

function ShortcutItem({ keys, label }: { keys: string[], label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {keys.map(k => (
          <kbd key={k} className="px-1.5 py-0.5 rounded border border-white/5 bg-white/[0.02] text-[9px] font-mono text-slate-500">{k}</kbd>
        ))}
      </div>
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{label}</span>
    </div>
  )
}
