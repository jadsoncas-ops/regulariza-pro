import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await prisma.documento.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir documento' }, { status: 500 })
  }
}
