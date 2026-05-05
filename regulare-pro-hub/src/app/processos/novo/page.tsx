'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Building2, FolderKanban, 
  DollarSign, Check, ChevronRight, ChevronLeft, 
  Loader2, MapPin, Calculator, Info, Search
} from 'lucide-react'

// --- CONSTANTES E TIPOS ---
const SERVICOS = [
  { id: 'regularizacao', label: 'Regularização de Imóvel', fields: ['area', 'matricula', 'iptu', 'zoneamento'] },
  { id: 'averbacao',     label: 'Averbação de Construção', fields: ['area', 'matricula'] },
  { id: 'desmembramento', label: 'Desmembramento',        fields: ['area', 'matricula', 'zoneamento'] },
  { id: 'unificacao',    label: 'Unificação de Lotes',    fields: ['area', 'matricula'] },
  { id: 'habite_se',     label: 'Habite-se',             fields: ['area'] },
  { id: 'obra',          label: 'Administração de Obra',  fields: [] },
  { id: 'projeto',       label: 'Projeto Arquitetônico', fields: ['area'] },
  { id: 'laudo',         label: 'Laudo Técnico',         fields: [] },
  { id: 'consultoria',   label: 'Consultoria',           fields: [] },
]

// --- COMPONENTES UI AUXILIARES ---
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{children}</label>
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white"
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

  // ESTADO GLOBAL DO WIZARD
  const [formData, setFormData] = useState({
    cliente: { nome: '', cpf_cnpj: '', telefone: '', email: '', endereco: '', cidade: '', observacoes: '' },
    imovel: { 
      cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
      area_terreno: '', area_construida: '', num_matricula: '', cartorio: '', inscricao_imobiliaria: '', zoneamento: '', observacoes: '',
      isProprietario: true,
      proprietario_nome: '', proprietario_doc: '', proprietario_tel: '', proprietario_email: ''
    },
    processo: { tipo: 'Regularização de Imóvel', observacoes: '' },
    financeiro: { valorTotal: '0', entrada: '0', parcelas: '1', parceiros: '0', custos: '0' }
  })

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

  // BUSCA DE CEP
  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      setIsSearchingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            imovel: {
              ...prev.imovel,
              endereco: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf,
              cep: cep
            }
          }))
        }
      } catch (e) { console.error(e) }
      finally { setIsSearchingCep(false) }
    }
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

  const selectedServico = SERVICOS.find(s => s.label === formData.processo.tipo)

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
                      onChange={e => setFormData({...formData, cliente: {...formData.cliente, nome: e.target.value}})}
                    />
                  </div>
                  <div>
                    <Label>CPF ou CNPJ *</Label>
                    <Input 
                      placeholder="000.000.000-00"
                      value={formData.cliente.cpf_cnpj}
                      onChange={e => setFormData({...formData, cliente: {...formData.cliente, cpf_cnpj: maskCpfCnpj(e.target.value)}})}
                    />
                  </div>
                  <div>
                    <Label>Telefone / WhatsApp *</Label>
                    <Input 
                      placeholder="(00) 00000-0000"
                      value={formData.cliente.telefone}
                      onChange={e => setFormData({...formData, cliente: {...formData.cliente, telefone: maskPhone(e.target.value)}})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>E-mail de Contato *</Label>
                    <Input 
                      type="email"
                      placeholder="exemplo@email.com"
                      value={formData.cliente.email}
                      onChange={e => setFormData({...formData, cliente: {...formData.cliente, email: e.target.value}})}
                    />
                  </div>
               </div>
               
               <div className="bg-slate-100/50 p-8 rounded-3xl border border-dashed border-slate-300">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Informações Opcionais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label>Endereço Residencial / Comercial</Label>
                      <Input 
                        placeholder="Rua, Número, Complemento"
                        value={formData.cliente.endereco}
                        onChange={e => setFormData({...formData, cliente: {...formData.cliente, endereco: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input 
                        placeholder="Ex: Itabuna"
                        value={formData.cliente.cidade}
                        onChange={e => setFormData({...formData, cliente: {...formData.cliente, cidade: e.target.value}})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Observações Gerais</Label>
                      <textarea 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[100px]"
                        placeholder="Alguma nota importante sobre este cliente?"
                        value={formData.cliente.observacoes}
                        onChange={e => setFormData({...formData, cliente: {...formData.cliente, observacoes: e.target.value}})}
                      />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* STEP 2: IMÓVEL */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>CEP do Imóvel</Label>
                      <div className="relative">
                        <Input 
                          placeholder="00000-000"
                          value={formData.imovel.cep}
                          onChange={e => handleCepSearch(e.target.value)}
                        />
                        {isSearchingCep && <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-4 top-3.5" />}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Endereço / Logradouro</Label>
                      <Input 
                        placeholder="Rua, Avenida, Travessa..."
                        value={formData.imovel.endereco}
                        onChange={e => setFormData({...formData, imovel: {...formData.imovel, endereco: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input 
                        placeholder="Ex: 123"
                        value={formData.imovel.numero}
                        onChange={e => setFormData({...formData, imovel: {...formData.imovel, numero: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Complemento</Label>
                      <Input 
                        placeholder="Apto, Sala, Loja"
                        value={formData.imovel.complemento}
                        onChange={e => setFormData({...formData, imovel: {...formData.imovel, complemento: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input 
                        placeholder="Nome do Bairro"
                        value={formData.imovel.bairro}
                        onChange={e => setFormData({...formData, imovel: {...formData.imovel, bairro: e.target.value}})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Cidade</Label>
                      <Input 
                        placeholder="Cidade"
                        value={formData.imovel.cidade}
                        onChange={e => setFormData({...formData, imovel: {...formData.imovel, cidade: e.target.value}})}
                      />
                    </div>
                    <div>
                      <Label>Estado (UF)</Label>
                      <Input 
                        placeholder="BA"
                        value={formData.imovel.estado}
                        onChange={e => setFormData({...formData, imovel: {...formData.imovel, estado: e.target.value}})}
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
                      <Input type="number" placeholder="0.00" value={formData.imovel.area_terreno} onChange={e => setFormData({...formData, imovel: {...formData.imovel, area_terreno: e.target.value}})} />
                    </div>
                    <div>
                      <Label>Área Constr. (m²)</Label>
                      <Input type="number" placeholder="0.00" value={formData.imovel.area_construida} onChange={e => setFormData({...formData, imovel: {...formData.imovel, area_construida: e.target.value}})} />
                    </div>
                    <div>
                      <Label>Matrícula</Label>
                      <Input placeholder="Nº Registro" value={formData.imovel.num_matricula} onChange={e => setFormData({...formData, imovel: {...formData.imovel, num_matricula: e.target.value}})} />
                    </div>
                    <div>
                      <Label>Inscrição IPTU</Label>
                      <Input placeholder="00.000..." value={formData.imovel.inscricao_imobiliaria} onChange={e => setFormData({...formData, imovel: {...formData.imovel, inscricao_imobiliaria: e.target.value}})} />
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
                          onClick={() => setFormData({...formData, imovel: {...formData.imovel, isProprietario: !formData.imovel.isProprietario}})}
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
                         <Input value={formData.imovel.proprietario_nome} onChange={e => setFormData({...formData, imovel: {...formData.imovel, proprietario_nome: e.target.value}})} />
                       </div>
                       <div>
                         <Label>CPF / CNPJ</Label>
                         <Input value={formData.imovel.proprietario_doc} onChange={e => setFormData({...formData, imovel: {...formData.imovel, proprietario_doc: maskCpfCnpj(e.target.value)}})} />
                       </div>
                       <div>
                         <Label>Telefone</Label>
                         <Input value={formData.imovel.proprietario_tel} onChange={e => setFormData({...formData, imovel: {...formData.imovel, proprietario_tel: maskPhone(e.target.value)}})} />
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* STEP 3: PROCESSO */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                  <div>
                    <Label>Tipo de Serviço / Projeto *</Label>
                    <select 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white font-medium"
                      value={formData.processo.tipo}
                      onChange={e => setFormData({...formData, processo: {...formData.processo, tipo: e.target.value}})}
                    >
                      {SERVICOS.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                    </select>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Info className="w-3 h-3" /> Campos sugeridos para {formData.processo.tipo}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {selectedServico?.fields.includes('area') && (
                          <div>
                            <Label>Validar Área Total (m²)</Label>
                            <Input value={formData.imovel.area_construida} readOnly className="bg-slate-100 opacity-60" />
                          </div>
                       )}
                       {selectedServico?.fields.includes('matricula') && (
                          <div>
                            <Label>Confirmar Matrícula</Label>
                            <Input value={formData.imovel.num_matricula} readOnly className="bg-slate-100 opacity-60" />
                          </div>
                       )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 italic">Estes campos foram preenchidos na etapa anterior e serão vinculados ao processo.</p>
                  </div>

                  <div>
                    <Label>Observações de Escopo</Label>
                    <textarea 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[120px]"
                      placeholder="Descreva brevemente o que será feito neste serviço..."
                      value={formData.processo.observacoes}
                      onChange={e => setFormData({...formData, processo: {...formData.processo, observacoes: e.target.value}})}
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
                      <Input type="number" value={formData.financeiro.valorTotal} onChange={e => setFormData({...formData, financeiro: {...formData.financeiro, valorTotal: e.target.value}})} />
                    </div>
                    <div>
                      <Label>Valor de Entrada Recebido (R$)</Label>
                      <Input type="number" value={formData.financeiro.entrada} onChange={e => setFormData({...formData, financeiro: {...formData.financeiro, entrada: e.target.value}})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label>Custos Processo</Label>
                         <Input type="number" value={formData.financeiro.custos} onChange={e => setFormData({...formData, financeiro: {...formData.financeiro, custos: e.target.value}})} />
                       </div>
                       <div>
                         <Label>Parceiros</Label>
                         <Input type="number" value={formData.financeiro.parceiros} onChange={e => setFormData({...formData, financeiro: {...formData.financeiro, parceiros: e.target.value}})} />
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

    </div>
  )
}
