import { prisma } from '@/lib/prisma'
import { 
  Search, 
  Users, 
  Home, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronRight,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Carregar dados reais do banco
  const [totalClientes, totalImoveis, totalProcessos, processosFinalizados] = await Promise.all([
    prisma.cliente.count(),
    prisma.imovel.count(),
    prisma.processo.count(),
    prisma.processo.count({ where: { status: 'finalizado' } })
  ])
  
  const financeiros = await prisma.financeiro.findMany()
  const faturamentoTotal = financeiros.filter(f => f.tipo === 'receita').reduce((acc, f) => acc + f.valor, 0)
  const receitaPaga = financeiros.filter(f => f.tipo === 'receita').reduce((acc, f) => acc + f.valor_pago, 0)
  const receitaPendente = faturamentoTotal - receitaPaga

  const despesaTotal = financeiros.filter(f => f.tipo === 'despesa').reduce((acc, f) => acc + f.valor, 0)
  const despesaPaga = financeiros.filter(f => f.tipo === 'despesa').reduce((acc, f) => acc + f.valor_pago, 0)
  const despesaPendente = despesaTotal - despesaPaga
  
  const lucroEsperado = faturamentoTotal - despesaTotal
  const lucroCaixa = receitaPaga - despesaPaga

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const agendaDoDia = await prisma.evento.findMany({
    where: { data_inicio: { gte: hoje, lt: amanha } },
    orderBy: { data_inicio: 'asc' },
    take: 5
  })

  const alertas = await prisma.alerta.findMany({
    where: { lido: false },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  const processosRecentes = await prisma.processo.findMany({
    take: 6,
    orderBy: { updatedAt: 'desc' },
    include: { cliente: true, imovel: true }
  })

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER TOP - REDESIGN */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end pb-8 border-b border-border/50 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-[0.3em] uppercase mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            Sistema Operacional Ativo
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            Painel <span className="text-primary">Central</span>
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
            Módulo de Gestão Executiva // REGULARIZA PRO HUB v2.0
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex-1 lg:w-80 flex items-center gap-3 px-4 py-3 bg-card/50 backdrop-blur-sm border border-border rounded-sm text-xs shadow-sm group focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="PESQUISAR CLIENTE, IMÓVEL OU PROCESSO..." 
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground/50 font-bold text-[10px] uppercase tracking-wider"
            />
          </div>
          <Link href="/processos/novo" className="px-6 py-3 bg-foreground text-background rounded-sm text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> NOVO PROCESSO
          </Link>
        </div>
      </div>

      {/* STATS GRID - PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Clientes Ativos', value: totalClientes, icon: Users, color: 'blue', desc: 'Base consolidada' },
          { label: 'Patrimônio Mapeado', value: totalImoveis, icon: Home, color: 'emerald', desc: 'Imóveis e Lotes' },
          { label: 'Fluxo de Processos', value: totalProcessos, icon: Layers, color: 'amber', desc: 'Em andamento' },
          { label: 'Entregas Realizadas', value: processosFinalizados, icon: CheckCircle2, color: 'primary', desc: 'Concluídos com sucesso' }
        ].map((stat, i) => (
          <div key={i} className="group relative bg-card border border-border p-6 rounded-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-16 h-16 bg-${stat.color}-500/5 rounded-bl-full -z-10 transition-colors group-hover:bg-${stat.color}-500/10`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-${stat.color}-500/10 rounded-sm text-${stat.color}-500`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-tighter">ID: 0{i+1}</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-black text-foreground tracking-tighter">
                {stat.value.toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] font-bold text-foreground uppercase tracking-widest">{stat.label}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FINANCEIRO E LISTAS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* COLUNA FINANCEIRA (ESQUERDA) */}
        <div className="xl:col-span-8 space-y-8">
          <section className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-sm">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">Balanço Financeiro Consolidado</h2>
                  <p className="text-[9px] text-muted-foreground uppercase">Monitoramento de Receita e Fluxo de Caixa</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" /> {((lucroCaixa / (faturamentoTotal || 1)) * 100).toFixed(1)}% Eficiência
                </div>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total de Contratos</span>
                  <div className="text-2xl font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoTotal)}</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Receita Realizada</span>
                    <span className="text-xs font-black text-emerald-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaPaga)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(receitaPaga / (faturamentoTotal || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Custos e Repasses</span>
                  <div className="text-2xl font-black text-red-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesaTotal)}</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Despesa Paga</span>
                    <span className="text-xs font-black text-red-500/70">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesaPaga)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${(despesaPaga / (despesaTotal || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-foreground text-background p-6 rounded-sm flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Saldo Líquido em Caixa</span>
                  <div className="text-3xl font-black tracking-tighter mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroCaixa)}</div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-background/20">
                  <span className="text-[9px] font-bold uppercase opacity-60 italic">Disponibilidade Imediata</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
              </div>
            </div>
          </section>

          {/* PROCESSOS RECENTES - REDESIGN */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">Atividades Recentes</h2>
              </div>
              <Link href="/processos" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                Visualizar Todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processosRecentes.map(p => (
                <Link key={p.id} href={`/processos/${p.id}`} className="group bg-card border border-border p-4 rounded-sm hover:border-primary/40 hover:bg-muted/30 transition-all flex justify-between items-center shadow-sm">
                  <div className="space-y-1">
                    <div className="font-black text-xs uppercase tracking-tight group-hover:text-primary transition-colors">{p.tipo_regularizacao.toUpperCase()}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">{p.cliente.nome.toUpperCase()}</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className="text-[9px] text-muted-foreground font-mono">{p.imovel?.cidade?.toUpperCase() || 'LOCAL NÃO INFORMADO'}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-tighter border ${
                    p.status === 'concluido' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                    p.status === 'em_andamento' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                    'bg-muted border-border text-muted-foreground'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* COLUNA LATERAL (DIREITA) */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* ALERTAS - REDESIGN */}
          <section className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-red-500/5 flex justify-between items-center">
              <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Alertas Críticos
              </h2>
              <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{alertas.length}</span>
            </div>
            <div className="divide-y divide-border">
              {alertas.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Nenhum alerta pendente</span>
                </div>
              ) : (
                alertas.map(alerta => (
                  <div key={alerta.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black uppercase tracking-tight">{alerta.titulo.toUpperCase()}</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase leading-relaxed line-clamp-2">{alerta.mensagem}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* AGENDA - REDESIGN */}
          <section className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-blue-500/5 flex justify-between items-center">
              <h2 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-500" /> Agenda de Hoje
              </h2>
            </div>
            <div className="divide-y divide-border">
              {agendaDoDia.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <Clock className="w-8 h-8 text-blue-500/20" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Sem compromissos hoje</span>
                </div>
              ) : (
                agendaDoDia.map(evento => (
                  <div key={evento.id} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors group">
                    <div className="text-center min-w-[50px]">
                      <div className="text-xs font-black text-primary">{evento.data_inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[8px] font-black text-muted-foreground uppercase">H:MM</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">{evento.titulo.toUpperCase()}</div>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase italic">
                        <span>{evento.tipo}</span>
                        {evento.local && <span>• {evento.local.toUpperCase()}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/agenda" className="block w-full p-3 bg-muted/50 text-center text-[9px] font-black uppercase tracking-[0.2em] hover:bg-muted transition-colors border-t border-border">
              Acessar Calendário Completo
            </Link>
          </section>

        </div>

      </div>

    </div>
  )
}

