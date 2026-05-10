import { prisma } from './prisma';

export interface PredictiveStats {
  avgTimePerType: Record<string, number>;
  avgTimePerStage: Record<string, number>;
  bottlenecks: Array<{ stage: string; avgDays: number; percentageOfTotal: number }>;
  recommendations: string[];
}

export async function getPredictiveIntelligence(): Promise<PredictiveStats> {
  // 1. Fetch all completed processes to build history
  const history = await prisma.processo.findMany({
    where: { status: 'finalizado' },
    select: {
      tipo_regularizacao: true,
      createdAt: true,
      updatedAt: true,
      logs: {
        where: { acao: { contains: 'Mudança de etapa' } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  const avgTimePerType: Record<string, number> = {};
  const stageDurations: Record<string, number[]> = {};

  history.forEach(p => {
    const totalDays = (p.updatedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Avg per type
    if (!avgTimePerType[p.tipo_regularizacao]) avgTimePerType[p.tipo_regularizacao] = 0;
    avgTimePerType[p.tipo_regularizacao] += totalDays;

    // Avg per stage (calculated from logs)
    let lastTime = p.createdAt.getTime();
    p.logs.forEach(log => {
      const stageName = log.acao.split('para ')[1] || 'Outros';
      const duration = (log.createdAt.getTime() - lastTime) / (1000 * 60 * 60 * 24);
      if (!stageDurations[stageName]) stageDurations[stageName] = [];
      stageDurations[stageName].push(duration);
      lastTime = log.createdAt.getTime();
    });
  });

  // Calculate final averages
  const finalAvgPerStage: Record<string, number> = {};
  let totalStageTime = 0;
  Object.entries(stageDurations).forEach(([stage, times]) => {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    finalAvgPerStage[stage] = Math.round(avg * 10) / 10;
    totalStageTime += avg;
  });

  const bottlenecks = Object.entries(finalAvgPerStage)
    .map(([stage, avgDays]) => ({
      stage,
      avgDays,
      percentageOfTotal: totalStageTime > 0 ? Math.round((avgDays / totalStageTime) * 100) : 0
    }))
    .sort((a, b) => b.avgDays - a.avgDays);

  // 2. Generate Recommendations
  const recommendations: string[] = [];
  const activeProcesses = await prisma.processo.findMany({
    where: { status: { not: 'finalizado' } },
    include: { documentos: true }
  });

  const criticalDelays = activeProcesses.filter(p => {
    const currentDuration = (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const avgForType = (avgTimePerType[p.tipo_regularizacao] || 30) / (history.filter(h => h.tipo_regularizacao === p.tipo_regularizacao).length || 1);
    return currentDuration > avgForType * 1.2; // 20% over average
  });

  if (criticalDelays.length > 0) {
    recommendations.push(`${criticalDelays.length} processos estão acima do tempo médio histórico e requerem atenção.`);
  }

  const missingDocs = activeProcesses.filter(p => p.documentos.some(d => d.status === 'pendente'));
  if (missingDocs.length > 0) {
    recommendations.push(`Existem ${missingDocs.length} processos parados aguardando documentação do cliente.`);
  }

  if (bottlenecks.length > 0 && bottlenecks[0].percentageOfTotal > 40) {
    recommendations.push(`A etapa "${bottlenecks[0].stage}" está consumindo ${bottlenecks[0].percentageOfTotal}% do tempo total dos processos.`);
  }

  return {
    avgTimePerType,
    avgTimePerStage: finalAvgPerStage,
    bottlenecks,
    recommendations
  };
}

export async function calculateProcessRisk(processoId: string) {
  const p = await prisma.processo.findUnique({
    where: { id: processoId },
    include: { logs: true }
  });

  if (!p || p.status === 'finalizado') return 'low';

  const currentDuration = (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  
  // Mock logic for average (ideally would use the same stats as above)
  const threshold = 45; // 45 days default threshold
  
  if (currentDuration > threshold * 1.5) return 'high';
  if (currentDuration > threshold) return 'medium';
  return 'low';
}
