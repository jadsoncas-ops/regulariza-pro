'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Building2, FolderKanban, 
  DollarSign, Check, ChevronRight, ChevronLeft, 
  Loader2, MapPin, Calculator, Info, Search,
  Copy, HelpCircle, Plus, X, ChevronDown, ChevronUp,
  Briefcase, Trash2, Calendar, Wallet, TrendingUp, TrendingDown, CheckCircle2,
  Settings2, Sparkles, ClipboardList, ListTodo, Layers, GripVertical, SearchIcon,
  FileText
} from 'lucide-react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'

// --- COMPONENTES UI AUXILIARES ---
function Label({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{children}</label>
      {help && (
        <div className="group relative">
          <HelpCircle className="w-3 h-3 text-slate-300 cursor-help hover:text-blue-500 transition-colors" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {help}
          </div>
        </div>
      )}
    </div>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
    />
  )
}

// --- CONSTANTES E MOCK DATA ---
const NATUREZAS = [
  { id: 'regularizacao', label: 'Regularização Imobiliária', icon: Building2, desc: 'Fluxo completo de legalização' },
  { id: 'obra', label: 'Administração de Obra', icon: Settings2, desc: 'Gestão e acompanhamento técnico' },
  { id: 'projeto', label: 'Projeto Arquitetônico', icon: Layers, desc: 'Criação e detalhamento técnico' },
  { id: 'habitese', label: 'Habite-se', icon: CheckCircle2, desc: 'Obtenção de certificado de conclusão' },
  { id: 'averbacao', label: 'Averbação', icon: ClipboardList, desc: 'Atualização de matrícula no cartório' },
  { id: 'desmembramento', label: 'Desmembramento', icon: Sparkles, desc: 'Divisão ou unificação de áreas' },
  { id: 'consultoria', label: 'Consultoria Técnica', icon: HelpCircle, desc: 'Análise e parecer especializado' },
  { id: 'laudo', label: 'Laudo Técnico', icon: FileText, desc: 'Perícia e vistorias detalhadas' },
  { id: 'levantamento', label: 'Levantamento Técnico', icon: MapPin, desc: 'Medições e cadastros in loco' },
]

const CATALOGO_ATIVIDADES = [
  { id: '1', nome: 'Levantamento cadastral', categoria: 'Levantamentos' },
  { id: '2', nome: 'Relatório fotográfico', categoria: 'Levantamentos' },
  { id: '3', nome: 'Projeto arquitetônico', categoria: 'Projetos' },
  { id: '4', nome: 'Memorial descritivo', categoria: 'Documentação' },
  { id: '5', nome: 'Laudo de habitabilidade', categoria: 'Consultoria' },
  { id: '6', nome: 'Emissão de ART/RRT', categoria: 'Documentação' },
  { id: '7', nome: 'Protocolo na prefeitura', categoria: 'Prefeitura' },
  { id: '8', nome: 'Acompanhamento de processo', categoria: 'Protocolos' },
  { id: '9', nome: 'Licença de construção', categoria: 'Prefeitura' },
  { id: '10', nome: 'Solicitação de habite-se', categoria: 'Prefeitura' },
  { id: '11', nome: 'Certidão de área construída', categoria: 'Prefeitura' },
  { id: '12', nome: 'Averbação em cartório', categoria: 'Cartório' },
  { id: '13', nome: 'Vistoria técnica', categoria: 'Levantamentos' },
  { id: '14', nome: 'Levantamento topográfico', categoria: 'Levantamentos' },
  { id: '15', nome: 'Cronoanálise', categoria: 'Gestão de obra' },
  { id: '16', nome: 'Cotação de fornecedores', categoria: 'Gestão de obra' },
  { id: '17', nome: 'Fração Ideal', categoria: 'Prefeitura' },
  { id: '18', nome: 'Instituição e Convenção', categoria: 'Cartório' },
  { id: '19', nome: 'Administração de Obra', categoria: 'Gestão de obra' },
]

const ESCOPOS_SUGERIDOS: Record<string, string[]> = {
  regularizacao: ['1', '2', '3', '4', '5', '6', '7', '8', '10', '11', '12'],
  obra: ['15', '16', '8', '13', '19'],
  projeto: ['1', '3', '4', '6'],
  habitese: ['5', '10', '11'],
  averbacao: ['11', '12', '18'],
  levantamento: ['1', '2', '14', '13'],
}

