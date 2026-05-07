import { useState } from 'react'
import { X, Save } from 'lucide-react'

export function EditClienteModal({
  isOpen,
  onClose,
  cliente,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  cliente: any
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)
  
  if (!isOpen || !cliente) return null

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())
    
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
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
          <h2 className="text-lg font-bold text-slate-800">Editar Cliente</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Nome</label>
            <input name="nome" defaultValue={cliente.nome} className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Telefone</label>
              <input name="telefone" defaultValue={cliente.telefone} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">E-mail</label>
              <input name="email" type="email" defaultValue={cliente.email} className="input-field" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Endereço (Rua, Número, Bairro)</label>
            <input name="endereco" defaultValue={cliente.endereco} className="input-field" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Cidade</label>
              <input name="cidade" defaultValue={cliente.cidade} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Status</label>
              <select name="status" defaultValue={cliente.status || 'ativo'} className="select-field">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
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
