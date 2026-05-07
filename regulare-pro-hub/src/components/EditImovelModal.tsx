import { useState } from 'react'
import { X, Save } from 'lucide-react'

export function EditImovelModal({
  isOpen,
  onClose,
  imovel,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  imovel: any
  onSuccess: () => void
}) {
  const [saving, setSaving] = useState(false)
  
  if (!isOpen || !imovel) return null

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())
    
    // Parse numeric fields
    if (payload.area_terreno) payload.area_terreno = parseFloat(payload.area_terreno as string) as any
    if (payload.area_construida) payload.area_construida = parseFloat(payload.area_construida as string) as any

    try {
      const res = await fetch(`/api/imoveis/${imovel.id}`, {
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
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Editar Imóvel</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Endereço</label>
              <input name="endereco" defaultValue={imovel.endereco} className="input-field" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Bairro</label>
              <input name="bairro" defaultValue={imovel.bairro} className="input-field" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Cidade</label>
              <input name="cidade" defaultValue={imovel.cidade} className="input-field" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Matrícula</label>
              <input name="num_matricula" defaultValue={imovel.num_matricula} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Área do Terreno (m²)</label>
              <input name="area_terreno" type="number" step="0.01" defaultValue={imovel.area_terreno} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Área Construída (m²)</label>
              <input name="area_construida" type="number" step="0.01" defaultValue={imovel.area_construida} className="input-field" />
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
