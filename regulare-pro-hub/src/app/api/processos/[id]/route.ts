import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logAction } from '@/lib/logger'
import { getTenantId } from '@/lib/tenant'
import { onStageChange } from '@/lib/workflowAutomation'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const empresaId = await getTenantId()
    const processo = await prisma.processo.findUnique({
      where: { id: (await params).id, empresaId },
      include: { 
        cliente: true,
        imovel: true,
        financeiro: { orderBy: { createdAt: 'desc' } },
        tarefas: { 
          include: { assignedTo: true },
          orderBy: { createdAt: 'desc' } 
        },
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
    const empresaId = await getTenantId()
    const id = (await params).id
    const data = await req.json()
    
    // 1. Primeiro, buscamos o processo para saber se ele já tem um imovelId
    const processoAtual = await prisma.processo.findUnique({
      where: { id, empresaId },
      select: { imovelId: true, clienteId: true, status: true, etapa_atual: true }
    })

    if (!processoAtual) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
    }

    const statusChanged = data.status && data.status !== processoAtual.status
    const oldStatus = processoAtual.status
    const newStatus = data.status

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
            empresaId,
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
        codigo_projeto: data.codigo_projeto,
        categoria: data.categoria,
        valor_total: data.valor_total ? parseFloat(data.valor_total) : undefined,
        etapa_atual: data.etapa_atual,
        status: data.status,
        data_deadline: data.data_deadline ? new Date(data.data_deadline) : undefined,
        data_previsao: data.data_previsao ? new Date(data.data_previsao) : undefined,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
        imovelId: imovelId // Garante que o vínculo esteja atualizado
      }
    })


    const stageChanged = data.etapa_atual && data.etapa_atual !== processoAtual.etapa_atual

    // LOGAR MUDANÇA DE STATUS SE HOUVER
    if (statusChanged) {
      await logAction({
        processoId: id,
        empresaId,
        acao: `Alteração de Status`,
        modulo: 'PROCESSO',
        detalhe: `De: ${processoAtual.status} → Para: ${data.status}`
      })
    }

    if (stageChanged) {
      await onStageChange(
        id, 
        processoAtual.etapa_atual || 'INICIAL', 
        data.etapa_atual, 
        'USUÁRIO', // In real app, get from session
        empresaId
      )
    }

    return NextResponse.json(processoAtualizado)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro ao atualizar processo e imóvel' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const empresaId = await getTenantId()
    const id = (await params).id
    
    // Buscar processo para pegar clienteId e imovelId
    const processo = await prisma.processo.findUnique({
      where: { id, empresaId },
      select: { clienteId: true, imovelId: true }
    })

    if (!processo) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
    }

    // 1️⃣ Apagar o processo
    // O Prisma cuidará de apagar tarefas, documentos, checklists, etc. via Cascade no Schema se configurado,
    // ou apagamos manualmente se necessário. No nosso schema, muitos estão com Cascade.
    await prisma.processo.delete({ where: { id } })

    // Nota: Mantemos o Cliente e o Imóvel no banco de dados, pois eles fazem parte 
    // da carteira de ativos e contatos da empresa, mesmo sem processos ativos.

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
