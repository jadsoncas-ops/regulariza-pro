'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Building2, FolderKanban, 
  DollarSign, Check, ChevronRight, ChevronLeft, 
  Loader2, MapPin, Calculator, Info, Search,
  Copy, HelpCircle, Plus, X, ChevronDown, ChevronUp,
  Briefcase
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

// --- PÁGINA PRINCIPAL ---
export default function NovoProjetoWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false)
  
  // Lista de serviços vinda da API
  const [servicosDisponiveis, setServicosDisponiveis] = useState<any[]>([])
  const [loadingServicos, setLoadingServicos] = useState(true)

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
    financeiro: { valorTotal: '0', entrada: '0', parcelas: '1', parceiros: '0', custos: '0' }
  })

  // Estado para criação de novo serviço
  const [newService, setNewService] = useState({
    nome: '', sigla: '', categoria: 'Regularização', descricao: ''
  })

  // BUSCAR SERVIÇOS
  const fetchServicos = async () => {
    try {
      const res = await fetch('/api/servicos')
      const data = await res.json()
      setServicosDisponiveis(data)
      if (data.length > 0 && !formData.processo.tipo) {
        // Seleciona o primeiro serviço por padrão se nada estiver selecionado
        setFormData(prev => ({...prev, processo: {...prev.processo, tipo: data[0].nome}}))
      }
      setLoadingServicos(false)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchServicos()
  }, [])

  // GERAÇÃO AUTOMÁTICA DE CÓDIGO
  useEffect(() => {
    const servico = servicosDisponiveis.find(s => s.nome === formData.processo.tipo)
    if (servico && formData.cliente.nome) {
      const sigla = servico.sigla || 'PRJ'
      const nomeCliente = formData.cliente.nome.split(' ')[0].toUpperCase()
      const random = Math.floor(Math.random() * 999).toString().padStart(3, '0')
      const codigo = `${sigla}_${nomeCliente}_${random}`
      setFormData(prev => ({...prev, processo: {...prev.processo, codigo_projeto: codigo}}))
    }
  }, [formData.processo.tipo, formData.cliente.nome, servicosDisponiveis])

  // MÁSCARAS E VALIDAÇÕES
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
        await fetchServicos()
        setIsNewServiceModalOpen(false)
        setNewService({ nome: '', sigla: '', categoria: 'Regularização', descricao: '' })
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // CÁLCULOS FINANCEIROS
  const calcFinanceiro = () => {
    const total = parseFloat(formData.financeiro.valorTotal) || 0
    const entrada = parseFloat(formData.financeiro.entrada) || 0
    const parceiros = parseFloat(formData.financeiro.parceiros) || 0
    const custos = parseFloat(formData.financeiro.custos) || 0
    
    return {
      saldoAReceber: total - entrada,
      custoTotal: parceiros + custos,
      lucroEstimado: total - (parceiros + custos)
    }
  }

  const fin = calcFinanceiro()

  // SALVAMENTO FINAL
  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/processos/novo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/processos/${data.id}`)
      }
    } catch (e) {
      alert('Erro ao salvar projeto.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  // Agrupamento de serviços por categoria
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
      
      {/* WIZARD HEADER & PROGRESS */}
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
        <div className="max-w-4xl mx-auto">
          
          {/* STEP 1: CLIENTE */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="md:col-span-2">
                    <Label>Nome do Cliente / Empresa *</Label>
                    <Input 
                      placeholder="Nome completo ou Razão Social"
                      value={formData.cliente.nome}
                      onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, nome: e.target.value}}))}
                    />
                  </div>
                  <div>
                    <Label>CPF ou CNPJ *</Label>
                    <Input 
                      placeholder="000.000.000-00"
                      value={formData.cliente.cpf_cnpj}
                      onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, cpf_cnpj: maskCpfCnpj(e.target.value)}}))}
                    />
                  </div>
                  <div>
                    <Label>Telefone / WhatsApp *</Label>
                    <Input 
                      placeholder="(00) 00000-0000"
                      value={formData.cliente.telefone}
                      onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, telefone: maskPhone(e.target.value)}}))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>E-mail de Contato *</Label>
                    <Input 
                      type="email"
                      placeholder="exemplo@email.com"
                      value={formData.cliente.email}
                      onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, email: e.target.value}}))}
                    />
                  </div>
               </div>
               
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Endereço de Cobrança / Correspondência</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>CEP</Label>
                      <div className="relative">
                        <Input 
                          placeholder="00000-000"
                          value={formData.cliente.cep}
                          onChange={e => handleCepChange(e, 'cliente')}
                        />
                        {isSearchingCep && <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-4 top-3.5" />}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex gap-4">
                       <div className="flex-1">
                          <Label>Logradouro / Endereço</Label>
                          <Input 
                            placeholder="Rua, Av..."
                            value={formData.cliente.endereco}
                            onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, endereco: e.target.value}}))}
                          />
                       </div>
                       <div className="w-24">
                          <Label>Número</Label>
                          <Input 
                            name="cliente_numero"
                            placeholder="123"
                            value={formData.cliente.numero}
                            onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, numero: e.target.value}}))}
                          />
                       </div>
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input 
                        placeholder="Bairro"
                        value={formData.cliente.bairro}
                        onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, bairro: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input 
                        placeholder="Cidade"
                        value={formData.cliente.cidade}
                        onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, cidade: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Input 
                        placeholder="UF"
                        value={formData.cliente.estado}
                        onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, estado: e.target.value}}))}
                      />
                    </div>
                  </div>
               </div>

               <div className="bg-slate-100/50 p-8 rounded-3xl border border-dashed border-slate-300">
                  <Label>Observações Gerais do Cliente</Label>
                  <textarea 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[80px]"
                    placeholder="Alguma nota importante sobre este cliente?"
                    value={formData.cliente.observacoes}
                    onChange={e => setFormData(prev => ({...prev, cliente: {...prev.cliente, observacoes: e.target.value}}))}
                  />
               </div>
            </div>
          )}

          {/* STEP 2: IMÓVEL */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Localização da Obra</h3>
                     <button 
                       type="button"
                       onClick={copyAddressFromCliente}
                       className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                     >
                       <Copy className="w-3 h-3" /> Usar mesmo endereço do cliente
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>CEP do Imóvel</Label>
                      <div className="relative">
                        <Input 
                          placeholder="00000-000"
                          value={formData.imovel.cep}
                          onChange={e => handleCepChange(e, 'imovel')}
                        />
                        {isSearchingCep && <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-4 top-3.5" />}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex gap-4">
                       <div className="flex-1">
                          <Label>Endereço / Logradouro</Label>
                          <Input 
                            placeholder="Rua, Avenida, Travessa..."
                            value={formData.imovel.endereco}
                            onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, endereco: e.target.value}}))}
                          />
                       </div>
                       <div className="w-24">
                          <Label>Número</Label>
                          <Input 
                            name="imovel_numero"
                            placeholder="Ex: 123"
                            value={formData.imovel.numero}
                            onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, numero: e.target.value}}))}
                          />
                       </div>
                    </div>
                    <div>
                      <Label>Complemento</Label>
                      <Input 
                        placeholder="Apto, Sala, Loja"
                        value={formData.imovel.complemento}
                        onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, complemento: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input 
                        placeholder="Nome do Bairro"
                        value={formData.imovel.bairro}
                        onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, bairro: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input 
                        placeholder="Cidade"
                        value={formData.imovel.cidade}
                        onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, cidade: e.target.value}}))}
                      />
                    </div>
                    <div>
                      <Label>Estado (UF)</Label>
                      <Input 
                        placeholder="BA"
                        value={formData.imovel.estado}
                        onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, estado: e.target.value}}))}
                      />
                    </div>
                  </div>
               </div>

               {/* DADOS TÉCNICOS OPCIONAIS */}
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Informações Técnicas (Opcional)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <Label>Área Terreno (m²)</Label>
                      <Input type="number" placeholder="0.00" value={formData.imovel.area_terreno} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, area_terreno: e.target.value}}))} />
                    </div>
                    <div>
                      <Label>Área Constr. (m²)</Label>
                      <Input type="number" placeholder="0.00" value={formData.imovel.area_construida} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, area_construida: e.target.value}}))} />
                    </div>
                    <div>
                      <Label>Matrícula</Label>
                      <Input placeholder="Nº Registro" value={formData.imovel.num_matricula} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, num_matricula: e.target.value}}))} />
                    </div>
                    <div>
                      <Label>Inscrição IPTU</Label>
                      <Input placeholder="00.000..." value={formData.imovel.inscricao_imobiliaria} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, inscricao_imobiliaria: e.target.value}}))} />
                    </div>
                  </div>
               </div>

               {/* PROPRIETÁRIO */}
               <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Proprietário do Imóvel</h3>
                     <label className="flex items-center gap-3 cursor-pointer">
                        <span className="text-xs font-bold text-slate-600">O proprietário é o cliente?</span>
                        <div 
                          onClick={() => setFormData(prev => ({...prev, imovel: {...prev.imovel, isProprietario: !prev.imovel.isProprietario}}))}
                          className={`w-12 h-6 rounded-full transition-colors relative ${formData.imovel.isProprietario ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                           <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.imovel.isProprietario ? 'translate-x-6' : ''}`} />
                        </div>
                     </label>
                  </div>
                  
                  {!formData.imovel.isProprietario && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                       <div className="md:col-span-2">
                         <Label>Nome do Proprietário</Label>
                         <Input value={formData.imovel.proprietario_nome} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, proprietario_nome: e.target.value}}))} />
                       </div>
                       <div>
                         <Label>CPF / CNPJ</Label>
                         <Input value={formData.imovel.proprietario_doc} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, proprietario_doc: maskCpfCnpj(e.target.value)}}))} />
                       </div>
                       <div>
                         <Label>Telefone</Label>
                         <Input value={formData.imovel.proprietario_tel} onChange={e => setFormData(prev => ({...prev, imovel: {...prev.imovel, proprietario_tel: maskPhone(e.target.value)}}))} />
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* STEP 3: SERVIÇO */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               {/* GUIA DE PREENCHIMENTO */}
               <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setIsHelpOpen(!isHelpOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 text-blue-700 font-bold text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" /> Guia de Preenchimento
                    </div>
                    {isHelpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isHelpOpen && (
                    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-blue-900 uppercase">Tipo de Serviço</p>
                          <p className="text-xs text-blue-700">Selecione o serviço principal que será executado no projeto.</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-blue-900 uppercase">Código do Projeto</p>
                          <p className="text-xs text-blue-700">Será gerado automaticamente com base no tipo de serviço e cliente.</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-blue-900 uppercase">Subserviços</p>
                          <p className="text-xs text-blue-700">Marque apenas as atividades incluídas no contrato.</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-blue-900 uppercase">Observações de Escopo</p>
                          <p className="text-xs text-blue-700">Descreva brevemente o que será feito no serviço.</p>
                       </div>
                    </div>
                  )}
               </div>

               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <Label help="Selecione o serviço principal. Se não encontrar, crie um novo abaixo.">Tipo de Serviço</Label>
                        <select 
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white font-medium"
                          value={formData.processo.tipo}
                          onChange={e => setFormData(prev => ({...prev, processo: {...prev.processo, tipo: e.target.value}}))}
                        >
                          {Object.keys(groupedServicos).map(cat => (
                            <optgroup key={cat} label={cat}>
                              {groupedServicos[cat].map((s: any) => (
                                <option key={s.id} value={s.nome}>{s.nome}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <button 
                          onClick={() => setIsNewServiceModalOpen(true)}
                          className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                        >
                           <Plus className="w-3.5 h-3.5" /> Criar Novo Serviço
                        </button>
                     </div>

                     <div>
                        <Label help="Identificador único gerado automaticamente para o projeto.">Código do Projeto</Label>
                        <Input 
                          value={formData.processo.codigo_projeto}
                          readOnly
                          className="bg-slate-50 font-mono font-bold text-blue-600 border-dashed"
                        />
                     </div>
                  </div>

                  {/* SUBSERVIÇOS DINÂMICOS */}
                  {selectedServicoData?.subservicos?.length > 0 && (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <Label help="Atividades específicas que compõem este serviço.">Subserviços Incluídos</Label>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {selectedServicoData.subservicos.map((sub: string) => (
                            <label key={sub} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                               <input 
                                 type="checkbox" 
                                 className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                                 checked={formData.processo.subservicos.includes(sub)}
                                 onChange={e => {
                                   const next = e.target.checked 
                                     ? [...formData.processo.subservicos, sub]
                                     : formData.processo.subservicos.filter(s => s !== sub)
                                   setFormData(prev => ({...prev, processo: {...prev.processo, subservicos: next}}))
                                 }}
                               />
                               <span className="text-xs font-medium text-slate-700">{sub}</span>
                            </label>
                          ))}
                       </div>
                    </div>
                  )}

                  <div>
                    <Label help="Detalhamento livre do escopo contratado.">Observações de Escopo</Label>
                    <textarea 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[120px]"
                      placeholder="Descreva o escopo técnico do projeto..."
                      value={formData.processo.observacoes}
                      onChange={e => setFormData(prev => ({...prev, processo: {...prev.processo, observacoes: e.target.value}}))}
                    />
                  </div>
               </div>
            </div>
          )}

          {/* STEP 4: FINANCEIRO */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                      <Label>Valor Total do Contrato (R$)</Label>
                      <Input type="number" value={formData.financeiro.valorTotal} onChange={e => setFormData(prev => ({...prev, financeiro: {...prev.financeiro, valorTotal: e.target.value}}))} />
                    </div>
                    <div>
                      <Label>Valor de Entrada Recebido (R$)</Label>
                      <Input type="number" value={formData.financeiro.entrada} onChange={e => setFormData(prev => ({...prev, financeiro: {...prev.financeiro, entrada: e.target.value}}))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label>Custos Processo</Label>
                         <Input type="number" value={formData.financeiro.custos} onChange={e => setFormData(prev => ({...prev, financeiro: {...prev.financeiro, custos: e.target.value}}))} />
                       </div>
                       <div>
                         <Label>Parceiros</Label>
                         <Input type="number" value={formData.financeiro.parceiros} onChange={e => setFormData(prev => ({...prev, financeiro: {...prev.financeiro, parceiros: e.target.value}}))} />
                       </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
                     <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Resumo Estimado</h3>
                        <div className="space-y-6">
                           <div>
                              <p className="text-xs text-slate-500 mb-1">Saldo a Receber</p>
                              <p className="text-2xl font-bold text-amber-400">R$ {fin.saldoAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                           </div>
                           <div>
                              <p className="text-xs text-slate-500 mb-1">Custo Total Previsto</p>
                              <p className="text-lg font-bold text-slate-300 text-red-400">R$ {fin.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-xs text-slate-500 mb-1">Lucro Estimado</p>
                        <p className="text-4xl font-bold text-emerald-400">R$ {fin.lucroEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-slate-500 mt-2 italic">* Cálculos baseados nos valores brutos informados.</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="bg-white border-t border-slate-200 px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${step === 1 ? 'opacity-0' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => router.push('/processos')}
               className="px-6 py-3 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
             >
               Cancelar
             </button>
             
             {step < 4 ? (
               <button 
                 onClick={nextStep}
                 className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
               >
                 Continuar <ChevronRight className="w-4 h-4" />
               </button>
             ) : (
               <button 
                 onClick={handleFinalSubmit}
                 disabled={loading}
                 className="flex items-center gap-2 px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50"
               >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                 Finalizar Projeto
               </button>
             )}
          </div>
        </div>
      </div>

      {/* MODAL NOVO SERVIÇO */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" />
                    <h2 className="font-bold">Cadastrar Novo Serviço</h2>
                 </div>
                 <button onClick={() => setIsNewServiceModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <form onSubmit={handleCreateService} className="p-8 space-y-6">
                 <div>
                    <Label>Nome do Serviço</Label>
                    <Input 
                      placeholder="Ex: Regularização de Imóvel" 
                      required 
                      value={newService.nome}
                      onChange={e => setNewService({...newService, nome: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <Label help="Sigla de 3 ou 4 letras para o código.">Sigla</Label>
                       <Input 
                        placeholder="Ex: REG" 
                        required 
                        maxLength={4}
                        value={newService.sigla}
                        onChange={e => setNewService({...newService, sigla: e.target.value})}
                       />
                    </div>
                    <div>
                       <Label>Categoria</Label>
                       <select 
                         className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white"
                         value={newService.categoria}
                         onChange={e => setNewService({...newService, categoria: e.target.value})}
                       >
                         {['Regularização', 'Projetos', 'Parcelamento do solo', 'Laudos técnicos', 'Gestão de obra', 'Consultoria'].map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                       </select>
                    </div>
                 </div>
                 <div>
                    <Label>Descrição Curta</Label>
                    <textarea 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[80px]"
                      placeholder="Para que serve este serviço?"
                      value={newService.descricao}
                      onChange={e => setNewService({...newService, descricao: e.target.value})}
                    />
                 </div>
                 <button 
                   type="submit"
                   disabled={loading}
                   className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                   Salvar Serviço
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  )
}