// --- PÁGINA PRINCIPAL ---
export default function NovoProjetoWizard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <WizardContent />
    </Suspense>
  )
}

function WizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const imovelId = searchParams.get('imovelId')
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  
  // ESTADO DO PROCESSO
  const [processo, setProcesso] = useState({
    tipo: 'completo', // completo, parcial, iniciado, isolado
    natureza: '',
    etapaAtual: 'Levantamento',
    atividades: [] as any[],
    clienteId: '',
    imovelId: '',
    valorTotal: '0',
    receitas: [] as any[],
    despesas: [] as any[],
    codigo: '',
    observacoes: ''
  })

  const [clienteData, setClienteData] = useState({
    nome: '', cpf_cnpj: '', telefone: '', email: '', 
    cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: ''
  })

  const [imovelData, setImovelData] = useState({
    cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '',
    num_matricula: '', area_terreno: '', area_construida: ''
  })

  // AUXILIARES DE BUSCA
  const [existingClientes, setExistingClientes] = useState<any[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [catalogSearch, setCatalogSearch] = useState('')
  const [clientMode, setClientMode] = useState<'existente' | 'novo'>('existente')

  useEffect(() => {
    fetch('/api/clientes').then(r => r.json()).then(d => setExistingClientes(Array.isArray(d) ? d : []))
  }, [])

  // GERAÇÃO DE CÓDIGO
  useEffect(() => {
    if (!processo.codigo) {
      const random = Math.floor(Math.random() * 999).toString().padStart(3, '0')
      setProcesso(prev => ({ ...prev, codigo: `REG-${random}` }))
    }
  }, [processo.codigo])

  // LÓGICA DE GERAÇÃO DE ESCOPO
  useEffect(() => {
    if (processo.natureza && ESCOPOS_SUGERIDOS[processo.natureza]) {
      const atividadesIds = ESCOPOS_SUGERIDOS[processo.natureza]
      const atividades = atividadesIds.map(id => CATALOGO_ATIVIDADES.find(a => a.id === id)).filter(Boolean)
      setProcesso(prev => ({ ...prev, atividades }))
    }
  }, [processo.natureza])

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  // BUSCA DE CEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cliente' | 'imovel') => {
    const rawValue = e.target.value
    const cleanCep = rawValue.replace(/\D/g, '')
    
    if (target === 'cliente') setClienteData(p => ({ ...p, cep: rawValue }))
    else setImovelData(p => ({ ...p, cep: rawValue }))

    if (cleanCep.length === 8) {
      setIsSearchingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          const updates = {
            endereco: data.logradouro.toUpperCase(),
            bairro: data.bairro.toUpperCase(),
            cidade: data.localidade.toUpperCase(),
            estado: data.uf.toUpperCase(),
          }
          if (target === 'cliente') setClienteData(p => ({ ...p, ...updates }))
          else setImovelData(p => ({ ...p, ...updates }))
        }
      } catch (e) { console.error(e) }
      finally { setIsSearchingCep(false) }
    }
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      const selectedNatureza = NATUREZAS.find(n => n.id === processo.natureza)
      
      const payload = {
        cliente: clienteData,
        imovel: imovelData,
        processo: {
          ...processo,
          tipo: selectedNatureza?.label || processo.natureza,
          subservicos: processo.atividades.map(a => a.nome)
        },
        financeiro: {
          valorTotal: processo.valorTotal,
          receitas: processo.receitas,
          despesas: processo.despesas
        },
        clienteId: processo.clienteId || null,
        imovelId: processo.imovelId || null
      }

      const res = await fetch('/api/processos/novo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/processos/${data.id}`)
      }
    } catch (e) { alert('Erro ao salvar processo.') }
    finally { setLoading(false) }
  }

  // --- RENDERS DAS ETAPAS ---

  return (
    <div className="h-screen flex flex-col bg-[#FDFDFD] overflow-hidden">
      
      {/* ── HEADER — Command Center Style ── */}
      <header className="h-[52px] bg-slate-950 border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/processos" className="p-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white uppercase tracking-tighter leading-none">Process Builder</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Etapa {step} de 7</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-blue-500' : 'w-4 bg-white/10'}`} />
          ))}
        </div>

        <button onClick={() => router.back()} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300">
          Cancelar
        </button>
      </header>

      {/* ── WORKSPACE ── */}
      <main className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-6 bg-slate-50/50">
        
        <AnimatePresence mode="wait">
          
          {/* PASSO 1: TIPO DE PROCESSO */}
          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Como deseja iniciar?</h2>
                <p className="text-sm text-slate-500 font-medium">Selecione o modelo operacional do processo</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'completo', label: 'Processo Completo', desc: 'Inicia o fluxo desde o levantamento até a finalização.', icon: Sparkles },
                  { id: 'parcial', label: 'Processo Parcial', desc: 'O processo começa em uma etapa intermediária.', icon: Layers },
                  { id: 'iniciado', label: 'Processo já Iniciado', desc: 'Cliente já possui parte da documentação ou aprovação.', icon: ClipboardList },
                  { id: 'isolado', label: 'Serviço Isolado', desc: 'Criação de apenas uma atividade específica.', icon: ListTodo },
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => { setProcesso(prev => ({ ...prev, tipo: opt.id })); nextStep() }}
                    className={`flex flex-col p-5 rounded-2xl border-2 text-left transition-all group ${processo.tipo === opt.id ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5' : 'border-white bg-white hover:border-slate-200 shadow-sm'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${processo.tipo === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                      <opt.icon size={20} />
                    </div>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{opt.label}</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* PASSO 2: NATUREZA DO SERVIÇO */}
          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Qual a natureza do serviço?</h2>
                <p className="text-sm text-slate-500 font-medium">Isso definirá o esqueleto automático de atividades</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {NATUREZAS.map(nat => (
                  <button 
                    key={nat.id}
                    onClick={() => { setProcesso(prev => ({ ...prev, natureza: nat.id })); (processo.tipo === 'parcial' || processo.tipo === 'iniciado') ? nextStep() : setStep(4) }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group ${processo.natureza === nat.id ? 'border-blue-600 bg-blue-50/50' : 'border-white bg-white hover:border-slate-200 shadow-sm'}`}
                  >
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors ${processo.natureza === nat.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                      <nat.icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight block truncate">{nat.label}</span>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{nat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-center pt-4">
                <button onClick={prevStep} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Voltar</button>
              </div>
            </motion.div>
          )}

          {/* PASSO 3: ETAPA ATUAL (Condicional) */}
          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Onde estamos agora?</h2>
                <p className="text-sm text-slate-500 font-medium">Em qual etapa o processo se encontra atualmente?</p>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {['Levantamento', 'Projeto', 'Prefeitura', 'Habite-se', 'Cartório'].map(etapa => (
                  <button 
                    key={etapa}
                    onClick={() => { setProcesso(prev => ({ ...prev, etapaAtual: etapa })); nextStep() }}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all group ${processo.etapaAtual === etapa ? 'border-blue-600 bg-blue-50/50' : 'border-white bg-white hover:border-slate-200 shadow-sm'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${processo.etapaAtual === etapa ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{etapa}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center pt-4">
                <button onClick={prevStep} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Voltar</button>
              </div>
            </motion.div>
          )}

          {/* PASSO 4: CLIENTE */}
          {step === 4 && (
            <motion.div 
              key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl w-full space-y-6"
            >
               <div className="text-center space-y-2 mb-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quem é o cliente?</h2>
                <div className="flex justify-center gap-2">
                  <button onClick={() => setClientMode('existente')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${clientMode === 'existente' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>Localizar</button>
                  <button onClick={() => setClientMode('novo')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${clientMode === 'novo' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>Novo Cadastro</button>
                </div>
              </div>

              {clientMode === 'existente' ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" placeholder="Digite nome ou CPF..."
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 transition-all"
                      value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                    />
                    {clientSearch && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {existingClientes.filter(c => c.nome.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 5).map(c => (
                          <button key={c.id} onClick={() => { setProcesso(prev => ({ ...prev, clienteId: c.id })); setClienteData(c); setClientSearch(''); nextStep() }}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0 flex justify-between items-center group">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{c.nome}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{c.cpf_cnpj}</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {processo.clienteId && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm"><User size={20} /></div>
                        <div><p className="text-sm font-bold">{clienteData.nome}</p><p className="text-[10px] text-slate-500 font-bold uppercase">{clienteData.cpf_cnpj}</p></div>
                      </div>
                      <button onClick={nextStep} className="btn-premium py-2 px-6">Continuar <ChevronRight size={14} /></button>
                    </div>
                  )}
                </div>
              ) : (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2"><Label>Nome Completo *</Label><Input value={clienteData.nome} onChange={e => setClienteData(p => ({...p, nome: e.target.value}))} /></div>
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label>CPF / CNPJ *</Label><Input value={clienteData.cpf_cnpj} onChange={e => setClienteData(p => ({...p, cpf_cnpj: e.target.value}))} /></div>
                      <div><Label>Telefone *</Label><Input value={clienteData.telefone} onChange={e => setClienteData(p => ({...p, telefone: e.target.value}))} /></div>
                    </div>
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <Label>CEP</Label>
                        <div className="relative">
                          <Input value={clienteData.cep} onChange={e => handleCepChange(e, 'cliente')} placeholder="00000-000" />
                          {isSearchingCep && <Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />}
                        </div>
                      </div>
                      <div className="md:col-span-2"><Label>Endereço</Label><Input value={clienteData.endereco} onChange={e => setClienteData(p => ({...p, endereco: e.target.value}))} /></div>
                      <div><Label>Número</Label><Input value={clienteData.numero} onChange={e => setClienteData(p => ({...p, numero: e.target.value}))} /></div>
                      <div><Label>Bairro</Label><Input value={clienteData.bairro} onChange={e => setClienteData(p => ({...p, bairro: e.target.value}))} /></div>
                      <div className="md:col-span-2"><Label>Cidade</Label><Input value={clienteData.cidade} onChange={e => setClienteData(p => ({...p, cidade: e.target.value}))} /></div>
                      <div><Label>UF</Label><Input value={clienteData.estado} onChange={e => setClienteData(p => ({...p, estado: e.target.value}))} /></div>
                    </div>
                  <div className="col-span-2 flex justify-end gap-2 pt-4 border-t border-slate-50">
                    <button onClick={prevStep} className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Voltar</button>
                    <button onClick={nextStep} className="btn-premium">Continuar <ChevronRight size={14} /></button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* PASSO 5: IMÓVEL */}
          {step === 5 && (
            <motion.div 
              key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl w-full space-y-6"
            >
               <div className="text-center space-y-2 mb-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Onde é o imóvel?</h2>
                <p className="text-sm text-slate-500 font-medium">Informe a localização técnica da regularização</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <Label>CEP</Label>
                  <div className="relative">
                    <Input value={imovelData.cep} onChange={e => handleCepChange(e, 'imovel')} placeholder="00000-000" />
                    {isSearchingCep && <Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />}
                  </div>
                </div>
                <div className="col-span-6"><Label>Endereço</Label><Input value={imovelData.endereco} onChange={e => setImovelData(p => ({...p, endereco: e.target.value}))} /></div>
                <div className="col-span-3"><Label>Número</Label><Input value={imovelData.numero} onChange={e => setImovelData(p => ({...p, numero: e.target.value}))} /></div>
                
                <div className="col-span-5"><Label>Bairro</Label><Input value={imovelData.bairro} onChange={e => setImovelData(p => ({...p, bairro: e.target.value}))} /></div>
                <div className="col-span-5"><Label>Cidade</Label><Input value={imovelData.cidade} onChange={e => setImovelData(p => ({...p, cidade: e.target.value}))} /></div>
                <div className="col-span-2"><Label>UF</Label><Input value={imovelData.estado} onChange={e => setImovelData(p => ({...p, estado: e.target.value}))} /></div>
                <div className="col-span-12 flex justify-end gap-2 pt-4 border-t border-slate-50">
                  <button onClick={prevStep} className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Voltar</button>
                  <button onClick={nextStep} className="btn-premium">Continuar <ChevronRight size={14} /></button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASSO 6: PROCESS BUILDER (ESCOPO & ATIVIDADES) */}
          {step === 6 && (
            <motion.div 
              key="step6" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
              className="w-full h-full flex gap-6"
            >
              {/* Left: Builder Flow */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"><Briefcase size={20} /></div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-tighter leading-none">Fluxo Operacional</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{processo.atividades.length} Atividades Planejadas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 rounded-lg p-2 flex items-center gap-3">
                      <Label>Valor Total</Label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="number" className="pl-6 pr-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold w-28 outline-none focus:ring-2 focus:ring-blue-500/10"
                          value={processo.valorTotal} onChange={e => setProcesso(prev => ({...prev, valorTotal: e.target.value}))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <Reorder.Group axis="y" values={processo.atividades} onReorder={(atvs) => setProcesso(prev => ({...prev, atividades: atvs}))} className="space-y-2">
                      {processo.atividades.map((atv) => (
                        <Reorder.Item key={atv.id} value={atv} className="group relative">
                          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-grab active:cursor-grabbing">
                            <GripVertical size={14} className="text-slate-300 group-hover:text-blue-300" />
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div className="flex-1">
                              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{atv.nome}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{atv.categoria}</p>
                            </div>
                            <button onClick={() => setProcesso(prev => ({...prev, atividades: prev.atividades.filter(a => a.id !== atv.id)}))} className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                    {processo.atividades.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                         <ListTodo size={40} className="mb-4" />
                         <p className="text-xs font-black uppercase tracking-widest">Seu fluxo está vazio</p>
                         <p className="text-[10px] font-bold">Arraste ou clique no catálogo ao lado</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <button 
                      onClick={async () => {
                        const selectedNatureza = NATUREZAS.find(n => n.id === processo.natureza)
                        const nomeModelo = prompt('Nome do Modelo:', selectedNatureza?.label)
                        if (!nomeModelo) return
                        
                        try {
                          await fetch('/api/servicos', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              nome: nomeModelo,
                              sigla: (selectedNatureza?.label || 'MOD').substring(0, 3),
                              categoria: 'MODELO',
                              subservicos: processo.atividades.map(a => a.nome)
                            })
                          })
                          alert('Modelo salvo com sucesso!')
                        } catch (e) { alert('Erro ao salvar modelo') }
                      }}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 hover:text-blue-700 transition-colors"
                    >
                      Salvar como Modelo
                    </button>
                    <div className="flex gap-2">
                      <button onClick={prevStep} className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Voltar</button>
                      <button onClick={nextStep} className="btn-premium py-2.5 px-8">Continuar <ChevronRight size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Catalog */}
              <div className="w-80 flex flex-col shrink-0 min-h-0">
                <div className="mb-4 flex flex-col gap-3">
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">Catálogo de Atividades</h3>
                  
                  {/* Quick Add Form */}
                  <div className="bg-blue-600 p-3 rounded-xl shadow-lg space-y-2">
                    <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">Nova Atividade no Catálogo</p>
                    <div className="flex gap-1">
                      <input 
                        type="text" placeholder="Nome da atividade..."
                        className="flex-1 bg-white/10 border border-white/10 rounded-md px-2 py-1.5 text-[10px] font-bold text-white placeholder:text-white/30 outline-none focus:bg-white/20 transition-all"
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value
                            if (!val) return
                            // Simula salvamento ou adiciona localmente
                            const newItem = { id: Date.now().toString(), nome: val, categoria: 'Personalizado' }
                            setProcesso(prev => ({ ...prev, atividades: [...prev.atividades, newItem] }))
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      <button className="bg-white text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" placeholder="Filtrar catálogo..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/10"
                      value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {['Levantamentos', 'Documentação', 'Projetos', 'Protocolos', 'Prefeitura', 'Cartório', 'Gestão de obra', 'Consultoria', 'Personalizado'].map(cat => {
                      const items = CATALOGO_ATIVIDADES.filter(a => a.categoria === cat && a.nome.toLowerCase().includes(catalogSearch.toLowerCase()))
                      if (items.length === 0) return null
                      return (
                        <div key={cat} className="space-y-2">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">{cat}</h4>
                          <div className="grid grid-cols-1 gap-1.5">
                            {items.map(item => (
                              <button 
                                key={item.id}
                                onClick={() => {
                                  if (!processo.atividades.find(a => a.id === item.id)) {
                                    setProcesso(prev => ({ ...prev, atividades: [...prev.atividades, { ...item, id: Date.now().toString() }] }))
                                  }
                                }}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left group"
                              >
                                <span className="text-[10px] font-bold text-slate-600 truncate">{item.nome}</span>
                                <Plus size={12} className="text-slate-300 group-hover:text-blue-500 shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASSO 7: FINANCEIRO DETALHADO */}
          {step === 7 && (
            <motion.div 
              key="step7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl w-full space-y-6"
            >
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financeiro do Processo</h2>
                <p className="text-sm text-slate-500 font-medium">Configure as receitas do cliente e os repasses de parceiros</p>
              </div>

              <div className="grid grid-cols-12 gap-6 h-[500px]">
                {/* Receitas */}
                <div className="col-span-6 flex flex-col min-h-0 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Receitas (Cliente)</span>
                    </div>
                    <button onClick={() => setProcesso(prev => ({ ...prev, receitas: [...prev.receitas, { id: Date.now().toString(), descricao: `Parcela ${prev.receitas.length + 1}`, valor: '0', data: new Date().toISOString().split('T')[0], status: 'pendente' }] }))} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"><Plus size={16} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    {processo.receitas.map((rec: any) => (
                      <div key={rec.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
                        <div className="col-span-5"><Label>Descrição</Label><input className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold" value={rec.descricao} onChange={e => setProcesso(p => ({...p, receitas: p.receitas.map((r: any) => r.id === rec.id ? {...r, descricao: e.target.value} : r)}))} /></div>
                        <div className="col-span-3"><Label>Valor</Label><input type="number" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold" value={rec.valor} onChange={e => setProcesso(p => ({...p, receitas: p.receitas.map((r: any) => r.id === rec.id ? {...r, valor: e.target.value} : r)}))} /></div>
                        <div className="col-span-4 flex items-end gap-2">
                          <div className="flex-1"><Label>Data</Label><input type="date" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold" value={rec.data} onChange={e => setProcesso(p => ({...p, receitas: p.receitas.map((r: any) => r.id === rec.id ? {...r, data: e.target.value} : r)}))} /></div>
                          <button onClick={() => setProcesso(p => ({...p, receitas: p.receitas.filter((r: any) => r.id !== rec.id)}))} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {processo.receitas.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-30 text-[10px] font-black uppercase tracking-widest"><TrendingUp size={24} className="mb-2" />Sem parcelas lançadas</div>}
                  </div>
                </div>

                {/* Despesas */}
                <div className="col-span-6 flex flex-col min-h-0 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={16} className="text-red-500" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Despesas (Parceiros/Custos)</span>
                    </div>
                    <button onClick={() => setProcesso(prev => ({ ...prev, despesas: [...prev.despesas, { id: Date.now().toString(), parceiro: '', servico: '', valor: '0', data: new Date().toISOString().split('T')[0], status: 'pendente' }] }))} className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-all"><Plus size={16} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    {processo.despesas.map((des: any) => (
                      <div key={des.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
                        <div className="col-span-5"><Label>Parceiro</Label><input className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold" value={des.parceiro} onChange={e => setProcesso(p => ({...p, despesas: p.despesas.map((d: any) => d.id === des.id ? {...d, parceiro: e.target.value} : d)}))} /></div>
                        <div className="col-span-3"><Label>Valor</Label><input type="number" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold" value={des.valor} onChange={e => setProcesso(p => ({...p, despesas: p.despesas.map((d: any) => d.id === des.id ? {...d, valor: e.target.value} : d)}))} /></div>
                        <div className="col-span-4 flex items-end gap-2">
                          <div className="flex-1"><Label>Data</Label><input type="date" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-bold" value={des.data} onChange={e => setProcesso(p => ({...p, despesas: p.despesas.map((d: any) => d.id === des.id ? {...d, data: e.target.value} : d)}))} /></div>
                          <button onClick={() => setProcesso(p => ({...p, despesas: p.despesas.filter((d: any) => d.id !== des.id)}))} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {processo.despesas.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-30 text-[10px] font-black uppercase tracking-widest"><TrendingDown size={24} className="mb-2" />Sem despesas lançadas</div>}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-6 bg-slate-900 rounded-3xl text-white shadow-xl">
                <div className="flex gap-8">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Contrato</p><p className="text-xl font-black">R$ {parseFloat(processo.valorTotal).toLocaleString('pt-BR')}</p></div>
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Despesas</p><p className="text-xl font-black text-red-400">R$ {processo.despesas.reduce((acc: number, d: any) => acc + (parseFloat(d.valor) || 0), 0).toLocaleString('pt-BR')}</p></div>
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Previsto</p><p className="text-xl font-black text-emerald-400">R$ {(parseFloat(processo.valorTotal) - processo.despesas.reduce((acc: number, d: any) => acc + (parseFloat(d.valor) || 0), 0)).toLocaleString('pt-BR')}</p></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={prevStep} className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 hover:text-white transition-colors">Voltar</button>
                  <button onClick={handleFinalSubmit} disabled={loading} className="btn-premium py-3 px-10">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Concluir Cadastro <Check size={18} /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

    </div>
  )
}
