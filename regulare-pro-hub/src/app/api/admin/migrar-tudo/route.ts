import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 1. Pegar todos os imóveis que NÃO possuem processos vinculados
    const imoveisSemProcesso = await prisma.imovel.findMany({
      where: {
        processos: {
          none: {}
        }
      },
      include: {
        cliente: true
      }
    })

    let criadosCount = 0

    // 2. Criar um processo para cada imóvel "órfão"
    const results = await prisma.$transaction(
      imoveisSemProcesso.map((imovel) => {
        return prisma.processo.create({
          data: {
            clienteId: imovel.clienteId,
            imovelId: imovel.id,
            tipo_regularizacao: 'REGULARIZAÇÃO DE OBRA',
            status: 'em_analise',
            etapa_atual: 'MIGRAÇÃO AUTOMÁTICA',
            responsavel: 'SISTEMA',
            observacoes: `PROCESSO GERADO AUTOMATICAMENTE A PARTIR DO IMÓVEL: ${imovel.endereco}`,
            // Criar financeiro inicial simbólico para aparecer no dashboard
            financeiro: {
              create: {
                clienteId: imovel.clienteId,
                descricao: 'FATURAMENTO ESTIMADO (MIGRAÇÃO)',
                valor: 1500, // Valor padrão de exemplo
                tipo: 'receita',
                status: 'pendente'
              }
            }
          }
        })
      })
    )

    criadosCount = results.length

    return NextResponse.json({ 
      success: true, 
      message: `${criadosCount} novos processos criados com sucesso!`,
      total: criadosCount
    })
  } catch (error) {
    console.error('ERRO NA MIGRAÇÃO EM MASSA:', error)
    return NextResponse.json({ error: 'Falha na migração' }, { status: 500 })
  }
}
