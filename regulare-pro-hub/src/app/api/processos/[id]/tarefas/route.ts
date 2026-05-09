import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'
import { processWorkflowTriggers } from '@/lib/workflowEngine'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { titulo, descricao, data, responsavel, prioridade, tipo, agendar } = await req.json()

    // 1. Criar a Tarefa
    const tarefa = await prisma.tarefa.create({
      data: {
        processoId,
        titulo,
        descricao,
        data: new Date(data),
        responsavel,
        prioridade,
        status: 'pendente'
      }
    })

    // 2. Se 'agendar' for true, criar Evento na Agenda
    if (agendar) {
      await prisma.evento.create({
        data: {
          processoId,
          titulo: `TAREFA: ${titulo}`,
          descricao: descricao || `Tarefa operacional vinculada ao processo.`,
          tipo: tipo || 'tarefa',
          data_inicio: new Date(data),
          responsavel,
          status: 'agendado'
        }
      })
    }

    await logAction({
      processoId,
      acao: `Tarefa Criada`,
      modulo: 'TAREFAS',
      detalhe: `${titulo} ${agendar ? '(Agendada)' : ''}`
    })

    return NextResponse.json(tarefa)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json()
    const { id, status, titulo, prioridade, data: taskDate, responsavel, processoId } = data
    
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (titulo !== undefined) updateData.titulo = titulo
    if (prioridade !== undefined) updateData.prioridade = prioridade
    if (taskDate !== undefined) updateData.data = new Date(taskDate)
    if (responsavel !== undefined) updateData.responsavel = responsavel

    const tarefa = await prisma.tarefa.update({
      where: { id },
      data: updateData
    })

    if (status === 'concluido') {
      try {
        await processWorkflowTriggers(processoId, id, 'tarefa')
        await logAction({
          processoId,
          acao: `Tarefa Concluída`,
          modulo: 'TAREFAS',
          detalhe: tarefa.titulo
        })
      } catch (err: any) {
        if (err.message === 'DOCUMENTOS_PENDENTES') {
          // Revert status update since it's blocked
          await prisma.tarefa.update({ where: { id }, data: { status: 'pendente' } })
          return NextResponse.json({ error: 'Existem documentos pendentes obrigatórios no processo. Faça o upload antes de concluir a etapa.' }, { status: 400 })
        }
      }
    } else if (titulo || prioridade || taskDate || responsavel) {
      await logAction({
        processoId,
        acao: `Tarefa Editada`,
        modulo: 'TAREFAS',
        detalhe: tarefa.titulo
      })
    }

    return NextResponse.json(tarefa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, ids, processoId, titulo } = await req.json()
    
    if (ids && Array.isArray(ids)) {
      await prisma.tarefa.deleteMany({
        where: { id: { in: ids } }
      })
      await logAction({
        processoId,
        acao: `Tarefas Excluídas (Lote)`,
        modulo: 'TAREFAS',
        detalhe: `${ids.length} tarefas removidas`
      })
    } else {
      await prisma.tarefa.delete({
        where: { id }
      })
      await logAction({
        processoId,
        acao: `Tarefa Excluída`,
        modulo: 'TAREFAS',
        detalhe: titulo
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir tarefa' }, { status: 500 })
  }
}
