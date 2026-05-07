import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const data = await req.json()
    
    const protocolo = await prisma.protocolo.create({
      data: {
        ...data,
        processoId,
        data: new Date(data.data),
        prazo: data.prazo ? new Date(data.prazo) : null
      }
    })

    await logAction({
      processoId,
      acao: `Protocolo Registrado`,
      modulo: 'PREFEITURA',
      detalhe: `${protocolo.orgao}: ${protocolo.numero_protocolo}`
    })

    return NextResponse.json(protocolo)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar protocolo' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { id, ...updates } = await req.json()
    
    if (updates.data) updates.data = new Date(updates.data)
    if (updates.prazo) updates.prazo = new Date(updates.prazo)

    const protocolo = await prisma.protocolo.update({
      where: { id },
      data: updates
    })

    await logAction({
      processoId,
      acao: `Protocolo Atualizado`,
      modulo: 'PREFEITURA',
      detalhe: `${protocolo.orgao}: ${protocolo.numero_protocolo}`
    })

    return NextResponse.json(protocolo)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar protocolo' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { id, orgao } = await req.json()
    
    await prisma.protocolo.delete({ where: { id } })

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
