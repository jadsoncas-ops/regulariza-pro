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
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // 1. Carregar dados reais do banco
  const totalClientes = await prisma.cliente.count()
  const totalImoveis = await prisma.imovel.count()
  const totalProcessos = await prisma.processo.count()
  const processosFinalizados = await prisma.processo.count({ where: { status: 'finalizado' } })
  
  const financeiros = await prisma.financeiro.findMany()
  const receitaGerada = financeiros.reduce((acc, f) => acc + f.valor_pago, 0)
  const receitaPendente = financeiros.reduce((acc, f) => acc + (f.valor - f.valor_pago), 0)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanhã = new Date(hoje)
  amanhã.setDate(amanhã.getDate() + 1)

  const agendaDoDia = await prisma.evento.findMany({
    where: {
      data_inicio: {
        gte: hoje,
        lt: amanhã
      }
    },
    orderBy: { data_inicio: 'asc' },
    take: 5
  })

  const alertas = await prisma.alerta.findMany({
    where: { lido: false },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  const processosRecentes = await prisma.processo.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: { cliente: true, imovel: true }
  })

  const prazosProximos = await prisma.evento.findMany({
    where: {
      tipo: 'prazo',
      data_inicio: {
        gte: hoje,
      }
    },
    orderBy: { data_inicio: 'asc' },
    take: 5,
    include: { processo: { include: { cliente: true } } }
  })

  const ultimosDocumentos = await prisma.documento.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { processo: true, imovel: true }
  })

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full min-h-screen relative font-mono">
      
      {/* HEADER TOP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-border gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-foreground uppercase">
            Painel Central
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            ERP Regularização Imobiliária // MOD.DASH / 01
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-sm text-xs md:w-64 shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Buscar no ERP..." 
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Link href="/processos/novo" className="hidden md:flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition">
            + Novo Processo
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* WIDGETS GERAIS */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Resumo Operacional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-5 rounded-sm shadow-sm hover:border-blue-500/50 smooth-transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Clientes</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">{totalClientes.toString().padStart(2, '0')}</div>
            </div>

            <div className="bg-card border border-border p-5 rounded-sm shadow-sm hover:border-emerald-500/50 smooth-transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Imóveis Cadastrados</span>
                <Home className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">{totalImoveis.toString().padStart(2, '0')}</div>
            </div>

            <div className="bg-card border border-border p-5 rounded-sm shadow-sm hover:border-purple-500/50 smooth-transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Processos Ativos</span>
                <FileText className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-foreground">{totalProcessos.toString().padStart(2, '0')}</div>
            </div>

            <div className="bg-card border border-border p-5 rounded-sm shadow-sm hover:border-primary/50 smooth-transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Finalizados</span>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{processosFinalizados.toString().padStart(2, '0')}</div>
            </div>
          </div>
        </section>

        {/* WIDGETS FINANCEIROS E ALERTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="lg:col-span-2">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Financeiro
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="bg-card border border-border p-6 rounded-sm shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Receita Gerada (Paga)</span>
                </div>
                <div className="text-3xl font-bold text-emerald-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaGerada)}
                </div>
              </div>
              
              <div className="bg-card border border-border p-6 rounded-sm shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Receita Pendente</span>
                </div>
                <div className="text-3xl font-bold text-amber-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaPendente)}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Alertas
              </h2>
              <Link href="/alertas" className="text-[9px] font-bold uppercase hover:underline text-primary">Ver todos</Link>
            </div>
            <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden h-[120px] overflow-y-auto">
              <div className="divide-y divide-border">
                {alertas.length === 0 ? (
                  <div className="p-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest">Sem alertas novos</div>
                ) : (
                  alertas.map(alerta => (
                    <div key={alerta.id} className="p-3 flex items-start gap-3 hover:bg-muted/30 smooth-transition">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alerta.tipo === 'warning' ? 'text-amber-500' : alerta.tipo === 'error' ? 'text-red-500' : 'text-blue-500'}`} />
                      <div>
                        <div className="text-xs font-bold">{alerta.titulo}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{alerta.mensagem}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

        </div>

        {/* LISTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Processos Recentes
              </h2>
              <Link href="/processos" className="text-[9px] font-bold uppercase hover:underline text-primary">Ver todos</Link>
            </div>
            <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden">
              <div className="divide-y divide-border">
                {processosRecentes.length === 0 ? (
                  <div className="p-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest">Nenhum processo</div>
                ) : (
                  processosRecentes.map(p => (
                    <Link key={p.id} href={`/processos/${p.id}`} className="p-4 flex justify-between items-center hover:bg-muted/30 smooth-transition group">
                      <div>
                        <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{p.tipo_regularizacao.toUpperCase()}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{p.cliente.nome}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 border border-border bg-muted/50 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                          {p.status.replace('_', ' ')}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Agenda do Dia
              </h2>
              <Link href="/agenda" className="text-[9px] font-bold uppercase hover:underline text-primary">Calendário Completo</Link>
            </div>
            <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden">
              <div className="divide-y divide-border">
                {agendaDoDia.length === 0 ? (
                  <div className="p-6 text-center flex flex-col items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-muted-foreground opacity-20" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Livre hoje</span>
                  </div>
                ) : (
                  agendaDoDia.map(evento => (
                    <div key={evento.id} className="p-4 flex items-start gap-4 hover:bg-muted/30 smooth-transition">
                      <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-sm border border-border min-w-[50px]">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">HOJE</span>
                        <span className="text-sm font-bold">{evento.data_inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{evento.titulo}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-background border border-border rounded-sm">{evento.tipo}</span>
                          {evento.local && <span>• {evento.local}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
