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
        
        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Código do Projeto</label>
              <input name="codigo_projeto" defaultValue={processo.codigo_projeto} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Categoria / Natureza</label>
              <input name="categoria" defaultValue={processo.categoria || processo.tipo_regularizacao} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tipo de Regularização (Exibição)</label>
            <input name="tipo_regularizacao" defaultValue={processo.tipo_regularizacao} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Status Operacional</label>
              <select name="status" defaultValue={processo.status} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-blue-600 appearance-none">
                <option value="em_analise">Em Entrada</option>
                <option value="levantamento">Levantamento</option>
                <option value="projeto">Projeto</option>
                <option value="protocolo_prefeitura">Protocolo Prefeitura</option>
                <option value="cartorio">Cartório</option>
                <option value="finalizado">Conclusão</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Valor Total Contratado (R$)</label>
              <input 
                name="valor_total" 
                type="number" 
                step="0.01"
                defaultValue={processo.valor_total} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-emerald-600" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Data de Previsão</label>
              <input 
                name="data_deadline" 
                type="date" 
                defaultValue={formatDateForInput(processo.data_deadline || processo.data_previsao)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Responsável Técnico</label>
              <input name="responsavel" defaultValue={processo.responsavel} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" required />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Observações do Processo</label>
            <textarea name="observacoes" defaultValue={processo.observacoes} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[100px]" />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-800 active:scale-[0.98]">
              {saving ? <Save className="animate-pulse" size={18} /> : <Save size={18} />}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
