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
      nome: '', cpf_cnpj: '', telefone: '', email: '', 
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
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
               <div className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Seleção de Cliente</h3>
                  </div>
                  <div>
                    <Label>Escolher Cliente Existente</Label>
                    <select 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      value={selectedClienteId}
                      onChange={(e) => {
                        const id = e.target.value
                        setSelectedClienteId(id)
                        setSelectedImovelId('') // Limpa seleção anterior
                        setFormData((prev: any) => ({ 
                          ...prev, 
                          imovel: {
                            cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
                            area_terreno: '', area_construida: '', num_matricula: '', inscricao_imobiliaria: '',
                            zoneamento: '', isProprietario: true
                          }
                        }))
                        if (id) {
                          const c = existingClientes.find(x => x.id === id)
                          if (c) setFormData((prev: any) => ({ ...prev, cliente: { ...c } }))
                        } else {
                          setFormData((prev: any) => ({ ...prev, cliente: { nome: '', cpf_cnpj: '', telefone: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', observacoes: '' } }))
                        }
                      }}
                    >
                      <option value="">+ Criar Novo Cliente</option>
                      {existingClientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nome} ({c.cpf_cnpj})</option>
                      ))}
                    </select>
                  </div>

                  {!selectedClienteId && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 14px', paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: 10 }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Label>Nome do Cliente / Empresa *</Label>
                        <Input placeholder="Nome completo ou Razão Social" value={formData.cliente.nome} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, nome: e.target.value}}))} />
                      </div>
                      <div><Label>CPF ou CNPJ *</Label><Input placeholder="000.000.000-00" value={formData.cliente.cpf_cnpj} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, cpf_cnpj: maskCpfCnpj(e.target.value)}}))} /></div>
                      <div><Label>Telefone / WhatsApp *</Label><Input placeholder="(00) 00000-0000" value={formData.cliente.telefone} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, telefone: maskPhone(e.target.value)}}))} /></div>
                      <div><Label>E-mail de Contato *</Label><Input type="email" placeholder="exemplo@email.com" value={formData.cliente.email} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, email: e.target.value}}))} /></div>
                    </div>
                  )}
               </div>

               {!selectedClienteId && (
                 <div className="card" style={{ padding: '18px 20px' }}>
                    <h3 style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Endereço de Cobrança</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px', gap: '10px 12px' }}>
                       <div><Label>CEP</Label><div style={{ position: 'relative' }}><Input placeholder="00000-000" value={formData.cliente.cep} onChange={e => handleCepChange(e, 'cliente')} />{isSearchingCep && <Loader2 size={14} className="text-blue-500 animate-spin" style={{ position: 'absolute', right: 10, top: 9 }} />}</div></div>
                       <div><Label>Logradouro / Endereço</Label><Input placeholder="Rua, Av..." value={formData.cliente.endereco} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, endereco: e.target.value}}))} /></div>
                       <div><Label>Número</Label><Input name="cliente_numero" placeholder="123" value={formData.cliente.numero} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, numero: e.target.value}}))} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '10px 12px', marginTop: 10 }}>
                       <div><Label>Bairro</Label><Input value={formData.cliente.bairro} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, bairro: e.target.value}}))} /></div>
                       <div><Label>Cidade</Label><Input value={formData.cliente.cidade} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, cidade: e.target.value}}))} /></div>
                       <div><Label>UF</Label><Input value={formData.cliente.estado} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, estado: e.target.value}}))} /></div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* STEP 2: IMÓVEL */}
          {step === 2 && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* SELEÇÃO OU CADASTRO DE IMÓVEL */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Propriedade (Imóvel)</h2>
                    <p className="text-xs text-slate-500">Selecione um imóvel existente ou cadastre um novo</p>
                  </div>
                </div>

                <div className="mb-8">
                  <Label>Selecione o Imóvel para este Processo</Label>
                  <select 
                    className="w-full px-4 py-4 border-2 border-slate-100 rounded-2xl text-sm bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all cursor-pointer"
                    value={selectedImovelId}
                    onChange={(e) => {
                      const id = e.target.value
                      setSelectedImovelId(id)
                      if (id) {
                        const im = existingImoveis.find(x => x.id === id)
                        if (im) {
                          setFormData((prev: any) => ({ 
                            ...prev, 
                            imovel: { 
                              ...im, 
                              isProprietario: true,
                              area_terreno: im.area_terreno || '',
                              area_construida: im.area_construida || '',
                              num_matricula: im.num_matricula || '',
                              inscricao_imobiliaria: im.inscricao_imobiliaria || '',
                              zoneamento: im.zoneamento || '',
                              complemento: im.complemento || '',
                              numero: im.numero || ''
                            } 
                          }))
                        }
                      } else {
                        setFormData((prev: any) => ({ 
                          ...prev, 
                          imovel: {
                            cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
                            area_terreno: '', area_construida: '', num_matricula: '', inscricao_imobiliaria: '',
                            zoneamento: '', isProprietario: true
                          }
                        }))
                      }
                    }}
                  >
                    <option value="">+ CADASTRAR NOVO IMÓVEL</option>
                    {existingImoveis.map(im => (
                      <option key={im.id} value={im.id}>{im.endereco}, {im.numero} - {im.bairro} ({im.cidade})</option>
                    ))}
                  </select>
                </div>

                <div className={`space-y-8 transition-all duration-500 ${selectedImovelId ? 'opacity-90 grayscale-[0.5]' : ''}`}>
                  <div className="flex items-center justify-between mb-2 pt-4 border-t border-slate-100">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                       {selectedImovelId ? 'Dados do Imóvel Selecionado' : 'Dados do Novo Imóvel'}
                     </h3>
                     {!selectedImovelId && (
                       <button type="button" onClick={copyAddressFromCliente} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                         <Copy className="w-3 h-3" /> Copiar do cliente
                       </button>
                     )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>CEP</Label>
                      <Input disabled={!!selectedImovelId} placeholder="00000-000" value={formData.imovel.cep} onChange={e => handleCepChange(e, 'imovel')} />
                    </div>
                    <div className="md:col-span-2 flex gap-4">
                      <div className="flex-1">
                        <Label>Endereço / Logradouro</Label>
                        <Input disabled={!!selectedImovelId} placeholder="Rua, Av..." value={formData.imovel.endereco} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, endereco: e.target.value}}))} />
                      </div>
                      <div className="w-24">
                        <Label>Nº</Label>
                        <Input disabled={!!selectedImovelId} name="imovel_numero" placeholder="123" value={formData.imovel.numero} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, numero: e.target.value}}))} />
                      </div>
                    </div>
                    <div><Label>Bairro</Label><Input disabled={!!selectedImovelId} value={formData.imovel.bairro} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, bairro: e.target.value}}))} /></div>
                    <div><Label>Cidade</Label><Input disabled={!!selectedImovelId} value={formData.imovel.cidade} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, cidade: e.target.value}}))} /></div>
                    <div><Label>UF</Label><Input disabled={!!selectedImovelId} value={formData.imovel.estado} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, estado: e.target.value}}))} /></div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Informações Técnicas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div><Label>Área Terreno</Label><Input disabled={!!selectedImovelId} type="number" value={formData.imovel.area_terreno} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, area_terreno: e.target.value}}))} /></div>
                      <div><Label>Área Constr.</Label><Input disabled={!!selectedImovelId} type="number" value={formData.imovel.area_construida} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, area_construida: e.target.value}}))} /></div>
                      <div><Label>Matrícula</Label><Input disabled={!!selectedImovelId} value={formData.imovel.num_matricula} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, num_matricula: e.target.value}}))} /></div>
                      <div><Label>Zoneamento</Label><Input disabled={!!selectedImovelId} value={formData.imovel.zoneamento} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, zoneamento: e.target.value}}))} /></div>
                    </div>
                    <div className="mt-6">
                       <Label>IPTU / Inscrição Imobiliária</Label>
                       <Input disabled={!!selectedImovelId} value={formData.imovel.inscricao_imobiliaria} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, inscricao_imobiliaria: e.target.value}}))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: NATUREZA E ATIVIDADES TÉCNICAS */}
          {step === 3 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden transition-all">
                 <button onClick={() => setIsHelpOpen(!isHelpOpen)} className="w-full flex items-center justify-between px-6 py-4 text-blue-700 font-bold text-sm">
                   <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Guia de Escopo Técnico</div>
                   {isHelpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                 </button>
                 {isHelpOpen && (
                   <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                     <div className="space-y-1">
                       <p className="text-[10px] font-bold text-blue-900 uppercase">Natureza do Processo</p>
                       <p className="text-xs text-blue-700">Define o objetivo principal do projeto.</p>
                     </div>
                     <div className="space-y-1">
                       <p className="text-[10px] font-bold text-blue-900 uppercase">Atividades Técnicas</p>
                       <p className="text-xs text-blue-700">Tarefas específicas que compõem o escopo do serviço.</p>
                     </div>
                   </div>
                 )}
               </div>

               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label help="Selecione o tipo principal de processo.">Natureza do Processo</Label>
                      <select 
                        className="w-full px-4 py-4 border-2 border-slate-100 rounded-2xl text-sm bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all cursor-pointer"
                        value={formData.processo.tipo} 
                        onChange={e => {
                          const val = e.target.value
                          const serv = servicosDisponiveis.find(s => s.nome === val)
                          setFormData((prev: any) => ({
                            ...prev, 
                            processo: { 
                              ...prev.processo, 
                              tipo: val,
                              subservicos: serv?.subservicos || [] // Sugestão automática
                            }
                          }))
                        }}
                      >
                        <option value="">Selecione a Natureza...</option>
                        {servicosDisponiveis.map(s => (
                          <option key={s.id} value={s.nome}>{s.nome}</option>
                        ))}
                      </select>
                      <button onClick={() => setIsNewServiceModalOpen(true)} className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
                        <Plus className="w-3.5 h-3.5" /> + Criar Natureza de Processo
                      </button>
                    </div>

                    <div>
                      <Label help="Identificador único.">Código do Projeto</Label>
                      <Input value={formData.processo.codigo_projeto} readOnly className="bg-slate-50 font-mono font-bold text-blue-600 border-dashed" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900">Atividades Técnicas</h2>
                          <p className="text-xs text-slate-500">Selecione as atividades incluídas no escopo</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsNewActivityModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-colors uppercase tracking-wider"
                      >
                         <Plus className="w-3 h-3" /> Nova Atividade Personalizada
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* ATIVIDADES SUGERIDAS E GLOBAIS */}
                      {Array.from(new Set([
                        ...(selectedServicoData?.subservicos || []),
                        ...customAtividades,
                        "Levantamento Cadastral", "Memorial Descritivo", "Projeto As-Built", 
                        "Projeto Arquitetônico", "Emissão de ART", "Análise Urbanística", 
                        "Relatório Fotográfico", "Vistoria Técnica", "Protocolo na Prefeitura", 
                        "Acompanhamento de Processo", "Entrega de Documentação"
                      ])).map((ativ: string) => (
                        <label 
                          key={ativ} 
                          className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            formData.processo.subservicos.includes(ativ) 
                              ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100' 
                              : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded-lg text-blue-600 border-slate-300 focus:ring-blue-500 transition-all" 
                            checked={formData.processo.subservicos.includes(ativ)} 
                            onChange={e => {
                              const next = e.target.checked 
                                ? [...formData.processo.subservicos, ativ]
                                : formData.processo.subservicos.filter(s => s !== ativ)
                              setFormData((prev: any) => ({ ...prev, processo: { ...prev.processo, subservicos: next } }))
                            }}
                          />
                          <span className={`text-xs font-bold ${formData.processo.subservicos.includes(ativ) ? 'text-blue-700' : 'text-slate-600'}`}>
                            {ativ}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label help="Detalhamento técnico adicional.">Observações de Escopo</Label>
                    <textarea 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[120px]" 
                      value={formData.processo.observacoes} 
                      onChange={e => setFormData((prev: any) => ({...prev, processo: {...prev.processo, observacoes: e.target.value}}))} 
                    />
                  </div>
               </div>
            </div>
          )}

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

      {/* FOOTER NAVIGATION — compact */}
      <div style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={prevStep} disabled={step === 1} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: 'none', fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: step === 1 ? 'default' : 'pointer', opacity: step === 1 ? 0 : 1, transition: 'background 0.12s' }}
          onMouseEnter={e => { if (step > 1) (e.currentTarget as HTMLElement).style.background = '#F3F4F6' }}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
          <ChevronLeft size={14} /> Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 5, marginRight: 12 }}>
            {[1,2,3,4].map(n => <div key={n} style={{ width: n === step ? 16 : 6, height: 6, borderRadius: 3, background: n === step ? '#2563EB' : n < step ? '#93C5FD' : '#E5E7EB', transition: 'all 0.2s' }} />)}
          </div>
          {step < 4
            ? <button onClick={nextStep} className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>Continuar <ChevronRight size={14} /></button>
            : <button onClick={handleFinalSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 22px', background: '#059669', color: '#fff', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Finalizar Projeto</button>}
        </div>
      </div>

      {/* MODAL NOVO SERVIÇO */}
      {isNewServiceModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"><div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"><div className="p-6 bg-slate-900 text-white flex justify-between items-center"><div className="flex items-center gap-2"><Plus className="w-5 h-5 text-blue-400" /><h2 className="font-bold">Cadastrar Novo Serviço</h2></div><button onClick={() => setIsNewServiceModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button></div><form onSubmit={handleCreateService} className="p-8 space-y-6"><div><Label>Nome do Serviço</Label><Input placeholder="Ex: Regularização" required value={newService.nome} onChange={e => setNewService({...newService, nome: e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><div><Label help="Sigla de 3 letras.">Sigla</Label><Input placeholder="Ex: REG" required maxLength={4} value={newService.sigla} onChange={e => setNewService({...newService, sigla: e.target.value})} /></div><div><Label>Categoria</Label><select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white" value={newService.categoria} onChange={e => setNewService({...newService, categoria: e.target.value})}>{CATEGORIAS_PADRAO.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div></div><button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}Salvar Serviço</button></form></div></div>)}

    </div>
  )
}
