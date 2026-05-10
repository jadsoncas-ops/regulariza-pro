'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Loader2, AlertCircle, Building2, Zap } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Falha na autenticação')
      }

      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden shadow-blue-500/5">
          <div className="p-10">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-6 group hover:rotate-12 transition-transform">
                <Lock size={32} />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Regulariza Pro</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                <Zap size={12} className="text-blue-500" /> Dashboard Administrativo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    required
                    placeholder="exemplo@regulapro.com.br"
                    className="w-full h-14 bg-slate-800/50 border border-slate-700 rounded-2xl px-6 text-sm font-bold text-white focus:bg-slate-800 focus:border-blue-500 transition-all outline-none placeholder:text-slate-600"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Senha de Acesso</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full h-14 bg-slate-800/50 border border-slate-700 rounded-2xl px-6 text-sm font-bold text-white focus:bg-slate-800 focus:border-blue-500 transition-all outline-none placeholder:text-slate-600"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-red-500/10 rounded-2xl flex items-center gap-3 text-red-400 border border-red-500/20"
                >
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-[0.98]"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>Autenticar Dashboard <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-950/50 p-8 border-t border-slate-800 flex flex-col items-center gap-2">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">SaaS Security Layer v2.0</p>
            <div className="flex items-center gap-2 text-slate-400 opacity-50">
               <Building2 size={14} />
               <span className="text-[10px] font-black uppercase tracking-tight">Acesso Restrito a Colaboradores</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
