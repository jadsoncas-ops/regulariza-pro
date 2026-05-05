'use client'

import { useState } from 'react'
import { AlertTriangle, Database, Trash2, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    if (!confirm('ATENÇÃO: Isso apagará TODOS os clientes, imóveis, processos e registros financeiros. Você tem certeza absoluta? O backup já foi feito.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/migrar-tudo')
      if (res.ok) {
        setSuccess(true)
      } else {
        alert('Erro ao resetar o sistema.')
      }
    } catch (e) {
      alert('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        <div className="p-8 bg-slate-900 text-white">
          <div className="flex items-center gap-3 mb-2">
             <Database className="w-6 h-6 text-blue-400" />
             <h1 className="text-xl font-bold">Painel de Controle</h1>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Ferramentas de Manutenção</p>
        </div>

        <div className="p-8 space-y-6">
           {success ? (
             <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                   <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-slate-900">Sistema Zerado!</h2>
                   <p className="text-sm text-slate-500 mt-1">Todos os dados foram removidos com sucesso.</p>
                </div>
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">
                   Ir para o Dashboard
                </Link>
             </div>
           ) : (
             <>
               <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <div>
                     <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Zona de Perigo</p>
                     <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                        Esta ação é irreversível. Certifique-se de que baixou o arquivo de backup antes de prosseguir.
                     </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-sm text-slate-600 font-medium">O que será apagado:</p>
                  <ul className="grid grid-cols-2 gap-2">
                     {['Clientes', 'Imóveis', 'Processos', 'Financeiro', 'Tarefas', 'Documentos'].map(item => (
                       <li key={item} className="flex items-center gap-2 text-[11px] text-slate-500 font-bold bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <Trash2 className="w-3 h-3" /> {item}
                       </li>
                     ))}
                  </ul>
               </div>

               <button 
                 onClick={handleReset}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200 active:scale-[0.98] disabled:opacity-50"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                 Zerar Todo o Sistema
               </button>

               <Link href="/" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Voltar para o Início
               </Link>
             </>
           )}
        </div>

      </div>
    </div>
  )
}
