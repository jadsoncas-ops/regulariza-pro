import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProcessosPage() {
  const processos = await prisma.processo.findMany({
    include: { cliente: true },
    orderBy: { createdAt: 'desc' }
  })

  // Map status to columns
  const columns = {
    'ENTRADA': processos.filter(p => ['prospecção', 'levantamento'].includes(p.status)),
    'PROJETO TÉCNICO': processos.filter(p => p.status === 'projeto'),
    'PREFEITURA': processos.filter(p => ['protocolado', 'em análise', 'exigência'].includes(p.status)),
    'CARTÓRIO': processos.filter(p => p.status === 'aprovado'),
    'FINALIZAÇÃO': processos.filter(p => p.status === 'finalizado'),
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP - REGULARIZA PRO STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Processos de Regularização <span className="text-muted-foreground font-normal ml-2">// MOD.PRC / 04</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-sm text-xs w-64 shadow-sm">
            <Search className="w-3 h-3 text-muted-foreground" />
            <input 
              placeholder="Buscar processo, cliente, matrícula..." 
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm bg-card">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sis. Online
          </div>
          <button className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition">
            + Assistente IA
          </button>
          <Link href="/processos/novo" className="flex items-center gap-2 bg-foreground text-background px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
            + Novo Processo
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* FILTER BAR */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-0 border border-border rounded-sm overflow-hidden text-[10px] font-bold uppercase tracking-widest bg-card shadow-sm">
            <div className="px-3 py-2 bg-foreground text-background border-r border-border">VISÃO KANBAN</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">RESPONSÁVEL *</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">TIPO TODOS</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer">PRAZO {'<'} 30 DIAS</div>
          </div>
          <div className="flex items-center gap-2 border border-border rounded-sm overflow-hidden bg-card text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <button className="px-4 py-2 border-r border-border hover:bg-muted smooth-transition">
              LISTA
            </button>
            <button className="px-4 py-2 border-r border-border hover:bg-muted smooth-transition">
              TIMELINE
            </button>
            <Link href="/processos/novo" className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 smooth-transition">
              + NOVO PROCESSO
            </Link>
          </div>
        </div>

        {/* KANBAN BOARD */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Esteira de Tramitação <span className="opacity-50">PRC.001</span>
          </h2>
          
          <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[60vh]">
            {Object.entries(columns).map(([columnName, items]) => (
              <div key={columnName} className="min-w-[280px] w-[280px] flex-shrink-0">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-border">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{columnName}</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-card border border-border rounded-sm">{items.length.toString().padStart(2, '0')}</span>
                </div>
                
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <div className="border border-dashed border-border rounded-sm p-4 text-center text-xs text-muted-foreground bg-muted/10">
                      Vazio
                    </div>
                  ) : items.map(p => (
                    <Link href={`/processos/${p.id}`} key={p.id} className={`block bg-card border ${p.status === 'exigência' ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'border-border shadow-sm'} p-4 rounded-sm relative group cursor-pointer hover:border-blue-600 smooth-transition`}>
                      <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-600"></div>
                      {p.status === 'exigência' && (
                        <div className="absolute top-4 right-8 text-[9px] font-bold text-rose-500 uppercase tracking-widest">EXIGÊNCIA</div>
                      )}
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border border-border w-fit px-1.5 py-0.5 rounded-sm bg-muted/30">
                        {`PRC-${p.id.slice(0,8)}`}
                      </div>
                      <div className="font-bold text-sm text-foreground mb-1">{p.tipo_regularizacao}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.cliente.nome}</div>
                      <div className="text-xs text-muted-foreground truncate mb-4">{p.endereco}</div>
                      
                      <div className="flex justify-between items-center border-t border-border pt-3 mt-3">
                        <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">PRAZO 15/11</div>
                        <div className="w-5 h-5 bg-muted rounded-sm flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-border">HT</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
