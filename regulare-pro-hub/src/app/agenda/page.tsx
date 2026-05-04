import { prisma } from '@/lib/prisma'
import AgendaList from '@/components/agenda/AgendaList'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  const eventos = await prisma.evento.findMany({
    include: { 
      processo: { select: { id: true, cliente: { select: { nome: true } } } }
    },
    orderBy: { data_inicio: 'asc' }
  })

  const tarefas = await prisma.tarefa.findMany({
    include: { 
      processo: { select: { id: true, cliente: { select: { nome: true } } } }
    },
    orderBy: { data: 'asc' }
  })

  // Converter datas para string
  const safeEventos = eventos.map(e => ({
    ...e,
    data_inicio: e.data_inicio.toISOString(),
    data_fim: e.data_fim ? e.data_fim.toISOString() : null,
  }))

  const safeTarefas = tarefas.map(t => ({
    ...t,
    data: t.data.toISOString(),
  }))

  const processos = await prisma.processo.findMany({
    select: { 
      id: true, 
      tipo_regularizacao: true,
      cliente: { select: { nome: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Agenda e Tarefas <span className="text-muted-foreground font-normal ml-2">// MOD.AGD / 07</span>
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">CALENDÁRIO DE COMPROMISSOS E DEMANDAS</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm bg-card">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sis. Online
          </div>
        </div>
      </div>

      <AgendaList initialEventos={safeEventos} initialTarefas={safeTarefas} processos={processos} />
    </div>
  )
}
