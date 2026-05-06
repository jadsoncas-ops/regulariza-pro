import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // INICIAR TRANSAÇÃO ATÔMICA
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar Cliente (ou buscar se já existir)
      let cliente = await tx.cliente.findFirst({
        where: { cpf_cnpj: data.cliente.cpf_cnpj }
      })

      if (!cliente) {
        cliente = await tx.cliente.create({
          data: {
            nome: data.cliente.nome.toUpperCase(),
            cpf_cnpj: data.cliente.cpf_cnpj,
            telefone: data.cliente.telefone,
            email: data.cliente.email.toUpperCase(),
            cep: data.cliente.cep,
            endereco: data.cliente.endereco?.toUpperCase() || null,
            numero: data.cliente.numero,
            bairro: data.cliente.bairro?.toUpperCase() || null,
            cidade: data.cliente.cidade?.toUpperCase() || null,
            estado: data.cliente.estado?.toUpperCase() || null,
            observacoes: data.cliente.observacoes?.toUpperCase() || null,
            status: 'ativo'
          }
        })
      }

      // 2. Criar ou Buscar Imóvel
      let imovelId = data.imovelId
      
      if (!imovelId) {
        const newImovel = await tx.imovel.create({
          data: {
            clienteId: cliente.id,
            cep: data.imovel.cep,
            endereco: data.imovel.endereco.toUpperCase(),
            numero: data.imovel.numero,
            complemento: data.imovel.complemento?.toUpperCase() || null,
            bairro: data.imovel.bairro.toUpperCase(),
            cidade: data.imovel.cidade.toUpperCase(),
            estado: data.imovel.estado.toUpperCase(),
            area_terreno: data.imovel.area_terreno ? parseFloat(data.imovel.area_terreno) : null,
            area_construida: data.imovel.area_construida ? parseFloat(data.imovel.area_construida) : null,
            num_matricula: data.imovel.num_matricula?.toUpperCase() || null,
            cartorio: data.imovel.cartorio?.toUpperCase() || null,
            inscricao_imobiliaria: data.imovel.inscricao_imobiliaria?.toUpperCase() || null,
            zoneamento: data.imovel.zoneamento?.toUpperCase() || null,
            observacoes: data.imovel.observacoes?.toUpperCase() || null,
            proprietario_nome: data.imovel.isProprietario ? null : data.imovel.proprietario_nome?.toUpperCase(),
            proprietario_doc: data.imovel.isProprietario ? null : data.imovel.proprietario_doc,
            proprietario_tel: data.imovel.isProprietario ? null : data.imovel.proprietario_tel,
            proprietario_email: data.imovel.isProprietario ? null : data.imovel.proprietario_email?.toUpperCase(),
          }
        })
        imovelId = newImovel.id
      }

      // 3. Criar Processo (Geração de Código Sequencial)
      const servico = await tx.servicoPadrao.findFirst({ where: { nome: data.processo.tipo } })
      const sigla = (servico?.sigla || 'REG').toUpperCase()
      
      // Busca o último processo com essa sigla para incrementar
      const lastProcess = await tx.processo.findFirst({
        where: { codigo_projeto: { startsWith: sigla } },
        orderBy: { createdAt: 'desc' }
      })

      let nextNum = 1
      if (lastProcess?.codigo_projeto) {
        const parts = lastProcess.codigo_projeto.split('-')
        const lastNum = parseInt(parts[parts.length - 1])
        if (!isNaN(lastNum)) nextNum = lastNum + 1
      }
      
      const codigoProjeto = `${sigla}-${nextNum.toString().padStart(3, '0')}`

      const processo = await tx.processo.create({
        data: {
          codigo_projeto: codigoProjeto,
          clienteId: cliente.id,
          imovelId: imovelId,
          tipo_regularizacao: data.processo.tipo.toUpperCase(),
          status: 'em_analise',
          etapa_atual: 'CADASTRO INICIAL',
          responsavel: 'JADSON CASTRO SANTANA',
          observacoes: data.processo.observacoes?.toUpperCase() || null,
          valor_total: parseFloat(data.financeiro.valorTotal) || 0
        }
      })

      // 4. Fluxo Financeiro Detalhado
      const { receitas, despesas } = data.financeiro
      
      // REGISTRAR RECEITAS (Entradas)
      for (const rec of receitas) {
        if (parseFloat(rec.valor) > 0) {
          await tx.financeiro.create({
            data: {
              processoId: processo.id,
              clienteId: cliente.id,
              descricao: rec.descricao.toUpperCase(),
              valor: parseFloat(rec.valor),
              valor_pago: rec.status === 'pago' ? parseFloat(rec.valor) : 0,
              tipo: 'receita',
              status: rec.status,
              data_vencimento: new Date(rec.data),
              data_pagamento: rec.status === 'pago' ? new Date(rec.data) : null
            }
          })
        }
      }

      // REGISTRAR DESPESAS (Custos / Parceiros)
      for (const desp of despesas) {
        if (parseFloat(desp.valor) > 0) {
          await tx.financeiro.create({
            data: {
              processoId: processo.id,
              clienteId: cliente.id,
              descricao: `PARCEIRO: ${desp.parceiro.toUpperCase()} - ${desp.servico.toUpperCase()}`,
              valor: parseFloat(desp.valor),
              valor_pago: desp.status === 'pago' ? parseFloat(desp.valor) : 0,
              tipo: 'despesa',
              status: desp.status,
              data_vencimento: new Date(desp.data),
              data_pagamento: desp.status === 'pago' ? new Date(desp.data) : null
            }
          })
        }
      }

      return processo
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('ERRO NO WIZARD FINANCEIRO:', error)
    return NextResponse.json({ error: 'Falha ao processar cadastro financeiro detalhado' }, { status: 500 })
  }
}
