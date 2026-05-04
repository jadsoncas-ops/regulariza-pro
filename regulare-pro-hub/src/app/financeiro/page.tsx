import { prisma } from '@/lib/prisma'
import FinanceiroList from '@/components/financeiro/FinanceiroList'

export const dynamic = 'force-dynamic'

export default async function FinanceiroPage() {
  const lancamentos = await prisma.financeiro.findMany({
    include: { 
      processo: { select: { id: true, tipo_regularizacao: true } },
      cliente: { select: { id: true, nome: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Converter datas para string
  const safeLancamentos = lancamentos.map(l => ({
    ...l,
    data_vencimento: l.data_vencimento ? l.data_vencimento.toISOString() : null,
    data_pagamento: l.data_pagamento ? l.data_pagamento.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }))

  const processos = await prisma.processo.findMany({
    select: { 
      id: true, 
      tipo_regularizacao: true,
      cliente: { select: { id: true, nome: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Gestão Financeira <span className="text-muted-foreground font-normal ml-2">// MOD.FIN / 06</span>
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">CONTROLE DE HONORÁRIOS E CUSTAS</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm bg-card">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sis. Online
          </div>
        </div>
      </div>

      <FinanceiroList initialLancamentos={safeLancamentos} processos={processos} />
    </div>
  )
}
