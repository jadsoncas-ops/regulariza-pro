import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const processos = await prisma.processo.findMany({
    include: { cliente: true, imovel: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(processos)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Automação: Geração de Código do Processo
    let codigo_projeto = data.codigo_projeto
    if (!codigo_projeto && data.clienteId) {
      const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } })
      const count = await prisma.processo.count({ where: { clienteId: data.clienteId } })
      
      let sigla = 'OP'
      const tipo = (data.tipo_regularizacao || '').toLowerCase()
      if (tipo.includes('projeto') || tipo.includes('arq')) sigla = 'PROJARQ'
      else if (tipo.includes('regulariza') || tipo.includes('imóvel') || tipo.includes('imovel')) sigla = 'REGIMOB'
      else if (tipo.includes('art') || tipo.includes('rt')) sigla = 'ART'
      
      const clientName = (cliente?.nome?.split(' ')[0] || 'CLI').toUpperCase().replace(/[^A-Z0-9]/g, '')
      const number = String(count + 1).padStart(3, '0')
      
      codigo_projeto = `${sigla}_${clientName}_${number}`
    }

    const processo = await prisma.processo.create({
      data: {
        clienteId: data.clienteId,
        imovelId: data.imovelId,
        tipo_regularizacao: data.tipo_regularizacao,
        codigo_projeto,
        etapa_atual: data.etapa_atual || 'Proposta',
        status: data.status || 'proposta',
        data_deadline: data.data_previsao ? new Date(data.data_previsao) : null,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
      }
    })
    return NextResponse.json(processo)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar processo' }, { status: 500 })
  }
}
