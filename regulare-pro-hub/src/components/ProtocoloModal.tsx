'use client'

import { useState } from 'react'
import { X, Save, Building2, Calendar, FileText } from 'lucide-react'

export function ProtocoloModal({
  isOpen,
  onClose,
  processoId,
  item,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  processoId: string
  item?: any
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    try {
      const url = `/api/processos/${processoId}/protocolos`
      const method = item ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        body: JSON.stringify({ ...data, id: item?.id, processoId })
      })
      
      if (res.ok) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{item ? 'Editar Protocolo' : 'Novo Protocolo em Órgão'}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trâmites Externos</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Órgão Público</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  name="orgao" 
                  defaultValue={item?.orgao} 
                  placeholder="Ex: Prefeitura de São Paulo, Graprohab, Incra..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Número do Protocolo</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  name="numero_protocolo" 
                  defaultValue={item?.numero_protocolo} 
                  placeholder="Ex: 2023/123456-7" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Data de Entrada</label>
                <input 
                  name="data" 
                  type="date" 
                  defaultValue={item?.data ? new Date(item.data).toISOString().split('T')[0] : ''} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Previsão / Prazo</label>
                <input 
                  name="prazo" 
                  type="date" 
                  defaultValue={item?.prazo ? new Date(item.prazo).toISOString().split('T')[0] : ''} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Status do Trâmite</label>
              <select 
                name="status" 
                defaultValue={item?.status || 'em_analise'} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all appearance-none"
              >
                <option value="em_analise">Em Análise</option>
                <option value="exigencia">Em Exigência</option>
                <option value="aprovado">Aprovado / Deferido</option>
                <option value="recusado">Recusado / Indeferido</option>
                <option value="concluido">Finalizado</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-[20px] font-bold text-sm hover:bg-slate-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-slate-900 text-white rounded-[20px] font-bold text-sm shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              {loading ? <Save className="animate-spin" size={18}/> : <Save size={18}/>}
              {loading ? 'Salvando...' : 'Confirmar Protocolo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
