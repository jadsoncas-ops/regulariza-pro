import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // INICIAR TRANSAÇÃO ATÔMICA
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar Cliente (ou buscar se já existir pelo CPF/CNPJ)
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
            endereco: data.cliente.endereco?.toUpperCase() || null,
            cidade: data.cliente.cidade?.toUpperCase() || null,
            observacoes: data.cliente.observacoes?.toUpperCase() || null,
            status: 'ativo'
          }
        })
      }

      // 2. Criar Imóvel
      const imovel = await tx.imovel.create({
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
          // Dados do proprietário (se não for o cliente)
          proprietario_nome: data.imovel.isProprietario ? null : data.imovel.proprietario_nome?.toUpperCase(),
          proprietario_doc: data.imovel.isProprietario ? null : data.imovel.proprietario_doc,
          proprietario_tel: data.imovel.isProprietario ? null : data.imovel.proprietario_tel,
          proprietario_email: data.imovel.isProprietario ? null : data.imovel.proprietario_email?.toUpperCase(),
        }
      })

      // 3. Criar Processo
      const processo = await tx.processo.create({
        data: {
          codigo_projeto: data.processo.codigo_projeto,
          clienteId: cliente.id,
          imovelId: imovel.id,
          tipo_regularizacao: data.processo.tipo.toUpperCase(),
          status: 'em_analise',
          etapa_atual: 'CADASTRO INICIAL',
          responsavel: 'JADSON CASTRO SANTANA',
          observacoes: `PROJETO CRIADO VIA WIZARD EM ${new Date().toLocaleDateString('pt-BR')}`
        }
      })

      // 4. Fluxo Financeiro Inteligente
      const financeiro = data.financeiro
      
      // REGISTRO DE ENTRADA (Já recebida)
      if (financeiro.entrada > 0) {
        await tx.financeiro.create({
          data: {
            processoId: processo.id,
            clienteId: cliente.id,
            descricao: `ENTRADA: ${data.processo.tipo.toUpperCase()}`,
            valor: parseFloat(financeiro.entrada),
            valor_pago: parseFloat(financeiro.entrada),
            tipo: 'receita',
            status: 'pago',
            data_pagamento: new Date()
          }
        })
      }

      // REGISTRO DE SALDO (Pendente)
      const saldoRemanescente = parseFloat(financeiro.valorTotal) - parseFloat(financeiro.entrada)
      if (saldoRemanescente > 0) {
        await tx.financeiro.create({
          data: {
            processoId: processo.id,
            clienteId: cliente.id,
            descricao: `SALDO CONTRATUAL: ${data.processo.tipo.toUpperCase()}`,
            valor: saldoRemanescente,
            tipo: 'receita',
            status: 'pendente'
          }
        })
      }

      // REGISTRO DE PARCEIROS / CUSTOS (Despesas)
      const totalDespesas = (parseFloat(financeiro.parceiros) || 0) + (parseFloat(financeiro.custos) || 0)
      if (totalDespesas > 0) {
        await tx.financeiro.create({
          data: {
            processoId: processo.id,
            clienteId: cliente.id,
            descricao: `CUSTOS E PARCEIROS INICIAIS`,
            valor: totalDespesas,
            tipo: 'despesa',
            status: 'pendente'
          }
        })
      }

      return processo
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('ERRO NO WIZARD DE CADASTRO:', error)
    return NextResponse.json({ error: 'Falha ao processar cadastro unificado' }, { status: 500 })
  }
}
