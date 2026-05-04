import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const processos = await prisma.processo.findMany({
    include: { cliente: true, imovel: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(processos)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const processo = await prisma.processo.create({
      data: {
        clienteId: data.clienteId,
        imovelId: data.imovelId,
        tipo_regularizacao: data.tipo_regularizacao,
        etapa_atual: data.etapa_atual || 'Análise de Documentação',
        status: data.status || 'em_analise',
        data_previsao: data.data_previsao ? new Date(data.data_previsao) : null,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
      }
    })
    return NextResponse.json(processo)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar processo' }, { status: 500 })
  }
}
