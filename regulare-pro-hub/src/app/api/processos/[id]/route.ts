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
    const id = (await params).id
    const data = await req.json()
    
    // Atualiza o processo e os dados do imóvel aninhados
    const processo = await prisma.processo.update({
      where: { id },
      data: {
        tipo_regularizacao: data.tipo_regularizacao,
        etapa_atual: data.etapa_atual,
        status: data.status,
        data_previsao: data.data_previsao ? new Date(data.data_previsao) : null,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
        // Se houver dados de imóvel no payload, atualiza o imóvel vinculado
        imovel: data.imovel ? {
          update: {
            endereco: data.imovel.endereco,
            numero: data.imovel.numero,
            bairro: data.imovel.bairro,
            cidade: data.imovel.cidade,
            cep: data.imovel.cep,
            area_terreno: data.imovel.area_terreno,
            area_construida: data.imovel.area_construida,
            num_matricula: data.imovel.num_matricula,
            cartorio: data.imovel.cartorio,
            inscricao_imobiliaria: data.imovel.inscricao_imobiliaria,
            zoneamento: data.imovel.zoneamento,
          }
        } : undefined
      }
    })
    return NextResponse.json(processo)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro ao atualizar processo e imóvel' }, { status: 500 })
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
