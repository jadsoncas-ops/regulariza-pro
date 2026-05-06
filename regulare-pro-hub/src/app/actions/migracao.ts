'use server'

import { prisma } from '@/lib/prisma'

export async function processMigration(jsonData: string) {
  try {
    const data = JSON.parse(jsonData)
    
    // Validar formato
    if (!data.clientes || !data.processos || !data.lancamentos) {
      return { success: false, error: 'Formato de backup inválido. Certifique-se de usar o backup completo do sistema antigo.' }
    }

    const { clientes, processos, lancamentos, tasks } = data

    console.log(`Iniciando migração de ${clientes.length} clientes, ${processos.length} processos e ${lancamentos.length} transações...`)

    // Mapeamento de IDs antigos para novos IDs no banco
    const mapClientes = new Map<string, string>()
    const mapProcessos = new Map<string, string>()

    // 1. MIGRAR CLIENTES
    for (const cli of clientes) {
      // Verifica se já existe por nome ou CPF (para evitar duplicidade básica)
      const exists = await prisma.cliente.findFirst({
        where: {
          OR: [
            { cpf_cnpj: cli.cpfCnpj || '00000000000' },
            { nome: cli.nome }
          ]
        }
      })

      if (exists) {
        mapClientes.set(cli.id, exists.id)
      } else {
        const newClient = await prisma.cliente.create({
          data: {
            nome: cli.nome,
            cpf_cnpj: cli.cpfCnpj || null,
            email: cli.email || null,
            telefone: cli.telefone ? `${cli.telefone.ddd || ''}${cli.telefone.numero || ''}` : null,
            endereco: cli.endereco ? `${cli.endereco.rua || ''}, ${cli.endereco.numero || ''} - ${cli.endereco.bairro || ''}, ${cli.endereco.cidade || ''}/${cli.endereco.estado || ''}` : null,
          }
        })
        mapClientes.set(cli.id, newClient.id)
      }
    }

    // 2. MIGRAR PROCESSOS (E IMÓVEIS)
    for (const proc of processos) {
      const novoClienteId = mapClientes.get(proc.clienteId)
      if (!novoClienteId) continue // Processo órfão

      // Tenta achar o imóvel ou cria um padrão (Obrigatório na nova arquitetura)
      let imovelId = ''
      const oldClient = clientes.find((c: any) => c.id === proc.clienteId)
      const address = oldClient?.propertyAddress || (oldClient?.endereco ? `${oldClient.endereco.rua || ''} ${oldClient.endereco.numero || ''}`.trim() : null) || 'ENDEREÇO NÃO INFORMADO (IMPORTADO)'
      
      const imovel = await prisma.imovel.create({
        data: {
          clienteId: novoClienteId,
          endereco: address,
          tipo: 'IMPORTADO'
        }
      })
      imovelId = imovel.id

      // Mapear status do sistema antigo para o novo Prisma enum/string
      let novoStatus = 'em_analise'
      if (proc.status === 'Iniciado') novoStatus = 'em_analise'
      else if (proc.status === 'Exigência') novoStatus = 'exigencia_tecnica'
      else if (proc.status === 'Aprovado') novoStatus = 'aprovado'
      else if (proc.status === 'Finalizado') novoStatus = 'finalizado'
      else if (proc.status === 'Arquivado') novoStatus = 'finalizado'

      const newProcess = await prisma.processo.create({
        data: {
          clienteId: novoClienteId,
          imovelId: imovelId,
          tipo_regularizacao: proc.type || proc.objeto || 'Regularização Genérica',
          status: novoStatus,
          etapa_atual: proc.etapa || proc.stage || 'Iniciado',
          data_inicio: proc.startDate ? new Date(proc.startDate) : new Date(),
          data_previsao: proc.expectedEndDate ? new Date(proc.expectedEndDate) : null,
          responsavel: proc.responsavelNome || null,
        }
      })
      mapProcessos.set(proc.id, newProcess.id)
    }

    // 3. MIGRAR FINANCEIRO (Lançamentos)
    for (const tx of lancamentos) {
      // Ignorar transações órfãs se dependem de processo
      const novoProcessoId = tx.processId ? mapProcessos.get(tx.processId) : null
      const novoClienteId = tx.clienteId ? mapClientes.get(tx.clienteId) : null

      if (!novoProcessoId && !novoClienteId) continue

      let tipoNova = 'receita'
      if (tx.tipo === 'Saída' || tx.tipo === 'A Pagar') tipoNova = 'despesa'

      let valorPago = 0
      if (tx.status === 'Concluído') valorPago = tx.valor
      else if (tx.status === 'Parcial') valorPago = tx.valor / 2 // Fallback simplista para parcial sem children

      await prisma.financeiro.create({
        data: {
          processoId: novoProcessoId,
          tipo: tipoNova,
          descricao: tx.descricao,
          categoria: tx.categoria,
          valor: tx.valor,
          valor_pago: valorPago,
          data_vencimento: tx.previsaoData ? new Date(tx.previsaoData) : new Date(tx.data),
          data_pagamento: tx.status === 'Concluído' ? new Date(tx.data) : null,
          status: tx.status === 'Concluído' ? 'pago' : tx.status === 'Parcial' ? 'parcial' : 'pendente'
        }
      })
    }

    return { 
      success: true, 
      stats: {
        clientes: mapClientes.size,
        processos: mapProcessos.size,
        transacoes: lancamentos.length
      }
    }

  } catch (error: any) {
    console.error('Migration error:', error)
    return { success: false, error: error.message || 'Erro desconhecido ao processar migração' }
  }
}
