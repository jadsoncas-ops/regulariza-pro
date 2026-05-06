'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Building2, FolderKanban, 
  DollarSign, Check, ChevronRight, ChevronLeft, 
  Loader2, MapPin, Calculator, Info, Search,
  Copy, HelpCircle, Plus, X, ChevronDown, ChevronUp,
  Briefcase, Trash2, Calendar, Wallet, TrendingUp, TrendingDown
} from 'lucide-react'

// --- COMPONENTES UI AUXILIARES ---
function Label({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{children}</label>
      {help && (
        <div className="group relative">
          <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help hover:text-blue-500 transition-colors" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
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
      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
    />
  )
}

function WizardStep({ active, icon: Icon, title }: { active: boolean; icon: any; title: string }) {
  return (
    <div className={`flex items-center gap-3 transition-all ${active ? 'opacity-100 scale-100' : 'opacity-40 scale-95 hidden md:flex'}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-sm font-bold whitespace-nowrap ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</span>
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

function WizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const imovelId = searchParams.get('imovelId')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false)
  
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* WIZARD HEADER */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
             <Link href="/processos" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
             </Link>
             <div>
                <h1 className="text-xl font-bold text-slate-900">Novo Projeto</h1>
                <p className="text-xs text-slate-500 font-medium">Siga as etapas para o cadastro unificado</p>
             </div>
          </div>

          <div className="flex items-center gap-8 lg:gap-12">
            <WizardStep active={step === 1} icon={User} title="Cliente" />
            <div className="hidden md:block w-8 h-px bg-slate-200"></div>
            <WizardStep active={step === 2} icon={Building2} title="Imóvel" />
            <div className="hidden md:block w-8 h-px bg-slate-200"></div>
            <WizardStep active={step === 3} icon={FolderKanban} title="Serviço" />
            <div className="hidden md:block w-8 h-px bg-slate-200"></div>
            <WizardStep active={step === 4} icon={DollarSign} title="Financeiro" />
          </div>

          <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
             <Info className="w-4 h-4 text-blue-500" />
             <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Passo {step} de 4</span>
          </div>
        </div>
      </div>

      {/* STEP CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-6xl mx-auto">
          
          {/* STEP 1: CLIENTE */}
          {step === 1 && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seleção de Cliente</h3>
                  </div>
                  <div>
                    <Label>Escolher Cliente Existente</Label>
                    <select 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                      value={selectedClienteId}
                      onChange={(e) => {
                        const id = e.target.value
                        setSelectedClienteId(id)
                        if (id) {
                          const c = existingClientes.find(x => x.id === id)
                          if (c) setFormData(prev => ({ ...prev, cliente: { ...c } }))
                        } else {
                          setFormData(prev => ({ ...prev, cliente: { nome: '', cpf_cnpj: '', telefone: '', email: '', cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', observacoes: '' } }))
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <div className="md:col-span-2">
                        <Label>Nome do Cliente / Empresa *</Label>
                        <Input placeholder="Nome completo ou Razão Social" value={formData.cliente.nome} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, nome: e.target.value}}))} />
                      </div>
                      <div><Label>CPF ou CNPJ *</Label><Input placeholder="000.000.000-00" value={formData.cliente.cpf_cnpj} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, cpf_cnpj: maskCpfCnpj(e.target.value)}}))} /></div>
                      <div><Label>Telefone / WhatsApp *</Label><Input placeholder="(00) 00000-0000" value={formData.cliente.telefone} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, telefone: maskPhone(e.target.value)}}))} /></div>
                      <div className="md:col-span-2"><Label>E-mail de Contato *</Label><Input type="email" placeholder="exemplo@email.com" value={formData.cliente.email} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, email: e.target.value}}))} /></div>
                    </div>
                  )}
               </div>

               {!selectedClienteId && (
                 <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Endereço de Cobrança</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><Label>CEP</Label><div className="relative"><Input placeholder="00000-000" value={formData.cliente.cep} onChange={e => handleCepChange(e, 'cliente')} />{isSearchingCep && <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-4 top-3.5" />}</div></div>
                      <div className="md:col-span-2 flex gap-4"><div className="flex-1"><Label>Logradouro / Endereço</Label><Input placeholder="Rua, Av..." value={formData.cliente.endereco} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, endereco: e.target.value}}))} /></div><div className="w-24"><Label>Número</Label><Input name="cliente_numero" placeholder="123" value={formData.cliente.numero} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, numero: e.target.value}}))} /></div></div>
                      <div><Label>Bairro</Label><Input value={formData.cliente.bairro} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, bairro: e.target.value}}))} /></div>
                      <div><Label>Cidade</Label><Input value={formData.cliente.cidade} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, cidade: e.target.value}}))} /></div>
                      <div><Label>Estado</Label><Input value={formData.cliente.estado} onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, estado: e.target.value}}))} /></div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* STEP 2: IMÓVEL */}
          {step === 2 && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seleção de Imóvel</h3>
                  </div>

                  {existingImoveis.length > 0 && (
                    <div className="mb-6">
                      <Label>Escolher Imóvel do Cliente</Label>
                      <select 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                        value={selectedImovelId}
                        onChange={(e) => {
                          const id = e.target.value
                          setSelectedImovelId(id)
                          if (id) {
                            const im = existingImoveis.find(x => x.id === id)
                            if (im) setFormData(prev => ({ ...prev, imovel: { ...im, isProprietario: true } }))
                          }
                        }}
                      >
                        <option value="">+ Cadastrar Novo Imóvel</option>
                        {existingImoveis.map(im => (
                          <option key={im.id} value={im.id}>{im.endereco}, {im.numero} - {im.bairro}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!selectedImovelId && (
                    <>
                      <div className="flex items-center justify-between mb-2 pt-4 border-t border-slate-100">
                         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dados do Novo Imóvel</h3>
                         <button type="button" onClick={copyAddressFromCliente} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"><Copy className="w-3 h-3" /> Copiar do cliente</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><Label>CEP do Imóvel</Label><div className="relative"><Input placeholder="00000-000" value={formData.imovel.cep} onChange={e => handleCepChange(e, 'imovel')} />{isSearchingCep && <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-4 top-3.5" />}</div></div>
                        <div className="md:col-span-2 flex gap-4"><div className="flex-1"><Label>Endereço / Logradouro</Label><Input placeholder="Rua, Av..." value={formData.imovel.endereco} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, endereco: e.target.value}}))} /></div><div className="w-24"><Label>Número</Label><Input name="imovel_numero" placeholder="123" value={formData.imovel.numero} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, numero: e.target.value}}))} /></div></div>
                        <div><Label>Complemento</Label><Input value={formData.imovel.complemento} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, complemento: e.target.value}}))} /></div>
                        <div><Label>Bairro</Label><Input value={formData.imovel.bairro} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, bairro: e.target.value}}))} /></div>
                        <div><Label>Cidade</Label><Input value={formData.imovel.cidade} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, cidade: e.target.value}}))} /></div>
                        <div><Label>UF</Label><Input value={formData.imovel.estado} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, estado: e.target.value}}))} /></div>
                      </div>
                    </>
                  )}
               </div>
               
               {!selectedImovelId && (
                 <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Informações Técnicas (Opcional)</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div><Label>Área Terreno</Label><Input type="number" value={formData.imovel.area_terreno} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, area_terreno: e.target.value}}))} /></div>
                     <div><Label>Área Constr.</Label><Input type="number" value={formData.imovel.area_construida} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, area_construida: e.target.value}}))} /></div>
                     <div><Label>Matrícula</Label><Input value={formData.imovel.num_matricula} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, num_matricula: e.target.value}}))} /></div>
                     <div><Label>IPTU</Label><Input value={formData.imovel.inscricao_imobiliaria} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, inscricao_imobiliaria: e.target.value}}))} /></div>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* STEP 3: SERVIÇO */}
          {step === 3 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden transition-all"><button onClick={() => setIsHelpOpen(!isHelpOpen)} className="w-full flex items-center justify-between px-6 py-4 text-blue-700 font-bold text-sm"><div className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Guia de Preenchimento</div>{isHelpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>{isHelpOpen && (<div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200"><div className="space-y-1"><p className="text-[10px] font-bold text-blue-900 uppercase">Tipo de Serviço</p><p className="text-xs text-blue-700">Selecione o serviço principal que será executado.</p></div><div className="space-y-1"><p className="text-[10px] font-bold text-blue-900 uppercase">Código do Projeto</p><p className="text-xs text-blue-700">Gerado automaticamente para identificação única.</p></div></div>)}</div>
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div><Label help="Se não encontrar, crie um novo.">Tipo de Serviço</Label><select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white font-medium" value={formData.processo.tipo} onChange={e => setFormData(prev => ({...prev, processo: {...prev.processo, tipo: e.target.value}}))}>{Object.keys(groupedServicos).map(cat => (<optgroup key={cat} label={cat}>{groupedServicos[cat].map((s: any) => (<option key={s.id} value={s.nome}>{s.nome}</option>))}</optgroup>))}</select><button onClick={() => setIsNewServiceModalOpen(true)} className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"><Plus className="w-3.5 h-3.5" /> Criar Novo Serviço</button></div><div><Label help="Identificador único.">Código do Projeto</Label><Input value={formData.processo.codigo_projeto} readOnly className="bg-slate-50 font-mono font-bold text-blue-600 border-dashed" /></div></div>
               {selectedServicoData?.subservicos?.length > 0 && (<div className="p-6 bg-slate-50 rounded-2xl border border-slate-100"><Label help="Atividades específicas.">Subserviços Incluídos</Label><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">{selectedServicoData.subservicos.map((sub: string) => (<label key={sub} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors"><input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" checked={formData.processo.subservicos.includes(sub)} onChange={e => { const next = e.target.checked ? [...formData.processo.subservicos, sub] : formData.processo.subservicos.filter(s => s !== sub); setFormData(prev => ({...prev, processo: {...prev.processo, subservicos: next}})) }} /><span className="text-xs font-medium text-slate-700">{sub}</span></label>))}</div></div>)}
               <div><Label help="Detalhamento técnico.">Observações de Escopo</Label><textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[120px]" value={formData.processo.observacoes} onChange={e => setFormData(prev => ({...prev, processo: {...prev.processo, observacoes: e.target.value}}))} /></div></div>
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

      {/* FOOTER NAVIGATION */}
      <div className="bg-white border-t border-slate-200 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${step === 1 ? 'opacity-0' : 'text-slate-500 hover:bg-slate-100'}`}><ChevronLeft className="w-4 h-4" /> Voltar</button>
          <div className="flex items-center gap-3">
             <button onClick={() => router.push('/processos')} className="px-6 py-3 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors">Cancelar</button>
             {step < 4 ? (<button onClick={nextStep} className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95">Continuar <ChevronRight className="w-4 h-4" /></button>) : (<button onClick={handleFinalSubmit} disabled={loading} className="flex items-center gap-2 px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Finalizar Projeto</button>)}
          </div>
        </div>
      </div>

      {/* MODAL NOVO SERVIÇO */}
      {isNewServiceModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"><div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"><div className="p-6 bg-slate-900 text-white flex justify-between items-center"><div className="flex items-center gap-2"><Plus className="w-5 h-5 text-blue-400" /><h2 className="font-bold">Cadastrar Novo Serviço</h2></div><button onClick={() => setIsNewServiceModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button></div><form onSubmit={handleCreateService} className="p-8 space-y-6"><div><Label>Nome do Serviço</Label><Input placeholder="Ex: Regularização" required value={newService.nome} onChange={e => setNewService({...newService, nome: e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><div><Label help="Sigla de 3 letras.">Sigla</Label><Input placeholder="Ex: REG" required maxLength={4} value={newService.sigla} onChange={e => setNewService({...newService, sigla: e.target.value})} /></div><div><Label>Categoria</Label><select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white" value={newService.categoria} onChange={e => setNewService({...newService, categoria: e.target.value})}>{['Regularização', 'Projetos', 'Parcelamento do solo', 'Laudos técnicos', 'Gestão de obra', 'Consultoria'].map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div></div><button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}Salvar Serviço</button></form></div></div>)}

    </div>
  )
}
