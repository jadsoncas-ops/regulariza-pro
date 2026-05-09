'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Briefcase, Building2, ArrowRight, X, Command } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  em_analise:           { label: 'Em Análise',   color: 'bg-amber-100 text-amber-700' },
  protocolo_prefeitura: { label: 'Protocolo',    color: 'bg-blue-100 text-blue-700' },
  finalizado:           { label: 'Finalizado',   color: 'bg-green-100 text-green-700' },
  pendente:             { label: 'Pendente',     color: 'bg-red-100 text-red-700' },
  aprovado:             { label: 'Aprovado',     color: 'bg-emerald-100 text-emerald-700' },
}

export default function GlobalSearch({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<any>({ clientes: [], processos: [], imoveis: [] })
  const [loading, setLoading] = useState(false)
  const inputRef  = useRef<HTMLInputElement>(null)
  const debounce  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const router    = useRouter()

  // Atalho de teclado Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // O AppShell já trata isso ou podemos chamar onClose se estiver aberto
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  // Busca com debounce
  useEffect(() => {
    clearTimeout(debounce.current)
    if (query.length < 2) { setResults({ clientes: [], processos: [], imoveis: [] }); return }
    setLoading(true)
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/busca?q=${encodeURIComponent(query)}`)
        setResults(await res.json())
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }, 300)
  }, [query])

  const total = (results.clientes?.length || 0) + (results.processos?.length || 0) + (results.imoveis?.length || 0)
  const hasResults = total > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por cliente, processo, imóvel, cidade, serviço..."
            className="flex-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded font-mono shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-5 py-10 text-center">
              <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Digite ao menos 2 caracteres para buscar</p>
              <p className="text-xs text-slate-300 mt-1">Busca em clientes, processos e imóveis</p>
            </div>
          ) : loading ? (
            <div className="px-5 py-10 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : !hasResults ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-500">Nenhum resultado para <strong>&quot;{query}&quot;</strong></p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Clientes */}
              {results.clientes?.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Clientes</p>
                  {results.clientes.map((c: any) => (
                    <Link key={c.id} href={`/clientes/${c.id}`} onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-600">{c.nome?.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors font-inter">{c.nome}</p>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{c.cidade || 'Sem cidade'}</p>
                      </div>
                      <Users className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Processos */}
              {results.processos?.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Processos</p>
                  {results.processos.map((p: any) => {
                    const st = STATUS_BADGE[p.status] || { label: p.status, color: 'bg-slate-100 text-slate-600' }
                    return (
                      <Link key={p.id} href={`/processos/${p.id}`} onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate font-inter">{p.tipo_regularizacao}</p>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shrink-0 ${st.color}`}>{st.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">{p.cliente?.nome} {p.codigo_projeto ? <span className="font-mono text-blue-500 ml-1">· {p.codigo_projeto}</span> : ''}</p>
                        </div>
                        <Briefcase className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400" />
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Imóveis */}
              {results.imoveis?.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Imóveis</p>
                  {results.imoveis.map((im: any) => (
                    <div key={im.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group cursor-default">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {im.endereco}{im.numero ? `, ${im.numero}` : ''}
                        </p>
                        <p className="text-xs text-slate-400">{im.cidade} · {im.cliente?.nome}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {hasResults ? `${total} resultado(s) encontrado(s)` : ''}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><kbd className="bg-slate-200 px-1 rounded">↑↓</kbd> navegar</span>
            <span className="flex items-center gap-1"><kbd className="bg-slate-200 px-1 rounded">Enter</kbd> abrir</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
