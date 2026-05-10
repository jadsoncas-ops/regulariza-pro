import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getPredictiveIntelligence } from '@/lib/predictiveEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'year';

    // 1. REVENUE AGGREGATIONS
    const revenueByMonth = await prisma.financeiro.groupBy({
      by: ['data_pagamento', 'tipo'],
      _sum: { valor_pago: true },
      where: {
        tipo: 'receita',
        status: 'pago',
        data_pagamento: { not: null }
      }
    });

    // 2. PIPELINE STATS (Processes by Stage)
    const pipeline = await prisma.processo.groupBy({
      by: ['etapa_atual'],
      _count: { id: true },
      _sum: { valor_total: true },
      where: {
        status: { not: 'finalizado' }
      }
    });

    // 3. PERFORMANCE (Avg Cycle Time)
    const completedProcesses = await prisma.processo.findMany({
      where: { status: 'finalizado' },
      select: { createdAt: true, updatedAt: true }
    });

    const avgCycleTime = completedProcesses.length 
      ? completedProcesses.reduce((acc, p) => acc + (p.updatedAt.getTime() - p.createdAt.getTime()), 0) / completedProcesses.length / (1000 * 60 * 60 * 24)
      : 0;

    // 4. CLIENT VALUE (Top Clients)
    const topClients = await prisma.cliente.findMany({
      include: {
        _count: { select: { processos: true } },
        financeiro: {
          where: { tipo: 'receita', status: 'pago' },
          select: { valor_pago: true }
        }
      },
      take: 5
    });

    const clientAnalytics = topClients.map(c => ({
      name: c.nome,
      processCount: c._count.processos,
      totalSpent: c.financeiro.reduce((acc, f) => acc + (f.valor_pago || 0), 0)
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    // 5. REVENUE MIX (By Process Type)
    const revenueByType = await prisma.processo.groupBy({
      by: ['tipo_regularizacao'],
      _sum: { valor_total: true },
      _count: { id: true }
    });

    // 6. PREDICTIVE INTELLIGENCE
    const predictions = await getPredictiveIntelligence();

    return NextResponse.json({
      revenueByMonth,
      pipeline: pipeline.map(p => ({
        stage: p.etapa_atual || 'Sem Etapa',
        count: p._count.id,
        value: p._sum.valor_total || 0
      })),
      performance: {
        avgCycleTime: Math.round(avgCycleTime * 10) / 10,
        completedCount: completedProcesses.length
      },
      clientAnalytics,
      revenueByType: revenueByType.map(r => ({
        type: r.tipo_regularizacao,
        total: r._sum.valor_total || 0,
        count: r._count.id
      })),
      predictions
    });

  } catch (error) {
    console.error('BI_STATS_ERROR:', error);
    return NextResponse.json({ error: 'Falha ao processar dados de BI' }, { status: 500 });
  }
}
