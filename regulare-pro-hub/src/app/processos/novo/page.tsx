'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Home, 
  FileText, 
  CheckCircle2, 
  MapPin, 
  AlertCircle,
  PlusCircle,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

export default function NovoProjetoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sameAddress, setSameAddress] = useState(false)

  // ESTADO DO FORMULÁRIO ÚNICO
  const [formData, setFormData] = useState({
    // CLIENTE
    cliente_nome: '',
    cliente_cpf_cnpj: '',
    cliente_telefone: '',
    cliente_email: '',
    cliente_endereco: '',
    
    // IMÓVEL
    imovel_endereco: '',
    imovel_bairro: '',
    imovel_cidade: '',
    imovel_cep: '',
    imovel_area_terreno: '',
    imovel_area_construida: '',
    imovel_matricula: '',
    imovel_cartorio: '',
    imovel_inscricao: '',
    imovel_zoneamento: '',
    imovel_obs: '',
    
    // PROCESSO
    processo_tipo: 'REGULARIZAÇÃO',
    processo_valor: '0',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const upperValue = value.toUpperCase()
    
    setFormData(prev => {
      const newState = { ...prev, [name]: upperValue }
      
      // Lógica de espelhamento de endereço
      if (sameAddress && name === 'cliente_endereco') {
        newState.imovel_endereco = upperValue
      }
      
      return newState
    })
  }

  const toggleSameAddress = () => {
    setSameAddress(!sameAddress)
    if (!sameAddress) {
      setFormData(prev => ({
        ...prev,
        imovel_endereco: prev.cliente_endereco
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/processos/novo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/processos/${data.id}`)
      } else {
        alert('Erro ao criar projeto. Verifique os dados.')
      }
    } catch (error) {
      console.error(error)
      alert('Erro crítico de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full mb-20 font-mono">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/processos" className="p-2 border border-border hover:bg-muted rounded-sm smooth-transition">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-primary" /> Novo Projeto <span className="text-primary/50">Full Stack</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 font-bold">
              CADASTRO UNIFICADO: CLIENTE + IMÓVEL + PROCESSO + FINANCEIRO
            </p>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-sm text-xs font-black uppercase tracking-widest hover:brightness-110 smooth-transition shadow-lg disabled:opacity-50"
        >
          {loading ? 'PROCESSANDO...' : (
            <>
              <Save className="w-4 h-4" /> Criar Projeto Automaticamente
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 1. DADOS DO CLIENTE */}
        <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/30 p-4 border-b border-border flex items-center gap-2 text-primary">
            <User className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">01. Dados do Cliente</span>
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome Completo / Razão Social *</label>
              <input required name="cliente_nome" value={formData.cliente_nome} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 font-bold" placeholder="EX: HAMILTON BANDEIRA CORRETOR" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CPF / CNPJ *</label>
              <input required name="cliente_cpf_cnpj" value={formData.cliente_cpf_cnpj} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 font-bold" placeholder="000.000.000-00" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Telefone</label>
                <input name="cliente_telefone" value={formData.cliente_telefone} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 font-bold" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                <input type="email" name="cliente_email" value={formData.cliente_email} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 font-bold" placeholder="EXEMPLO@EMAIL.COM" />
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Endereço de Correspondência</label>
              <textarea rows={2} name="cliente_endereco" value={formData.cliente_endereco} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-primary/30 font-bold resize-none" placeholder="RUA, NÚMERO, BAIRRO..." />
            </div>
          </div>
        </div>

        {/* 2. DADOS DO IMÓVEL */}
        <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden flex flex-col xl:col-span-1">
          <div className="bg-muted/30 p-4 border-b border-border flex items-center justify-between text-emerald-500">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">02. Dados do Imóvel / Obra</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={sameAddress} onChange={toggleSameAddress} className="w-3 h-3 rounded-sm border-border text-primary focus:ring-0" />
              <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-emerald-500 transition-colors">Mesmo do Cliente</span>
            </label>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[600px]">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Endereço da Obra *</label>
              <input required name="imovel_endereco" value={formData.imovel_endereco} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold" placeholder="AV. AMÉLIA AMADO, 582" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bairro</label>
                <input name="imovel_bairro" value={formData.imovel_bairro} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold" placeholder="CENTRO" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CEP</label>
                <input name="imovel_cep" value={formData.imovel_cep} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold" placeholder="45600-000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Área Terreno (m²)</label>
                <input type="number" name="imovel_area_terreno" value={formData.imovel_area_terreno} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold" placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Área Const. (m²)</label>
                <input type="number" name="imovel_area_construida" value={formData.imovel_area_construida} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold" placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nº Matrícula</label>
                <input name="imovel_matricula" value={formData.imovel_matricula} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold" placeholder="12.345" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Inscrição Imob.</label>
                <input name="imovel_inscricao" value={formData.imovel_inscricao} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold" placeholder="00.00.000.000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cartório / RGI</label>
              <input name="imovel_cartorio" value={formData.imovel_cartorio} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold" placeholder="EX: 1º OFÍCIO DE REGISTRO DE IMÓVEIS" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zoneamento / Observações Técnicas</label>
              <textarea rows={3} name="imovel_obs" value={formData.imovel_obs} onChange={handleChange} className="w-full bg-background border border-border px-3 py-2 rounded-sm text-xs outline-none focus:ring-1 focus:ring-emerald-500/30 font-bold resize-none" placeholder="ZONEAMENTO URBANO, LIMITAÇÕES, ACESSOS..." />
            </div>
          </div>
        </div>

        {/* 3. CONFIGURAÇÃO DO PROCESSO */}
        <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden flex flex-col">
          <div className="bg-muted/30 p-4 border-b border-border flex items-center gap-2 text-blue-500">
            <FileText className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">03. Configuração do Processo</span>
          </div>
          <div className="p-6 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo de Serviço Principal *</label>
              <select required name="processo_tipo" value={formData.processo_tipo} onChange={handleChange} className="w-full bg-background border border-border px-3 py-3 rounded-sm text-xs outline-none focus:ring-1 focus:ring-blue-500/30 font-black uppercase">
                <option value="REGULARIZAÇÃO">REGULARIZAÇÃO DE OBRA</option>
                <option value="AVERBAÇÃO">AVERBAÇÃO</option>
                <option value="LEVANTAMENTO">LEVANTAMENTO TOPOGRÁFICO</option>
                <option value="DESMEMBRAMENTO">DESMEMBRAMENTO</option>
                <option value="HABITE-SE">HABITE-SE</option>
                <option value="USUCAPIÃO">USUCAPIÃO</option>
                <option value="REURB">REURB</option>
                <option value="ALVARÁ">ALVARÁ DE CONSTRUÇÃO</option>
              </select>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-emerald-500" /> Valor Inicial do Contrato
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">R$</span>
                <input type="number" name="processo_valor" value={formData.processo_valor} onChange={handleChange} className="w-full bg-background border border-border pl-10 pr-3 py-3 rounded-sm text-sm outline-none focus:ring-1 focus:ring-emerald-500/30 font-black" />
              </div>
              <p className="text-[8px] text-muted-foreground font-bold uppercase italic mt-1">
                * O REGISTRO FINANCEIRO SERÁ CRIADO AUTOMATICAMENTE COMO PENDENTE.
              </p>
            </div>

            <div className="mt-8 p-6 border border-primary/20 bg-primary/5 rounded-sm flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-tight">Criação Instantânea</h4>
                  <p className="text-[9px] text-muted-foreground uppercase leading-relaxed mt-1">
                    ESTE PROCESSO SERÁ ADICIONADO AO KANBAN E A PASTA DE DOCUMENTOS SERÁ INICIALIZADA AGORA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* FOOTER MOBILE / FLOATING BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border xl:hidden flex justify-end z-50">
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          {loading ? 'SALVANDO...' : 'CRIAR PROCESSO'}
        </button>
      </div>
    </div>
  )
}
