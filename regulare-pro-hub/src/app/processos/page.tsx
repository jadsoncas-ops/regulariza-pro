import { prisma } from '@/lib/prisma'
import ProcessoKanban from '@/components/processos/ProcessoKanban'

export const dynamic = 'force-dynamic'

export default async function ProcessosPage() {
  const processos = await prisma.processo.findMany({
    include: { 
      cliente: { select: { nome: true } },
      imovel: { select: { endereco: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Converter datas para string para passar para o client component
  const safeProcessos = processos.map(p => ({
    ...p,
    data_inicio: p.data_inicio.toISOString(),
    data_previsao: p.data_previsao ? p.data_previsao.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Processos de Regularização <span className="text-muted-foreground font-normal ml-2">// MOD.PRC / 04</span>
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">GESTÃO E ACOMPANHAMENTO DE TRAMITAÇÕES</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm bg-card">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sis. Online
          </div>
        </div>
      </div>

      <ProcessoKanban initialProcessos={safeProcessos} />
    </div>
  )
}
