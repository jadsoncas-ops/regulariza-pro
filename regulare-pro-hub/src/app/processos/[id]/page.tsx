'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Home, 
  FileText, 
  DollarSign, 
  ListTodo, 
  History, 
  Info,
  MapPin,
  CheckCircle2,
  Clock,
  User,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function ProcessoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('geral')
  const [processo, setProcesso] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProcesso() {
      try {
        const response = await fetch(`/api/processos/${params.id}`)
        const data = await response.json()
        setProcesso(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProcesso()
  }, [params.id])

  if (loading) return <div className="p-8 font-mono animate-pulse uppercase text-[10px] font-bold">Carregando processo...</div>
  if (!processo) return <div className="p-8 font-mono uppercase text-[10px] font-bold text-rose-500">Processo não encontrado.</div>

  const tabs = [
    { id: 'geral', name: 'Visão Geral', icon: Info },
    { id: 'imovel', name: 'Imóvel / Obra', icon: Home },
    { id: 'documentos', name: 'Documentos', icon: FileText },
    { id: 'financeiro', name: 'Financeiro', icon: DollarSign },
    { id: 'tarefas', name: 'Tarefas', icon: ListTodo },
    { id: 'historico', name: 'Histórico', icon: History },
  ]

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full font-mono mb-20">
      
      {/* HEADER SIMPLIFICADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/processos" className="p-2 border border-border hover:bg-muted rounded-sm transition-all">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-sm border border-primary/20">PRC-{processo.id.substring(0,8)}</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{processo.status.replace(/_/g, ' ')}</span>
            </div>
            <h1 className="text-xl font-black text-foreground uppercase tracking-tight">{processo.tipo_regularizacao}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-5 py-2 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all rounded-sm">Editar</button>
           <button className="px-5 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all rounded-sm">Ações do Processo</button>
        </div>
      </div>

      {/* SISTEMA DE ABAS - UX SaaS MODERNO */}
      <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-sm mb-8 overflow-x-auto whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "text-primary" : ""}`} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="bg-background min-h-[500px]">
        
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="xl:col-span-2 space-y-8">
               <div className="bg-card border border-border p-8 rounded-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-muted-foreground">Status Operacional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Etapa Atual</span>
                        <div className="text-sm font-black mt-1 uppercase text-primary">{processo.etapa_atual || 'INICIAL'}</div>
                     </div>
                     <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Data de Início</span>
                        <div className="text-sm font-black mt-1 uppercase">{new Date(processo.createdAt).toLocaleDateString('pt-BR')}</div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-card border border-border p-8 rounded-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-muted-foreground">Observações</h3>
                  <p className="text-xs leading-relaxed text-foreground/80 font-bold uppercase">{processo.observacoes || 'NÃO HÁ OBSERVAÇÕES PARA ESTE PROCESSO.'}</p>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-muted/30 border border-border p-6 rounded-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Cliente / Requerente</h3>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center text-background text-[10px] font-black">
                        {processo.cliente.nome.substring(0,2).toUpperCase()}
                     </div>
                     <div>
                        <div className="text-xs font-black uppercase">{processo.cliente.nome}</div>
                        <div className="text-[9px] text-muted-foreground font-bold">{processo.cliente.cpf_cnpj}</div>
                     </div>
                  </div>
                  <Link href={`/clientes/${processo.cliente.id}`} className="text-[9px] font-black text-primary uppercase hover:underline">Ver ficha do cliente</Link>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'imovel' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-card border border-border p-8 rounded-sm">
               <div className="flex items-center gap-3 mb-8 text-primary">
                  <MapPin className="w-5 h-5" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Localização e Dados Técnicos</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase">Endereço da Obra</span>
                     <div className="text-sm font-black mt-1 uppercase">{processo.imovel?.endereco || 'NÃO CADASTRADO'}</div>
                  </div>
                  <div>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase">Matrícula / RGI</span>
                     <div className="text-sm font-black mt-1 uppercase">{processo.imovel?.num_matricula || '---'}</div>
                  </div>
                  <div>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase">Inscrição Imob.</span>
                     <div className="text-sm font-black mt-1 uppercase">{processo.imovel?.inscricao_imobiliaria || '---'}</div>
                  </div>
                  <div>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase">Área do Terreno</span>
                     <div className="text-sm font-black mt-1 uppercase">{processo.imovel?.area_terreno ? `${processo.imovel.area_terreno} m²` : '---'}</div>
                  </div>
                  <div>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase">Área Construída</span>
                     <div className="text-sm font-black mt-1 uppercase">{processo.imovel?.area_construida ? `${processo.imovel.area_construida} m²` : '---'}</div>
                  </div>
                  <div>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase">Zoneamento</span>
                     <div className="text-sm font-black mt-1 uppercase">{processo.imovel?.zoneamento || '---'}</div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="bg-card border border-border rounded-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest">Repositório de Arquivos</span>
              <button className="text-[9px] font-black bg-foreground text-background px-3 py-1.5 rounded-sm uppercase">+ Upload</button>
            </div>
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Nenhum documento anexado a este processo.</p>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-sm">
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total do Contrato</span>
                   <div className="text-xl font-black mt-1">R$ 0,00</div>
                </div>
                <div className="bg-card border border-border p-6 rounded-sm">
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-emerald-600">Recebido</span>
                   <div className="text-xl font-black mt-1 text-emerald-600">R$ 0,00</div>
                </div>
                <div className="bg-card border border-border p-6 rounded-sm">
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-amber-600">Pendente</span>
                   <div className="text-xl font-black mt-1 text-amber-600">R$ 0,00</div>
                </div>
             </div>
             <div className="bg-card border border-border rounded-sm p-8 text-center py-20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Sem lançamentos financeiros detalhados.
             </div>
          </div>
        )}

        {activeTab === 'tarefas' && (
          <div className="bg-card border border-border rounded-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest">Checklist de Operação</span>
              <button className="text-[9px] font-black bg-foreground text-background px-3 py-1.5 rounded-sm uppercase">+ Nova Tarefa</button>
            </div>
            <div className="p-12 text-center">
               <ListTodo className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Tudo em dia! Nenhuma tarefa pendente.</p>
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="bg-card border border-border rounded-sm animate-in fade-in slide-in-from-bottom-2 duration-300 p-8">
             <div className="space-y-6">
                <div className="flex gap-4">
                   <div className="w-2 bg-emerald-500 rounded-full h-auto"></div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest">Processo Criado</div>
                      <div className="text-[9px] text-muted-foreground font-bold uppercase">Hoje • Sistema Automático</div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  )
}
