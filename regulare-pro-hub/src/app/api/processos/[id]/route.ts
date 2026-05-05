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
    
    // 1. Primeiro, buscamos o processo para saber se ele já tem um imovelId
    const processoAtual = await prisma.processo.findUnique({
      where: { id },
      select: { imovelId: true, clienteId: true }
    })

    if (!processoAtual) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
    }

    let imovelId = processoAtual.imovelId

    // 2. Se houver dados de imóvel no payload
    if (data.imovel) {
      if (imovelId) {
        // Atualiza o imóvel existente
        await prisma.imovel.update({
          where: { id: imovelId },
          data: {
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
        })
      } else {
        // Cria um novo imóvel e obtém o ID
        const novoImovel = await prisma.imovel.create({
          data: {
            clienteId: processoAtual.clienteId, // Vincula ao mesmo cliente
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
        })
        imovelId = novoImovel.id
      }
    }

    // 3. Atualiza os dados do processo
    const processoAtualizado = await prisma.processo.update({
      where: { id },
      data: {
        tipo_regularizacao: data.tipo_regularizacao,
        etapa_atual: data.etapa_atual,
        status: data.status,
        data_previsao: data.data_previsao ? new Date(data.data_previsao) : null,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
        imovelId: imovelId // Garante que o vínculo esteja atualizado
      }
    })

    return NextResponse.json(processoAtualizado)
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
