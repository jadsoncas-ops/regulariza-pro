"use client";

import { useState } from 'react'
import { 
  Search, 
  PlusCircle, 
  LayoutGrid, 
  List, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Processo {
  id: string
  tipo_regularizacao: string
  etapa_atual: string | null
  status: string
  cliente: { nome: string }
  imovel: { endereco: string } | null
  financeiro: any[]
}

interface ProcessoKanbanProps {
  initialProcessos: Processo[]
}

export default function ProcessoKanban({ initialProcessos }: ProcessoKanbanProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  const filteredProcessos = initialProcessos.filter(p => 
    p.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tipo_regularizacao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = {
    'ANÁLISE': filteredProcessos.filter(p => p.status === 'em_analise'),
    'EM ANDAMENTO': filteredProcessos.filter(p => ['documentacao_pendente', 'protocolo_prefeitura', 'em_aprovacao'].includes(p.status)),
    'EXIGÊNCIA': filteredProcessos.filter(p => p.status === 'exigencia_tecnica'),
    'FINALIZADO': filteredProcessos.filter(p => ['aprovado', 'finalizado'].includes(p.status)),
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full font-mono space-y-10">
      
      {/* HEADER SaaS - REGRA DE 3 AÇÕES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">Processos</h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Gestão de Fluxo Operacional</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="BUSCAR PROCESSO OU CLIENTE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border pl-10 pr-4 py-2.5 rounded-sm text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="flex border border-border rounded-sm overflow-hidden bg-card">
             <button onClick={() => setViewMode('kanban')} className={`p-2.5 ${viewMode === 'kanban' ? 'bg-muted' : 'hover:bg-muted'}`}><LayoutGrid className="w-4 h-4" /></button>
             <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted'}`}><List className="w-4 h-4" /></button>
          </div>
          <Link href="/processos/novo" className="bg-foreground text-background px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
            <PlusCircle className="w-3.5 h-3.5" /> Novo Processo
          </Link>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* KANBAN MINIMALISTA */
        <div className="flex gap-6 overflow-x-auto pb-6 items-start">
          {Object.entries(columns).map(([colName, items]) => (
            <div key={colName} className="min-w-[300px] w-[300px] flex-shrink-0">
               <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{colName}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded-full">{items.length}</span>
               </div>
               
               <div className="space-y-4">
                  {items.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => router.push(`/processos/${p.id}`)}
                      className="bg-card border border-border p-4 rounded-sm hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
                    >
                       <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{p.cliente.nome}</span>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">PRC-{p.id.substring(0,4)}</span>
                       </div>
                       <h4 className="text-[9px] font-bold text-muted-foreground uppercase mb-4 leading-tight">{p.tipo_regularizacao}</h4>
                       
                       <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="flex items-center gap-1.5">
                             <Clock className="w-3 h-3 text-muted-foreground" />
                             <span className="text-[8px] font-black uppercase text-muted-foreground">{p.etapa_atual || 'INICIADO'}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      ) : (
        /* LISTA SIMPLIFICADA */
        <div className="bg-card border border-border rounded-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-muted/30 border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                 <tr>
                    <th className="px-6 py-4">PROCESSO</th>
                    <th className="px-6 py-4">CLIENTE</th>
                    <th className="px-6 py-4">ETAPA</th>
                    <th className="px-6 py-4 text-right">AÇÕES</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px]">
                 {filteredProcessos.map(p => (
                   <tr key={p.id} className="hover:bg-muted/10 smooth-transition group cursor-pointer" onClick={() => router.push(`/processos/${p.id}`)}>
                      <td className="px-6 py-4 font-black uppercase text-foreground">{p.tipo_regularizacao}</td>
                      <td className="px-6 py-4 font-bold uppercase text-muted-foreground">{p.cliente.nome}</td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-0.5 bg-muted rounded-full text-[9px] font-black uppercase">{p.etapa_atual || 'INICIAL'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <ArrowRight className="w-4 h-4 text-muted-foreground inline" />
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  )
}
