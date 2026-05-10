'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Download, Loader2, FileType, CheckCircle2, AlertCircle } from 'lucide-react'

interface GerarDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  processoId: string
  processoCode: string
}

const TEMPLATES = [
  { id: 'memorial_descritivo', label: 'Memorial Descritivo', icon: FileText },
  { id: 'laudo_tecnico', label: 'Laudo Técnico', icon: FileText },
  { id: 'declaracao_responsabilidade', label: 'Declaração de Responsabilidade', icon: FileText },
  { id: 'capa_protocolo', label: 'Capa de Protocolo', icon: FileText },
]

export function GerarDocumentoModal({ isOpen, onClose, processoId, processoCode }: GerarDocumentoModalProps) {
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf')
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id)
  const [success, setSuccess] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/processos/${processoId}/gerar-documento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate, format })
      })

      if (!res.ok) throw new Error('Falha ao gerar documento')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedTemplate}_${processoCode}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error(error)
      alert('Erro ao gerar documento técnico.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Gerar Documento</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automação de Engenharia</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Selecione o Modelo</label>
                  <div className="grid grid-cols-1 gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                          selectedTemplate === t.id 
                            ? 'border-blue-600 bg-blue-50 text-blue-900' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <t.icon size={18} className={selectedTemplate === t.id ? 'text-blue-600' : 'text-slate-400'} />
                        <span className="text-[13px] font-bold">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Formato de Saída</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button
                      onClick={() => setFormat('pdf')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        format === 'pdf' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <FileType size={14} /> PDF
                    </button>
                    <button
                      onClick={() => setFormat('docx')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        format === 'docx' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <FileText size={14} /> DOCX
                    </button>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || success}
                  className={`w-full py-5 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                    success 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : success ? (
                    <> <CheckCircle2 size={18} /> Gerado com Sucesso </>
                  ) : (
                    <> <Download size={18} /> Iniciar Geração </>
                  )}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium">
                  Os dados serão extraídos automaticamente do processo <strong>{processoCode}</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
