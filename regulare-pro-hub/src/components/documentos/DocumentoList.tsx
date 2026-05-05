'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Trash2, 
  Eye, 
  X, 
  FileText,
  Upload,
  Download,
  Filter,
  FileCode,
  FileImage,
  FileIcon,
  PlusCircle,
  MoreVertical,
  Check
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Documento {
  id: string
  processoId: string | null
  imovelId: string | null
  nome: string
  tipo: string
  url: string
  tamanho: number | null
  responsavel: string | null
  observacoes: string | null
  createdAt: string
  processo: {
    tipo_regularizacao: string
    cliente: { nome: string }
  } | null
  imovel: {
    endereco: string
  } | null
}

interface DocumentoListProps {
  initialDocumentos: Documento[]
  processos: { id: string, tipo_regularizacao: string, cliente: { nome: string } }[]
}

// UI Components
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    />
  )
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    >
      {children}
    </select>
  )
}

export default function DocumentoList({ initialDocumentos, processos }: DocumentoListProps) {
  const [documentos, setDocumentos] = useState(initialDocumentos)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredDocs = documentos.filter(d => 
    d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.processo?.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.nome,
          tipo: data.tipo,
          processoId: data.processoId,
          url: `/uploads/${data.nome}`,
          tamanho: Math.floor(Math.random() * 5000) + 100,
          responsavel: 'Equipe'
        })
      })

      if (res.ok) {
        setIsModalOpen(false)
        router.refresh()
        setTimeout(() => window.location.reload(), 300)
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este documento?')) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/documentos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocumentos(prev => prev.filter(d => d.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (tipo: string) => {
    const t = tipo.toLowerCase()
    if (t.includes('pdf')) return <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileText className="w-5 h-5" /></div>
    if (t.includes('dwg') || t.includes('cad')) return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileCode className="w-5 h-5" /></div>
    if (t.includes('jpg') || t.includes('png') || t.includes('imagem')) return <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FileImage className="w-5 h-5" /></div>
    return <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><FileIcon className="w-5 h-5" /></div>
  }

  return (
    <div className="space-y-6">
      
      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-[hsl(var(--border))] rounded-xl shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nome ou cliente..."
            className="w-full bg-slate-50 border border-[hsl(var(--border))] pl-10 pr-4 py-2 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" /> Novo Upload
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-[hsl(var(--border))] bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Arquivo</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vínculo</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data / Tamanho</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Responsável</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic">
                  Nenhum documento encontrado.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {getFileIcon(doc.tipo)}
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 line-clamp-1">{doc.nome}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{doc.tipo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {doc.processo ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-blue-600">PRC-{doc.processoId?.substring(0,6).toUpperCase()}</span>
                        <span className="text-[11px] text-slate-500">{doc.processo.cliente.nome}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sem vínculo</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-700">{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[11px] text-slate-400">{doc.tamanho ? `${(doc.tamanho / 1024).toFixed(1)} MB` : '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600">{doc.responsavel || 'Equipe'}</span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL (UPLOAD) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[hsl(var(--border))] w-full max-w-lg rounded-xl shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Novo Upload</h2>
                <p className="text-xs text-slate-500 mt-0.5">Adicione arquivos ao repositório do sistema</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer group">
                <div className="p-4 bg-white border border-slate-200 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">Arraste seus arquivos aqui</p>
                <p className="text-xs text-slate-500 mt-1">ou clique para selecionar do computador</p>
                <p className="text-[10px] text-slate-400 mt-4">PDF, DWG, PNG ou JPG (Máx: 50MB)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Nome do Arquivo *</Label>
                  <Input name="nome" placeholder="Ex: Escritura_Lote_04.pdf" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Documento *</Label>
                    <Select name="tipo" required>
                      <option value="PDF">PDF</option>
                      <option value="DWG">DWG (CAD)</option>
                      <option value="IMAGEM">IMAGEM</option>
                      <option value="DOCX">WORD / DOCX</option>
                      <option value="OUTRO">OUTROS</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Processo Vinculado</Label>
                    <Select name="processoId">
                      <option value="">Sem vínculo</option>
                      {processos.map(p => (
                        <option key={p.id} value={p.id}>#{p.id.substring(0,6).toUpperCase()} - {p.cliente.nome}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Enviando...' : <><Check className="w-4 h-4" /> Finalizar Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
