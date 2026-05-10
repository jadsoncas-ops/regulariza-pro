'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, ListTodo, Clock, ShieldCheck, AlertCircle, Save, X } from 'lucide-react'

const STAGES = [
  { id: 'em_analise', label: 'Entrada' },
  { id: 'levantamento', label: 'Levantamento' },
  { id: 'projeto', label: 'Projeto' },
  { id: 'protocolo_prefeitura', label: 'Prefeitura' },
  { id: 'cartorio', label: 'Cartório' },
  { id: 'finalizado', label: 'Conclusão' }
]

export function TaskTemplatesManager() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates/tarefas')
      const data = await res.json()
      setTemplates(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este template de tarefa?')) return
    try {
      await fetch('/api/templates/tarefas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      fetchTemplates()
    } catch (err) { console.error(err) }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">Automação de Tarefas</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Templates automáticos por etapa do processo</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingTemplate(null); setIsModalOpen(true) }}
          className="btn-premium px-4 py-2 text-[10px] uppercase tracking-widest"
        >
          <Plus size={14} className="mr-2" /> Novo Template
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs animate-pulse">CARREGANDO ENGINE...</div>
        ) : (
          <div className="space-y-8">
            {STAGES.map(stage => {
              const stageTemplates = templates.filter(t => t.etapa === stage.id)
              return (
                <div key={stage.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{stage.label}</span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stageTemplates.map(t => (
                      <div key={t.id} className="group p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all shadow-sm relative">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-[11px] font-bold text-slate-800 uppercase leading-tight">{t.titulo}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingTemplate(t); setIsModalOpen(true) }} className="p-1 text-slate-400 hover:text-blue-500 transition-colors"><Edit size={12}/></button>
                            <button onClick={() => handleDelete(t.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mb-3">{t.descricao}</p>
                        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                            <Clock size={10} /> {t.prazo_dias} dias
                          </div>
                          {t.obrigatoria && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase bg-amber-50 px-2 py-0.5 rounded-full">
                              <ShieldCheck size={10} /> Obrigatória
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {stageTemplates.length === 0 && (
                      <div className="md:col-span-2 py-4 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                        <p className="text-[9px] font-bold uppercase tracking-widest">Nenhuma tarefa para esta etapa</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <TemplateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { fetchTemplates(); setIsModalOpen(false) }}
        item={editingTemplate}
      />
    </section>
  )
}

function TemplateModal({ isOpen, onClose, onSuccess, item }: any) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    
    try {
      const res = await fetch('/api/templates/tarefas', {
        method: item ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          id: item?.id,
          obrigatoria: data.obrigatoria === 'on'
        })
      })
      if (res.ok) onSuccess()
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono">{item ? 'Editar Template' : 'Novo Template'}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Configuração de workflow automático</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl shadow-sm"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Etapa do Processo</label>
              <select name="etapa" defaultValue={item?.etapa} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none appearance-none" required>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Título da Tarefa</label>
              <input name="titulo" defaultValue={item?.titulo} required className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none" placeholder="Ex: Conferir Matrícula" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Prazo Automático (dias após ativação)</label>
              <input name="prazo_dias" type="number" defaultValue={item?.prazo_dias || 3} required className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
               <input type="checkbox" name="obrigatoria" defaultChecked={item?.obrigatoria ?? true} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
               <div>
                  <p className="text-[10px] font-bold text-slate-700 uppercase">Tarefa Obrigatória</p>
                  <p className="text-[9px] text-slate-500">Impede o avanço automático se pendente.</p>
               </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Descrição/Instruções</label>
              <textarea name="descricao" defaultValue={item?.descricao} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none min-h-[80px]" placeholder="Instruções para o operador..." />
            </div>
          </div>

          <button disabled={loading} className="w-full btn-premium py-4 font-mono uppercase tracking-widest text-xs">
            {loading ? 'Salvando...' : 'Salvar Template'}
          </button>
        </form>
      </div>
    </div>
  )
}
