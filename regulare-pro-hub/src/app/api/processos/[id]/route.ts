import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processo = await prisma.processo.findUnique({
      where: { id: (await params).id },
      include: { 
        cliente: true,
        imovel: true,
        financeiro: true,
        tarefas: true,
        documentos: true,
        checklists: true,
        eventos: true
      }
    })
    if (!processo) return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
    return NextResponse.json(processo)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar processo' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json()
    const processo = await prisma.processo.update({
      where: { id: (await params).id },
      data: {
        clienteId: data.clienteId,
        imovelId: data.imovelId,
        tipo_regularizacao: data.tipo_regularizacao,
        etapa_atual: data.etapa_atual,
        status: data.status,
        data_previsao: data.data_previsao ? new Date(data.data_previsao) : null,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
      }
    })
    return NextResponse.json(processo)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar processo' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await prisma.processo.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir processo' }, { status: 500 })
  }
}
