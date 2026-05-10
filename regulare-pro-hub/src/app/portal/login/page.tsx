'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, Building2 } from 'lucide-react'

export default function PortalLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ identifier: '', code: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Acesso negado')
      }

      router.push('/portal')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-6">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portal do Cliente</h1>
              <p className="text-sm text-slate-500 font-medium mt-2">Acompanhe seu processo em tempo real</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">CPF ou CNPJ</label>
                  <input 
                    type="text" 
                    required
                    placeholder="000.000.000-00"
                    className="w-full h-14 bg-slate-50 border-transparent rounded-2xl px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    value={formData.identifier}
                    onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Código de Acesso</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••"
                    className="w-full h-14 bg-slate-50 border-transparent rounded-2xl px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600 border border-red-100"
                >
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>Entrar no Portal <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-8 border-t border-slate-100 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tecnologia por</p>
            <div className="flex items-center gap-2 text-slate-800">
               <Building2 size={16} className="text-blue-600" />
               <span className="text-xs font-black uppercase tracking-tight">Regulare Pro Engine</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
