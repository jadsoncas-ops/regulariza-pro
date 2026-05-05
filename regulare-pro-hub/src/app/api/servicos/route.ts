import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// LISTAR SERVIÇOS
export async function GET() {
  try {
    const servicos = await prisma.servicoPadrao.findMany({
      orderBy: { categoria: 'asc' }
    })
    return NextResponse.json(servicos)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 })
  }
}

// CRIAR NOVO SERVIÇO
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const novoServico = await prisma.servicoPadrao.create({
      data: {
        nome: data.nome.toUpperCase(),
        sigla: data.sigla.toUpperCase(),
        categoria: data.categoria.toUpperCase(),
        descricao: data.descricao?.toUpperCase() || null,
        subservicos: data.subservicos || []
      }
    })
    return NextResponse.json(novoServico)
  } catch (error) {
    console.error('ERRO AO CRIAR SERVIÇO:', error)
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 })
  }
}
