'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Briefcase, Building2, ArrowRight, X, Command, Zap } from 'lucide-react'
import Link from 'next/link'

const STATUS_BADGE: Record<string, { label: string; badge: string }> = {
  em_analise:           { label: 'Em Análise',   badge: 'badge-amber' },
  protocolo_prefeitura: { label: 'Protocolo',    badge: 'badge-blue' },
  finalizado:           { label: 'Finalizado',   badge: 'badge-green' },
  pendente:             { label: 'Pendente',     badge: 'badge-red' },
  aprovado:             { label: 'Aprovado',     badge: 'badge-green' },
}

export default function GlobalSearch() {
  const [open, setOpen]       = useState(false)
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
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

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

  return (
    <>
      {/* TRIGGER na Topbar Premium */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 transition-all w-full max-w-md group relative"
      >
        <Search className="absolute left-4 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
        <span className="flex-1 text-left font-medium">Busca Global Inteligente...</span>
        <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
          <kbd className="bg-slate-200 text-slate-600 text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase">Cmd</kbd>
          <kbd className="bg-slate-200 text-slate-600 text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase">K</kbd>
        </div>
      </button>

      {/* MODAL PREMIUM */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 overflow-hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setOpen(false)} />

          {/* Dialog */}
          <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/20 overflow-hidden animate-fade-up">
            
            {/* Input Section */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-white/50">
              <Search className="w-5 h-5 text-blue-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="O que você está procurando hoje?"
                className="flex-1 text-base font-bold text-slate-900 outline-none placeholder:text-slate-400 bg-transparent tracking-tight"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-2 text-slate-400 hover:text-slate-900 transition-all bg-slate-100 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-2">
                 <div className="w-px h-4 bg-slate-200 mx-2" />
                 <kbd className="text-[9px] font-black bg-slate-900 text-white px-2 py-1 rounded-lg uppercase tracking-widest shrink-0 shadow-lg">ESC</kbd>
              </div>
            </div>

            {/* Content Area */}
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar bg-white/30 p-2">
              {query.length < 2 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-[24px] flex items-center justify-center mx-auto shadow-inner border border-blue-100">
                    <Search className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Busca Instantânea RegularizaPro</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sincronizado com Neon PostgreSQL</p>
                  </div>
                </div>
              ) : loading ? (
                <div className="py-20 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : !hasResults ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-400 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <Zap size={32} />
                  </div>
                  <p className="text-sm font-black text-slate-900">Nenhum registro para &quot;{query}&quot;</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Tente termos mais genéricos</p>
                </div>
              ) : (
                <div className="space-y-4 p-2">
                  {/* Clientes */}
                  {results.clientes?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-3">Relacionamento / Clientes</p>
                      {results.clientes.map((c: any) => (
                        <Link key={c.id} href={`/clientes/${c.id}`} onClick={() => setOpen(false)}
                          className="flex items-center gap-4 px-4 py-3 rounded-[20px] bg-white border border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                            <span className="text-xs font-black">{c.nome?.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{c.nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{c.cidade || 'Base Geral'}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Processos */}
                  {results.processos?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-3">Operações / Processos</p>
                      {results.processos.map((p: any) => {
                        const st = STATUS_BADGE[p.status] || { label: p.status, badge: 'badge-slate' }
                        return (
                          <Link key={p.id} href={`/processos/${p.id}`} onClick={() => setOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 rounded-[20px] bg-white border border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-lg">
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight truncate">{p.tipo_regularizacao}</p>
                                <span className={`badge ${st.badge} scale-90`}>{st.label}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.cliente?.nome} {p.codigo_projeto ? <span className="text-blue-500 ml-1">· {p.codigo_projeto}</span> : ''}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* Imóveis */}
                  {results.imoveis?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-3">Patrimônio / Imóveis</p>
                      {results.imoveis.map((im: any) => (
                        <div key={im.id}
                          className="flex items-center gap-4 px-4 py-3 rounded-[20px] bg-white border border-slate-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group cursor-default">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-slate-900 tracking-tight">
                              {im.endereco}{im.numero ? `, ${im.numero}` : ''}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{im.cidade} · {im.cliente?.nome}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Premium */}
            <div className="px-8 py-4 bg-slate-900 text-white flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {hasResults ? `${total} ENTRADAS LOCALIZADAS` : 'BUSCA OPERACIONAL'}
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="bg-white/10 px-1.5 py-0.5 rounded-lg text-white">↑↓</div> Navegar
                </span>
                <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="bg-white/10 px-1.5 py-0.5 rounded-lg text-white">Enter</div> Selecionar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
