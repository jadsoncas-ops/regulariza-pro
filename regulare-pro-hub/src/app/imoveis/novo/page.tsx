'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Building2, User, MapPin, 
  Check, Loader2, Info, HelpCircle 
} from 'lucide-react'

function NovoImovelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteIdParam = searchParams.get('clienteId')
  
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    clienteId: clienteIdParam || '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    area_terreno: '',
    area_construida: '',
    num_matricula: '',
    cartorio: '',
    inscricao_imobiliaria: '',
    zoneamento: '',
    observacoes: ''
  })

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(data => {
        setClientes(data)
        if (clienteIdParam) {
          const found = data.find((c: any) => c.id === clienteIdParam)
          if (found) setClienteSelecionado(found)
        }
      })
  }, [clienteIdParam])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/imoveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        router.push(formData.clienteId ? `/clientes/${formData.clienteId}` : '/imoveis')
      }
    } catch (error) {
      alert('Erro ao cadastrar imóvel.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Novo Imóvel</h1>
              <p className="text-xs text-slate-500">Cadastre uma nova propriedade e vincule a um cliente</p>
            </div>
          </div>
          {clienteSelecionado && (
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {clienteSelecionado.nome.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Cliente Selecionado</p>
                <p className="text-xs font-bold text-slate-700">{clienteSelecionado.nome}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-up">
          
          {/* CLIENTE */}
          {!clienteIdParam && (
            <div className="card p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><User className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold text-slate-800">Vincular a um Cliente</h3>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Selecione o Cliente Proprietário</label>
                <select 
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* LOCALIZAÇÃO */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold text-slate-800">Localização da Propriedade</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Endereço Completo / Logradouro *</label>
                <input name="endereco" value={formData.endereco} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Número *</label>
                <input name="numero" value={formData.numero} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">CEP</label>
                <input name="cep" value={formData.cep} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Bairro</label>
                <input name="bairro" value={formData.bairro} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cidade</label>
                  <input name="cidade" value={formData.cidade} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
                </div>
                <div className="w-20">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">UF</label>
                  <input name="estado" value={formData.estado} onChange={handleInputChange} maxLength={2} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-center uppercase" />
                </div>
              </div>
            </div>
          </div>

          {/* DADOS TÉCNICOS */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold text-slate-800">Dados Técnicos & Registro</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nº Matrícula (RGI)</label>
                <input name="num_matricula" value={formData.num_matricula} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cartório</label>
                <input name="cartorio" value={formData.cartorio} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Área Terreno (m²)</label>
                <input type="number" step="0.01" name="area_terreno" value={formData.area_terreno} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Área Constr. (m²)</label>
                <input type="number" step="0.01" name="area_construida" value={formData.area_construida} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">IPTU / Inscrição</label>
                <input name="inscricao_imobiliaria" value={formData.inscricao_imobiliaria} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Observações Adicionais</label>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none" placeholder="Ex: ZONA, restrições ambientais, etc..."></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={() => router.back()} className="px-8 py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Cadastrar Imóvel</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NovoImovelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <NovoImovelContent />
    </Suspense>
  )
}
