import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getProcessHealth } from '@/lib/health'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const empresaId = await getTenantId()

    const results = await Promise.all([
      prisma.processo.count({ where: { empresaId } }),
      prisma.processo.findMany({
        where: { empresaId, NOT: { status: 'finalizado' } },
        select: { id: true, status: true, updatedAt: true, createdAt: true, etapa_atual: true, valor_total: true }
      }),
      prisma.financeiro.groupBy({
        by: ['tipo', 'status'],
        where: { empresaId },
        _sum: { valor: true, valor_pago: true }
      }),
      prisma.evento.findMany({
        where: { processo: { empresaId } }, // Only events for processes of this empresa
        take: 10,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.processo.findMany({
        where: { empresaId, status: 'finalizado' },
        select: { createdAt: true, updatedAt: true }
      }),
      prisma.tarefa.findMany({
        where: { empresaId },
        select: { status: true, data: true, assignedId: true }
      })
    ])

    const [processosCount, processosAtivos, financeiroStats, recentEvents, processosFinalizados, allTasks] = results

    // Calculate MRR (Current vs Prev)
    const currentMonthRevenue = await prisma.financeiro.aggregate({
      where: {
        empresaId,
        tipo: 'receita',
        status: 'pago',
        data_pagamento: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1)
        }
      },
      _sum: { valor: true }
    })

    const prevMonthRevenue = await prisma.financeiro.aggregate({
      where: {
        empresaId,
        tipo: 'receita',
        status: 'pago',
        data_pagamento: {
          gte: new Date(prevYear, prevMonth, 1),
          lt: new Date(prevYear, prevMonth + 1, 1)
        }
      },
      _sum: { valor: true }
    })

    // Health Distribution
    const healthDistribution = { on_track: 0, attention: 0, delayed: 0 }
    processosAtivos.forEach(p => {
      const health = getProcessHealth(p).status
      healthDistribution[health as keyof typeof healthDistribution]++
    })

    // Average Completion Time
    const avgCompTime = processosFinalizados.length 
      ? processosFinalizados.reduce((s, p) => s + (p.updatedAt.getTime() - p.createdAt.getTime()), 0) / processosFinalizados.length / 86400000 
      : 0

    // Total Financials
    const totalContracted = processosAtivos.reduce((s, p) => s + (p.valor_total || 0), 0)
    const totalReceived = financeiroStats
      .filter(f => f.tipo === 'receita' && f.status === 'pago')
      .reduce((s, f) => s + (f._sum.valor || 0), 0)

    // Bottlenecks
    const stages: Record<string, number> = {}
    processosAtivos.forEach(p => {
      const stage = p.etapa_atual || 'CADASTRO'
      stages[stage] = (stages[stage] || 0) + 1
    })
    const bottlenecks = Object.entries(stages)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Task Stats
    const taskStats = {
      pending: allTasks.filter(t => t.status !== 'concluido').length,
      overdue: allTasks.filter(t => t.status !== 'concluido' && new Date(t.data) < now).length,
      completed: allTasks.filter(t => t.status === 'concluido').length
    }

    return NextResponse.json({
      activeCount: processosAtivos.length,
      totalCount: processosCount,
      monthlyRevenue: currentMonthRevenue._sum.valor || 0,
      prevMonthlyRevenue: prevMonthRevenue._sum.valor || 0,
      avgTicket: processosCount ? totalContracted / processosCount : 0,
      avgCompTime,
      health: healthDistribution,
      financials: {
        totalContracted,
        totalReceived,
        pending: totalContracted - totalReceived
      },
      bottlenecks,
      taskStats,
      events: recentEvents
    })

  } catch (error) {
    console.error('DASHBOARD_STATS_ERROR:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
