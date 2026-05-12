import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenantId = 'default-tenant'
  
  // 1. Garantir que a empresa padrão existe
  const empresa = await prisma.empresa.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      nomeFantasia: 'REGULARE PRO',
      razaoSocial: 'REGULARE PRO TECNOLOGIA'
    }
  })
  console.log(`Empresa ${empresa.nomeFantasia} garantida.`)

  console.log('Fixing data for default-tenant...')

  const updatedClientes = await prisma.cliente.updateMany({
    where: { empresaId: null },
    data: { empresaId: tenantId }
  })
  console.log(`Updated ${updatedClientes.count} clientes.`)

  const updatedImoveis = await prisma.imovel.updateMany({
    where: { empresaId: null },
    data: { empresaId: tenantId }
  })
  console.log(`Updated ${updatedImoveis.count} imoveis.`)

  const updatedProcessos = await prisma.processo.updateMany({
    where: { empresaId: null },
    data: { empresaId: tenantId }
  })
  console.log(`Updated ${updatedProcessos.count} processos.`)

  const updatedFinanceiro = await prisma.financeiro.updateMany({
    where: { empresaId: null },
    data: { empresaId: tenantId }
  })
  console.log(`Updated ${updatedFinanceiro.count} financeiro records.`)

  const updatedTarefas = await prisma.tarefa.updateMany({
    where: { empresaId: null },
    data: { empresaId: tenantId }
  })
  console.log(`Updated ${updatedTarefas.count} tarefas.`)

  const updatedDocumentos = await prisma.documento.updateMany({
    where: { empresaId: null },
    data: { empresaId: tenantId }
  })
  console.log(`Updated ${updatedDocumentos.count} documentos.`)

  const updatedLogs = await prisma.log.updateMany({
    where: { empresaId: null },
    data: { empresaId: tenantId }
  })
  console.log(`Updated ${updatedLogs.count} logs.`)

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
