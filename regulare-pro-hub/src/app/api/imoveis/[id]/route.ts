import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id: (await params).id },
      include: { 
        cliente: true,
        processos: true,
        documentos: true
      }
    })
    if (!imovel) return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 })
    return NextResponse.json(imovel)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar imóvel' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json()
    const imovel = await prisma.imovel.update({
      where: { id: (await params).id },
      data: {
        clienteId: data.clienteId,
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        area_terreno: data.area_terreno ? parseFloat(data.area_terreno) : null,
        area_construida: data.area_construida ? parseFloat(data.area_construida) : null,
        num_matricula: data.num_matricula,
        cartorio: data.cartorio,
        inscricao_imobiliaria: data.inscricao_imobiliaria,
        zoneamento: data.zoneamento,
        observacoes: data.observacoes,
      }
    })
    return NextResponse.json(imovel)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar imóvel' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await prisma.imovel.delete({ where: { id: (await params).id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir imóvel' }, { status: 500 })
  }
}
