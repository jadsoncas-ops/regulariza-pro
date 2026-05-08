import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { orgao, numero_protocolo, data, prazo, observacao } = await req.json()

    const protocolo = await prisma.protocolo.create({
      data: {
        processoId,
        orgao,
        numero_protocolo,
        data: new Date(data),
        prazo: prazo ? new Date(prazo) : null,
        observacao
      }
    })

    await logAction({
      processoId,
      acao: `Protocolo Registrado`,
      modulo: 'PREFEITURA',
      detalhe: `${orgao} - Nº ${numero_protocolo}`
    })

    return NextResponse.json(protocolo)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar protocolo' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json()
    const { id, orgao, numero_protocolo, data: protDate, prazo, status, observacao, processoId } = data
    
    const updateData: any = {}
    if (orgao !== undefined) updateData.orgao = orgao
    if (numero_protocolo !== undefined) updateData.numero_protocolo = numero_protocolo
    if (protDate !== undefined) updateData.data = new Date(protDate)
    if (prazo !== undefined) updateData.prazo = prazo ? new Date(prazo) : null
    if (status !== undefined) updateData.status = status
    if (observacao !== undefined) updateData.observacao = observacao

    const protocolo = await prisma.protocolo.update({
      where: { id },
      data: updateData
    })

    await logAction({
      processoId,
      acao: `Protocolo Atualizado`,
      modulo: 'PREFEITURA',
      detalhe: `${protocolo.orgao} - ${protocolo.numero_protocolo}`
    })

    return NextResponse.json(protocolo)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar protocolo' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, processoId, orgao } = await req.json()
    
    await prisma.protocolo.delete({
      where: { id }
    })

    await logAction({
      processoId,
      acao: `Protocolo Excluído`,
      modulo: 'PREFEITURA',
      detalhe: orgao
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir protocolo' }, { status: 500 })
  }
}
