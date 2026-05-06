import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const processos = await prisma.processo.findMany({
      include: {
        cliente: { select: { id: true, nome: true, telefone: true } },
        imovel: {
          select: {
            id: true, endereco: true, numero: true, bairro: true,
            cidade: true, estado: true, cep: true,
            area_construida: true, area_terreno: true,
            latitude: true, longitude: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Retornar apenas processos que têm imóvel com coordenadas OU imóvel com endereço para geocoding
    const result = processos.map(p => ({
      id: p.id,
      codigo: p.codigo_projeto,
      tipo: p.tipo_regularizacao,
      status: p.status,
      etapa: p.etapa_atual,
      prioridade: p.prioridade,
      cliente: p.cliente,
      imovel: p.imovel,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('ERRO /api/mapa:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados do mapa' }, { status: 500 })
  }
}
