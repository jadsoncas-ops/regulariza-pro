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

  // Converter datas para string para o Client Component
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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Financeiro</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestão de honorários, custas e fluxo de caixa</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Ações principais no componente List */}
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <FinanceiroList initialLancamentos={safeLancamentos} processos={processos} />
      </div>
    </div>
  )
}
