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
        ...(data.clienteId      !== undefined && { clienteId: data.clienteId }),
        ...(data.endereco       !== undefined && { endereco: data.endereco }),
        ...(data.bairro         !== undefined && { bairro: data.bairro }),
        ...(data.cidade         !== undefined && { cidade: data.cidade }),
        ...(data.estado         !== undefined && { estado: data.estado }),
        ...(data.cep            !== undefined && { cep: data.cep }),
        ...(data.area_terreno   !== undefined && { area_terreno: data.area_terreno ? parseFloat(data.area_terreno) : null }),
        ...(data.area_construida !== undefined && { area_construida: data.area_construida ? parseFloat(data.area_construida) : null }),
        ...(data.num_matricula  !== undefined && { num_matricula: data.num_matricula }),
        ...(data.cartorio       !== undefined && { cartorio: data.cartorio }),
        ...(data.inscricao_imobiliaria !== undefined && { inscricao_imobiliaria: data.inscricao_imobiliaria }),
        ...(data.zoneamento     !== undefined && { zoneamento: data.zoneamento }),
        ...(data.observacoes    !== undefined && { observacoes: data.observacoes }),
        ...(data.latitude       !== undefined && { latitude: data.latitude }),
        ...(data.longitude      !== undefined && { longitude: data.longitude }),
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
