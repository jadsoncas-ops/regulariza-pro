import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json()
    
    // Only update fields that are provided
    const updateData: any = {}
    if (data.titulo !== undefined) updateData.titulo = data.titulo
    if (data.descricao !== undefined) updateData.descricao = data.descricao
    if (data.processoId !== undefined) updateData.processoId = data.processoId || null
    if (data.data !== undefined) updateData.data = new Date(data.data)
    if (data.hora !== undefined) updateData.hora = data.hora || null
    if (data.responsavel !== undefined) updateData.responsavel = data.responsavel
    if (data.status !== undefined) updateData.status = data.status

    const tarefa = await prisma.tarefa.update({
      where: { id: (await params).id },
      data: updateData
    })
    return NextResponse.json(tarefa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await prisma.tarefa.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir tarefa' }, { status: 500 })
  }
}
