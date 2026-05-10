'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, User, FileText,
  MapPin, Briefcase, Calendar, ChevronRight,
  TrendingUp, Activity, Ruler, Hash, Plus,
  Camera, Map, Layers, History, Info, Edit,
  ExternalLink, Globe, Landmark, ShieldCheck,
  Search, Filter, Download, MoreVertical,
  CheckCircle2, Clock, AlertCircle, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EditImovelModal } from '@/components/EditImovelModal'

export default function ImovelDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [imovel, setImovel] = useState<any>(null)
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Carregando Ficha do Imóvel...</p>
    </div>
  )

  if (!imovel) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/5 p-12 text-center rounded-[32px] max-w-md">
         <div className="w-20 h-20 bg-white/5 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-6"><Building2 size={40}/></div>
         <h2 className="text-xl font-bold text-white">Imóvel não localizado</h2>
         <p className="text-sm text-slate-500 mt-2">O registro deste imóvel não consta na base de dados ativa.</p>
         <Link href="/imoveis" className="mt-8 inline-flex px-10 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest">Voltar para Base</Link>
      </div>
    </div>
  )

  const processos = imovel.processos || []
  const documentos = imovel.documentos || []
  const cliente = imovel.cliente

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-300 pb-10">
      
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="h-[72px] border-b border-white/5 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/imoveis" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
            <ArrowLeft size={18} />
          </Link>
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{imovel.endereco}, {imovel.numero || 'S/N'}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{imovel.bairro} • {imovel.cidade}/{imovel.estado}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all">
            <Edit size={14} className="inline mr-2" /> Editar Imóvel
          </button>
          <Link href={`/processos/novo?imovelId=${imovel.id}&clienteId=${imovel.clienteId}`} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all">
            Novo Processo
          </Link>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 grid grid-cols-12 gap-6">
        
        {/* ── LEFT PANEL: Property Information (3 Cols) ── */}
        <section className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden flex flex-col">
            <div className="h-48 bg-slate-800 relative group overflow-hidden">
               {/* Simplified static map placeholder or actual map component could go here */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
               <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] font-black text-white bg-blue-600 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {imovel.num_matricula || 'SEM MATRÍCULA'}
                  </span>
               </div>
            </div>
            
            <div className="p-8 space-y-8">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Ficha Técnica</p>
                  <InfoItem icon={MapPin} label="Endereço" value={`${imovel.endereco}, ${imovel.numero || 'S/N'}`} sub={`${imovel.bairro}, ${imovel.cidade}/${imovel.estado}`} />
                  <InfoItem icon={Hash} label="Inscrição Imobiliária" value={imovel.inscricao_imobiliaria || '—'} />
                  <InfoItem icon={Ruler} label="Área Terreno" value={imovel.area_terreno ? `${imovel.area_terreno} m²` : '—'} />
                  <InfoItem icon={Building2} label="Área Construída" value={imovel.area_construida ? `${imovel.area_construida} m²` : '—'} />
                  <InfoItem icon={ShieldCheck} label="Zoneamento" value={imovel.zoneamento || 'Não Inf.'} />
               </div>

               <div className="pt-8 border-t border-white/5 space-y-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Proprietário</p>
                  <div className="flex items-center gap-3 bg-white/2 p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                      {cliente?.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-tight">{cliente?.nome}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{cliente?.cpf_cnpj}</p>
                    </div>
                  </div>
                  <Link href={`/clientes/${cliente?.id}`} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest">
                    Ver ficha do cliente <ArrowRight size={12} />
                  </Link>
               </div>
            </div>
          </div>
        </section>

        {/* ── CENTER PANEL: Linked Processes (6 Cols) ── */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] flex flex-col min-h-[600px]">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Briefcase size={16} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Processos Vinculados</h3>
              </div>
              <span className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
                {processos.length} Total
              </span>
            </div>

            <div className="p-4 flex-1">
               {processos.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <Briefcase size={48} className="text-slate-700 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Nenhum processo iniciado</p>
                    <p className="text-[10px] text-slate-600 mt-2 max-w-[200px]">Clique no botão acima para iniciar uma regularização neste imóvel.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-4">
                    {processos.map((p: any) => (
                      <Link key={p.id} href={`/processos/${p.id}`} className="group flex items-center justify-between p-6 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-3xl transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors border border-white/5">
                            <Activity size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest font-mono">{p.codigo_projeto || 'PROJ-000'}</span>
                              <span className="text-slate-700">•</span>
                              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <h4 className="text-[15px] font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">{p.tipo_regularizacao}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Status Atual</p>
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                p.status === 'finalizado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {p.status.replace('_', ' ')}
                              </span>
                           </div>
                           <ChevronRight size={18} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                 </div>
               )}
            </div>

            <div className="p-8 border-t border-white/5 bg-white/[0.01]">
               <Link href={`/processos/novo?imovelId=${imovel.id}&clienteId=${imovel.clienteId}`} className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/10">
                 <Plus size={18} /> Iniciar Processo para este Imóvel
               </Link>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL: Documents (3 Cols) ── */}
        <section className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] flex flex-col min-h-[400px]">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <FileText size={16} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Documentos</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
               {documentos.length === 0 ? (
                 <div className="py-12 text-center opacity-30">
                    <FileText size={32} className="mx-auto mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Sem arquivos vinculados</p>
                 </div>
               ) : (
                 documentos.map((doc: any) => (
                   <div key={doc.id} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                           <FileText size={14} />
                         </div>
                         <div className="min-w-0">
                           <p className="text-[11px] font-bold text-white truncate">{doc.nome}</p>
                           <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{doc.tipo}</p>
                         </div>
                      </div>
                      <a href={doc.url} target="_blank" className="p-2 text-slate-500 hover:text-white transition-colors">
                        <Download size={14} />
                      </a>
                   </div>
                 ))
               )}
            </div>
            
            <div className="mt-auto p-6">
               <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest">
                 Upload de Documento Técnico
               </button>
            </div>
          </div>

          {/* ACTIVITY CARD */}
          <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <History size={14} className="text-slate-500" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Log do Imóvel</p>
             </div>
             <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                <LogItem title="Matrícula Atualizada" date="Ontem, 14:20" />
                <LogItem title="Processo Iniciado" date="02 Jan 2026" />
                <LogItem title="Imóvel Cadastrado" date="15 Dez 2025" />
             </div>
          </div>
        </section>

      </main>

      <EditImovelModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        imovel={imovel}
        onSuccess={fetchImovel}
      />
    </div>
  )
}

function InfoItem({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 mt-0.5 shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{label}</p>
        <p className="text-[13px] font-bold text-white truncate">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 font-medium truncate">{sub}</p>}
      </div>
    </div>
  )
}

function LogItem({ title, date }: { title: string; date: string }) {
  return (
    <div className="flex gap-4 relative">
       <div className="w-4 h-4 rounded-full bg-slate-900 border border-white/10 mt-1 shrink-0 z-10" />
       <div>
          <p className="text-[11px] font-bold text-slate-300">{title}</p>
          <p className="text-[9px] text-slate-600 font-medium">{date}</p>
       </div>
    </div>
  )
}
