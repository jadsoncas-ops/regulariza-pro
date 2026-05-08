import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const processo = await prisma.processo.findUnique({
      where: { id: (await params).id },
      include: { 
        cliente: true,
        imovel: true,
        financeiro: { orderBy: { createdAt: 'desc' } },
        tarefas: { orderBy: { createdAt: 'desc' } },
        documentos: { orderBy: { createdAt: 'desc' } },
        checklists: { orderBy: { createdAt: 'asc' } },
        eventos: { orderBy: { createdAt: 'desc' } },
        protocolos: { orderBy: { createdAt: 'desc' } },
        logs: { orderBy: { createdAt: 'desc' } }
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
      select: { imovelId: true, clienteId: true, status: true }
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

    // LOGAR MUDANÇA DE STATUS SE HOUVER
    if (data.status && data.status !== processoAtual.status) {
      await logAction({
        processoId: id,
        acao: `Alteração de Status`,
        modulo: 'PROCESSO',
        detalhe: `De: ${processoAtual.status} → Para: ${data.status}`
      })
    }

    return NextResponse.json(processoAtualizado)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro ao atualizar processo e imóvel' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id
    
    // Buscar processo para pegar clienteId e imovelId
    const processo = await prisma.processo.findUnique({
      where: { id },
      select: { clienteId: true, imovelId: true }
    })

    if (!processo) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
    }

    // 1️⃣ Apagar o processo
    await prisma.processo.delete({ where: { id } })

    // 2️⃣ Verificar se o imóvel está vinculado a outros processos
    if (processo.imovelId) {
      const outrosProcessosImovel = await prisma.processo.count({
        where: { imovelId: processo.imovelId }
      })
      if (outrosProcessosImovel === 0) {
        // Excluir imóvel automaticamente se não estiver em outro processo
        await prisma.imovel.delete({ where: { id: processo.imovelId } })
      }
    }

    // 3️⃣ Verificar se o cliente possui mais imóveis ou processos
    if (processo.clienteId) {
      const outrosProcessosCliente = await prisma.processo.count({
        where: { clienteId: processo.clienteId }
      })
      const outrosImoveisCliente = await prisma.imovel.count({
        where: { clienteId: processo.clienteId }
      })
      
      if (outrosProcessosCliente === 0 && outrosImoveisCliente === 0) {
        // Excluir cliente automaticamente se não possuir mais nada
        await prisma.cliente.delete({ where: { id: processo.clienteId } })
      }
    }

    // 4️⃣ Reorganizar a numeração dos processos (codigo_projeto)
    const allProcessos = await prisma.processo.findMany({
      orderBy: { createdAt: 'asc' }
    })

    // Agrupar por sigla se necessário, ou apenas resequenciar tudo como REG se for o padrão
    // Vamos resequenciar mantendo a sigla original se existir, ou usando REG como padrão
    for (let i = 0; i < allProcessos.length; i++) {
      const p = allProcessos[i]
      const currentCode = p.codigo_projeto || ''
      const sigla = currentCode.split('-')[0] || 'REG'
      const newCode = `${sigla}-${(i + 1).toString().padStart(3, '0')}`
      
      if (p.codigo_projeto !== newCode) {
        await prisma.processo.update({
          where: { id: p.id },
          data: { codigo_projeto: newCode }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na deleção em cascata:', error)
    return NextResponse.json({ error: 'Erro ao excluir processo e vínculos' }, { status: 500 })
  }
}
