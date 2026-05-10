import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/logger'

export async function processWorkflowTriggers(processoId: string, currentStageId: string, type: 'tarefa' | 'protocolo') {
  // 1. Enforce Document Check
  const pendingDocs = await prisma.documento.findMany({
    where: { processoId, status: 'pendente' }
  })
  if (pendingDocs.length > 0) {
    throw new Error('DOCUMENTOS_PENDENTES')
  }

  // 2. Fetch all stages to find the next one
  const proc = await prisma.processo.findUnique({
    where: { id: processoId },
    include: { tarefas: true, protocolos: true }
  })

  if (!proc) return

  const allStages = [
    ...proc.tarefas.map(t => ({ id: t.id, data: t.data, type: 'tarefa', status: t.status, titulo: t.titulo })),
    ...proc.protocolos.map(p => ({ id: p.id, data: p.data, type: 'protocolo', status: p.status, titulo: p.orgao }))
  ].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

  const currentIndex = allStages.findIndex(s => s.id === currentStageId)
  
  if (currentIndex !== -1 && currentIndex + 1 < allStages.length) {
    const nextStage = allStages[currentIndex + 1]
    
    // Auto advance pipeline
    await prisma.processo.update({
      where: { id: processoId },
      data: { etapa_atual: nextStage.titulo }
    })

    await logAction({
      processoId,
      acao: 'Workflow Autônomo',
      modulo: 'SISTEMA',
      detalhe: `Etapa avançada para: ${nextStage.titulo}`
    })

    // 3. Notify Financial Module if reaching specific stages
    const titleUpper = nextStage.titulo.toUpperCase()
    const isFinancialStage = titleUpper.includes('CARTÓRIO') || titleUpper.includes('HABITE-SE') || titleUpper.includes('PREFEITURA') || titleUpper.includes('REGISTRO')
    
    if (isFinancialStage) {
      await prisma.financeiro.create({
        data: {
          processoId,
          clienteId: proc.clienteId,
          descricao: `[WORKFLOW] Provisionamento: ${nextStage.titulo}`,
          valor: 0,
          valor_pago: 0,
          tipo: 'despesa',
          status: 'pendente',
          data_vencimento: nextStage.data || new Date()
        }
      })
      await logAction({
        processoId,
        acao: 'Provisionamento Financeiro',
        modulo: 'FINANCEIRO',
        detalhe: `Geração de registro para controle de taxas da etapa ${nextStage.titulo}`
      })
    }
  } else if (currentIndex !== -1 && currentIndex === allStages.length - 1) {
    // Process is completed
    await prisma.processo.update({
      where: { id: processoId },
      data: { status: 'finalizado', etapa_atual: 'CONCLUÍDO' }
    })
    await logAction({
      processoId,
      acao: 'Processo Finalizado',
      modulo: 'SISTEMA',
      detalhe: 'Workflow Operacional Concluído'
    })
  }
}
