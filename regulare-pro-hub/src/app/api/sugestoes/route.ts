import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/sugestoes?campo=tipo_regularizacao&q=regu
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const campo = searchParams.get('campo') || ''
  const q     = searchParams.get('q')     || ''

  try {
    let sugestoes: string[] = []

    if (campo === 'tipo_regularizacao' || campo === 'servico') {
      const rows = await prisma.processo.findMany({
        where: { tipo_regularizacao: { contains: q, mode: 'insensitive' } },
        select: { tipo_regularizacao: true },
        distinct: ['tipo_regularizacao'],
        take: 10,
      })
      sugestoes = rows.map(r => r.tipo_regularizacao)
    }

    else if (campo === 'categoria') {
      const rows = await prisma.processo.findMany({
        where: { categoria: { contains: q, mode: 'insensitive' } },
        select: { categoria: true },
        distinct: ['categoria'],
        take: 10,
      })
      sugestoes = rows.map(r => r.categoria).filter(Boolean) as string[]
    }

    else if (campo === 'cidade') {
      const imoveisCidades = await prisma.imovel.findMany({
        where: { cidade: { contains: q, mode: 'insensitive' } },
        select: { cidade: true },
        distinct: ['cidade'],
        take: 6,
      })
      const clientesCidades = await prisma.cliente.findMany({
        where: { cidade: { contains: q, mode: 'insensitive' } },
        select: { cidade: true },
        distinct: ['cidade'],
        take: 6,
      })
      const all = [
        ...imoveisCidades.map(r => r.cidade),
        ...clientesCidades.map(r => r.cidade),
      ].filter(Boolean) as string[]
      sugestoes = [...new Set(all)].slice(0, 10)
    }

    else if (campo === 'tags') {
      // Extrai todas as tags únicas de todos os processos
      const rows = await prisma.processo.findMany({
        select: { tags: true },
        where: { tags: { not: null } },
      })
      const allTags = rows.flatMap(r => {
        try { return JSON.parse(r.tags || '[]') } catch { return [] }
      })
      const uniqueTags = [...new Set(allTags)] as string[]
      sugestoes = q
        ? uniqueTags.filter(t => t.toLowerCase().includes(q.toLowerCase()))
        : uniqueTags
      sugestoes = sugestoes.slice(0, 15)
    }

    return NextResponse.json(sugestoes)
  } catch (error) {
    console.error('ERRO /api/sugestoes:', error)
    return NextResponse.json([])
  }
}
