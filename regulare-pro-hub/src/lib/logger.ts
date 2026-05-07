import { prisma } from './prisma'

export async function logAction({
  processoId,
  usuario = 'JADSON CASTRO SANTANA',
  acao,
  modulo,
  detalhe
}: {
  processoId: string
  usuario?: string
  acao: string
  modulo: string
  detalhe?: string
}) {
  try {
    // 1. Criar Log de Auditoria
    await prisma.log.create({
      data: {
        processoId,
        usuario,
        acao,
        modulo,
        detalhe
      }
    })

    // 2. Criar Evento na Timeline (se relevante para a visão operacional)
    // Nem todo log precisa ser um evento de timeline, mas na visão do usuário sim.
    await prisma.evento.create({
      data: {
        processoId,
        titulo: acao,
        descricao: detalhe,
        tipo: modulo.toLowerCase(),
        data_inicio: new Date(),
        responsavel: usuario,
        status: 'concluido'
      }
    })
  } catch (error) {
    console.error('Falha ao registrar log/evento:', error)
  }
}
