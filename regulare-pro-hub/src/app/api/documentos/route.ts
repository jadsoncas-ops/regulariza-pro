import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const doc = await prisma.documento.create({
      data: {
        nome: data.nome,
        tipo: data.tipo,
        processoId: data.processoId || null,
        imovelId: data.imovelId || null,
        url: data.url,
        tamanho: data.tamanho,
        responsavel: data.responsavel,
      }
    })
    return NextResponse.json(doc)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar documento' }, { status: 500 })
  }
}
