'use client'

import { useState } from 'react'
import { X, Save, ListTodo, Calendar, User } from 'lucide-react'

export function TaskModal({
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
      const url = `/api/processos/${processoId}/tarefas`
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
            <h2 className="text-lg font-bold text-slate-900">{item ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Atividades</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Título da Tarefa</label>
              <div className="relative">
                <ListTodo className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  name="titulo" 
                  defaultValue={item?.titulo} 
                  placeholder="Ex: Realizar levantamento, Solicitar ART..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Data</label>
                <input 
                  name="data" 
                  type="date" 
                  defaultValue={item?.data ? new Date(item.data).toISOString().split('T')[0] : ''} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Prioridade</label>
                <select 
                  name="prioridade" 
                  defaultValue={item?.prioridade || 'normal'} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all appearance-none"
                >
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Responsável</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  name="responsavel" 
                  defaultValue={item?.responsavel} 
                  placeholder="Nome do responsável..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Descrição</label>
              <textarea 
                name="descricao" 
                defaultValue={item?.descricao} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-[20px] font-bold text-sm hover:bg-slate-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-slate-900 text-white rounded-[20px] font-bold text-sm shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              {loading ? <Save className="animate-spin" size={18}/> : <Save size={18}/>}
              {loading ? 'Salvando...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
