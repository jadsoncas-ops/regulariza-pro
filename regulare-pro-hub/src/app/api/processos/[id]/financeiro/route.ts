import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const data = await req.json()
    
    // Pegar clienteId do processo se não for enviado
    let clienteId = data.clienteId
    if (!clienteId) {
       const p = await prisma.processo.findUnique({ where: { id: processoId }, select: { clienteId: true } })
       clienteId = p?.clienteId
    }

    const financeiro = await prisma.financeiro.create({
      data: {
        ...data,
        processoId,
        clienteId,
        data_vencimento: data.data_vencimento ? new Date(data.data_vencimento) : null,
        data_pagamento: data.data_pagamento ? new Date(data.data_pagamento) : null
      }
    })

    await logAction({
      processoId,
      acao: `Lançamento Financeiro: ${data.tipo.toUpperCase()}`,
      modulo: 'FINANCEIRO',
      detalhe: `${data.descricao} - ${data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    })

    return NextResponse.json(financeiro)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { id, ...updates } = await req.json()
    
    if (updates.data_vencimento) updates.data_vencimento = new Date(updates.data_vencimento)
    if (updates.data_pagamento) updates.data_pagamento = new Date(updates.data_pagamento)

    const financeiro = await prisma.financeiro.update({
      where: { id },
      data: updates
    })

    await logAction({
      processoId,
      acao: `Financeiro Atualizado`,
      modulo: 'FINANCEIRO',
      detalhe: financeiro.descricao
    })

    return NextResponse.json(financeiro)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar financeiro' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { id, descricao } = await req.json()
    
    await prisma.financeiro.delete({ where: { id } })

    await logAction({
      processoId,
      acao: `Lançamento Financeiro Excluído`,
      modulo: 'FINANCEIRO',
      detalhe: descricao
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir financeiro' }, { status: 500 })
  }
}
