'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Upload, Search, Eye, Download, Tag, Folder, Plus } from 'lucide-react'

const CATEGORIAS = [
  { id: '',           label: 'Todos',                icon: Folder },
  { id: 'certidoes',  label: 'Certidões',            icon: FileText },
  { id: 'art',        label: 'ART / RRT',            icon: FileText },
  { id: 'projetos',   label: 'Projetos Arquitetônicos', icon: FileText },
  { id: 'alvaras',    label: 'Alvarás',              icon: FileText },
  { id: 'habite_se',  label: 'Habite-se',            icon: FileText },
  { id: 'fotos',      label: 'Fotos',                icon: FileText },
  { id: 'outros',     label: 'Outros',               icon: FileText },
]

const STATUS_MAP: Record<string, string> = {
  pendente:   'badge-amber',
  verificado: 'badge-green',
  recusado:   'badge-red',
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')

  useEffect(() => {
    fetch('/api/documentos')
      .then(r => r.json())
      .then(d => { setDocs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = docs.filter(d =>
    (!cat || d.categoria === cat) &&
    (d.nome?.toLowerCase().includes(search.toLowerCase()) || !search)
  )

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Documentos</h1><p className="page-subtitle">{docs.length} documento(s) no sistema</p></div>
        <button className="btn-primary"><Upload className="w-4 h-4" /> Enviar Documento</button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar de categorias */}
        <div className="w-48 shrink-0 space-y-1">
          {CATEGORIAS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${cat === c.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}>
              <c.icon className="w-4 h-4" /> {c.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input placeholder="Buscar documentos..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 text-center py-12">Carregando...</p>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-2">Nenhum documento encontrado</p>
              <p className="text-xs text-slate-400">Envie documentos através do fluxo de criação de processos</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-6 py-3 text-left table-header">Nome</th>
                    <th className="px-6 py-3 text-left table-header">Categoria</th>
                    <th className="px-6 py-3 text-left table-header">Processo</th>
                    <th className="px-6 py-3 text-left table-header">Status</th>
                    <th className="px-6 py-3 text-left table-header">Data</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id} className="table-row">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>
                          <p className="text-sm font-medium text-slate-800">{d.nome}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3.5"><span className="badge badge-slate">{d.categoria || 'outros'}</span></td>
                      <td className="px-6 py-3.5"><p className="text-xs font-mono text-slate-500">{d.processo?.codigo_projeto || '—'}</p></td>
                      <td className="px-6 py-3.5"><span className={`badge ${STATUS_MAP[d.status] || 'badge-slate'}`}>{d.status}</span></td>
                      <td className="px-6 py-3.5"><p className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</p></td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <a href={d.url} target="_blank" className="btn-ghost py-1 px-2 text-xs"><Eye className="w-3.5 h-3.5" /></a>
                          <a href={d.url} download className="btn-ghost py-1 px-2 text-xs"><Download className="w-3.5 h-3.5" /></a>
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
    </div>
  )
}
