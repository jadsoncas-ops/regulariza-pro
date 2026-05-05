import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const SERVICOS_PADRAO = [
  { nome: 'Regularização de Imóvel', sigla: 'REG', categoria: 'Regularização', subservicos: ['Levantamento', 'Desenho Técnico', 'Protocolo Prefeitura'] },
  { nome: 'Averbação de Construção', sigla: 'AVB', categoria: 'Regularização', subservicos: ['CND INSS', 'Certidão de Habite-se', 'Protocolo Cartório'] },
  { nome: 'Desmembramento', sigla: 'DES', categoria: 'Parcelamento do solo', subservicos: ['Memorial Descritivo', 'Planta Georreferenciada'] },
  { nome: 'Unificação de Lotes', sigla: 'UNI', categoria: 'Parcelamento do solo', subservicos: ['Memorial Descritivo', 'Levantamento'] },
  { nome: 'Habite-se', sigla: 'HAB', categoria: 'Regularização', subservicos: ['Vistoria Sanitária', 'Vistoria Bombeiros'] },
  { nome: 'Administração de Obra', sigla: 'OBR', categoria: 'Gestão de obra', subservicos: ['Diário de Obra', 'Controle Financeiro'] },
  { nome: 'Projeto Arquitetônico', sigla: 'PRJ', categoria: 'Projetos', subservicos: ['Estudo Preliminar', 'Projeto Executivo', 'Renderização 3D'] },
  { nome: 'Laudo Técnico', sigla: 'LAU', categoria: 'Laudos técnicos', subservicos: ['Vistoria In Loco', 'Emissão de ART/RRT'] },
  { nome: 'Consultoria', sigla: 'CON', categoria: 'Consultoria', subservicos: ['Análise de Viabilidade', 'Parecer Técnico'] },
]

// LISTAR SERVIÇOS (Com Auto-Seed)
export async function GET() {
  try {
    let servicos = await prisma.servicoPadrao.findMany({
      orderBy: { categoria: 'asc' }
    })

    // Se estiver vazio, popula com os padrões
    if (servicos.length === 0) {
      for (const s of SERVICOS_PADRAO) {
        await prisma.servicoPadrao.create({ data: s })
      }
      servicos = await prisma.servicoPadrao.findMany({
        orderBy: { categoria: 'asc' }
      })
    }

    return NextResponse.json(servicos)
  } catch (error) {
    console.error('ERRO AO BUSCAR/POULAR SERVICOS:', error)
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 })
  }
}

// CRIAR NOVO SERVIÇO
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const novoServico = await prisma.servicoPadrao.create({
      data: {
        nome: data.nome.toUpperCase(),
        sigla: data.sigla.toUpperCase(),
        categoria: data.categoria.toUpperCase(),
        descricao: data.descricao?.toUpperCase() || null,
        subservicos: data.subservicos || []
      }
    })
    return NextResponse.json(novoServico)
  } catch (error) {
    console.error('ERRO AO CRIAR SERVIÇO:', error)
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 })
  }
}
