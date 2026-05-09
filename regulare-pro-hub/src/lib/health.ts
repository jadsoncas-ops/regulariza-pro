export type HealthStatus = 'on_track' | 'attention' | 'delayed'

export function getProcessHealth(processo: any): { status: HealthStatus, label: string, color: string, daysInactive: number } {
  // If finished, it's always on track or "Concluído"
  if (processo.status === 'finalizado') {
    return { status: 'on_track', label: 'Concluído', color: 'text-emerald-500 bg-emerald-50 border-emerald-200', daysInactive: 0 }
  }

  // Calculate days since last update
  // Ideal is to check the last log or updatedAt
  const lastActivityDate = processo.logs?.length > 0 
    ? new Date(processo.logs[0].createdAt) 
    : new Date(processo.updatedAt || processo.createdAt)
    
  const daysInactive = Math.floor((Date.now() - lastActivityDate.getTime()) / 86400000)

  if (daysInactive > 20) {
    return { status: 'delayed', label: 'Atrasado', color: 'text-red-600 bg-red-50 border-red-200', daysInactive }
  }
  
  if (daysInactive > 10) {
    return { status: 'attention', label: 'Atenção', color: 'text-amber-600 bg-amber-50 border-amber-200', daysInactive }
  }

  return { status: 'on_track', label: 'No Prazo', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', daysInactive }
}
