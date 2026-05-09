import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''

  if (q.length < 2) return NextResponse.json({ 
    clientes: [], processos: [], imoveis: [], 
    documentos: [], financeiro: [], acoes: [] 
  })

  try {
    const [clientes, processos, imoveis, documentos, financeiro] = await Promise.all([
      prisma.cliente.findMany({
        where: {
          OR: [
            { nome:      { contains: q, mode: 'insensitive' } },
            { cpf_cnpj:  { contains: q } },
            { email:     { contains: q, mode: 'insensitive' } },
          ]
        },
        select: { id: true, nome: true, cidade: true },
        take: 5,
      }),
      prisma.processo.findMany({
        where: {
          OR: [
            { tipo_regularizacao: { contains: q, mode: 'insensitive' } },
            { codigo_projeto:     { contains: q, mode: 'insensitive' } },
            { cliente: { nome:   { contains: q, mode: 'insensitive' } } },
          ]
        },
        select: {
          id: true, codigo_projeto: true, tipo_regularizacao: true,
          status: true, cliente: { select: { nome: true } }
        },
        take: 8,
      }),
      prisma.imovel.findMany({
        where: {
          OR: [
            { endereco: { contains: q, mode: 'insensitive' } },
            { cidade:   { contains: q, mode: 'insensitive' } },
          ]
        },
        select: { id: true, endereco: true, numero: true, cidade: true },
        take: 3,
      }),
      prisma.documento.findMany({
        where: {
          OR: [
            { nome: { contains: q, mode: 'insensitive' } },
            { tipo: { contains: q, mode: 'insensitive' } },
          ]
        },
        select: { id: true, nome: true, tipo: true, processoId: true },
        take: 5,
      }),
      prisma.financeiro.findMany({
        where: {
          OR: [
            { descricao: { contains: q, mode: 'insensitive' } },
            { status:    { contains: q, mode: 'insensitive' } },
          ]
        },
        select: { id: true, descricao: true, valor: true, tipo: true, processoId: true },
        take: 5,
      })
    ])

    // Quick Actions
    const quickActions = [
      { id: 'new-process', title: 'Criar Novo Processo', action: '/processos/novo', icon: 'Plus' },
      { id: 'go-dashboard', title: 'Abrir Dashboard', action: '/dashboard', icon: 'LayoutGrid' },
      { id: 'new-client', title: 'Cadastrar Novo Cliente', action: '/clientes/novo', icon: 'UserPlus' },
      { id: 'view-map', title: 'Ver Mapa de Processos', action: '/mapa', icon: 'Map' },
    ].filter(a => a.title.toLowerCase().includes(q.toLowerCase()))

    return NextResponse.json({ 
      clientes, processos, imoveis, 
      documentos, financeiro, acoes: quickActions 
    })
  } catch (error) {
    console.error('ERRO /api/busca:', error)
    return NextResponse.json({ 
      clientes: [], processos: [], imoveis: [], 
      documentos: [], financeiro: [], acoes: [] 
    })
  }
}
