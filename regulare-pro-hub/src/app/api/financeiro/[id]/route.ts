import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json()
    const financeiro = await prisma.financeiro.update({
      where: { id: (await params).id },
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
    return NextResponse.json({ error: 'Erro ao atualizar lançamento' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await prisma.financeiro.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir lançamento' }, { status: 500 })
  }
}
