'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, User, FileText,
  MapPin, Briefcase, Calendar, ChevronRight,
  TrendingUp, Activity, Ruler, Hash, Plus
} from 'lucide-react'

export default function ImovelDetailPage() {
  const { id } = useParams()
  const [imovel, setImovel] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/imoveis/${id}`)
      .then(r => r.json())
      .then(d => { setImovel(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Carregando detalhes do imóvel...</div>
  if (!imovel) return <div className="p-8 text-center"><p>Imóvel não encontrado.</p><Link href="/imoveis" className="btn-primary mt-4 inline-flex">Voltar</Link></div>

  const processos = imovel.processos || []
  const cliente = imovel.cliente

  return (
    <div className="space-y-6 animate-fade-up pb-20">
      
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <Link href="/clientes" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg border border-slate-200 transition-colors mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="page-title">{imovel.endereco}, {imovel.numero}</h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3 h-3" /> {imovel.bairro} • {imovel.cidade}/{imovel.estado} • CEP {imovel.cep}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: DADOS TÉCNICOS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Dados da Propriedade</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Informações Técnicas</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Ruler className="w-3 h-3" /> Área Terreno</p>
                <p className="text-sm font-bold text-slate-700">{imovel.area_terreno ? `${imovel.area_terreno} m²` : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Building2 className="w-3 h-3" /> Área Construída</p>
                <p className="text-sm font-bold text-slate-700">{imovel.area_construida ? `${imovel.area_construida} m²` : '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Hash className="w-3 h-3" /> Matrícula</p>
                <p className="text-sm font-bold text-slate-700">{imovel.num_matricula || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Activity className="w-3 h-3" /> Zoneamento</p>
                <p className="text-sm font-bold text-slate-700">{imovel.zoneamento || '—'}</p>
              </div>
            </div>
          </div>

          {/* LISTA DE PROCESSOS VINCULADOS */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Processos Relacionados</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Histórico de Regularização</p>
                </div>
              </div>
              <Link href={`/processos/novo?imovelId=${imovel.id}`} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> Novo Processo
              </Link>
            </div>

            {processos.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic text-sm">
                Nenhum processo vinculado a este imóvel.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {processos.map((p: any) => (
                  <Link key={p.id} href={`/processos/${p.id}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{p.tipo_regularizacao}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.codigo_projeto || 'SEM CÓDIGO'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <p className="text-xs font-bold text-slate-600">{p.status}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: PROPRIETÁRIO */}
        <div className="space-y-6">
          <div className="card p-8 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Proprietário</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Cliente Responsável</p>
              </div>
            </div>

            {cliente ? (
              <Link href={`/clientes/${cliente.id}`} className="block group">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-blue-200 transition-all">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{cliente.nome}</p>
                  <p className="text-xs text-slate-500 mt-1">{cliente.cpf_cnpj}</p>
                  <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                    Ver perfil completo <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ) : (
              <p className="text-xs text-slate-400 italic">Nenhum proprietário vinculado.</p>
            )}
          </div>

          <div className="card p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Notas do Imóvel
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              {imovel.observacoes || 'Nenhuma observação técnica cadastrada para este imóvel.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
