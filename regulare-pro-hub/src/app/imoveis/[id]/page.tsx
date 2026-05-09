'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, User, FileText,
  MapPin, Briefcase, Calendar, ChevronRight,
  TrendingUp, Activity, Ruler, Hash, Plus,
  Camera, Map, Layers, History, Info, Edit,
  ExternalLink, Globe, Landmark, ShieldCheck
} from 'lucide-react'
import { EditImovelModal } from '@/components/EditImovelModal'

const TABS = [
  { id: 'tecnico',   label: 'Ficha Técnica',    icon: Ruler },
  { id: 'processos', label: 'Histórico Operac.', icon: Briefcase },
  { id: 'documentos',label: 'Documentos',       icon: FileText },
  { id: 'fotos',     label: 'Fotos & Mídia',    icon: Camera },
]

export default function ImovelDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [imovel, setImovel] = useState<any>(null)
  const [tab, setTab] = useState('tecnico')
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchImovel = () => {
    fetch(`/api/imoveis/${id}`)
      .then(r => r.json())
      .then(d => { setImovel(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchImovel()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coletando Dados Técnicos...</p>
    </div>
  )

  if (!imovel) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="card p-12 text-center border-0 shadow-xl max-w-md bg-white">
         <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6"><Building2 size={40}/></div>
         <h2 className="text-xl font-bold text-slate-900">Imóvel não localizado</h2>
         <p className="text-sm text-slate-500 mt-2">O registro deste imóvel não consta na base de dados ativa.</p>
         <Link href="/imoveis" className="btn-primary mt-8 inline-flex px-10">Voltar para Base</Link>
      </div>
    </div>
  )

  const processos = imovel.processos || []
  const cliente = imovel.cliente

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      
      {/* HEADER TÉCNICO PREMIUM */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-6 py-8">
           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                 <Link href="/imoveis" className="p-3 bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl transition-all group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                 </Link>
                 <div>
                    <div className="flex items-center gap-2 mb-1.5">
                       <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Unidade Técnica</span>
                       <span className="text-slate-200">•</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">MATRÍCULA: {imovel.num_matricula || 'NÃO INF.'}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{imovel.endereco}, {imovel.numero}</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                       <MapPin size={14} className="text-slate-400" /> {imovel.bairro} • {imovel.cidade}/{imovel.estado} • CEP {imovel.cep}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="hidden lg:block text-right mr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável Atual</p>
                    <p className="text-sm font-bold text-slate-800">{cliente?.nome || 'Proprietário não inf.'}</p>
                 </div>
                 <button onClick={() => setIsEditModalOpen(true)} className="p-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-sm">
                    <Edit size={18} />
                 </button>
                 <Link href={`/processos/novo?imovelId=${imovel.id}`} className="btn-primary px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-100">
                    + Iniciar Processo
                 </Link>
              </div>
           </div>

           {/* PROPERTY TABS */}
           <div className="flex items-center gap-2 mt-10 overflow-x-auto no-scrollbar">
              {TABS.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-xs font-bold transition-all rounded-xl whitespace-nowrap ${
                    tab === t.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 py-10">
        
        {/* ── FICHA TÉCNICA ─────────────────────────────────────────── */}
        {tab === 'tecnico' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             <div className="lg:col-span-2 space-y-8">
                {/* DADOS DE REGISTRO E ÁREA */}
                <div className="card p-8 border-0 shadow-sm bg-white">
                   <h3 className="text-sm font-bold text-slate-800 mb-8 flex items-center gap-2"><Landmark size={18} className="text-blue-500"/> Registro e Medições</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                      <TechnicalField icon={Hash} label="Matrícula RGI" value={imovel.num_matricula} />
                      <TechnicalField icon={Landmark} label="Cartório de Registro" value={imovel.cartorio} />
                      <TechnicalField icon={Ruler} label="Área do Terreno" value={imovel.area_terreno ? `${imovel.area_terreno} m²` : null} />
                      <TechnicalField icon={Building2} label="Área Construída" value={imovel.area_construida ? `${imovel.area_construida} m²` : null} />
                      <TechnicalField icon={Layers} label="Inscrição Imobiliária" value={imovel.inscricao_imobiliaria} />
                      <TechnicalField icon={ShieldCheck} label="ZONA" value={imovel.zoneamento} highlight />
                   </div>
                </div>

                {/* LOCALIZAÇÃO E GEORREFERENCIAMENTO */}
                <div className="card p-8 border-0 shadow-sm bg-white overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Globe size={18} className="text-blue-500"/> Localização Geográfica</h3>
                      <button className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"><Map size={12}/> Ver no Google Maps</button>
                   </div>
                   <div className="aspect-video w-full bg-slate-100 rounded-3xl border border-slate-100 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-46.6333,23.5505,15,0/800x450?access_token=pk.xxx')] bg-cover bg-center grayscale opacity-50 group-hover:grayscale-0 transition-all duration-700" />
                      <div className="relative z-10 text-center">
                         <MapPin size={32} className="text-red-500 mx-auto mb-2 drop-shadow-md" />
                         <p className="text-[10px] font-bold text-slate-900 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">COORDENADAS EM PROCESSAMENTO</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-8">
                {/* PROPRIETÁRIO ATUAL */}
                <div className="card p-8 border-0 shadow-sm bg-white border-l-4 border-l-blue-500">
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Proprietário / Titular</h3>
                   {cliente ? (
                     <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400">{cliente.nome.charAt(0)}</div>
                           <div>
                              <p className="text-sm font-bold text-slate-800">{cliente.nome}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cliente.cpf_cnpj}</p>
                           </div>
                        </div>
                        <Link href={`/clientes/${cliente.id}`} className="w-full py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-100">
                           Ver Ficha do Cliente <ExternalLink size={12}/>
                        </Link>
                     </div>
                   ) : (
                     <p className="text-xs text-slate-400 italic">Nenhum proprietário vinculado.</p>
                   )}
                </div>

                {/* NOTAS TÉCNICAS */}
                <div className="card p-8 border-0 shadow-sm bg-slate-900 text-white">
                   <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Notas Técnicas do Objeto</h3>
                   <p className="text-sm text-slate-400 leading-relaxed italic">
                      {imovel.observacoes || 'Sem observações técnicas registradas para esta unidade. Adicione notas sobre zoneamento, topografia ou restrições.'}
                   </p>
                </div>
             </div>

          </div>
        )}

        {/* ── HISTÓRICO DE PROCESSOS ───────────────────────────────── */}
        {tab === 'processos' && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="card border-0 shadow-sm bg-white overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                   <div>
                      <h3 className="text-sm font-bold text-slate-800">Processos Vinculados</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Histórico completo de regularizações e projetos deste imóvel</p>
                   </div>
                   <Link href={`/processos/novo?imovelId=${imovel.id}`} className="btn-primary py-2 px-6 text-[10px] uppercase">+ Abrir Novo Processo</Link>
                </div>
                
                <div className="divide-y divide-slate-50">
                   {processos.length === 0 ? (
                     <div className="p-20 text-center text-slate-400 italic text-sm">Este imóvel não possui processos anteriores registrados.</div>
                   ) : processos.map((p: any) => (
                     <div key={p.id} className="p-8 hover:bg-slate-50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm">
                                 <Briefcase size={24}/>
                              </div>
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">{p.codigo_projeto || 'SEM CÓDIGO'}</span>
                                    <span className="text-slate-200">•</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                                 </div>
                                 <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{p.tipo_regularizacao}</h4>
                              </div>
                           </div>
                           <div className="flex items-center gap-8">
                              <div className="text-right">
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Situação</p>
                                 <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">{p.status}</span>
                              </div>
                              <Link href={`/processos/${p.id}`} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                 <ExternalLink size={18}/>
                              </Link>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* ── PLACEHOLDERS PARA DOCS E FOTOS ────────────────────────── */}
        {(tab === 'documentos' || tab === 'fotos') && (
          <div className="py-32 text-center animate-in fade-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                {tab === 'documentos' ? <FileText size={40}/> : <Camera size={40}/>}
             </div>
             <h3 className="text-lg font-bold text-slate-800">Base em Construção</h3>
             <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Esta área está sendo preparada para receber {tab === 'documentos' ? 'a documentação técnica (Matrícula, Habite-se, etc)' : 'o levantamento fotográfico'} do imóvel.</p>
             <button className="mt-8 btn-primary px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-100">+ Adicionar {tab === 'documentos' ? 'Documento' : 'Fotos'}</button>
          </div>
        )}

      </div>

      <EditImovelModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        imovel={imovel}
        onSuccess={fetchImovel}
      />
    </div>
  )
}

function TechnicalField({ icon: Icon, label, value, highlight }: { icon: any; label: string; value?: string | null; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`p-2.5 rounded-xl border ${highlight ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
         <Icon size={18} />
      </div>
      <div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <p className={`text-sm font-bold ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>
            {value || <span className="text-slate-300 font-normal italic">— Não Consta</span>}
         </p>
      </div>
    </div>
  )
}
