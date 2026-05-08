'use client'

import { useState, useEffect } from 'react'
import { X, Save, DollarSign, Calendar, Tag, TrendingUp, Users, RefreshCw, Check } from 'lucide-react'

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
  const [repasses, setRepasses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [includeRepasse, setIncludeRepasse] = useState(false)
  
  if (!isOpen) return null

  // Calcular saldo restante para lançar
  const jaLancado = currentLançamentos
    ?.filter(f => f.tipo === 'receita')
    .reduce((acc, curr) => acc + curr.valor, 0) || 0
  const saldoRestante = Math.max(0, (processoTotal || 0) - jaLancado)

  const addRepasse = () => {
    setRepasses([...repasses, { id: Date.now(), nome: '', valor: 0, status: 'pendente' }])
  }

  const removeRepasse = (id: number) => {
    setRepasses(repasses.filter(r => r.id !== id))
  }

  const updateRepasse = (id: number, field: string, value: any) => {
    setRepasses(repasses.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    try {
      const url = `/api/processos/${processoId}/financeiro`
      
      // 1. Lançamento Principal
      const payloadPrincipal = {
        descricao: data.descricao,
        valor: parseFloat(data.valor as string),
        tipo: data.tipo,
        status: data.status,
        data_vencimento: data.data_vencimento ? new Date(data.data_vencimento as string).toISOString() : null,
        valor_pago: data.status === 'pago' ? parseFloat(data.valor as string) : 0,
        data_pagamento: data.status === 'pago' ? new Date().toISOString() : null,
      }
      
      const res1 = await fetch(url, {
        method: item ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...payloadPrincipal, id: item?.id, processoId })
      })

      if (!res1.ok) {
        const error = await res1.json()
        throw new Error(error.error || 'Erro no lançamento principal')
      }
      
      // 2. Lançamentos de Repasse (Múltiplos)
      if (includeRepasse && !item) {
        for (const repasse of repasses) {
          if (!repasse.nome || !repasse.valor) continue

          const payloadRepasse = {
            descricao: `Repasse: ${repasse.nome} (${data.descricao})`,
            valor: parseFloat(repasse.valor.toString()),
            valor_pago: repasse.status === 'pago' ? parseFloat(repasse.valor.toString()) : 0,
            data_pagamento: repasse.status === 'pago' ? new Date().toISOString() : null,
            tipo: 'despesa',
            is_repasse: true,
            status: repasse.status,
            data_vencimento: data.data_vencimento ? new Date(data.data_vencimento as string).toISOString() : null,
          }
          
          await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ ...payloadRepasse, processoId })
          })
        }
      }
      
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      alert(`Falha ao salvar: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <DollarSign size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900">{item ? 'Editar Lançamento' : 'Gestão Financeira'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fluxo de Caixa do Projeto</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
          {!item && saldoRestante > 0 && (
            <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-[24px] flex items-center justify-between group">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-emerald-200 shadow-lg group-hover:scale-105 transition-transform">
                     <TrendingUp size={18}/>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Saldo a Lançar</p>
                     <p className="text-lg font-black text-emerald-700 font-mono">R$ {saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
               </div>
               <button 
                 type="button"
                 onClick={() => {
                   const input = document.getElementById('valor-input') as HTMLInputElement
                   if (input) input.value = saldoRestante.toString()
                 }}
                 className="px-4 py-2 bg-white border border-emerald-200 rounded-xl text-[10px] font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
               >
                 LANÇAR TUDO
               </button>
            </div>
          )}

          <div className="space-y-6">
            {/* LANÇAMENTO PRINCIPAL */}
            <div className="grid grid-cols-1 gap-6 p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full" />
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Lançamento Principal</h4>
               </div>
               
               <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Descrição</label>
                 <input 
                   name="descricao" 
                   defaultValue={item?.descricao} 
                   placeholder="Ex: Parcela Única, Honorários..." 
                   className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                   required 
                 />
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
                     className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                     required 
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Tipo</label>
                   <select 
                     name="tipo" 
                     defaultValue={item?.tipo || 'receita'} 
                     className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all appearance-none"
                   >
                     <option value="receita">Receita (Honorários)</option>
                     <option value="despesa">Despesa (Geral)</option>
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
                     className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                     required
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Status</label>
                   <select 
                     name="status" 
                     defaultValue={item?.status || 'pendente'} 
                     className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all appearance-none"
                   >
                     <option value="pendente">Pendente</option>
                     <option value="pago">Já Pago / Recebido</option>
                   </select>
                 </div>
               </div>
            </div>

            {/* REPASSES A PARCEIROS */}
            {!item && (
              <div className={`p-6 rounded-[32px] border-2 transition-all ${includeRepasse ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' : 'bg-white border-dashed border-slate-200 opacity-60'}`}>
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${includeRepasse ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                         <Users size={16}/>
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Repasses a Parceiros</p>
                         <p className="text-[9px] text-slate-400 font-medium">Comissões e prestadores externos</p>
                      </div>
                   </div>
                   <button 
                     type="button" 
                     onClick={() => {
                       if (!includeRepasse) { setIncludeRepasse(true); if (repasses.length === 0) addRepasse() }
                       else setIncludeRepasse(false)
                     }}
                     className={`w-12 h-6 rounded-full relative transition-all duration-300 ${includeRepasse ? 'bg-indigo-500' : 'bg-slate-200'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${includeRepasse ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                {includeRepasse && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 mt-6">
                     {repasses.map((repasse, idx) => (
                       <div key={repasse.id} className="p-5 bg-white rounded-[24px] border border-indigo-100 shadow-sm space-y-4 relative group">
                          <button 
                            type="button" 
                            onClick={() => removeRepasse(repasse.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <X size={12}/>
                          </button>

                          <div>
                             <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Parceiro {idx + 1}</label>
                             <input 
                               value={repasse.nome}
                               onChange={(e) => updateRepasse(repasse.id, 'nome', e.target.value)}
                               placeholder="Ex: Arquiteto, Projetista..." 
                               className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-indigo-300 transition-all"
                             />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Valor</label>
                                <input 
                                  type="number"
                                  value={repasse.valor}
                                  onChange={(e) => updateRepasse(repasse.id, 'valor', e.target.value)}
                                  placeholder="0,00"
                                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-indigo-600 outline-none focus:border-indigo-300 transition-all"
                                />
                             </div>
                             <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Status</label>
                                <select 
                                  value={repasse.status}
                                  onChange={(e) => updateRepasse(repasse.id, 'status', e.target.value)}
                                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-300 transition-all appearance-none"
                                >
                                  <option value="pendente">A Pagar</option>
                                  <option value="pago">Liquidado</option>
                                </select>
                             </div>
                          </div>
                       </div>
                     ))}
                     
                     <button 
                       type="button" 
                       onClick={addRepasse}
                       className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-2xl text-[10px] font-bold text-indigo-500 uppercase hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                     >
                        <Plus size={14}/> ADICIONAR OUTRO PARCEIRO
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-5 bg-slate-50 text-slate-600 rounded-[24px] font-bold text-sm hover:bg-slate-100 transition-all">Descartar</button>
            <button type="submit" disabled={loading} className="flex-[1.5] py-5 bg-slate-900 text-white rounded-[24px] font-bold text-sm shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
              {loading ? <RefreshCw className="animate-spin" size={20}/> : <Check size={20} strokeWidth={3}/>}
              {loading ? 'Processando...' : 'Confirmar e Sincronizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
