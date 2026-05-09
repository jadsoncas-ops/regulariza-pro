import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'
import { processWorkflowTriggers } from '@/lib/workflowEngine'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { orgao, numero_protocolo, data, prazo, observacao, agendar } = await req.json()

    // 1. Criar o Protocolo
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

    // 2. Se houver prazo e 'agendar' for true, criar Evento na Agenda
    if (prazo && agendar) {
      await prisma.evento.create({
        data: {
          processoId,
          titulo: `PRAZO: ${orgao} (${numero_protocolo})`,
          descricao: `Vencimento do prazo para o protocolo no órgão ${orgao}.`,
          tipo: 'prazo',
          data_inicio: new Date(prazo),
          status: 'agendado'
        }
      })
    }

    await logAction({
      processoId,
      acao: `Protocolo Registrado`,
      modulo: 'PREFEITURA',
      detalhe: `${orgao} - Nº ${numero_protocolo} ${agendar ? '(Deadline Agendado)' : ''}`
    })

    return NextResponse.json(protocolo)
  } catch (error) {
    console.error('API Error:', error)
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

    if (status === 'concluido') {
      try {
        await processWorkflowTriggers(processoId, id, 'protocolo')
      } catch (err: any) {
        if (err.message === 'DOCUMENTOS_PENDENTES') {
          // Revert status update
          await prisma.protocolo.update({ where: { id }, data: { status: 'analise' } })
          return NextResponse.json({ error: 'Existem documentos pendentes obrigatórios no processo. Faça o upload antes de concluir a etapa.' }, { status: 400 })
        }
      }
    }

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
    const { id, ids, processoId, orgao } = await req.json()
    
    if (ids && Array.isArray(ids)) {
      await prisma.protocolo.deleteMany({
        where: { id: { in: ids } }
      })
      await logAction({
        processoId,
        acao: `Protocolos Excluídos (Lote)`,
        modulo: 'PREFEITURA',
        detalhe: `${ids.length} protocolos removidos`
      })
    } else {
      await prisma.protocolo.delete({
        where: { id }
      })
      await logAction({
        processoId,
        acao: `Protocolo Excluído`,
        modulo: 'PREFEITURA',
        detalhe: orgao
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir protocolo' }, { status: 500 })
  }
}
