'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'

export function EditProcessoModal({
  isOpen,
  onClose,
  processo,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  processo: any
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)
  
  if (!isOpen || !processo) return null

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())
    
    try {
      const res = await fetch(`/api/processos/${processo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Função segura para formatar data para o input
  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return ''
      return d.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Editar Detalhes do Processo</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tipo de Regularização</label>
            <input name="tipo_regularizacao" defaultValue={processo.tipo_regularizacao} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Status Operacional</label>
              <select name="status" defaultValue={processo.status} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-blue-600">
                <option value="em_analise">Em Andamento</option>
                <option value="protocolo_prefeitura">Protocolado</option>
                <option value="pendente">Pendência</option>
                <option value="finalizado">Concluído</option>
                <option value="aprovado">Aprovado</option>
                <option value="documentacao_pendente">Doc. Pendente</option>
                <option value="exigencia_tecnica">Exigência Técnica</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Data de Previsão</label>
              <input 
                name="data_previsao" 
                type="date" 
                defaultValue={formatDateForInput(processo.data_previsao || processo.data_deadline)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Responsável Técnico</label>
            <input name="responsavel" defaultValue={processo.responsavel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" required />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Observações do Processo</label>
            <textarea name="observacoes" defaultValue={processo.observacoes} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[100px]" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-800">
              {saving ? <Save className="animate-pulse" size={18} /> : <Save size={18} />}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
