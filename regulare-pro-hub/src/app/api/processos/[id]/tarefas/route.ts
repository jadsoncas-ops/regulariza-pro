import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'
import { getTenantId } from '@/lib/tenant'
import { onTaskComplete } from '@/lib/workflowAutomation'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const empresaId = await getTenantId()
    const processoId = (await params).id
    const { titulo, descricao, data, responsavel, prioridade, tipo, agendar, assignedId } = await req.json()

    // 1. Criar a Tarefa
    const tarefa = await prisma.tarefa.create({
      data: {
        empresaId,
        processoId,
        titulo,
        descricao,
        data: new Date(data),
        responsavel,
        assignedId,
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
      empresaId,
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
    const empresaId = await getTenantId()
    const data = await req.json()
    const { id, status, titulo, prioridade, data: taskDate, responsavel, processoId, assignedId, descricao } = data
    
    const updateData: any = {}
    if (status !== undefined) {
      updateData.status = status
      if (status === 'in_progress') updateData.startedAt = new Date()
      if (status === 'concluido') updateData.finishedAt = new Date()
    }
    if (titulo !== undefined) updateData.titulo = titulo
    if (descricao !== undefined) updateData.descricao = descricao
    if (prioridade !== undefined) updateData.prioridade = prioridade
    if (taskDate !== undefined) updateData.data = new Date(taskDate)
    if (responsavel !== undefined) updateData.responsavel = responsavel
    if (assignedId !== undefined) updateData.assignedId = assignedId

    const tarefa = await prisma.tarefa.update({
      where: { id, empresaId },
      data: updateData
    })

    if (status === 'concluido') {
      await onTaskComplete(processoId, id, 'USUÁRIO', empresaId)
    } else if (titulo || prioridade || taskDate || responsavel || assignedId) {
      await logAction({
        processoId,
        empresaId,
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
    const empresaId = await getTenantId()
    const { id, ids, processoId, titulo } = await req.json()
    
    if (ids && Array.isArray(ids)) {
      await prisma.tarefa.deleteMany({
        where: { id: { in: ids }, empresaId }
      })
      await logAction({
        processoId,
        empresaId,
        acao: `Tarefas Excluídas (Lote)`,
        modulo: 'TAREFAS',
        detalhe: `${ids.length} tarefas removidas`
      })
    } else {
      await prisma.tarefa.delete({
        where: { id, empresaId }
      })
      await logAction({
        processoId,
        empresaId,
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
