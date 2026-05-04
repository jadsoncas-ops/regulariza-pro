import { prisma } from '@/lib/prisma'
import { Search, Plus, UserCircle2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // 1. Carregar dados reais do banco
  const totalProcessos = await prisma.processo.count()
  
  const processosAtivos = await prisma.processo.count({ where: { status: { notIn: ['finalizado'] } } })
  const alvarasMes = await prisma.processo.count({ where: { status: 'aprovado' } })
  const retidosOrgaos = await prisma.processo.count({ where: { status: { in: ['em análise', 'protocolado', 'exigência'] } } })
  
  const financeiros = await prisma.financeiro.findMany()
  const receitaPrevista = financeiros.reduce((acc, f) => acc + f.honorarios, 0)
  const receitaFaturada = financeiros.reduce((acc, f) => acc + f.valor_pago, 0)

  // 2. Trazer processos para a esteira (Kanban style)
  const pipeline = await prisma.processo.findMany({
    take: 6,
    orderBy: { updatedAt: 'desc' },
    include: { cliente: true }
  })

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full min-h-screen relative font-mono">
      
      {/* HEADER TOP - ENGARQ STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Painel Central — Regularização Imobiliária <span className="text-muted-foreground font-normal ml-2">// EMP.GRID-881 / NOV-2026</span>
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

      <div className="space-y-10">
        
        {/* INDICADORES OPERACIONAIS */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Indicadores Operacionais <span className="opacity-50">OPR.001</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-card shadow-sm rounded-sm overflow-hidden">
            <div className="p-6 border-r border-border flex flex-col justify-between">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Em Andamento</div>
              <div>
                <div className="text-4xl font-bold text-foreground">{processosAtivos < 10 ? `0${processosAtivos}` : processosAtivos}</div>
                <div className="text-[10px] text-muted-foreground mt-1">+3 esta semana</div>
              </div>
            </div>
            <div className="p-6 border-r border-border flex flex-col justify-between">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Alvarás (Mês)</div>
              <div>
                <div className="text-4xl font-bold text-foreground">{alvarasMes < 10 ? `0${alvarasMes}` : alvarasMes}</div>
                <div className="text-[10px] text-muted-foreground mt-1">5 deferidos</div>
              </div>
            </div>
            <div className="p-6 border-r border-border flex flex-col justify-between">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Receita Prevista</div>
              <div>
                <div className="text-4xl font-bold text-foreground">
                  {receitaPrevista >= 1000 ? `R$ ${(receitaPrevista/1000).toFixed(0)}k` : `R$ ${receitaPrevista}`}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Meta: 92%</div>
              </div>
            </div>
            <div className="p-6 bg-blue-600 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-90">Retidos Órgãos</div>
              <div>
                <div className="text-4xl font-bold">{retidosOrgaos < 10 ? `0${retidosOrgaos}` : retidosOrgaos}</div>
                <div className="text-[10px] mt-1 opacity-90">Prefeitura - Cartório</div>
              </div>
            </div>
          </div>
        </section>

        {/* ESTEIRA DE TRAMITAÇÃO */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Esteira de Tramitação <span className="opacity-50">FLW.002</span>
            </h2>
            <Link href="/processos" className="text-[10px] font-bold uppercase tracking-widest text-foreground hover:underline border border-border px-2 py-1 bg-card rounded-sm">
              Ver Quadro Completo →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border bg-card shadow-sm rounded-sm">
            {/* Coluna 1 */}
            <div className="border-r border-border min-h-[300px]">
              <div className="p-3 border-b border-border bg-muted/30 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Análise Documental</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-background border border-border rounded-sm">12</span>
              </div>
              <div className="p-4 space-y-4 bg-muted/10">
                {pipeline.slice(0,2).map(p => (
                  <div key={p.id} className="bg-card border border-border p-4 shadow-sm rounded-sm relative group cursor-pointer hover:border-blue-600 smooth-transition">
                    <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-600"></div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border border-border w-fit px-1.5 py-0.5 rounded-sm bg-muted/30">{p.id.slice(-6)}</div>
                    <div className="font-bold text-sm text-foreground mb-1">{p.tipo_regularizacao}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.endereco}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Coluna 2 */}
            <div className="border-r border-border min-h-[300px]">
              <div className="p-3 border-b border-border bg-muted/30 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prefeitura / SMU</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-background border border-border rounded-sm">17</span>
              </div>
              <div className="p-4 space-y-4 bg-muted/10">
                <div className="bg-card border border-rose-500 p-4 shadow-[0_0_10px_rgba(244,63,94,0.1)] rounded-sm relative group cursor-pointer smooth-transition">
                  <div className="absolute top-4 right-4 text-[10px] font-bold text-rose-500 uppercase">Exigência</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border border-border w-fit px-1.5 py-0.5 rounded-sm bg-muted/30">PRC-9105</div>
                  <div className="font-bold text-sm text-foreground mb-1">Habite-se Residencial</div>
                  <div className="text-xs text-muted-foreground truncate mb-3">Cond. Vale Verde, Q3</div>
                  <div className="text-xs text-rose-500 flex items-center gap-1 border-t border-border pt-2">
                    <span className="w-1 h-4 bg-rose-500 inline-block mr-1"></span>
                    Exigência: Laudo Bombeiros
                  </div>
                </div>

                <div className="bg-card border border-border p-4 shadow-sm rounded-sm relative group cursor-pointer hover:border-blue-600 smooth-transition">
                  <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-600"></div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border border-border w-fit px-1.5 py-0.5 rounded-sm bg-muted/30">PRC-9201</div>
                  <div className="font-bold text-sm text-foreground mb-1">Alvará de Execução</div>
                  <div className="text-xs text-muted-foreground truncate">Galpão Logístico Centro</div>
                </div>
              </div>
            </div>

            {/* Coluna 3 */}
            <div className="min-h-[300px]">
              <div className="p-3 border-b border-border bg-muted/30 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cartório / RGI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-background border border-border rounded-sm">04</span>
              </div>
              <div className="p-4 space-y-4 bg-muted/10">
                <div className="bg-card border border-border p-4 shadow-sm rounded-sm relative group cursor-pointer hover:border-blue-600 smooth-transition">
                  <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-600"></div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 border border-border w-fit px-1.5 py-0.5 rounded-sm bg-muted/30">REG-7721</div>
                  <div className="font-bold text-sm text-foreground mb-1">Averbação de Construção</div>
                  <div className="text-xs text-muted-foreground truncate">Estrada do Mendanha, Lt 5</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Receita Faturada <span className="opacity-50">FIN.003</span>
            </h2>
            <div className="border border-border bg-card shadow-sm rounded-sm p-6 flex flex-col h-64">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {receitaFaturada >= 1000 ? `R$ ${(receitaFaturada/1000).toFixed(0)}k` : `R$ ${receitaFaturada}`}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                    Semestre <span className="text-emerald-500 font-bold ml-1">+24% vs ANT.</span>
                  </div>
                </div>
                <div className="flex bg-muted/30 border border-border rounded-sm overflow-hidden text-[10px] font-bold">
                  <div className="px-2 py-1 border-r border-border">6M</div>
                  <div className="px-2 py-1 bg-foreground text-background">1A</div>
                </div>
              </div>
              
              <div className="flex-1 flex items-end gap-2 mt-auto">
                {/* Fake chart bars */}
                <div className="w-full flex justify-between items-end h-full pt-4">
                  <div className="w-[12%] bg-muted/50 h-[30%] hover:bg-blue-600 smooth-transition cursor-pointer relative group"><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground">JUN</span></div>
                  <div className="w-[12%] bg-muted/50 h-[45%] hover:bg-blue-600 smooth-transition cursor-pointer relative group"><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground">JUL</span></div>
                  <div className="w-[12%] bg-muted/50 h-[35%] hover:bg-blue-600 smooth-transition cursor-pointer relative group"><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground">AGO</span></div>
                  <div className="w-[12%] bg-muted/50 h-[60%] hover:bg-blue-600 smooth-transition cursor-pointer relative group"><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground">SET</span></div>
                  <div className="w-[12%] bg-blue-600 h-[85%] shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer relative group"><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-foreground font-bold">OUT</span></div>
                  <div className="w-[12%] bg-blue-900 dark:bg-blue-300 h-[50%] hover:bg-blue-600 smooth-transition cursor-pointer relative group"><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground">NOV</span></div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Alertas Ativos <span className="opacity-50">ALR.005</span>
            </h2>
            <div className="flex flex-col gap-3">
              <div className="border border-rose-500/50 bg-rose-500/5 p-4 rounded-sm flex items-start gap-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                <div className="text-rose-500 mt-0.5">⚠️</div>
                <div>
                  <div className="font-bold text-sm text-foreground">Prazo da Prefeitura</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Processo PRC-9105 vence em 3 dias</div>
                </div>
              </div>
              
              <div className="border border-border bg-card shadow-sm p-4 rounded-sm flex items-start gap-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground"></div>
                <div className="text-foreground mt-0.5">📄</div>
                <div>
                  <div className="font-bold text-sm text-foreground">Documento pendente</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Matrícula atualizada — Cliente A. Ribeiro</div>
                </div>
              </div>

              <div className="border border-border bg-card shadow-sm p-4 rounded-sm flex items-start gap-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted-foreground"></div>
                <div className="text-muted-foreground mt-0.5">🕒</div>
                <div>
                  <div className="font-bold text-sm text-foreground">Processo parado</div>
                  <div className="text-xs text-muted-foreground mt-0.5">REG-7721 há 12 dias sem movimentação</div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
