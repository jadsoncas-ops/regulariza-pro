import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json()
    const evento = await prisma.evento.update({
      where: { id: (await params).id },
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        tipo: data.tipo,
        processoId: data.processoId || null,
        data_inicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
        data_fim: data.data_fim ? new Date(data.data_fim) : null,
        local: data.local,
        responsavel: data.responsavel,
        status: data.status,
      }
    })
    return NextResponse.json(evento)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await prisma.evento.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir evento' }, { status: 500 })
  }
}
