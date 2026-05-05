import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // INICIAR TRANSAÇÃO ATÔMICA (Ou cria tudo ou não cria nada)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar Cliente
      const cliente = await tx.cliente.create({
        data: {
          nome: data.cliente_nome.toUpperCase(),
          cpf_cnpj: data.cliente_cpf_cnpj,
          telefone: data.cliente_telefone,
          email: data.cliente_email.toUpperCase(),
          endereco: data.cliente_endereco.toUpperCase(),
          cidade: data.imovel_cidade.toUpperCase() || 'NÃO INFORMADO',
          estado: 'BA'
        }
      })

      // 2. Criar Imóvel
      const imovel = await tx.imovel.create({
        data: {
          clienteId: cliente.id,
          endereco: data.imovel_endereco.toUpperCase(),
          bairro: data.imovel_bairro.toUpperCase(),
          cep: data.imovel_cep,
          cidade: data.imovel_cidade.toUpperCase() || 'NÃO INFORMADO',
          estado: 'BA',
          area_terreno: data.imovel_area_terreno ? parseFloat(data.imovel_area_terreno) : null,
          area_construida: data.imovel_area_construida ? parseFloat(data.imovel_area_construida) : null,
          num_matricula: data.imovel_matricula.toUpperCase(),
          cartorio: data.imovel_cartorio.toUpperCase(),
          inscricao_imobiliaria: data.imovel_inscricao.toUpperCase(),
          zoneamento: data.imovel_zoneamento.toUpperCase(),
          observacoes: data.imovel_obs.toUpperCase()
        }
      })

      // 3. Criar Processo
      const processo = await tx.processo.create({
        data: {
          clienteId: cliente.id,
          imovelId: imovel.id,
          tipo_regularizacao: data.processo_tipo.toUpperCase(),
          status: 'em_analise',
          etapa_atual: 'INICIADO',
          responsavel: 'JADSON CASTRO SANTANA', // Default como responsável técnico
        }
      })

      // 4. Criar Registro Financeiro Inicial (Faturamento)
      if (data.processo_valor && parseFloat(data.processo_valor) > 0) {
        await tx.financeiro.create({
          data: {
            processoId: processo.id,
            clienteId: cliente.id,
            descricao: `CONTRATO: ${data.processo_tipo.toUpperCase()}`,
            valor: parseFloat(data.processo_valor),
            tipo: 'receita',
            status: 'pendente'
          }
        })
      }

      return processo
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('ERRO AO CRIAR PROJETO UNIFICADO:', error)
    return NextResponse.json({ error: 'Falha ao processar cadastro' }, { status: 500 })
  }
}
