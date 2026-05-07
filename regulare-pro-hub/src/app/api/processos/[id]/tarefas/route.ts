import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { titulo, descricao, data, responsavel, prioridade } = await req.json()

    const tarefa = await prisma.tarefa.create({
      data: {
        processoId,
        titulo,
        descricao,
        data: new Date(data),
        responsavel,
        prioridade,
        status: 'pendente'
      }
    })

    await logAction({
      processoId,
      acao: `Tarefa Criada`,
      modulo: 'TAREFAS',
      detalhe: titulo
    })

    return NextResponse.json(tarefa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, processoId } = await req.json()
    
    const tarefa = await prisma.tarefa.update({
      where: { id },
      data: { status }
    })

    if (status === 'concluido') {
      await logAction({
        processoId,
        acao: `Tarefa Concluída`,
        modulo: 'TAREFAS',
        detalhe: tarefa.titulo
      })
    }

    return NextResponse.json(tarefa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}
