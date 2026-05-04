import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const tarefa = await prisma.tarefa.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao || null,
        processoId: data.processoId || null,
        data: new Date(data.data),
        hora: data.hora || null,
        responsavel: data.responsavel || null,
        status: data.status || 'pendente',
      }
    })
    return NextResponse.json(tarefa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
  }
}
