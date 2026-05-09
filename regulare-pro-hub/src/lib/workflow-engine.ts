import { prisma } from './prisma';

/**
 * Workflow Engine & Automation Layer
 * Handles automated task generation, status updates, and rule execution.
 */

export const WORKFLOW_RULES = {
  // Configuração das etapas por tipo de serviço
  PIPELINES: {
    REGULARIZACAO: [
      'em_analise',
      'levantamento',
      'projeto',
      'protocolo_prefeitura',
      'cartorio',
      'finalizado'
    ],
    CONSULTORIA: [
      'em_analise',
      'levantamento',
      'projeto',
      'finalizado'
    ]
  },

  // Definição das tarefas automáticas por etapa
  TASK_TEMPLATES: {
    levantamento: [
      { titulo: 'Visita Técnica', descricao: 'Coleta de dados in loco', prioridade: 'alta' },
      { titulo: 'Relatório Fotográfico', descricao: 'Registro visual do imóvel', prioridade: 'normal' },
      { titulo: 'Medição Cadastral', descricao: 'Levantamento de medidas reais', prioridade: 'alta' }
    ],
    projeto: [
      { titulo: 'Elaboração de Desenhos', descricao: 'Plantas, cortes e fachadas', prioridade: 'alta' },
      { titulo: 'Memorial Descritivo', descricao: 'Especificações técnicas', prioridade: 'normal' },
      { titulo: 'Emissão de ART/RRT', descricao: 'Responsabilidade técnica', prioridade: 'urgente' }
    ],
    protocolo_prefeitura: [
      { titulo: 'Protocolar Processo', descricao: 'Entrada na prefeitura', prioridade: 'urgente' },
      { titulo: 'Acompanhar Deferimento', descricao: 'Verificar status semanalmente', prioridade: 'normal' }
    ],
    cartorio: [
      { titulo: 'Entrada no Registro de Imóveis', descricao: 'Registro final', prioridade: 'alta' }
    ]
  }
};

export async function processWorkflowTransition(processoId: string, fromStatus: string, toStatus: string) {
  console.log(`[Workflow] Transição: ${fromStatus} -> ${toStatus} para o processo ${processoId}`);

  // 1. Logar a transição
  await prisma.log.create({
    data: {
      processoId,
      acao: `Mudança de etapa: ${fromStatus} para ${toStatus}`,
      usuario: 'SISTEMA',
      modulo: 'Workflow'
    }
  });

  // 2. Gerar tarefas automáticas para a nova etapa
  const templates = WORKFLOW_RULES.TASK_TEMPLATES[toStatus as keyof typeof WORKFLOW_RULES.TASK_TEMPLATES];
  if (templates) {
    for (const template of templates) {
      await prisma.tarefa.create({
        data: {
          processoId,
          titulo: template.titulo,
          descricao: template.descricao,
          prioridade: template.prioridade,
          status: 'pendente',
          data: new Date(Date.now() + 86400000 * 3) // Deadline padrão de 3 dias
        }
      });
    }
  }

  // 3. Automação Financeira (Opcional: Criar lançamento de comissão ao finalizar projeto)
  if (toStatus === 'projeto') {
     // Poderia automatizar a criação de despesa de projeto aqui
  }
}

export async function checkStalledProcesses() {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  
  const stalled = await prisma.processo.findMany({
    where: {
      status: { not: 'finalizado' },
      updatedAt: { lt: tenDaysAgo }
    }
  });

  for (const p of stalled) {
    // Gerar alerta ou log
    await prisma.log.create({
      data: {
        processoId: p.id,
        acao: `ALERTA: Processo estagnado há mais de 10 dias na etapa ${p.status}`,
        usuario: 'SISTEMA',
        modulo: 'Workflow'
      }
    });
  }
}
