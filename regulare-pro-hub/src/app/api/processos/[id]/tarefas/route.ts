import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const data = await req.json()
    
    const tarefa = await prisma.tarefa.create({
      data: {
        ...data,
        processoId,
        data: new Date(data.data)
      }
    })

    await logAction({
      processoId,
      acao: `Tarefa Criada`,
      modulo: 'TAREFAS',
      detalhe: tarefa.titulo
    })

    return NextResponse.json(tarefa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { id, ...updates } = await req.json()
    
    if (updates.data) updates.data = new Date(updates.data)

    const tarefa = await prisma.tarefa.update({
      where: { id },
      data: updates
    })

    await logAction({
      processoId,
      acao: updates.status ? `Tarefa ${updates.status}` : `Tarefa Editada`,
      modulo: 'TAREFAS',
      detalhe: tarefa.titulo
    })

    return NextResponse.json(tarefa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { id, titulo } = await req.json()
    
    await prisma.tarefa.delete({ where: { id } })

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
