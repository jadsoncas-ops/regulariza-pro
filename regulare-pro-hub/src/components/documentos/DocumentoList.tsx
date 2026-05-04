'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Trash2, 
  Eye, 
  X, 
  Save, 
  AlertTriangle,
  FileText,
  Upload,
  Download,
  Filter
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

export default function DocumentoList({ initialDocumentos, processos }: DocumentoListProps) {
  const [documentos, setDocumentos] = useState(initialDocumentos)
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredDocs = documentos.filter(d => 
    d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.processo?.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDeleteClick = (doc: Documento) => {
    setSelectedDoc(doc)
    setIsDeleteModalOpen(true)
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    // Simulating upload by creating a record with a fake URL
    try {
      const res = await fetch(`/api/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.nome,
          tipo: data.tipo,
          processoId: data.processoId,
          url: `/uploads/${data.nome}`,
          tamanho: Math.floor(Math.random() * 5000) + 100, // mock size
          responsavel: 'Usuário Atual'
        })
      })

      if (res.ok) {
        const created = await res.json()
        const processoObj = processos.find(p => p.id === created.processoId)
        setDocumentos(prev => [{ ...created, processo: processoObj }, ...prev])
        setIsUploadModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedDoc) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/documentos/${selectedDoc.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocumentos(prev => prev.filter(d => d.id !== selectedDoc.id))
        setIsDeleteModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFormatIcon = (tipo: string) => {
    return <FileText className="w-5 h-5 text-blue-500" />
  }

  return (
    <div className="space-y-8 font-mono">
      
      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/20 p-4 border border-border rounded-sm">
        <div className="relative w-full md:w-[500px] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="BUSCAR NOME DO ARQUIVO OU CLIENTE..."
              className="w-full bg-background border border-border px-10 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 smooth-transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2.5 bg-background border border-border rounded-sm text-muted-foreground hover:bg-muted smooth-transition flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <Filter className="w-4 h-4" /> FILTROS
          </button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-2.5 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center justify-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" /> NOVO UPLOAD
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-border bg-card shadow-md rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 w-16">TIPO</th>
              <th className="px-6 py-4">NOME DO ARQUIVO</th>
              <th className="px-6 py-4">VÍNCULO</th>
              <th className="px-6 py-4">DATA / TAMANHO</th>
              <th className="px-6 py-4 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic tracking-widest">
                  NENHUM DOCUMENTO ENCONTRADO
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/10 smooth-transition group">
                  <td className="px-6 py-5">
                    <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      {getFormatIcon(doc.tipo)}
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-[300px]">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-sm text-foreground tracking-tight truncate">{doc.nome}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold px-1.5 py-0.5 bg-muted/50 border border-border w-fit rounded-sm">
                        {doc.tipo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      {doc.processo ? (
                        <>
                          <div className="text-[10px] font-bold text-foreground">PRC-{doc.processoId?.substring(0,8).toUpperCase()}</div>
                          <div className="text-[9px] text-muted-foreground uppercase">{doc.processo.cliente.nome}</div>
                        </>
                      ) : doc.imovel ? (
                        <>
                          <div className="text-[10px] font-bold text-foreground">IMÓVEL</div>
                          <div className="text-[9px] text-muted-foreground uppercase truncate w-48">{doc.imovel.endereco}</div>
                        </>
                      ) : (
                        <div className="text-[9px] text-muted-foreground uppercase">SEM VÍNCULO</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-bold text-foreground">{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{doc.tamanho ? `${(doc.tamanho / 1024).toFixed(1)} MB` : '--'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-blue-500 smooth-transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground smooth-transition"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(doc)}
                        className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-red-500 smooth-transition"
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

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-sm shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Upload className="w-4 h-4" /> Upload de Documento</h2>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-muted rounded-sm smooth-transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              
              <div className="border-2 border-dashed border-border rounded-sm p-10 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 smooth-transition cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mb-4" />
                <div className="text-xs font-bold uppercase tracking-widest text-foreground">CLIQUE PARA SELECIONAR OU ARRASTE AQUI</div>
                <div className="text-[10px] text-muted-foreground mt-2">PDF, JPG, PNG, DWG (Máx: 50MB)</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome do Arquivo *</label>
                  <input 
                    name="nome"
                    className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="Ex: Planta_Baixa_V1.pdf"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo/Formato *</label>
                  <select name="tipo" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30" required>
                    <option value="PDF">PDF</option>
                    <option value="IMAGEM">IMAGEM</option>
                    <option value="DWG">DWG</option>
                    <option value="DOC">DOC / DOCX</option>
                    <option value="OUTRO">OUTRO</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vincular a Processo</label>
                  <select name="processoId" className="bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="">Nenhum vínculo inicial</option>
                    {processos.map(p => (
                      <option key={p.id} value={p.id}>PRC-{p.id.substring(0,6).toUpperCase()} - {p.cliente.nome} ({p.tipo_regularizacao})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-6 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'ENVIANDO...' : <><Save className="w-3.5 h-3.5" /> CONFIRMAR UPLOAD</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {isDeleteModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest">Excluir Arquivo?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                VOCÊ ESTÁ PRESTES A EXCLUIR <span className="text-foreground font-bold">{selectedDoc.nome}</span>.<br />
                ESTA AÇÃO É IRREVERSÍVEL.
              </p>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 smooth-transition disabled:opacity-50"
                >
                  {isLoading ? 'EXCLUINDO...' : 'CONFIRMAR EXCLUSÃO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
