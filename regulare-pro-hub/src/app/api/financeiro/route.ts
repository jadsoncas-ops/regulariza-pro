import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const financeiro = await prisma.financeiro.create({
      data: {
        descricao: data.descricao,
        valor: data.valor,
        valor_pago: data.valor_pago,
        data_vencimento: data.data_vencimento ? new Date(data.data_vencimento) : null,
        data_pagamento: data.data_pagamento ? new Date(data.data_pagamento) : null,
        forma_pagamento: data.forma_pagamento || null,
        status: data.status,
        processoId: data.processoId || null,
        clienteId: data.clienteId || null,
      }
    })
    return NextResponse.json(financeiro)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const financeiro = await prisma.financeiro.findMany({
      include: {
        cliente: true,
        processo: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const processos = await prisma.processo.findMany({
      select: {
        id: true,
        valor_total: true,
        financeiro: {
          select: {
            valor: true,
            tipo: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({ financeiro, processos })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar financeiro' }, { status: 500 })
  }
}
