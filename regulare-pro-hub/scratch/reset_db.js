const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Resetting database...')
  await prisma.log.deleteMany({})
  await prisma.protocolo.deleteMany({})
  await prisma.tarefa.deleteMany({})
  await prisma.financeiro.deleteMany({})
  await prisma.documento.deleteMany({})
  await prisma.evento.deleteMany({})
  await prisma.checklist.deleteMany({})
  await prisma.alerta.deleteMany({})
  await prisma.processo.deleteMany({})
  await prisma.imovel.deleteMany({})
  await prisma.cliente.deleteMany({})
  console.log('Database reset successfully')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
