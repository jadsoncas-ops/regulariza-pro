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

  // Converter datas para string para passar aos Client Components
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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <AgendaList initialEventos={safeEventos} initialTarefas={safeTarefas} processos={processos} />
    </div>
  )
}
