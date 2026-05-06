import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/busca?q=termo
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''

  if (q.length < 2) return NextResponse.json({ clientes: [], processos: [], imoveis: [] })

  try {
    const [clientes, processos, imoveis] = await Promise.all([
      prisma.cliente.findMany({
        where: {
          OR: [
            { nome:      { contains: q, mode: 'insensitive' } },
            { cpf_cnpj:  { contains: q } },
            { cidade:    { contains: q, mode: 'insensitive' } },
            { email:     { contains: q, mode: 'insensitive' } },
          ]
        },
        select: { id: true, nome: true, cidade: true, telefone: true },
        take: 5,
      }),
      prisma.processo.findMany({
        where: {
          OR: [
            { tipo_regularizacao: { contains: q, mode: 'insensitive' } },
            { codigo_projeto:     { contains: q, mode: 'insensitive' } },
            { categoria:         { contains: q, mode: 'insensitive' } },
            { cliente: { nome:   { contains: q, mode: 'insensitive' } } },
          ]
        },
        select: {
          id: true, codigo_projeto: true, tipo_regularizacao: true,
          status: true, cliente: { select: { nome: true } }
        },
        take: 5,
      }),
      prisma.imovel.findMany({
        where: {
          OR: [
            { endereco: { contains: q, mode: 'insensitive' } },
            { cidade:   { contains: q, mode: 'insensitive' } },
            { bairro:   { contains: q, mode: 'insensitive' } },
          ]
        },
        select: {
          id: true, endereco: true, numero: true, cidade: true,
          cliente: { select: { nome: true } }
        },
        take: 5,
      }),
    ])

    return NextResponse.json({ clientes, processos, imoveis })
  } catch (error) {
    console.error('ERRO /api/busca:', error)
    return NextResponse.json({ clientes: [], processos: [], imoveis: [] })
  }
}
