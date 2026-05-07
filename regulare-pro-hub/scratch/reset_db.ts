import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Resetting database...')
  try {
    await prisma.$transaction([
      prisma.log.deleteMany({}),
      prisma.protocolo.deleteMany({}),
      prisma.tarefa.deleteMany({}),
      prisma.financeiro.deleteMany({}),
      prisma.documento.deleteMany({}),
      prisma.evento.deleteMany({}),
      prisma.checklist.deleteMany({}),
      prisma.alerta.deleteMany({}),
      prisma.processo.deleteMany({}),
      prisma.imovel.deleteMany({}),
      prisma.cliente.deleteMany({}),
    ])
    console.log('Database reset successfully!')
  } catch (error) {
    console.error('Error resetting database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
