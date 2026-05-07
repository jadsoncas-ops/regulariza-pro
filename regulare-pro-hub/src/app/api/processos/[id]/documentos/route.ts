import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processoId = (await params).id
    const { nome, tipo, tamanho, categoria, responsavel, observacoes } = await req.json()

    const documento = await prisma.documento.create({
      data: {
        processoId,
        nome,
        tipo,
        tamanho: tamanho || 0,
        categoria,
        responsavel,
        observacoes,
        url: `https://fake-storage.regularizapro.com.br/${nome.replace(/\s/g, '_')}`, // Simulação enquanto não há S3
        status: 'pendente'
      }
    })

    await logAction({
      processoId,
      acao: `Documento Anexado`,
      modulo: 'DOCUMENTOS',
      detalhe: `${nome} (${tipo})`
    })

    return NextResponse.json(documento)
  } catch (error) {
    console.error('Erro ao anexar documento:', error)
    return NextResponse.json({ error: 'Erro ao anexar documento' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, processoId, nome } = await req.json()
    
    await prisma.documento.delete({ where: { id } })

    await logAction({
      processoId,
      acao: `Documento Removido`,
      modulo: 'DOCUMENTOS',
      detalhe: nome
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover documento' }, { status: 500 })
  }
}
