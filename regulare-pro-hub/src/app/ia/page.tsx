'use client'

import { useState } from 'react'
import { 
  Sparkles, Bot, ArrowRight, ArrowLeft, Send, 
  Mic, FileSearch, CheckCircle2, AlertCircle, 
  Download, Share2, ClipboardCheck, Building2,
  MapPin, ShieldCheck, Zap, MessageSquare,
  Globe, Search, History, Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id: 1, title: 'Contexto', icon: Building2 },
  { id: 2, title: 'Identificação', icon: MapPin },
  { id: 3, title: 'Anomalias', icon: AlertCircle },
  { id: 4, title: 'Processamento', icon: Zap },
]

export default function IAPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    tipo: 'Residencial',
    identificacao: '',
    problemas: [] as string[],
    descricao: ''
  })

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const startAnalysis = () => {
    setLoading(true)
    setStep(4)
    // Mocking AI processing
    setTimeout(() => {
      setLoading(false)
      setResult({
        score: 85,
        status: 'Crítico',
        recomendacao: 'Necessário desmembramento e retificação de área antes da averbação da construção.',
        etapas: [
          'Levantamento Topográfico Planialtimétrico',
          'Protocolo de Retificação na Prefeitura',
          'Averbação no RGI'
        ]
      })
    }, 4000)
  }

  const toggleProblema = (p: string) => {
    setFormData(prev => ({
      ...prev,
      problemas: prev.problemas.includes(p) 
        ? prev.problemas.filter(item => item !== p)
        : [...prev.problemas, p]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/20 animate-pulse">
           <Sparkles size={32} />
        </div>
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Diagnóstico Inteligente</h1>
           <p className="text-sm text-slate-500 font-medium max-w-md">Utilize nossa IA treinada em legislação imobiliária para diagnosticar irregularidades em segundos.</p>
        </div>
      </div>

      {/* ── WIZARD PROGRESS ── */}
      {step < 5 && (
        <div className="flex items-center justify-center gap-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4">
              <div className={`flex flex-col items-center gap-2 transition-all ${step >= s.id ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  step === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 
                  step > s.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s.id ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-12 h-px ${step > s.id ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      )}

      {/* ── STEP CONTENT ── */}
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-xl space-y-8"
            >
               <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm space-y-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">TIPO DE IMÓVEL</p>
                     <div className="grid grid-cols-2 gap-4">
                        {['Residencial', 'Comercial', 'Industrial', 'Rural'].map(t => (
                           <button 
                             key={t} onClick={() => setFormData({...formData, tipo: t})}
                             className={`p-6 rounded-3xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-3 ${
                               formData.tipo === t ? 'border-primary bg-primary/5 text-primary shadow-xl shadow-primary/5' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                             }`}
                           >
                              {t}
                           </button>
                        ))}
                     </div>
                  </div>
                  <button onClick={nextStep} className="w-full btn-premium py-4">PRÓXIMO PASSO <ArrowRight size={18} /></button>
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-xl space-y-8"
            >
               <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm space-y-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">IDENTIFICAÇÃO DO IMÓVEL</p>
                     <div className="relative">
                        <textarea 
                          rows={4} placeholder="Informe o endereço completo, número da matrícula ou inscrição imobiliária..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-6 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                          value={formData.identificacao} onChange={e => setFormData({...formData, identificacao: e.target.value})}
                        />
                        <button className="absolute bottom-6 right-6 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
                           <Mic size={18} />
                        </button>
                     </div>
                     <p className="text-[10px] text-slate-400 font-medium italic text-center">A IA cruzará os dados com bases públicas e registros internos.</p>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={prevStep} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-3xl font-bold text-xs uppercase tracking-widest">VOLTAR</button>
                     <button onClick={nextStep} className="flex-[2] btn-premium py-4">ANALISAR DADOS <ArrowRight size={18} /></button>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-2xl space-y-8"
            >
               <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm space-y-10">
                  <div className="space-y-4 text-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ANOMALIAS CONHECIDAS</p>
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight">O que está irregular hoje?</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     {[
                       'Área construída maior que o IPTU',
                       'Falta de Escritura Pública',
                       'Inventário não finalizado',
                       'Divergência de confrontantes',
                       'Loteamento irregular',
                       'Uso do solo em desacordo'
                     ].map(p => (
                       <button 
                         key={p} onClick={() => toggleProblema(p)}
                         className={`p-5 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-3 ${
                           formData.problemas.includes(p) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                         }`}
                       >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.problemas.includes(p) ? 'bg-primary border-primary text-white' : 'border-slate-200'}`}>
                             {formData.problemas.includes(p) && <CheckCircle2 size={10} />}
                          </div>
                          {p}
                       </button>
                     ))}
                  </div>

                  <div className="flex gap-4">
                     <button onClick={prevStep} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-3xl font-bold text-xs uppercase tracking-widest">VOLTAR</button>
                     <button onClick={startAnalysis} className="flex-[2] btn-premium py-4">FINALIZAR DIAGNÓSTICO <Zap size={18} /></button>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg text-center space-y-8"
            >
               <div className="relative">
                  <div className="w-32 h-32 bg-primary/10 rounded-[48px] flex items-center justify-center text-primary mx-auto relative z-10">
                     <motion.div 
                        animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 border-4 border-primary border-t-transparent rounded-[48px]"
                     />
                     <Bot size={48} className="animate-bounce" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 blur-3xl rounded-full" />
               </div>
               
               <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Processando Diagnóstico...</h3>
                  <div className="flex flex-col gap-2 max-w-xs mx-auto">
                     <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 4 }} className="h-full bg-primary" />
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Consultando Legislação Municipal</p>
                  </div>
               </div>

               {result && (
                 <motion.button 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                   onClick={nextStep}
                   className="btn-premium px-10 py-4"
                 >
                    VER RESULTADO <ArrowRight size={18} />
                 </motion.button>
               )}
            </motion.div>
          )}

          {step === 5 && result && (
            <motion.div 
              key="step5" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl space-y-10"
            >
               <div className="bg-slate-900 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-1000" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
                     <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase tracking-[0.2em] font-mono">IA DIAGNÓSTICO COMPLETO</span>
                              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-[0.2em] font-mono">SCORE: {result.score}</span>
                           </div>
                           <h2 className="text-4xl font-bold tracking-tight">Parecer Técnico Preliminar</h2>
                           <p className="text-slate-400 text-lg leading-relaxed">{result.recomendacao}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           {result.etapas.map((e: string, i: number) => (
                              <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-default">
                                 <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{i+1}</div>
                                 <p className="text-sm font-bold text-slate-200">{e}</p>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="w-full md:w-64 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center space-y-4 backdrop-blur-md">
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">DURAÇÃO ESTIMADA</p>
                           <p className="text-3xl font-bold text-white tracking-tighter">4-6 Meses</p>
                           <p className="text-[10px] text-slate-500 font-medium">Sujeito a aprovação de órgãos públicos.</p>
                        </div>
                        <button className="w-full py-5 bg-primary text-white rounded-3xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                           <Download size={18} /> RELATÓRIO PDF
                        </button>
                        <button onClick={() => setStep(1)} className="w-full py-5 bg-white/5 text-slate-400 rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
                           NOVO DIAGNÓSTICO
                        </button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'Viabilidade Jurídica', score: 'Alta', icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'Segurança Notarial', score: 'Pendente', icon: FileSearch, color: 'text-amber-500' },
                    { label: 'Valorização Estimada', score: '+22%', icon: TrendingUp, color: 'text-primary' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-6 rounded-[32px] flex flex-col items-center text-center gap-2 shadow-sm">
                       <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${s.color}`}><s.icon size={20}/></div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{s.label}</p>
                       <p className="text-sm font-bold text-slate-900">{s.score}</p>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}

function TrendingUp(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>
}
