import { useState, useEffect } from 'react'
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Editar Processo</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Tipo de Processo</label>
            <input name="tipo_regularizacao" defaultValue={processo.tipo_regularizacao} className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Status</label>
              <select name="status" defaultValue={processo.status} className="select-field">
                <option value="em_analise">Em Andamento</option>
                <option value="protocolo_prefeitura">Protocolado</option>
                <option value="pendente">Pendência</option>
                <option value="finalizado">Concluído</option>
                <option value="aprovado">Aprovado</option>
                <option value="documentacao_pendente">Doc. Pendente</option>
                <option value="exigencia_tecnica">Exigência</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Data Previsão / Deadline</label>
              <input name="data_previsao" type="date" defaultValue={processo.data_deadline ? new Date(processo.data_deadline).toISOString().split('T')[0] : ''} className="input-field" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Responsável</label>
            <input name="responsavel" defaultValue={processo.responsavel} className="input-field" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Observações</label>
            <textarea name="observacoes" defaultValue={processo.observacoes} className="input-field min-h-[80px]" />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={saving} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
