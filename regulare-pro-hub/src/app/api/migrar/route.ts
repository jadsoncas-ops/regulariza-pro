import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mapeamento de status: HBS antigo → Regulariza Pro
function mapStatus(status: string): string {
  const map: Record<string, string> = {
    'Iniciado': 'em_analise',
    'Em Análise': 'em_analise',
    'Em Andamento': 'em_analise',
    'Exigência': 'exigencia_tecnica',
    'Aprovado': 'aprovado',
    'Finalizado': 'finalizado',
    'Arquivado': 'finalizado',
  }
  return map[status] || 'em_analise'
}

function mapFinanceiroStatus(status: string): string {
  const map: Record<string, string> = {
    'Concluído': 'pago',
    'Parcial': 'parcial',
    'Pendente': 'pendente',
  }
  return map[status] || 'pendente'
}

export async function POST(request: Request) {
  try {
    const { jsonData } = await request.json()
    const data = JSON.parse(jsonData)

    const clientes = data.clientes || data.clients || []
    const processos = data.processos || data.processes || []
    const lancamentos = data.lancamentos || data.transactions || []
    const tasks = data.tasks || []

    const mapClientes = new Map<string, string>()
    const mapProcessos = new Map<string, string>()
    const stats = { clientes: 0, processos: 0, financeiro: 0, tarefas: 0, ignorados: 0 }

    // ── 1. CLIENTES ────────────────────────────────────────────
    for (const cli of clientes) {
      const cpf = cli.cpfCnpj?.replace(/\D/g, '') || null

      const exists = await prisma.cliente.findFirst({
        where: {
          OR: [
            ...(cpf ? [{ cpf_cnpj: cpf }] : []),
            { nome: { equals: cli.nome, mode: 'insensitive' as const } }
          ]
        }
      })

      if (exists) {
        mapClientes.set(cli.id, exists.id)
        stats.ignorados++
        continue
      }

      let enderecoStr = null
      if (cli.endereco) {
        const e = cli.endereco
        enderecoStr = [e.rua, e.numero, e.bairro, e.cidade, e.estado].filter(Boolean).join(', ')
      }

      const novo = await prisma.cliente.create({
        data: {
          nome: cli.nome,
          cpf_cnpj: cpf || '00000000000',
          email: cli.email || null,
          telefone: cli.telefone ? `(${cli.telefone.ddd || ''}) ${cli.telefone.numero || ''}`.trim() : null,
          endereco: enderecoStr,
          observacoes: cli.notes || cli.descricao || null,
        }
      })
      mapClientes.set(cli.id, novo.id)
      stats.clientes++
    }

    // ── 2. PROCESSOS ───────────────────────────────────────────
    for (const proc of processos) {
      if (proc.isArchived) continue // Skip arquivados
      const novoClienteId = mapClientes.get(proc.clienteId)
      if (!novoClienteId) { stats.ignorados++; continue }

      // Tenta achar o imóvel ou cria um padrão (Obrigatório na nova arquitetura)
      let imovelId = ''
      const oldCli = clientes.find((c: any) => c.id === proc.clienteId)
      const address = oldCli?.propertyAddress || (oldCli?.endereco ? [oldCli.endereco.rua, oldCli.endereco.numero].filter(Boolean).join(', ') : null) || 'ENDEREÇO NÃO INFORMADO (IMPORTADO)'
      
      const imovel = await prisma.imovel.create({
        data: {
          clienteId: novoClienteId,
          endereco: address,
          tipo: 'IMPORTADO',
        }
      })
      imovelId = imovel.id

      // Montar observações com timeline
      let obs = ''
      if (proc.requirements && proc.requirements.length > 0) {
        obs += `\n\n[EXIGÊNCIAS TÉCNICAS MIGRADAS]\n`
        proc.requirements.forEach((r: any) => {
          obs += `• ${r.description} (Status: ${r.status})\n`
        })
      }
      if (proc.checklist && proc.checklist.length > 0) {
        obs += `\n[CHECKLIST MIGRADO]\n`
        proc.checklist.forEach((item: any) => {
          obs += `${item.completed ? '✓' : '○'} ${item.label}\n`
        })
      }

      const novo = await prisma.processo.create({
        data: {
          clienteId: novoClienteId,
          imovelId,
          tipo_regularizacao: proc.type || proc.objeto || 'Regularização',
          status: mapStatus(proc.status),
          etapa_atual: proc.etapa || proc.stage || proc.status || 'Iniciado',
          data_inicio: proc.startDate ? new Date(proc.startDate) : new Date(proc.createdAt || Date.now()),
          data_previsao: proc.expectedEndDate ? new Date(proc.expectedEndDate) : null,
          responsavel: proc.responsavelNome || null,
          observacoes: obs.trim() || null,
        }
      })
      mapProcessos.set(proc.id, novo.id)
      stats.processos++

      // Criar checklists no banco
      if (proc.checklist && proc.checklist.length > 0) {
        await prisma.checklist.createMany({
          data: proc.checklist.map((item: any) => ({
            processoId: novo.id,
            item: item.label,
            concluido: item.completed || false,
          }))
        })
      }
    }

    // ── 3. FINANCEIRO ──────────────────────────────────────────
    for (const tx of lancamentos) {
      // Só migrar o que tem vínculo
      const novoProcessoId = tx.processId ? mapProcessos.get(tx.processId) : null
      const novoClienteId = tx.clienteId ? mapClientes.get(tx.clienteId) : null
      if (!novoProcessoId && !novoClienteId) { stats.ignorados++; continue }

      // Ignorar repasses secundários (childId) - migramos apenas o pai
      if (tx.isRepasse && tx.parentId) { stats.ignorados++; continue }

      let tipo = 'receita'
      if (tx.tipo === 'Saída' || tx.tipo === 'A Pagar') tipo = 'despesa'
      const isRepasse = tx.isRepasse === true

      let valorPago = 0
      if (tx.status === 'Concluído') valorPago = tx.valor
      else if (tx.status === 'Parcial') {
        // O sistema antigo não guardava o valor parcial explícito, estimamos
        valorPago = tx.valor * 0.5
      }

      await prisma.financeiro.create({
        data: {
          processoId: novoProcessoId,
          clienteId: novoClienteId,
          descricao: tx.descricao || 'Sem descrição',
          categoria: tx.categoria || 'Migrado',
          valor: tx.valor || 0,
          valor_pago: valorPago,
          tipo,
          is_repasse: isRepasse,
          forma_pagamento: tx.paymentMethod || null,
          data_vencimento: tx.previsaoData ? new Date(tx.previsaoData) : new Date(tx.data || Date.now()),
          data_pagamento: tx.status === 'Concluído' ? new Date(tx.data || Date.now()) : null,
          status: mapFinanceiroStatus(tx.status),
        }
      })
      stats.financeiro++
    }

    // ── 4. TAREFAS ─────────────────────────────────────────────
    for (const task of tasks) {
      const novoProcessoId = task.processId ? mapProcessos.get(task.processId) : null
      if (!novoProcessoId) { stats.ignorados++; continue }

      let statusTarefa = 'pendente'
      if (task.status === 'Concluída') statusTarefa = 'concluida'
      else if (task.status === 'Em Andamento') statusTarefa = 'em_andamento'

      await prisma.tarefa.create({
        data: {
          titulo: task.title,
          descricao: task.description || null,
          processoId: novoProcessoId,
          data: task.dueDate ? new Date(task.dueDate) : new Date(),
          hora: task.dueTime || null,
          responsavel: task.assignedUserId ? `Usuário ID: ${task.assignedUserId}` : null,
          status: statusTarefa,
        }
      })
      stats.tarefas++
    }

    return NextResponse.json({ success: true, stats })

  } catch (error: any) {
    console.error('[MIGRAÇÃO] Erro:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno ao processar a migração' },
      { status: 500 }
    )
  }
}
