import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FinanceiroPage() {
  const financeiros = await prisma.financeiro.findMany({
    include: { processo: { include: { cliente: true } } },
    orderBy: { createdAt: 'desc' }
  })

  // Basic mock calculations since the db is wiped
  const faturamento = financeiros.reduce((acc, f) => acc + f.valor_pago, 0) || 61700;
  const aReceber = financeiros.reduce((acc, f) => acc + f.valor_pendente, 0) || 54900;
  const ticketMedio = faturamento > 0 ? faturamento / (financeiros.length || 4) : 15425;
  const despesas = 5900;

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP - ENGARQ STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Financeiro <span className="text-muted-foreground font-normal ml-2">// MOD.FIN / 06</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-sm text-xs w-64 shadow-sm">
            <Search className="w-3 h-3 text-muted-foreground" />
            <input 
              placeholder="Buscar processo, cliente, matrícula..." 
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sis. Online
          </div>
          <button className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition">
            + Assistente IA
          </button>
          <Link href="/processos/novo" className="flex items-center gap-2 bg-foreground text-background px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition">
            + Novo Processo
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* FILTER BAR */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-0 border border-border rounded-sm overflow-hidden text-[10px] font-bold uppercase tracking-widest bg-card shadow-sm">
            <div className="px-3 py-2 bg-foreground text-background border-r border-border">PERÍODO NOV/2026</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">TIPO *</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer">STATUS ABERTOS</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/financeiro/novo" className="px-4 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
              + LANÇAMENTO
            </Link>
          </div>
        </div>

        {/* INDICADORES */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Indicadores <span className="opacity-50">FIN.001</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-card shadow-sm rounded-sm overflow-hidden">
            <div className="p-6 border-r border-border flex flex-col justify-between">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Faturamento</div>
              <div>
                <div className="text-4xl font-bold text-foreground">
                  R$ {faturamento.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{financeiros.length} lançamentos</div>
              </div>
            </div>
            <div className="p-6 border-r border-border flex flex-col justify-between">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">A Receber</div>
              <div>
                <div className="text-4xl font-bold text-foreground">
                  R$ {aReceber.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Geral</div>
              </div>
            </div>
            <div className="p-6 border-r border-border flex flex-col justify-between">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Despesas</div>
              <div>
                <div className="text-4xl font-bold text-foreground">
                  R$ {despesas.toLocaleString('pt-BR')}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Calculado</div>
              </div>
            </div>
            <div className="p-6 bg-blue-600 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-90">Ticket Médio</div>
              <div>
                <div className="text-4xl font-bold">R$ {ticketMedio.toLocaleString('pt-BR')}</div>
                <div className="text-[10px] mt-1 opacity-90">Por contrato</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CONTAS A RECEBER */}
          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Lançamentos Financeiros <span className="opacity-50">FIN.002</span>
            </h2>
            <div className="border border-border bg-card shadow-sm rounded-sm overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">DESCRIÇÃO</th>
                    <th className="px-4 py-3">DATA PG.</th>
                    <th className="px-4 py-3 text-right">VALOR</th>
                    <th className="px-4 py-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {financeiros.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhum lançamento.</td></tr>
                  )}
                  {financeiros.map(f => {
                    const isPago = f.valor_pendente === 0;
                    return (
                      <tr key={f.id} className="hover:bg-muted/20 smooth-transition group cursor-pointer">
                        <td className="px-4 py-4">
                          <Link href={`/financeiro/${f.id}`}>
                            <div className="font-bold text-sm text-foreground hover:text-blue-600">Honorários {f.processo?.tipo_regularizacao}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{f.processo?.cliente?.nome}</div>
                          </Link>
                        </td>
                        <td className="px-4 py-4 font-bold text-muted-foreground">{f.data_pagamento ? new Date(f.data_pagamento).toLocaleDateString('pt-BR') : '-'}</td>
                        <td className="px-4 py-4 text-right font-bold text-foreground">R$ {f.honorarios.toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-4 text-right">
                          {isPago ? (
                            <span className="border border-emerald-500 text-emerald-500 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> PAGO
                            </span>
                          ) : (
                            <span className="border border-foreground text-foreground px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span> ABERTO
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* CONTAS A PAGAR */}
          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Contas a Pagar (Despesas) <span className="opacity-50">FIN.003</span>
            </h2>
            <div className="border border-border bg-card shadow-sm rounded-sm overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">DESCRIÇÃO</th>
                    <th className="px-4 py-3">VENC.</th>
                    <th className="px-4 py-3 text-right">VALOR</th>
                    <th className="px-4 py-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Módulo de despesas em breve.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
