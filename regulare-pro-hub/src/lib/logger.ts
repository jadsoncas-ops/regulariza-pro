import { prisma } from './prisma'

export interface LogPayload {
  processoId?: string
  clienteId?: string
  empresaId?: string
  usuario?: string
  acao: string
  modulo: string
  detalhe?: string
}

export async function logAction({
  processoId,
  clienteId,
  empresaId,
  usuario = 'SISTEMA',
  acao,
  modulo,
  detalhe
}: LogPayload) {
  try {
    // 1. Audit log - always created
    await prisma.log.create({
      data: {
        processoId: processoId || null,
        empresaId: empresaId || null,
        usuario,
        acao,
        modulo,
        detalhe
      }
    })

    // 2. Timeline event (only if linked to a processo)
    if (processoId) {
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
    }
  } catch (error) {
    // Log failures should never crash the main request
    console.error('Falha ao registrar log/evento:', error)
  }
}
