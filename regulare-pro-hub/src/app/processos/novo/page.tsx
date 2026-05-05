'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Building2, FolderKanban, ChevronRight, Check } from 'lucide-react'

const TIPOS_PROCESSO = [
  "Regularização de Obra",
  "Averbação",
  "Levantamento Topográfico",
  "Desmembramento",
  "Habite-se",
  "Usucapião",
  "REURB",
  "Alvará de Construção",
]

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    />
  )
}

function TextArea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-white"
    />
  )
}

function SectionHeader({ icon: Icon, step, title, desc }: { icon: any; step: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">{step}</span>
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-500" /> {title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

export default function NovoProjetoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sameAddress, setSameAddress] = useState(false)
  const [formData, setFormData] = useState({
    cliente_nome: '', cliente_cpf_cnpj: '', cliente_telefone: '', cliente_email: '', cliente_endereco: '',
    imovel_endereco: '', imovel_bairro: '', imovel_cidade: '', imovel_cep: '',
    imovel_area_terreno: '', imovel_area_construida: '',
    imovel_matricula: '', imovel_cartorio: '', imovel_inscricao: '', imovel_zoneamento: '', imovel_obs: '',
    processo_tipo: 'Regularização de Obra', processo_valor: '0',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (sameAddress && name === 'cliente_endereco') next.imovel_endereco = value
      return next
    })
  }

  const toggleSameAddress = () => {
    setSameAddress(!sameAddress)
    if (!sameAddress) setFormData(prev => ({ ...prev, imovel_endereco: prev.cliente_endereco }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/processos/novo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (r.ok) {
        const data = await r.json()
        router.push(`/processos/${data.id}`)
      } else {
        alert('Erro ao criar projeto.')
      }
    } catch {
      alert('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/processos" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <nav className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
                <Link href="/processos" className="hover:text-slate-600 transition-colors">Processos</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-600">Novo Projeto</span>
              </nav>
              <h1 className="text-lg font-semibold text-slate-900">Cadastro Unificado</h1>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {loading ? 'Salvando...' : 'Criar Projeto'}
          </button>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="max-w-screen-lg mx-auto px-8 py-8 space-y-8">

        {/* CLIENTE */}
        <div className="bg-white border border-[hsl(var(--border))] rounded-xl p-7 shadow-sm">
          <SectionHeader icon={User} step={1} title="Dados do Cliente" desc="Informações do requerente ou parceiro responsável" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label>Nome completo / Razão Social *</Label>
              <Input required name="cliente_nome" value={formData.cliente_nome} onChange={handleChange} placeholder="Ex: Maria da Silva Santos" />
            </div>
            <div>
              <Label>CPF / CNPJ *</Label>
              <Input required name="cliente_cpf_cnpj" value={formData.cliente_cpf_cnpj} onChange={handleChange} placeholder="000.000.000-00" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input name="cliente_telefone" value={formData.cliente_telefone} onChange={handleChange} placeholder="(00) 90000-0000" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" name="cliente_email" value={formData.cliente_email} onChange={handleChange} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Endereço de correspondência</Label>
              <Input name="cliente_endereco" value={formData.cliente_endereco} onChange={handleChange} placeholder="Rua, número, bairro" />
            </div>
          </div>
        </div>

        {/* IMÓVEL */}
        <div className="bg-white border border-[hsl(var(--border))] rounded-xl p-7 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" /> Dados do Imóvel / Obra
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Localização e informações técnicas do imóvel</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <div
                onClick={toggleSameAddress}
                className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${sameAddress ? 'bg-blue-600' : 'bg-slate-200'} relative cursor-pointer`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sameAddress ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Mesmo endereço do cliente</span>
            </label>
          </div>

          <div className="space-y-6">
            {/* LOCALIZAÇÃO */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Localização</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Label>Endereço da obra *</Label>
                  <Input required name="imovel_endereco" value={formData.imovel_endereco} onChange={handleChange} placeholder="Av. Principal, 123" />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input name="imovel_bairro" value={formData.imovel_bairro} onChange={handleChange} placeholder="Centro" />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input name="imovel_cidade" value={formData.imovel_cidade} onChange={handleChange} placeholder="Salvador" />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input name="imovel_cep" value={formData.imovel_cep} onChange={handleChange} placeholder="00000-000" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Dados Técnicos</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div>
                  <Label>Área do terreno (m²)</Label>
                  <Input type="number" name="imovel_area_terreno" value={formData.imovel_area_terreno} onChange={handleChange} placeholder="0,00" />
                </div>
                <div>
                  <Label>Área construída (m²)</Label>
                  <Input type="number" name="imovel_area_construida" value={formData.imovel_area_construida} onChange={handleChange} placeholder="0,00" />
                </div>
                <div>
                  <Label>Zoneamento</Label>
                  <Input name="imovel_zoneamento" value={formData.imovel_zoneamento} onChange={handleChange} placeholder="ZR-1" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Registro Imobiliário</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Nº Matrícula</Label>
                  <Input name="imovel_matricula" value={formData.imovel_matricula} onChange={handleChange} placeholder="00.000" />
                </div>
                <div>
                  <Label>Inscrição Imobiliária</Label>
                  <Input name="imovel_inscricao" value={formData.imovel_inscricao} onChange={handleChange} placeholder="00.00.000.0000-0" />
                </div>
                <div className="md:col-span-2">
                  <Label>Cartório / RGI</Label>
                  <Input name="imovel_cartorio" value={formData.imovel_cartorio} onChange={handleChange} placeholder="Ex: 1º Ofício de Registro de Imóveis" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <Label>Observações técnicas</Label>
              <TextArea rows={3} name="imovel_obs" value={formData.imovel_obs} onChange={handleChange} placeholder="Informações adicionais sobre o imóvel, restrições, notas técnicas..." />
            </div>
          </div>
        </div>

        {/* PROCESSO */}
        <div className="bg-white border border-[hsl(var(--border))] rounded-xl p-7 shadow-sm">
          <SectionHeader icon={FolderKanban} step={3} title="Configuração do Processo" desc="Tipo de serviço e valor do contrato" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Tipo de serviço *</Label>
              <select
                required
                name="processo_tipo"
                value={formData.processo_tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
              >
                {TIPOS_PROCESSO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Valor do contrato (R$)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">R$</span>
                <Input type="number" name="processo_valor" value={formData.processo_valor} onChange={handleChange} className="pl-8" placeholder="0,00" />
              </div>
            </div>
          </div>

          {/* SUMMARY BOX */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs font-medium text-blue-700 mb-2">O que será criado automaticamente:</p>
            <ul className="space-y-1">
              {['Cadastro do cliente', 'Cadastro do imóvel vinculado', 'Processo com card no Kanban', 'Registro financeiro inicial'].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-blue-600">
                  <Check className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SUBMIT BUTTON BOTTOM */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/processos" className="px-5 py-2 border border-[hsl(var(--border))] text-sm font-medium text-slate-600 rounded-md hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Check className="w-4 h-4" />}
            {loading ? 'Criando projeto...' : 'Criar Projeto Automaticamente'}
          </button>
        </div>

      </form>
    </div>
  )
}
