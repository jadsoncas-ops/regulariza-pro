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
    const data = await req.json()
    const { id, status, titulo, prioridade, data: taskDate, responsavel, processoId } = data
    
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (titulo !== undefined) updateData.titulo = titulo
    if (prioridade !== undefined) updateData.prioridade = prioridade
    if (taskDate !== undefined) updateData.data = new Date(taskDate)
    if (responsavel !== undefined) updateData.responsavel = responsavel

    const tarefa = await prisma.tarefa.update({
      where: { id },
      data: updateData
    })

    if (status === 'concluido') {
      await logAction({
        processoId,
        acao: `Tarefa Concluída`,
        modulo: 'TAREFAS',
        detalhe: tarefa.titulo
      })
    } else if (titulo || prioridade || taskDate || responsavel) {
      await logAction({
        processoId,
        acao: `Tarefa Editada`,
        modulo: 'TAREFAS',
        detalhe: tarefa.titulo
      })
    }

    return NextResponse.json(tarefa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, processoId, titulo } = await req.json()
    
    await prisma.tarefa.delete({
      where: { id }
    })

    await logAction({
      processoId,
      acao: `Tarefa Excluída`,
      modulo: 'TAREFAS',
      detalhe: titulo
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir tarefa' }, { status: 500 })
  }
}
