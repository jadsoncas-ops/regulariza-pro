'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  PlusCircle, 
  MapPin, 
  User, 
  Calendar as CalendarIcon, 
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  List,
  LayoutGrid
} from 'lucide-react'

interface Processo {
  id: string
  clienteId: string
  imovelId: string | null
  tipo_regularizacao: string
  etapa_atual: string | null
  status: string
  data_inicio: string
  data_previsao: string | null
  responsavel: string | null
  cliente: { nome: string }
  imovel: { endereco: string } | null
}

interface ProcessoKanbanProps {
  initialProcessos: Processo[]
}

export default function ProcessoKanban({ initialProcessos }: ProcessoKanbanProps) {
  const [processos, setProcessos] = useState(initialProcessos)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  const filteredProcessos = processos.filter(p => 
    p.tipo_regularizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.imovel?.endereco?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const columns = {
    'ANÁLISE INICIAL': filteredProcessos.filter(p => p.status === 'em_analise'),
    'DOCUMENTAÇÃO': filteredProcessos.filter(p => p.status === 'documentacao_pendente'),
    'EM ORGÃO PÚBLICO': filteredProcessos.filter(p => ['protocolo_prefeitura', 'em_aprovacao'].includes(p.status)),
    'EXIGÊNCIA TÉCNICA': filteredProcessos.filter(p => p.status === 'exigencia_tecnica'),
    'APROVADO / FINALIZADO': filteredProcessos.filter(p => ['aprovado', 'finalizado'].includes(p.status)),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exigencia_tecnica': return 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)] bg-rose-500/5'
      case 'aprovado': 
      case 'finalizado': return 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)] bg-emerald-500/5'
      case 'em_analise': return 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
      default: return 'border-border shadow-sm'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase()
  }

  return (
    <div className="space-y-8 font-mono">
      
      {/* SEARCH AND ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/20 p-4 border border-border rounded-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="BUSCAR PROCESSO, CLIENTE OU IMÓVEL..."
            className="w-full bg-background border border-border px-10 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 smooth-transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center border border-border rounded-sm overflow-hidden bg-card text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 border-r border-border hover:bg-muted smooth-transition flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> KANBAN
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 hover:bg-muted smooth-transition flex items-center gap-2 ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            >
              <List className="w-3.5 h-3.5" /> LISTA
            </button>
          </div>
          <Link href="/processos/novo" className="flex-1 md:flex-none px-6 py-2.5 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center justify-center gap-2">
            <PlusCircle className="w-3.5 h-3.5" /> NOVO PROCESSO
          </Link>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[60vh]">
          {Object.entries(columns).map(([columnName, items]) => (
            <div key={columnName} className="min-w-[320px] w-[320px] flex-shrink-0">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-border">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{columnName}</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-card border border-border rounded-sm">{items.length.toString().padStart(2, '0')}</span>
              </div>
              
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="border border-dashed border-border rounded-sm p-6 text-center flex flex-col items-center gap-2 bg-muted/5">
                    <FileText className="w-6 h-6 text-muted-foreground opacity-20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Vazio</span>
                  </div>
                ) : items.map(p => (
                  <Link href={`/processos/${p.id}`} key={p.id} className={`block bg-card border ${getStatusColor(p.status)} p-5 rounded-sm relative group cursor-pointer hover:border-foreground/30 smooth-transition`}>
                    
                    {p.status === 'exigencia_tecnica' && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                        <AlertTriangle className="w-3 h-3" /> EXIGÊNCIA
                      </div>
                    )}
                    {(p.status === 'aprovado' || p.status === 'finalizado') && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> {getStatusLabel(p.status)}
                      </div>
                    )}

                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-3 border border-border w-fit px-1.5 py-0.5 rounded-sm bg-muted/50">
                      PRC-{p.id.substring(0,6).toUpperCase()}
                    </div>
                    
                    <div className="font-bold text-sm text-foreground mb-3">{p.tipo_regularizacao.toUpperCase()}</div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-medium">{p.cliente.nome}</span>
                      </div>
                      <div className="flex items-start gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{p.imovel?.endereco || 'SEM IMÓVEL VINCULADO'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Etapa Atual</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground line-clamp-1">{p.etapa_atual || 'Não definida'}</span>
                      </div>
                      {p.data_previsao && (
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-muted-foreground font-bold px-2 py-1 bg-muted/50 rounded-sm">
                          <Clock className="w-3 h-3" />
                          {new Date(p.data_previsao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="border border-border bg-card shadow-md rounded-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4">PROCESSO</th>
                <th className="px-6 py-4">CLIENTE / IMÓVEL</th>
                <th className="px-6 py-4">STATUS / ETAPA</th>
                <th className="px-6 py-4">RESPONSÁVEL</th>
                <th className="px-6 py-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProcessos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic tracking-widest">
                    NENHUM PROCESSO ENCONTRADO PARA "{searchTerm.toUpperCase()}"
                  </td>
                </tr>
              ) : (
                filteredProcessos.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10 smooth-transition group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <Link href={`/processos/${p.id}`} className="font-bold text-sm text-foreground hover:text-primary hover:underline tracking-tight">
                          {p.tipo_regularizacao.toUpperCase()}
                        </Link>
                        <span className="text-[9px] text-muted-foreground mt-1 uppercase tracking-wider font-bold">
                          PRC-{p.id.substring(0,8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-[250px]">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-bold text-foreground">{p.cliente.nome}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                          {p.imovel?.endereco || 'S/ IMÓVEL'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(p.status).replace('shadow-sm', '')}`}>
                          {getStatusLabel(p.status)}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">{p.etapa_atual}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {p.responsavel || 'NÃO ATRIBUÍDO'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/processos/${p.id}`}
                        className="inline-flex px-4 py-2 border border-border bg-card rounded-sm text-[9px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background smooth-transition"
                      >
                        DETALHES
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
