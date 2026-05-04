import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const processos = await prisma.processo.findMany({
    include: { cliente: true }
  })
  return NextResponse.json(processos)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const processo = await prisma.processo.create({
      data: {
        clienteId: data.clienteId,
        tipo_regularizacao: data.tipo_regularizacao,
        endereco: data.endereco,
        area_construida: Number(data.area_construida),
        status: data.status || 'prospecção',
        responsavel: data.responsavel,
      }
    })
    return NextResponse.json(processo)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar processo' }, { status: 500 })
  }
}
