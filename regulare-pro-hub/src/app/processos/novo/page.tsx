'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Building2, FolderKanban, 
  DollarSign, Check, ChevronRight, ChevronLeft, 
  Loader2, MapPin, Calculator, Info, Search,
  Copy, HelpCircle, Plus, X, ChevronDown, ChevronUp,
  Briefcase, Trash2, Calendar, Wallet, TrendingUp, TrendingDown, CheckCircle2
} from 'lucide-react'

// --- COMPONENTES UI AUXILIARES ---
function Label({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{children}</label>
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
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
    />
  )
}

function WizardStep({ step: stepNum, current, icon: Icon, title, done }: { step: number; current: number; icon: any; title: string; done: boolean }) {
  const active = stepNum === current
  const past = done || stepNum < current
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-[10px] font-bold ${
        past ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-slate-100 text-slate-400'
      }`}>
        {past && !active ? <Check className="w-3 h-3" /> : stepNum}
      </div>
      <span className={`text-[12px] font-semibold whitespace-nowrap hidden sm:block ${
        active ? 'text-slate-900' : past ? 'text-slate-500' : 'text-slate-300'
      }`}>{title}</span>
    </div>
  )
}

// --- PÁGINA PRINCIPAL COM SUSPENSE ---
export default function NovoProjetoWizard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <WizardContent />
    </Suspense>
  )
}

const CATEGORIAS_PADRAO = [
  'Regularização',
  'Projetos',
  'Laudos Técnicos',
  'Consultoria',
  'Levantamentos',
  'Administração de Obras'
]

function WizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const imovelId = searchParams.get('imovelId')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false)
  const [isNewActivityModalOpen, setIsNewActivityModalOpen] = useState(false)
  const [newActivityName, setNewActivityName] = useState('')
  const [customAtividades, setCustomAtividades] = useState<string[]>([])
  
  const [servicosDisponiveis, setServicosDisponiveis] = useState<any[]>([])
  const [existingClientes, setExistingClientes] = useState<any[]>([])
  const [existingImoveis, setExistingImoveis] = useState<any[]>([])
  const [loadingServicos, setLoadingServicos] = useState(true)
  const [selectedClienteId, setSelectedClienteId] = useState<string>('')
  const [selectedImovelId, setSelectedImovelId] = useState<string>('')

  // ESTADO GLOBAL DO WIZARD
  const [formData, setFormData] = useState({
    cliente: { 
      nome: '', cpf_cnpj: '', rg_ie: '', telefone: '', email: '', 
      cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
      observacoes: '' 
    },
    imovel: { 
      cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
      area_terreno: '', area_construida: '', num_matricula: '', cartorio: '', inscricao_imobiliaria: '', zoneamento: '', observacoes: '',
      isProprietario: true,
      proprietario_nome: '', proprietario_doc: '', proprietario_tel: '', proprietario_email: ''
    },
    processo: { 
      categoria: 'Regularização',
      tipo: '', 
      codigo_projeto: '', 
      observacoes: '',
      subservicos: [] as string[]
    },
    financeiro: { 
      valorTotal: '0', 
      receitas: [] as any[],
      despesas: [] as any[]
    }
  })

  // NOVOS ESTADOS PARA UI MELHORADA
  const [clientMode, setClientMode] = useState<'existente' | 'novo'>('existente')
  const [clientSearch, setClientSearch] = useState('')
  const [imovelMode, setImovelMode] = useState<'existente' | 'novo'>('existente')
  const [imovelSearch, setImovelSearch] = useState('')


  // Estado para criação de novo serviço
  const [newService, setNewService] = useState({
    nome: '', sigla: '', categoria: 'Regularização', descricao: ''
  })

  // BUSCAR SERVIÇOS E CLIENTES
  const fetchData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch('/api/servicos'),
        fetch('/api/clientes')
      ])
      const [sData, cData] = await Promise.all([sRes.json(), cRes.json()])
      
      if (Array.isArray(sData)) setServicosDisponiveis(sData)
      if (Array.isArray(cData)) setExistingClientes(cData)
    } catch (e) { 
      console.error('Erro ao buscar dados:', e) 
    } finally {
      setLoadingServicos(false)
    }
  }

  // BUSCAR IMÓVEIS DO CLIENTE SELECIONADO
  useEffect(() => {
    if (selectedClienteId) {
      fetch(`/api/clientes/${selectedClienteId}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.imoveis) setExistingImoveis(data.imoveis)
        })
    }
  }, [selectedClienteId])

  // BUSCAR DADOS DO IMÓVEL SE HOUVER ID
  useEffect(() => {
    if (imovelId) {
      setLoading(true)
      fetch(`/api/imoveis/${imovelId}`)
        .then(r => r.json())
        .then(data => {
          if (data && !data.error) {
            setFormData(prev => ({
              ...prev,
              cliente: {
                ...prev.cliente,
                nome: data.cliente.nome,
                cpf_cnpj: data.cliente.cpf_cnpj || '',
                telefone: data.cliente.telefone || '',
                email: data.cliente.email || '',
              },
              imovel: {
                ...prev.imovel,
                cep: data.cep || '',
                endereco: data.endereco || '',
                numero: data.numero || '',
                bairro: data.bairro || '',
                cidade: data.cidade || '',
                estado: data.estado || '',
                area_terreno: data.area_terreno || '',
                area_construida: data.area_construida || '',
                num_matricula: data.num_matricula || '',
              }
            }))
            // Pula para a etapa de serviço se já temos os dados
            setStep(3)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [imovelId])

  // GERAÇÃO AUTOMÁTICA DE CÓDIGO (NOVO PADRÃO: SIGLA-001)
  useEffect(() => {
    fetchData()
  }, [])
  
  useEffect(() => {
    const servico = servicosDisponiveis.find(s => s.nome === formData.processo.tipo)
    if (servico) {
      const sigla = (servico.sigla || 'REG').toUpperCase()
      
      // Busca contagem para gerar o número (simulado aqui, o ideal seria API, mas faremos randômico único se não houver API)
      const random = Math.floor(Math.random() * 999).toString().padStart(3, '0')
      const codigo = `${sigla}-${random}`
      
      setFormData(prev => ({...prev, processo: {...prev.processo, codigo_projeto: codigo}}))
    }
  }, [formData.processo.tipo, servicosDisponiveis])

  // MÁSCARAS
  const maskCpfCnpj = (v: string) => {
    v = v.replace(/\D/g, "")
    if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const maskPhone = (v: string) => {
    v = v.replace(/\D/g, "")
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const maskCep = (v: string) => {
    v = v.replace(/\D/g, "")
    return v.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  // BUSCA DE CEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cliente' | 'imovel') => {
    const rawValue = e.target.value
    const cleanCep = rawValue.replace(/\D/g, '')
    const maskedValue = maskCep(rawValue)

    setFormData(prev => ({
      ...prev,
      [target]: { ...prev[target as keyof typeof prev], cep: maskedValue }
    }))

    if (cleanCep.length === 8) {
      setIsSearchingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            [target]: {
              ...prev[target as keyof typeof prev],
              endereco: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf,
            }
          }))
          setTimeout(() => {
            const numInput = document.getElementsByName(`${target}_numero`)[0] as HTMLInputElement
            if (numInput) numInput.focus()
          }, 100)
        }
      } catch (e) { console.error(e) }
      finally { setIsSearchingCep(false) }
    }
  }

  const copyAddressFromCliente = () => {
    setFormData(prev => ({
      ...prev,
      imovel: {
        ...prev.imovel,
        cep: prev.cliente.cep,
        endereco: prev.cliente.endereco,
        numero: prev.cliente.numero,
        complemento: prev.cliente.complemento,
        bairro: prev.cliente.bairro,
        cidade: prev.cliente.cidade,
        estado: prev.cliente.estado,
      }
    }))
  }

  // GERENCIAMENTO DE FINANCEIRO
  const addReceita = () => {
    setFormData(prev => ({
      ...prev,
      financeiro: {
        ...prev.financeiro,
        receitas: [...prev.financeiro.receitas, { id: Date.now().toString(), descricao: `Parcela ${prev.financeiro.receitas.length + 1}`, valor: '0', data: new Date().toISOString().split('T')[0], status: 'pendente' }]
      }
    }))
  }

  const addDespesa = () => {
    setFormData(prev => ({
      ...prev,
      financeiro: {
        ...prev.financeiro,
        despesas: [...prev.financeiro.despesas, { id: Date.now().toString(), parceiro: '', servico: '', valor: '0', data: new Date().toISOString().split('T')[0], status: 'pendente' }]
      }
    }))
  }

  const removeFinanceiro = (id: string, target: 'receitas' | 'despesas') => {
    setFormData(prev => ({
      ...prev,
      financeiro: {
        ...prev.financeiro,
        [target]: prev.financeiro[target].filter((item: any) => item.id !== id)
      }
    }))
  }

  const updateFinanceiro = (id: string, target: 'receitas' | 'despesas', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      financeiro: {
        ...prev.financeiro,
        [target]: prev.financeiro[target].map((item: any) => 
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }))
  }

  // CÁLCULOS FINANCEIROS AVANÇADOS
  const fin = useMemo(() => {
    const totalContrato = parseFloat(formData.financeiro.valorTotal) || 0
    
    const recebido = formData.financeiro.receitas
      .filter((r: any) => r.status === 'pago')
      .reduce((sum: number, r: any) => sum + (parseFloat(r.valor) || 0), 0)
    
    const aReceber = formData.financeiro.receitas
      .filter((r: any) => r.status === 'pendente')
      .reduce((sum: number, r: any) => sum + (parseFloat(r.valor) || 0), 0)

    const despesasPagas = formData.financeiro.despesas
      .filter((d: any) => d.status === 'pago')
      .reduce((sum: number, d: any) => sum + (parseFloat(d.valor) || 0), 0)

    const despesasAPagar = formData.financeiro.despesas
      .filter((d: any) => d.status === 'pendente')
      .reduce((sum: number, d: any) => sum + (parseFloat(d.valor) || 0), 0)

    const despesasTotais = despesasPagas + despesasAPagar

    return {
      totalContrato,
      recebido,
      aReceber,
      despesasPagas,
      despesasAPagar,
      despesasTotais,
      lucroRealizado: recebido - despesasPagas,
      lucroPrevisto: totalContrato - despesasTotais
    }
  }, [formData.financeiro])

  // CRIAR NOVO SERVIÇO
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      })
      if (res.ok) {
        await fetchData()
        setIsNewServiceModalOpen(false)
        setNewService({ nome: '', sigla: '', categoria: 'Regularização', descricao: '' })
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // SALVAMENTO FINAL
  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...formData,
        clienteId: selectedClienteId || null,
        imovelId: selectedImovelId || imovelId || null
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
    } catch (e) { alert('Erro ao salvar projeto.') }
    finally { setLoading(false) }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const groupedServicos = useMemo(() => {
    const groups: Record<string, any[]> = {}
    servicosDisponiveis.forEach(s => {
      if (!groups[s.categoria]) groups[s.categoria] = []
      groups[s.categoria].push(s)
    })
    return groups
  }, [servicosDisponiveis])

  const filteredClients = useMemo(() => {
    if (!clientSearch) return []
    return existingClientes.filter(c => 
      c.nome.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.cpf_cnpj.includes(clientSearch)
    ).slice(0, 5)
  }, [existingClientes, clientSearch])

  const filteredImoveis = useMemo(() => {
    if (!imovelSearch) return []
    return existingImoveis.filter(i => 
      i.endereco.toLowerCase().includes(imovelSearch.toLowerCase()) || 
      (i.num_matricula && i.num_matricula.includes(imovelSearch))
    ).slice(0, 5)
  }, [existingImoveis, imovelSearch])



  const selectedServicoData = servicosDisponiveis.find(s => s.nome === formData.processo.tipo)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F7FB' }}>

      {/* WIZARD HEADER — compact dark bar inspired by second photo */}
      <div style={{ background: '#0A0C11', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        {/* Left: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/processos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, color: '#6B7280', textDecoration: 'none', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <ArrowLeft size={14} />
          </Link>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E5E7EB', letterSpacing: '-0.02em' }}>Novo Processo</div>
            <div style={{ fontSize: 10, color: '#4B5563' }}>Cadastro unificado — {step} de 4</div>
          </div>
        </div>

        {/* Center: step pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { n: 1, icon: User, label: 'Cliente' },
            { n: 2, icon: Building2, label: 'Imóvel' },
            { n: 3, icon: FolderKanban, label: 'Serviço' },
            { n: 4, icon: DollarSign, label: 'Financeiro' },
          ].map((s, i) => (
            <>
              {i > 0 && <div key={`div-${s.n}`} style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.1)' }} />}
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20,
                background: step === s.n ? 'rgba(59,130,246,0.2)' : 'transparent',
                border: step === s.n ? '1px solid rgba(59,130,246,0.35)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800,
                  background: s.n < step ? '#2563EB' : s.n === step ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                  color: s.n <= step ? '#fff' : '#4B5563',
                }}>
                  {s.n < step ? <Check size={9} /> : s.n}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: s.n === step ? '#93C5FD' : s.n < step ? '#6B7280' : '#374151', display: 'none' }} className="sm:block">{s.label}</span>
              </div>
            </>
          ))}
        </div>

        {/* Right: cancel */}
        <Link href="/processos" style={{ fontSize: 12, color: '#4B5563', textDecoration: 'none', padding: '5px 10px', borderRadius: 7, transition: 'color 0.12s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}>
          Cancelar
        </Link>
      </div>

      {/* STEP CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          
          {/* STEP 1: CLIENTE */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {/* SELETOR DE MODO */}
              <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full max-w-sm mx-auto mb-8 border border-slate-200">
                <button 
                  onClick={() => setClientMode('existente')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${clientMode === 'existente' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Cliente Existente
                </button>
                <button 
                  onClick={() => {
                    setClientMode('novo')
                    setSelectedClienteId('')
                    setFormData(prev => ({ ...prev, cliente: { nome: '', cpf_cnpj: '', rg_ie: '', telefone: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', observacoes: '' } }))
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${clientMode === 'novo' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Novo Cliente
                </button>
              </div>

              {clientMode === 'existente' ? (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Search className="w-5 h-5" /></div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Buscar Cliente</h2>
                        <p className="text-xs text-slate-500">Digite o nome ou CPF/CNPJ para localizar</p>
                      </div>
                    </div>

                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl text-sm bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700 transition-all"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                      />
                      
                      {filteredClients.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                          {filteredClients.map(c => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSelectedClienteId(c.id)
                                setFormData(prev => ({ ...prev, cliente: { ...c } }))
                                setClientSearch('')
                              }}
                              className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <div className="text-sm font-bold text-slate-900">{c.nome}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">{c.cpf_cnpj}</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedClienteId && (
                      <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{formData.cliente.nome}</div>
                              <div className="text-xs text-slate-500">{formData.cliente.email || 'Sem e-mail'} • {formData.cliente.telefone}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedClienteId('')
                              setFormData(prev => ({ ...prev, cliente: { nome: '', cpf_cnpj: '', rg_ie: '', telefone: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', observacoes: '' } }))
                            }}
                            className="p-2 hover:bg-blue-100 text-blue-400 rounded-xl transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* FORMULÁRIO NOVO CLIENTE */}
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><User className="w-5 h-5" /></div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Novo Cliente</h2>
                        <p className="text-xs text-slate-500">Preencha os dados fundamentais</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label>Nome Completo / Razão Social *</Label>
                        <Input placeholder="Ex: João da Silva / Construtora X" value={formData.cliente.nome} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, nome: e.target.value}}))} />
                      </div>
                      <div>
                        <Label>CPF ou CNPJ *</Label>
                        <Input placeholder="000.000.000-00" value={formData.cliente.cpf_cnpj} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, cpf_cnpj: maskCpfCnpj(e.target.value)}}))} />
                      </div>
                      <div>
                        <Label>Telefone / WhatsApp *</Label>
                        <Input placeholder="(00) 00000-0000" value={formData.cliente.telefone} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, telefone: maskPhone(e.target.value)}}))} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>E-mail Principal</Label>
                        <Input type="email" placeholder="cliente@email.com" value={formData.cliente.email} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, email: e.target.value}}))} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>RG / Inscrição Estadual</Label>
                        <Input placeholder="RG ou IE" value={formData.cliente.rg_ie} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, rg_ie: e.target.value}}))} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Endereço de Cobrança</h2>
                        <p className="text-xs text-slate-500">Local para faturamento e correspondência</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label>CEP</Label>
                        <div className="relative">
                          <Input placeholder="00000-000" value={formData.cliente.cep} onChange={e => handleCepChange(e, 'cliente')} />
                          {isSearchingCep && <Loader2 size={14} className="text-blue-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
                        </div>
                      </div>
                      <div className="md:col-span-2 flex gap-4">
                        <div className="flex-1">
                          <Label>Rua / Logradouro</Label>
                          <Input placeholder="Logradouro..." value={formData.cliente.endereco} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, endereco: e.target.value}}))} />
                        </div>
                        <div className="w-24">
                          <Label>Nº</Label>
                          <Input name="cliente_numero" placeholder="123" value={formData.cliente.numero} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, numero: e.target.value}}))} />
                        </div>
                      </div>
                      <div><Label>Bairro</Label><Input value={formData.cliente.bairro} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, bairro: e.target.value}}))} /></div>
                      <div><Label>Cidade</Label><Input value={formData.cliente.cidade} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, cidade: e.target.value}}))} /></div>
                      <div><Label>UF</Label><Input value={formData.cliente.estado} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, estado: e.target.value}}))} /></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* STEP 2: IMÓVEL */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {/* SELETOR DE MODO */}
              <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full max-w-sm mx-auto mb-8 border border-slate-200">
                <button 
                  onClick={() => setImovelMode('existente')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${imovelMode === 'existente' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Imóvel Existente
                </button>
                <button 
                  onClick={() => {
                    setImovelMode('novo')
                    setSelectedImovelId('')
                    setFormData(prev => ({ 
                      ...prev, 
                      imovel: {
                        cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
                        area_terreno: '', area_construida: '', num_matricula: '', cartorio: '', inscricao_imobiliaria: '', zoneamento: '', observacoes: '',
                        isProprietario: true,
                        proprietario_nome: '', proprietario_doc: '', proprietario_tel: '', proprietario_email: ''
                      }
                    }))
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${imovelMode === 'novo' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Novo Imóvel
                </button>
              </div>

              {imovelMode === 'existente' ? (
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Buscar Propriedade</h2>
                      <p className="text-xs text-slate-500">Selecione entre os imóveis cadastrados para este cliente</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Pesquisar endereço ou matrícula..."
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl text-sm bg-slate-50 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium text-slate-700 transition-all"
                      value={imovelSearch}
                      onChange={(e) => setImovelSearch(e.target.value)}
                    />
                    
                    {filteredImoveis.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                        {filteredImoveis.map(i => (
                          <button
                            key={i.id}
                            onClick={() => {
                              setSelectedImovelId(i.id)
                              setFormData(prev => ({ 
                                ...prev, 
                                imovel: { 
                                  ...i, 
                                  isProprietario: true,
                                  area_terreno: i.area_terreno || '',
                                  area_construida: i.area_construida || '',
                                  num_matricula: i.num_matricula || '',
                                  inscricao_imobiliaria: i.inscricao_imobiliaria || '',
                                  zoneamento: i.zoneamento || '',
                                  complemento: i.complemento || '',
                                  numero: i.numero || '',
                                  cartorio: i.cartorio || '',
                                  observacoes: i.observacoes || '',
                                  proprietario_nome: i.proprietario_nome || '',
                                  proprietario_doc: i.proprietario_doc || '',
                                  proprietario_tel: i.proprietario_tel || '',
                                  proprietario_email: i.proprietario_email || ''
                                } 
                              }))
                              setImovelSearch('')
                            }}
                            className="w-full px-6 py-4 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <div className="text-sm font-bold text-slate-900">{i.endereco}, {i.numero}</div>
                              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">{i.bairro} - {i.cidade}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedImovelId && (
                    <div className="mt-8 p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl animate-in zoom-in-95 duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{formData.imovel.endereco}, {formData.imovel.numero}</div>
                            <div className="text-xs text-slate-500">{formData.imovel.bairro} • {formData.imovel.cidade} - {formData.imovel.estado}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedImovelId('')
                            setFormData(prev => ({ 
                              ...prev, 
                              imovel: { 
                                cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', 
                                area_terreno: '', area_construida: '', num_matricula: '', inscricao_imobiliaria: '', 
                                zoneamento: '', isProprietario: true,
                                cartorio: '', observacoes: '',
                                proprietario_nome: '', proprietario_doc: '', proprietario_tel: '', proprietario_email: ''
                              } 
                            }))
                          }}
                          className="p-2 hover:bg-emerald-100 text-emerald-400 rounded-xl transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900">Novo Imóvel</h2>
                          <p className="text-xs text-slate-500">Cadastre a propriedade para este processo</p>
                        </div>
                      </div>
                      <button type="button" onClick={copyAddressFromCliente} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all active:scale-95">
                        <Copy className="w-3.5 h-3.5" /> Copiar do cliente
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label>CEP</Label>
                        <div className="relative">
                          <Input placeholder="00000-000" value={formData.imovel.cep} onChange={e => handleCepChange(e, 'imovel')} />
                          {isSearchingCep && <Loader2 size={14} className="text-blue-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
                        </div>
                      </div>
                      <div className="md:col-span-2 flex gap-4">
                        <div className="flex-1">
                          <Label>Rua / Logradouro</Label>
                          <Input placeholder="Endereço completo..." value={formData.imovel.endereco} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, endereco: e.target.value}}))} />
                        </div>
                        <div className="w-24">
                          <Label>Nº</Label>
                          <Input name="imovel_numero" placeholder="123" value={formData.imovel.numero} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, numero: e.target.value}}))} />
                        </div>
                      </div>
                      <div><Label>Bairro</Label><Input value={formData.imovel.bairro} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, bairro: e.target.value}}))} /></div>
                      <div><Label>Cidade</Label><Input value={formData.imovel.cidade} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, city: e.target.value}}))} /></div>
                      <div><Label>UF</Label><Input value={formData.imovel.estado} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, estado: e.target.value}}))} /></div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center"><Calculator className="w-5 h-5" /></div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Dados Técnicos</h2>
                        <p className="text-xs text-slate-500">Informações de área e registro</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div><Label>Área Terreno</Label><Input type="number" value={formData.imovel.area_terreno} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, area_terreno: e.target.value}}))} /></div>
                      <div><Label>Área Constr.</Label><Input type="number" value={formData.imovel.area_construida} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, area_construida: e.target.value}}))} /></div>
                      <div><Label>Matrícula</Label><Input value={formData.imovel.num_matricula} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, num_matricula: e.target.value}}))} /></div>
                      <div><Label>Zoneamento</Label><Input value={formData.imovel.zoneamento} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, zoneamento: e.target.value}}))} /></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* STEP 3: NATUREZA E ATIVIDADES TÉCNICAS — refatorado */}
          {step === 3 && (() => {
            const NATUREZAS = [
              { label: 'Regularização Imobiliária', sigla: 'REG', icon: '🏠', cor: '#2563EB', atividades: ['Levantamento cadastral','Memorial descritivo','Emissão de ART','Relatório fotográfico','Protocolo na prefeitura','Acompanhamento processual','Entrega documental'] },
              { label: 'Administração de Obra',     sigla: 'ADM', icon: '🏗️', cor: '#7C3AED', atividades: ['Vistoria técnica','Diário de obra','Cronograma físico-financeiro','Relatório mensal','Medição de serviços'] },
              { label: 'Projeto Arquitetônico',     sigla: 'ARQ', icon: '📐', cor: '#0891B2', atividades: ['Levantamento cadastral','Projeto arquitetônico','Projeto As-Built','Emissão de ART','Análise urbanística','Protocolo na prefeitura'] },
              { label: 'Aprovação de Projeto',      sigla: 'APR', icon: '✅', cor: '#059669', atividades: ['Análise urbanística','Protocolo na prefeitura','Acompanhamento processual','Emissão de ART','Entrega documental'] },
              { label: 'Habite-se',                 sigla: 'HAB', icon: '🔑', cor: '#D97706', atividades: ['Vistoria técnica','Relatório fotográfico','Memorial descritivo','Protocolo na prefeitura','Acompanhamento processual'] },
              { label: 'Averbação',                 sigla: 'AVB', icon: '📄', cor: '#4F46E5', atividades: ['Levantamento cadastral','Memorial descritivo','Emissão de ART','Protocolo no cartório','Entrega documental'] },
              { label: 'Consultoria Técnica',       sigla: 'CON', icon: '💼', cor: '#0D9488', atividades: ['Vistoria técnica','Relatório fotográfico','Parecer técnico','Emissão de ART'] },
              { label: 'Laudo / Perícia',           sigla: 'LDO', icon: '🔬', cor: '#DC2626', atividades: ['Vistoria técnica','Relatório fotográfico','Laudo técnico','Emissão de ART'] },
              { label: 'Desmembramento',            sigla: 'DES', icon: '✂️', cor: '#9333EA', atividades: ['Levantamento cadastral','Memorial descritivo','Emissão de ART','Protocolo na prefeitura','Acompanhamento processual'] },
              { label: 'Unificação de Lotes',       sigla: 'UNI', icon: '🔗', cor: '#EA580C', atividades: ['Levantamento cadastral','Memorial descritivo','Emissão de ART','Protocolo no cartório'] },
              { label: 'Levantamento Técnico',      sigla: 'LEV', icon: '📏', cor: '#0369A1', atividades: ['Levantamento cadastral','Relatório fotográfico','Memorial descritivo','Emissão de ART'] },
            ]
            const TODAS = Array.from(new Set(['Levantamento cadastral','Memorial descritivo','Emissão de ART','Projeto arquitetônico','Projeto As-Built','Relatório fotográfico','Vistoria técnica','Protocolo na prefeitura','Protocolo no cartório','Acompanhamento processual','Entrega documental','Análise urbanística','Laudo técnico','Parecer técnico','Diário de obra','Cronograma físico-financeiro','Relatório mensal','Medição de serviços',...customAtividades]))
            const naturezaSel = NATUREZAS.find(n => n.label === formData.processo.tipo)
            const sugeridas = naturezaSel?.atividades || []
            const toggleAtiv = (a: string) => {
              const has = formData.processo.subservicos.includes(a)
              setFormData((prev: any) => ({ ...prev, processo: { ...prev.processo, subservicos: has ? prev.processo.subservicos.filter((s: string) => s !== a) : [...prev.processo.subservicos, a] } }))
            }
            const selectNatureza = (n: typeof NATUREZAS[0]) => {
              setFormData((prev: any) => ({ 
                ...prev, 
                processo: { 
                  ...prev.processo, 
                  tipo: n.label, 
                  categoria: n.label, 
                  codigo_projeto: `${n.sigla}-AUTO`, 
                  subservicos: n.atividades 
                } 
              }))
            }
            return (
              <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:860, margin:'0 auto' }}>

                {/* ── 1. NATUREZA (MACRO) ── */}
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>📋</div>
                    <div style={{ flex:1 }}>
                      <h3 style={{ fontSize:13, fontWeight:700, color:'#111827', letterSpacing:'-0.02em' }}>Natureza do Processo</h3>
                      <p style={{ fontSize:11, color:'#9CA3AF', marginTop:1 }}>Tipo principal do contrato — selecione apenas um</p>
                    </div>
                    {naturezaSel && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:20, background:'#EFF6FF', border:'1px solid #BFDBFE' }}>
                        <span style={{ fontSize:11, fontWeight:700, color:'#1D4ED8', fontFamily:'monospace' }}>{naturezaSel.sigla}</span>
                        <span style={{ fontSize:10, color:'#3B82F6' }}>·</span>
                        <span style={{ fontSize:11, color:'#2563EB', fontWeight:600 }}>{formData.processo.codigo_projeto}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(175px,1fr))', gap:8 }}>
                    {NATUREZAS.map(n => {
                      const active = formData.processo.tipo === n.label
                      return (
                        <button key={n.label} type="button" onClick={() => selectNatureza(n)}
                          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', transition:'all 0.15s', background: active ? `${n.cor}15` : '#F9FAFB', outline: active ? `2px solid ${n.cor}35` : '2px solid transparent' }}
                          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F3F4F6' }}
                          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
                        >
                          <span style={{ fontSize:16, lineHeight:1, flexShrink:0 }}>{n.icon}</span>
                          <div style={{ minWidth:0, flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:600, color: active ? n.cor : '#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.label}</div>
                            <div style={{ fontSize:10, fontFamily:'monospace', fontWeight:700, color: active ? n.cor : '#9CA3AF', marginTop:2 }}>{n.sigla}</div>
                          </div>
                          {active && <div style={{ width:16, height:16, borderRadius:'50%', background:n.cor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={9} color="#fff" strokeWidth={3} /></div>}
                        </button>
                      )
                    })}
                  </div>
                  <button type="button" onClick={() => setIsNewServiceModalOpen(true)}
                    style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:12, fontSize:11, fontWeight:600, color:'#6B7280', background:'none', border:'1px dashed #D1D5DB', borderRadius:8, padding:'5px 10px', cursor:'pointer', transition:'all 0.12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='#2563EB'; (e.currentTarget as HTMLElement).style.color='#2563EB' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#D1D5DB'; (e.currentTarget as HTMLElement).style.color='#6B7280' }}>
                    <Plus size={12} /> Criar natureza personalizada
                  </button>
                </div>

                {/* ── 2. ATIVIDADES TÉCNICAS (MICRO) ── */}
                <div className="card" style={{ padding:'20px 22px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✅</div>
                      <div>
                        <h3 style={{ fontSize:13, fontWeight:700, color:'#111827', letterSpacing:'-0.02em' }}>Atividades Técnicas</h3>
                        <p style={{ fontSize:11, color: formData.processo.subservicos.length > 0 ? '#059669' : '#9CA3AF', fontWeight: formData.processo.subservicos.length > 0 ? 600 : 400, marginTop:1 }}>
                          {formData.processo.subservicos.length > 0 ? `${formData.processo.subservicos.length} atividade(s) selecionada(s)` : 'Selecione as entregas que compõem o escopo'}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setIsNewActivityModalOpen(true)}
                      style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 11px', fontSize:11, fontWeight:600, color:'#374151', background:'#F3F4F6', border:'none', borderRadius:8, cursor:'pointer', transition:'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='#E5E7EB'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='#F3F4F6'}>
                      <Plus size={12} /> Personalizada
                    </button>
                  </div>

                  {sugeridas.length > 0 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>💡 Sugeridas para esta natureza</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {sugeridas.map(a => {
                          const checked = formData.processo.subservicos.includes(a)
                          return (
                            <button key={a} type="button" onClick={() => toggleAtiv(a)}
                              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 11px', borderRadius:20, border:'none', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.15s', background: checked ? '#ECFDF5' : '#F9FAFB', color: checked ? '#059669' : '#4B5563', outline: checked ? '1.5px solid #A7F3D0' : '1.5px solid #E5E7EB' }}>
                              <span style={{ width:14, height:14, borderRadius:'50%', background: checked ? '#059669' : '#D1D5DB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                                {checked && <Check size={8} color="#fff" strokeWidth={3} />}
                              </span>
                              {a}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop:'1px solid rgba(0,0,0,0.05)', paddingTop:14 }}>
                    <div style={{ fontSize:10, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Catálogo completo</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(195px,1fr))', gap:6 }}>
                      {TODAS.map(a => {
                        const checked = formData.processo.subservicos.includes(a)
                        return (
                          <label key={a} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 11px', borderRadius:9, cursor:'pointer', border:`1.5px solid ${checked ? '#A7F3D0' : 'rgba(0,0,0,0.06)'}`, background: checked ? '#ECFDF5' : 'transparent', transition:'all 0.15s' }}
                            onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLElement).style.background='#F9FAFB' }}
                            onMouseLeave={e => { if (!checked) (e.currentTarget as HTMLElement).style.background='transparent' }}>
                            <div style={{ width:16, height:16, borderRadius:5, flexShrink:0, background: checked ? '#059669' : '#fff', border:`1.5px solid ${checked ? '#059669' : '#D1D5DB'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                              {checked && <Check size={9} color="#fff" strokeWidth={3} />}
                            </div>
                            <input type="checkbox" hidden checked={checked} onChange={() => toggleAtiv(a)} />
                            <span style={{ fontSize:12, fontWeight: checked ? 600 : 400, color: checked ? '#059669' : '#374151', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a}</span>
                            {sugeridas.includes(a) && !checked && <span style={{ fontSize:9, color:'#93C5FD', fontWeight:700, flexShrink:0 }}>IA</span>}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {formData.processo.subservicos.length > 0 && (
                    <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize:10, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Escopo definido ({formData.processo.subservicos.length})</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {formData.processo.subservicos.map(a => (
                          <span key={a} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:20, background:'#EFF6FF', color:'#1D4ED8', fontSize:11, fontWeight:600, border:'1px solid #BFDBFE' }}>
                            {a}
                            <button type="button" onClick={() => toggleAtiv(a)} style={{ background:'none', border:'none', cursor:'pointer', color:'#93C5FD', padding:0, display:'flex', alignItems:'center' }}><X size={11} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Observações ── */}
                <div className="card" style={{ padding:'16px 20px' }}>
                  <Label help="Informações complementares ao escopo técnico.">Observações de Escopo</Label>
                  <textarea className="input-field" style={{ minHeight:80, resize:'vertical', fontFamily:'inherit', lineHeight:1.5 }}
                    placeholder="Descreva detalhes técnicos, condicionantes ou restrições..."
                    value={formData.processo.observacoes}
                    onChange={e => setFormData((prev: any) => ({...prev, processo: {...prev.processo, observacoes: e.target.value}}))} />
                </div>

              </div>
            )
          })()}

          {/* STEP 4: FINANCEIRO (NOVA ESTRUTURA) */}
          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               {/* FORMULÁRIOS LADO ESQUERDO */}
               <div className="lg:col-span-2 space-y-8">
                  {/* CONTRATO */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Briefcase className="w-5 h-5" /></div>
                      <div><h2 className="text-base font-bold text-slate-900">Valor do Contrato</h2><p className="text-xs text-slate-500">Valor total acordado com o cliente</p></div>
                    </div>
                    <div>
                      <Label>Valor Total do Projeto (R$)</Label>
                      <Input type="number" placeholder="0,00" value={formData.financeiro.valorTotal} onChange={e => setFormData(prev => ({...prev, financeiro: {...prev.financeiro, valorTotal: e.target.value}}))} />
                    </div>
                  </div>

                  {/* RECEITAS */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Wallet className="w-5 h-5" /></div>
                        <div><h2 className="text-base font-bold text-slate-900">Receitas (Entradas)</h2><p className="text-xs text-slate-500">Controle de parcelas e pagamentos do cliente</p></div>
                      </div>
                      <button onClick={addReceita} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"><Plus className="w-3.5 h-3.5" /> Adicionar Parcela</button>
                    </div>
                    <div className="space-y-4">
                      {formData.financeiro.receitas.map((r: any) => (
                        <div key={r.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-end group">
                          <div className="md:col-span-1">
                            <Label>Descrição</Label>
                            <Input value={r.descricao} onChange={e => updateFinanceiro(r.id, 'receitas', 'descricao', e.target.value)} />
                          </div>
                          <div>
                            <Label>Valor (R$)</Label>
                            <Input type="number" value={r.valor} onChange={e => updateFinanceiro(r.id, 'receitas', 'valor', e.target.value)} />
                          </div>
                          <div>
                            <Label>Status</Label>
                            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none" value={r.status} onChange={e => updateFinanceiro(r.id, 'receitas', 'status', e.target.value)}>
                              <option value="pago">Recebido</option>
                              <option value="pendente">A receber</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="flex-1">
                               <Label>Data</Label>
                               <Input type="date" value={r.data} onChange={e => updateFinanceiro(r.id, 'receitas', 'data', e.target.value)} />
                             </div>
                             <button onClick={() => removeFinanceiro(r.id, 'receitas')} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DESPESAS */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><TrendingDown className="w-5 h-5" /></div>
                        <div><h2 className="text-base font-bold text-slate-900">Despesas / Parceiros</h2><p className="text-xs text-slate-500">Pagamentos a terceiros e custos do processo</p></div>
                      </div>
                      <button onClick={addDespesa} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"><Plus className="w-3.5 h-3.5" /> Adicionar Despesa</button>
                    </div>
                    <div className="space-y-4">
                      {formData.financeiro.despesas.length === 0 && <p className="text-center py-8 text-slate-400 text-sm italic">Nenhuma despesa lançada.</p>}
                      {formData.financeiro.despesas.map((d: any) => (
                        <div key={d.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-end group">
                          <div className="md:col-span-1">
                            <Label>Parceiro</Label>
                            <Input value={d.parceiro} onChange={e => updateFinanceiro(d.id, 'despesas', 'parceiro', e.target.value)} />
                          </div>
                          <div className="md:col-span-1">
                            <Label>Serviço</Label>
                            <Input value={d.servico} onChange={e => updateFinanceiro(d.id, 'despesas', 'servico', e.target.value)} />
                          </div>
                          <div>
                            <Label>Valor (R$)</Label>
                            <Input type="number" value={d.valor} onChange={e => updateFinanceiro(d.id, 'despesas', 'valor', e.target.value)} />
                          </div>
                          <div>
                            <Label>Status</Label>
                            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none" value={d.status} onChange={e => updateFinanceiro(d.id, 'despesas', 'status', e.target.value)}>
                              <option value="pago">Pago</option>
                              <option value="pendente">Pendente</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                             <div className="flex-1">
                               <Label>Data</Label>
                               <Input type="date" value={d.data} onChange={e => updateFinanceiro(d.id, 'despesas', 'data', e.target.value)} />
                             </div>
                             <button onClick={() => removeFinanceiro(d.id, 'despesas')} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 mt-6"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               {/* PAINEL DE RESUMO (DIREITO) */}
               <div className="lg:col-span-1 space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl sticky top-28">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Resumo Financeiro</h3>
                    
                    <div className="space-y-8">
                       <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Contrato Total</p>
                          <p className="text-2xl font-bold">R$ {fin.totalContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                             <p className="text-[9px] text-emerald-400 uppercase font-bold mb-1">Recebido</p>
                             <p className="text-sm font-bold text-emerald-300">R$ {fin.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                             <p className="text-[9px] text-amber-400 uppercase font-bold mb-1">A Receber</p>
                             <p className="text-sm font-bold text-amber-300">R$ {fin.aReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                       </div>

                       <div className="space-y-4 pt-4 border-t border-white/10">
                          <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-400">Despesas Totais</span>
                             <span className="font-bold text-red-400">- R$ {fin.despesasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                             <span className="text-slate-500">Pagas</span>
                             <span className="text-slate-300">R$ {fin.despesasPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                             <span className="text-slate-500">A Pagar</span>
                             <span className="text-slate-300">R$ {fin.despesasAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                       </div>

                       <div className="pt-6 border-t-2 border-white/20 space-y-4">
                          <div>
                             <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">Lucro Realizado <TrendingUp className="w-3 h-3 text-emerald-400" /></p>
                             <p className="text-xl font-black text-emerald-400">R$ {fin.lucroRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">Lucro Previsto <TrendingUp className="w-3 h-3 text-blue-400" /></p>
                             <p className="text-3xl font-black text-blue-400">R$ {fin.lucroPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

            </div>
          )}

        </div>
      </div>

      {/* MODAL NOVA ATIVIDADE */}
      {isNewActivityModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-200" />
                <h2 className="font-bold">Nova Atividade Técnica</h2>
              </div>
              <button onClick={() => setIsNewActivityModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <Label>Nome da Atividade</Label>
                <Input 
                  placeholder="Ex: Consultoria Ambiental" 
                  value={newActivityName} 
                  onChange={e => setNewActivityName(e.target.value)} 
                />
              </div>
              <button 
                onClick={() => {
                  if (newActivityName.trim()) {
                    setCustomAtividades(prev => [...prev, newActivityName.trim()])
                    setFormData((prev: any) => ({
                      ...prev,
                      processo: {
                        ...prev.processo,
                        subservicos: [...prev.processo.subservicos, newActivityName.trim()]
                      }
                    }))
                    setNewActivityName('')
                    setIsNewActivityModalOpen(false)
                  }
                }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Adicionar ao Escopo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER NAVIGATION — improved and more visible */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-8 py-6 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={prevStep} 
            disabled={step === 1} 
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          
          <div className="flex items-center gap-8">
            {/* Progress dots - more modern */}
            <div className="hidden md:flex gap-2">
              {[1, 2, 3, 4].map(n => (
                <div 
                  key={n} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${n === step ? 'w-8 bg-blue-600' : n < step ? 'w-4 bg-blue-400' : 'w-4 bg-slate-200'}`} 
                />
              ))}
            </div>

            {step < 4 ? (
              <button 
                onClick={nextStep} 
                className="group relative flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:shadow-blue-200 hover:bg-blue-600 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Continuar <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <button 
                onClick={handleFinalSubmit} 
                disabled={loading} 
                className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} 
                Finalizar Cadastro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL NOVO SERVIÇO */}
      {isNewServiceModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"><div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"><div className="p-6 bg-slate-900 text-white flex justify-between items-center"><div className="flex items-center gap-2"><Plus className="w-5 h-5 text-blue-400" /><h2 className="font-bold">Cadastrar Novo Serviço</h2></div><button onClick={() => setIsNewServiceModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button></div><form onSubmit={handleCreateService} className="p-8 space-y-6"><div><Label>Nome do Serviço</Label><Input placeholder="Ex: Regularização" required value={newService.nome} onChange={e => setNewService({...newService, nome: e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><div><Label help="Sigla de 3 letras.">Sigla</Label><Input placeholder="Ex: REG" required maxLength={4} value={newService.sigla} onChange={e => setNewService({...newService, sigla: e.target.value})} /></div><div><Label>Categoria</Label><select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white" value={newService.categoria} onChange={e => setNewService({...newService, categoria: e.target.value})}>{CATEGORIAS_PADRAO.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div></div><button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}Salvar Serviço</button></form></div></div>)}

    </div>
  )
}
