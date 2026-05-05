"use client";

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
  LayoutGrid,
  DollarSign,
  ArrowRight,
  TrendingUp,
  CreditCard
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

interface Financeiro {
  tipo: string
  valor: number
  valor_pago: number
  status: string
}

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
  financeiro: Financeiro[]
}

interface ProcessoKanbanProps {
  initialProcessos: Processo[]
}

export default function ProcessoKanban({ initialProcessos }: ProcessoKanbanProps) {
  const [processos, setProcessos] = useState(initialProcessos)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null)

  const activeProcess = processos.find(p => p.id === activeProcessId)

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
    'FINALIZADO': filteredProcessos.filter(p => ['aprovado', 'finalizado'].includes(p.status)),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exigencia_tecnica': return 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
      case 'aprovado': 
      case 'finalizado': return 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
      case 'em_analise': return 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
      default: return 'border-border shadow-sm'
    }
  }

  const calculateFinances = (p: Processo) => {
    const faturamentoTotal = p.financeiro.filter(f => f.tipo === 'receita').reduce((a, b) => a + b.valor, 0)
    const receitaPaga = p.financeiro.filter(f => f.tipo === 'receita').reduce((a, b) => a + b.valor_pago, 0)
    const despesaTotal = p.financeiro.filter(f => f.tipo === 'despesa').reduce((a, b) => a + b.valor, 0)
    const despesaPaga = p.financeiro.filter(f => f.tipo === 'despesa').reduce((a, b) => a + b.valor_pago, 0)

    return {
      faturamentoTotal,
      receitaPaga,
      receitaPendente: faturamentoTotal - receitaPaga,
      despesaTotal,
      despesaPaga,
      despesaPendente: despesaTotal - despesaPaga,
      lucroEsperado: faturamentoTotal - despesaTotal,
      caixaReal: receitaPaga - despesaPaga
    }
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
                ) : items.map(p => {
                  const fin = calculateFinances(p)
                  return (
                  <div 
                    key={p.id} 
                    onClick={() => setActiveProcessId(p.id)}
                    className={`block bg-card border ${getStatusColor(p.status)} rounded-sm relative group cursor-pointer hover:border-foreground/30 smooth-transition overflow-hidden hover:-translate-y-0.5`}
                  >
                    {/* Stage Ribbon (Banner Interno) */}
                    <div className={`px-3 py-1.5 flex items-center justify-between border-b text-white shadow-sm ${
                        p.status === 'em_analise' ? 'bg-gradient-to-r from-blue-500 to-blue-500/80 border-blue-500/20' :
                        p.status === 'exigencia_tecnica' ? 'bg-gradient-to-r from-amber-500 to-amber-500/80 border-amber-500/20' :
                        p.status === 'aprovado' || p.status === 'finalizado' ? 'bg-gradient-to-r from-emerald-500 to-emerald-500/80 border-emerald-500/20' :
                        'bg-gradient-to-r from-slate-500 to-slate-500/80 border-slate-500/20'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-[0.1em]">{p.etapa_atual || 'INICIADO'}</span>
                      </div>
                      {p.status === 'exigencia_tecnica' && (
                        <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded text-[7px] font-black uppercase animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" /> PENDÊNCIA
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2.5">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-foreground line-clamp-1">{p.cliente.nome}</span>
                          <span className="text-[7px] h-3.5 px-1 flex items-center justify-center font-black uppercase shrink-0 bg-muted text-muted-foreground rounded-sm border border-border tracking-wider">PRC-{p.id.substring(0,4)}</span>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity mt-0.5">{p.tipo_regularizacao}</span>
                      </div>

                      {/* Mini Financial Grid */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-3 py-2 border-y border-border/50 bg-muted/20 rounded-sm px-2 -mx-1">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-tighter">Recebido</span>
                          <span className="text-[9px] font-black text-emerald-500">R$ {fin.receitaPaga.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-tighter">Falta (Líquida)</span>
                          <span className="text-[9px] font-black text-sky-500">R$ {fin.receitaPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-tighter">Despesas</span>
                          <span className="text-[9px] font-black text-rose-500">R$ {fin.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-tighter">Lucro Total</span>
                          <span className="text-[9px] font-black text-primary">R$ {fin.lucroEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5 transition-all">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            fin.faturamentoTotal > 0 && fin.receitaPendente <= 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                            fin.receitaPaga > 0 ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          }`} />
                          <span className="text-[8px] font-black uppercase text-muted-foreground/80 tracking-widest">
                            {fin.faturamentoTotal > 0 && fin.receitaPendente <= 0 ? 'PAGO' : fin.receitaPaga > 0 ? 'PARCIAL' : 'PENDENTE'}
                          </span>
                        </div>
                        {p.responsavel && (
                          <span className="text-[8px] h-4 flex items-center justify-center px-1.5 border border-primary/20 text-primary bg-primary/5 uppercase font-black tracking-tight max-w-[80px] truncate rounded-sm">
                            👤 {p.responsavel.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
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
                <th className="px-6 py-4">LUCRO PROJ.</th>
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
                filteredProcessos.map((p) => {
                  const fin = calculateFinances(p)
                  return (
                  <tr key={p.id} className="hover:bg-muted/10 smooth-transition group cursor-pointer" onClick={() => setActiveProcessId(p.id)}>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground hover:text-primary hover:underline tracking-tight">
                          {p.tipo_regularizacao.toUpperCase()}
                        </span>
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
                          {p.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">{p.etapa_atual}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-primary">
                        R$ {fin.lucroEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        className="inline-flex px-4 py-2 border border-border bg-card rounded-sm text-[9px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background smooth-transition"
                      >
                        GAVETA
                      </button>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* GAVETA / DRAWER (Sheet) */}
      <Sheet open={!!activeProcessId} onOpenChange={(open) => !open && setActiveProcessId(null)}>
        <SheetContent className="w-full sm:max-w-md border-l border-border bg-background p-0 flex flex-col font-mono" side="right">
          {activeProcess && (
            <>
              <SheetHeader className="p-6 border-b border-border bg-muted/20">
                <SheetTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
                  <FolderClosed className="w-4 h-4 text-primary" /> {activeProcess.tipo_regularizacao}
                </SheetTitle>
                <SheetDescription className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  {activeProcess.cliente.nome} • PRC-{activeProcess.id.substring(0,6)}
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Status Geral */}
                <div className="space-y-3">
                  <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status Atual</h4>
                  <div className={`p-4 rounded-sm border flex items-center justify-between ${getStatusColor(activeProcess.status)}`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{activeProcess.status.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-muted-foreground mt-1">{activeProcess.etapa_atual || 'Iniciado'}</span>
                    </div>
                  </div>
                </div>

                {/* Resumo Financeiro na Gaveta */}
                <div className="space-y-3">
                  <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" /> Posição Financeira
                  </h4>
                  <div className="bg-card border border-border p-4 rounded-sm space-y-4 shadow-sm">
                    
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Valor do Contrato</span>
                      <span className="text-sm font-bold">R$ {calculateFinances(activeProcess).faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recebido</span>
                        <span className="font-bold text-emerald-500">R$ {calculateFinances(activeProcess).receitaPaga.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pendente</span>
                        <span className="font-bold text-amber-500">R$ {calculateFinances(activeProcess).receitaPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-red-500"/> Custos Totais</span>
                        <span className="font-bold text-red-500">R$ {fin.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">A Pagar</span>
                        <span className="font-bold text-amber-500">R$ {fin.despesaPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border bg-muted/30 p-3 -mx-4 -mb-4 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Caixa Real (Líquido)</span>
                        <span className="text-sm font-bold text-primary">R$ {fin.caixaReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Localização */}
                <div className="space-y-3">
                  <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Imóvel</h4>
                  <div className="p-3 bg-muted/20 border border-border rounded-sm flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">{activeProcess.imovel?.endereco || 'Endereço não cadastrado'}</span>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-border bg-background">
                <Link 
                  href={`/processos/${activeProcess.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition"
                >
                  <ArrowRight className="w-4 h-4" /> Detalhes Completos
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

    </div>
  )
}

