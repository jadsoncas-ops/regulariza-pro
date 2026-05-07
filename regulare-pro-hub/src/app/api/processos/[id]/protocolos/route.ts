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
