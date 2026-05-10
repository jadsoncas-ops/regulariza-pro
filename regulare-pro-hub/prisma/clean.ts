import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- INICIANDO LIMPEZA DO BANCO DE DADOS ---')
  
  try {
    // Delete in correct order to avoid foreign key constraints
    await prisma.log.deleteMany()
    await prisma.protocolo.deleteMany()
    await prisma.evento.deleteMany()
    await prisma.checklist.deleteMany()
    await prisma.documento.deleteMany()
    await prisma.tarefa.deleteMany()
    await prisma.financeiro.deleteMany()
    await prisma.alerta.deleteMany()
    await prisma.processo.deleteMany()
    await prisma.imovel.deleteMany()
    await prisma.cliente.deleteMany()
    await prisma.user.deleteMany()
    await prisma.empresa.deleteMany()

    console.log('✅ Banco de dados zerado com sucesso.')
    console.log('O sistema iniciará limpo para testes reais.')
  } catch (error) {
    console.error('❌ Erro ao limpar o banco de dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
