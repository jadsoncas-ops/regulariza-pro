import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

export async function GET() {
  const empresaId = await getTenantId()
  const imoveis = await prisma.imovel.findMany({
    where: { empresaId },
    include: { cliente: true, processos: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(imoveis)
}

export async function POST(req: Request) {
  try {
    const empresaId = await getTenantId()
    const data = await req.json()
    const imovel = await prisma.imovel.create({
      data: {
        empresaId,
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
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
      }
    })
    return NextResponse.json(imovel)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar imóvel' }, { status: 500 })
  }
}
