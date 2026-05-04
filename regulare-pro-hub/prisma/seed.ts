import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data in correct order due to foreign keys
  await prisma.evento.deleteMany()
  await prisma.checklist.deleteMany()
  await prisma.documento.deleteMany()
  await prisma.tarefa.deleteMany()
  await prisma.financeiro.deleteMany()
  await prisma.processo.deleteMany()
  await prisma.imovel.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.alerta.deleteMany()
  await prisma.empresaConfig.deleteMany()
  await prisma.user.deleteMany()

  // 1. Configurações da Empresa
  await prisma.empresaConfig.create({
    data: {
      nomeFantasia: 'Regulariza Pro Engenharia',
      razaoSocial: 'Regulariza Pro Engenharia e Arquitetura LTDA',
      cnpj: '12.345.678/0001-90',
      email: 'contato@regularizapro.com',
      telefone: '(11) 98765-4321',
      endereco: 'Av. Paulista, 1000, Conj 501',
      cidade: 'São Paulo',
      estado: 'SP',
      crea: '123456789-0',
    }
  })

  // 2. Usuário Admin
  await prisma.user.create({
    data: {
      name: 'Admin Regulariza Pro',
      email: 'admin@regularizapro.com',
      password: 'hashed_password_here', // In a real app, hash this!
      role: 'admin'
    }
  })

  // 3. Clientes
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: 'João da Silva Santos',
      cpf_cnpj: '123.456.789-00',
      telefone: '(11) 99999-1111',
      email: 'joao.silva@email.com',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01000-000',
      observacoes: 'Cliente prioritário, indicação do Dr. Carlos.'
    }
  })

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: 'Construtora Horizonte LTDA',
      cpf_cnpj: '98.765.432/0001-10',
      telefone: '(11) 3333-2222',
      email: 'contato@construtorahorizonte.com.br',
      endereco: 'Av. Engenheiro Berrini, 500',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04571-000',
      observacoes: 'Grande construtora, focar no atendimento B2B.'
    }
  })

  // 4. Imóveis
  const imovel1 = await prisma.imovel.create({
    data: {
      clienteId: cliente1.id,
      endereco: 'Rua das Acácias, 45',
      bairro: 'Jardim Primavera',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '02000-000',
      area_terreno: 250,
      area_construida: 120,
      num_matricula: '12345',
      cartorio: '1º CRI SP',
      inscricao_imobiliaria: '123.456.001-0',
      zoneamento: 'ZRM',
    }
  })

  const imovel2 = await prisma.imovel.create({
    data: {
      clienteId: cliente2.id,
      endereco: 'Av. das Nações, Lote 10',
      bairro: 'Centro Industrial',
      cidade: 'Osasco',
      estado: 'SP',
      cep: '06000-000',
      area_terreno: 1000,
      area_construida: 800,
      num_matricula: '98765',
      cartorio: 'CRI Osasco',
      inscricao_imobiliaria: '987.654.002-1',
      zoneamento: 'ZI',
    }
  })

  // 5. Processos
  const processo1 = await prisma.processo.create({
    data: {
      clienteId: cliente1.id,
      imovelId: imovel1.id,
      tipo_regularizacao: 'Habite-se',
      etapa_atual: 'Análise de Documentação',
      status: 'em_analise',
      data_previsao: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 days
      responsavel: 'Eng. Roberto',
      observacoes: 'Aguardando planta atualizada do arquiteto.'
    }
  })

  const processo2 = await prisma.processo.create({
    data: {
      clienteId: cliente2.id,
      imovelId: imovel2.id,
      tipo_regularizacao: 'Desmembramento',
      etapa_atual: 'Aprovação na Prefeitura',
      status: 'aprovado',
      data_previsao: new Date(new Date().setDate(new Date().getDate() + 15)), // +15 days
      responsavel: 'Eng. Mariana',
      observacoes: 'Processo acelerado.'
    }
  })

  // 6. Financeiro
  await prisma.financeiro.create({
    data: {
      processoId: processo1.id,
      clienteId: cliente1.id,
      descricao: 'Honorários - Habite-se (Entrada)',
      valor: 5000,
      valor_pago: 2500,
      data_vencimento: new Date(new Date().setDate(new Date().getDate() - 5)), // -5 days (overdue partially)
      data_pagamento: new Date(new Date().setDate(new Date().getDate() - 10)),
      forma_pagamento: 'pix',
      status: 'pendente' // partial payment
    }
  })

  await prisma.financeiro.create({
    data: {
      processoId: processo2.id,
      clienteId: cliente2.id,
      descricao: 'Honorários - Desmembramento (Parcela Única)',
      valor: 15000,
      valor_pago: 15000,
      data_vencimento: new Date(new Date().setDate(new Date().getDate() - 2)),
      data_pagamento: new Date(new Date().setDate(new Date().getDate() - 2)),
      forma_pagamento: 'transferencia',
      status: 'pago'
    }
  })

  // 7. Tarefas
  await prisma.tarefa.create({
    data: {
      titulo: 'Revisar planta baixa',
      descricao: 'Validar medidas da fachada',
      processoId: processo1.id,
      data: new Date(),
      hora: '14:00',
      responsavel: 'Eng. Roberto',
      status: 'pendente'
    }
  })

  // 8. Documentos
  await prisma.documento.create({
    data: {
      processoId: processo1.id,
      imovelId: imovel1.id,
      nome: 'Planta_Baixa_V1.pdf',
      tipo: 'PDF',
      url: '/uploads/planta_baixa_v1.pdf', // Mock URL
      tamanho: 2048,
      responsavel: 'Cliente',
    }
  })

  // 9. Checklist
  await prisma.checklist.create({
    data: {
      processoId: processo1.id,
      item: 'Matrícula atualizada',
      concluido: true
    }
  })
  
  await prisma.checklist.create({
    data: {
      processoId: processo1.id,
      item: 'Cópia IPTU',
      concluido: false
    }
  })

  // 10. Eventos
  await prisma.evento.create({
    data: {
      titulo: 'Vistoria no Imóvel',
      tipo: 'vistoria',
      processoId: processo1.id,
      data_inicio: new Date(new Date().setDate(new Date().getDate() + 2)),
      local: imovel1.endereco,
      responsavel: 'Eng. Roberto',
      status: 'agendado'
    }
  })

  // 11. Alertas
  await prisma.alerta.create({
    data: {
      titulo: 'Prazo Vencendo',
      mensagem: 'Protocolo de Desmembramento da Construtora Horizonte expira em 5 dias.',
      tipo: 'warning',
      processoId: processo2.id,
      clienteId: cliente2.id
    }
  })

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
