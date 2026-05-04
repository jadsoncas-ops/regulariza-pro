import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const evento = await prisma.evento.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao || null,
        tipo: data.tipo,
        processoId: data.processoId || null,
        data_inicio: new Date(data.data_inicio),
        data_fim: data.data_fim ? new Date(data.data_fim) : null,
        local: data.local || null,
        responsavel: data.responsavel || null,
        status: data.status || 'agendado',
      }
    })
    return NextResponse.json(evento)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 })
  }
}
