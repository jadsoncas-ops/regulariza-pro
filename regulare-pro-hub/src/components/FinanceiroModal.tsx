'use client'

import { useState, useEffect } from 'react'
import { X, Save, DollarSign, Calendar, Tag } from 'lucide-react'

export function FinanceiroModal({
  isOpen,
  onClose,
  processoId,
  processoTotal,
  item,
  onSuccess,
  currentLançamentos = []
}: {
  isOpen: boolean
  onClose: () => void
  processoId: string
  processoTotal: number
  item?: any
  onSuccess: () => void
  currentLançamentos?: any[]
}) {
  const [loading, setLoading] = useState(false)
  
  if (!isOpen) return null

  // Calcular saldo restante para lançar
  const jaLancado = currentLançamentos
    .filter(f => f.tipo === 'receita')
    .reduce((acc, curr) => acc + curr.valor, 0)
  const saldoRestante = Math.max(0, (processoTotal || 0) - jaLancado)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    try {
      const url = `/api/processos/${processoId}/financeiro`
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
            <h2 className="text-lg font-bold text-slate-900">{item ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Fluxo de Caixa</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!item && saldoRestante > 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                     <DollarSign size={16}/>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Saldo a Lançar</p>
                     <p className="text-sm font-bold text-emerald-700">R$ {saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
               </div>
               <button 
                 type="button"
                 onClick={() => {
                   const input = document.getElementById('valor-input') as HTMLInputElement
                   if (input) input.value = saldoRestante.toString()
                 }}
                 className="text-[10px] font-bold text-emerald-600 hover:underline uppercase"
               >
                 Usar Saldo
               </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Descrição do Lançamento</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  name="descricao" 
                  defaultValue={item?.descricao} 
                  placeholder="Ex: Parcela 01, Taxa de Protocolo..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Valor (R$)</label>
                <input 
                  id="valor-input"
                  name="valor" 
                  type="number" 
                  step="0.01" 
                  defaultValue={item?.valor} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Tipo</label>
                <select 
                  name="tipo" 
                  defaultValue={item?.tipo || 'receita'} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all appearance-none"
                >
                  <option value="receita">Receita (Entrada)</option>
                  <option value="despesa">Despesa (Saída)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Vencimento</label>
                <input 
                  name="data_vencimento" 
                  type="date" 
                  defaultValue={item?.data_vencimento ? new Date(item.data_vencimento).toISOString().split('T')[0] : ''} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={item?.status || 'pendente'} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all appearance-none"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago / Recebido</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-[20px] font-bold text-sm hover:bg-slate-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-slate-900 text-white rounded-[20px] font-bold text-sm shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              {loading ? <Save className="animate-spin" size={18}/> : <Save size={18}/>}
              {loading ? 'Salvando...' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
