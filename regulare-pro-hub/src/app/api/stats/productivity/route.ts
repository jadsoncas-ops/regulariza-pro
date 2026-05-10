import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

export async function GET() {
  try {
    const empresaId = await getTenantId()

    // 1. Performance por Colaborador (Leaderboard)
    // Buscamos todos os usuários da empresa
    const users = await prisma.user.findMany({
      where: { empresaId },
      include: {
        tarefasAtribuidas: {
          where: { status: 'concluido' },
          select: { id: true, startedAt: true, finishedAt: true }
        }
      }
    })

    const leaderboard = users.map(user => {
      const completedTasks = user.tarefasAtribuidas.length
      const totalDuration = user.tarefasAtribuidas.reduce((acc, t) => {
        if (t.startedAt && t.finishedAt) {
          return acc + (t.finishedAt.getTime() - t.startedAt.getTime())
        }
        return acc
      }, 0)
      
      const avgTime = completedTasks > 0 ? (totalDuration / completedTasks / 3600000).toFixed(2) : 0 // Hours

      return {
        id: user.id,
        name: user.name,
        completedTasks,
        avgTimeHours: parseFloat(avgTime.toString()),
        score: completedTasks * 10 - (parseFloat(avgTime.toString()) * 2) // Simple score logic
      }
    }).sort((a, b) => b.completedTasks - a.completedTasks)

    // 2. Tempo Médio por Etapa (Bottlenecks)
    const stageHistory = await prisma.stageHistory.groupBy({
      by: ['etapa'],
      where: { empresaId, saida: { not: null } },
      _avg: { duracao: true },
      _count: { id: true }
    })

    const stageMetrics = stageHistory.map(s => ({
      etapa: s.etapa,
      avgDurationDays: s._avg.duracao ? (s._avg.duracao / 1440).toFixed(2) : 0, // Minutes to Days
      count: s._count.id
    })).sort((a, b) => parseFloat(b.avgDurationDays.toString()) - parseFloat(a.avgDurationDays.toString()))

    // 3. Tempo Médio por Tipo de Processo
    // Primeiro pegamos os processos finalizados
    const completedProcesses = await prisma.processo.findMany({
      where: { empresaId, status: 'finalizado' },
      select: { tipo_regularizacao: true, createdAt: true, updatedAt: true }
    })

    const processTypeMetrics: Record<string, { total: number, count: number }> = {}
    completedProcesses.forEach(p => {
      const duration = p.updatedAt.getTime() - p.createdAt.getTime()
      if (!processTypeMetrics[p.tipo_regularizacao]) {
        processTypeMetrics[p.tipo_regularizacao] = { total: 0, count: 0 }
      }
      processTypeMetrics[p.tipo_regularizacao].total += duration
      processTypeMetrics[p.tipo_regularizacao].count++
    })

    const typeMetrics = Object.entries(processTypeMetrics).map(([type, stats]) => ({
      type,
      avgDays: (stats.total / stats.count / 86400000).toFixed(1)
    }))

    // 4. Volume de Tarefas por Status
    const tasksByStatus = await prisma.tarefa.groupBy({
      by: ['status'],
      where: { empresaId },
      _count: { id: true }
    })

    return NextResponse.json({
      leaderboard,
      stageMetrics,
      typeMetrics,
      tasksByStatus: tasksByStatus.map(s => ({ status: s.status, count: s._count.id })),
      overallAvgTaskHours: leaderboard.length > 0 ? (leaderboard.reduce((a, b) => a + b.avgTimeHours, 0) / leaderboard.length).toFixed(1) : 0
    })

  } catch (error) {
    console.error('PRODUCTIVITY_STATS_ERROR:', error)
    return NextResponse.json({ error: 'Failed to fetch productivity metrics' }, { status: 500 })
  }
}
