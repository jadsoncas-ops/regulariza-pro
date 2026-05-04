import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.checklist.deleteMany()
  await prisma.documento.deleteMany()
  await prisma.tarefa.deleteMany()
  await prisma.financeiro.deleteMany()
  await prisma.processo.deleteMany()
  await prisma.cliente.deleteMany()

  console.log('🌱 Iniciando seed...')

  // Criar 5 Clientes
  const clientes = []
  for (let i = 1; i <= 5; i++) {
    const cliente = await prisma.cliente.create({
      data: {
        nome: `Cliente Exemplo ${i}`,
        cpf_cnpj: `000.000.000-0${i}`,
        telefone: `(11) 99999-000${i}`,
        email: `cliente${i}@exemplo.com`,
        endereco: `Rua Exemplo ${i}, Centro`,
      }
    })
    clientes.push(cliente)
  }

  // Criar 10 Processos
  const statusList = ['prospecção', 'levantamento', 'projeto', 'protocolado', 'em análise', 'exigência', 'aprovado', 'finalizado']
  const tipos = ['Desmembramento', 'Unificação', 'Usucapião', 'Habite-se', 'Alvará de Execução']
  
  for (let i = 1; i <= 10; i++) {
    const cliente = clientes[i % 5]
    const processo = await prisma.processo.create({
      data: {
        clienteId: cliente.id,
        tipo_regularizacao: tipos[i % 5],
        endereco: `Endereço do Imóvel ${i}`,
        area_construida: 100 + (i * 10),
        status: statusList[i % 8],
        responsavel: 'Eng. Responsável',
      }
    })

    // Criar Financeiro para o processo
    await prisma.financeiro.create({
      data: {
        processoId: processo.id,
        honorarios: 5000 + (i * 500),
        valor_pago: i % 2 === 0 ? 5000 + (i * 500) : 1000,
        valor_pendente: i % 2 === 0 ? 0 : 4000 + (i * 500),
      }
    })

    // Criar Tarefas
    await prisma.tarefa.create({
      data: {
        titulo: `Revisar Documentação - Proc ${i}`,
        processoId: processo.id,
        data: new Date(new Date().setDate(new Date().getDate() + (i % 3))),
        status: i % 2 === 0 ? 'concluída' : 'pendente'
      }
    })

    // Criar Checklist Automático
    const checklistItems = ['matrícula', 'IPTU', 'levantamento', 'planta', 'ART']
    for (const item of checklistItems) {
      await prisma.checklist.create({
        data: {
          processoId: processo.id,
          item: item,
          concluido: Math.random() > 0.5
        }
      })
    }
  }

  console.log('✅ Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
