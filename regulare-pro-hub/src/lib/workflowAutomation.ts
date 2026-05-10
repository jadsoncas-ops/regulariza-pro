import { prisma } from './prisma';
import { logAction } from './logger';

const STAGE_SEQUENCE = [
  'em_analise',
  'levantamento',
  'projeto',
  'protocolo_prefeitura',
  'cartorio',
  'finalizado'
];

/**
 * Triggered when a process changes stage.
 * 1. Logs the change in the timeline.
 * 2. Generates automatic tasks based on templates.
 * 3. Records stage history for productivity analytics.
 */
export async function onStageChange(processoId: string, oldStage: string, newStage: string, usuario: string, empresaId: string) {
  try {
    const now = new Date();

    // 1. Close previous stage history
    if (oldStage) {
      const lastHistory = await prisma.stageHistory.findFirst({
        where: { processoId, etapa: oldStage, saida: null },
        orderBy: { entrada: 'desc' }
      });

      if (lastHistory) {
        const duration = Math.floor((now.getTime() - lastHistory.entrada.getTime()) / 60000); // Minutes
        await prisma.stageHistory.update({
          where: { id: lastHistory.id },
          data: { saida: now, duracao: duration }
        });
      }
    }

    // 2. Open new stage history
    await prisma.stageHistory.create({
      data: { processoId, empresaId, etapa: newStage, entrada: now }
    });

    // 3. Audit Trail
    await logAction({
      processoId,
      empresaId,
      usuario,
      acao: 'Mudança de Etapa',
      modulo: 'WORKFLOW',
      detalhe: `De: ${oldStage} -> Para: ${newStage}`
    });

    // 4. Task Generation
    const templates = await prisma.taskTemplate.findMany({
      where: { etapa: newStage, empresaId }
    });

    if (templates.length > 0) {
      const tasksToCreate = templates.map(t => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (t.prazo_dias || 0));

        return {
          processoId,
          empresaId,
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: t.prioridade,
          status: 'pendente',
          data: dueDate,
          obrigatoria: t.obrigatoria,
          etapa: newStage
        };
      });

      await prisma.tarefa.createMany({
        data: tasksToCreate
      });

      await logAction({
        processoId,
        empresaId,
        usuario: 'SISTEMA',
        acao: 'Workflow Automático Ativado',
        modulo: 'WORKFLOW',
        detalhe: `Geradas ${templates.length} tarefas automáticas para a etapa ${newStage}`
      });
    }
  } catch (error) {
    console.error('WORKFLOW_AUTOMATION_ERROR:', error);
  }
}

/**
 * Triggered when a task is completed.
 */
export async function onTaskComplete(processoId: string, tarefaId: string, usuario: string, empresaId: string) {
  try {
     const tarefa = await prisma.tarefa.findUnique({ 
        where: { id: tarefaId },
        include: { processo: true }
     });
     
     if (!tarefa) return;

     // Update finishedAt if not set
     await prisma.tarefa.update({
        where: { id: tarefaId },
        data: { finishedAt: new Date() }
     });

     await logAction({
        processoId,
        empresaId,
        usuario,
        acao: 'Tarefa Concluída',
        modulo: 'TAREFAS',
        detalhe: tarefa.titulo
     });

     // AUTO-ADVANCE LOGIC
     if (tarefa.processo) {
        const currentStage = tarefa.processo.status;
        const pendingMandatory = await prisma.tarefa.count({
           where: {
              processoId,
              status: { not: 'concluido' },
              obrigatoria: true,
              etapa: currentStage
           }
        });

        if (pendingMandatory === 0) {
           const currentIdx = STAGE_SEQUENCE.indexOf(currentStage);
           if (currentIdx !== -1 && currentIdx < STAGE_SEQUENCE.length - 1) {
              const nextStage = STAGE_SEQUENCE[currentIdx + 1];
              
              await prisma.processo.update({
                 where: { id: processoId },
                 data: { status: nextStage, etapa_atual: nextStage }
              });

              await logAction({
                 processoId,
                 empresaId,
                 usuario: 'SISTEMA',
                 acao: 'Avanço Automático',
                 modulo: 'WORKFLOW',
                 detalhe: `Todas as tarefas obrigatórias concluídas. Avançando para: ${nextStage}`
              });

              await onStageChange(processoId, currentStage, nextStage, 'SISTEMA', empresaId);
           }
        }
     }
  } catch (error) {
     console.error('TASK_COMPLETE_ERROR:', error);
  }
}
