import { prisma } from '@/lib/prisma'
import { 
  FolderKanban, 
  CheckCircle2, 
  DollarSign, 
  CalendarClock,
  ArrowUpRight,
  TrendingUp,
  Clock,
  PlusCircle,
  Users,
  ChevronRight,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [
    processosAtivos,
    processosFinalizados,
    financeiroMes,
    tarefasPendentesCount,
    processosRecentes,
    tarefasHoje
  ] = await Promise.all([
    prisma.processo.count({ where: { status: { not: 'finalizado' } } }),
    prisma.processo.count({ where: { status: 'finalizado' } }),
    prisma.financeiro.aggregate({
      where: { status: 'pago' },
      _sum: { valor_pago: true }
    }),
    prisma.tarefa.count({ where: { status: 'pendente' } }),
    prisma.processo.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { cliente: { select: { nome: true } } }
    }),
    prisma.tarefa.findMany({
      take: 4,
      where: { status: 'pendente' },
      orderBy: { data_vencimento: 'asc' },
      include: { processo: { select: { tipo_regularizacao: true } } }
    })
  ])

  const kpis = [
    {
      label: "Processos Ativos",
      value: processosAtivos,
      icon: FolderKanban,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "+3 novos",
      trendColor: "text-blue-600"
    },
    {
      label: "Finalizados",
      value: processosFinalizados,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "Total geral",
      trendColor: "text-slate-400"
    },
    {
      label: "Receita do Mês",
      value: `R$ ${(financeiroMes._sum.valor_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50",
      trend: "+15% vs mês ant.",
      trendColor: "text-emerald-600"
    },
    {
      label: "Tarefas de Hoje",
      value: tarefasHoje.length,
      icon: CalendarClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: `${tarefasPendentesCount} pendentes`,
      trendColor: "text-amber-600"
    },
  ]

  const statusLabel: Record<string, { label: string; color: string }> = {
    em_analise: { label: "Análise", color: "badge-blue" },
    documentacao_pendente: { label: "Documentação", color: "badge-amber" },
    exigencia_tecnica: { label: "Exigência", color: "badge-red" },
    aprovado: { label: "Aprovado", color: "badge-green" },
    finalizado: { label: "Finalizado", color: "badge-green" },
    protocolo_prefeitura: { label: "Protocolo", color: "badge-gray" },
    em_aprovacao: { label: "Em aprovação", color: "badge-blue" },
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-12">
      
      {/* GREETING HEADER */}
      <div className="bg-white border-b border-[hsl(var(--border))] px-8 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" /> Visão Geral do Sistema
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bom dia, Jadson!</h1>
            <p className="text-slate-500 mt-1">Aqui está o que está acontecendo no seu hub hoje.</p>
          </div>
          <div className="flex items-center gap-3">
             <Link
              href="/processos/novo"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-slate-200"
            >
              <PlusCircle className="w-4 h-4" />
              Novo Projeto
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-screen-xl mx-auto space-y-8">

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${kpi.bg} ${kpi.color} rounded-xl group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${kpi.trendColor}`}>
                  {kpi.trend}
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* RECENT PROCESSES */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-[hsl(var(--border))] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Processos Recentes</h2>
                    <p className="text-xs text-slate-500">Últimas movimentações</p>
                  </div>
                </div>
                <Link href="/processos" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                  Ver Kanban <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {processosRecentes.length === 0 ? (
                  <div className="px-6 py-16 text-center text-slate-400 italic">
                    Nenhum processo iniciado.
                  </div>
                ) : processosRecentes.map(p => {
                  const status = statusLabel[p.status] || { label: p.status, color: "badge-gray" }
                  return (
                    <Link
                      key={p.id}
                      href={`/processos/${p.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 truncate">{p.tipo_regularizacao}</span>
                          <span className={`badge ${status.color} text-[10px]`}>{status.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{p.cliente.nome}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                        <p className="text-[10px] text-slate-300 font-mono mt-0.5">#{p.id.substring(0,6).toUpperCase()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* TASKS OF THE DAY */}
          <div className="space-y-6">
            <div className="bg-white border border-[hsl(var(--border))] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900">Tarefas de Hoje</h2>
                </div>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {tarefasHoje.length}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {tarefasHoje.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Tudo em dia por aqui!</p>
                  </div>
                ) : tarefasHoje.map(t => (
                  <div key={t.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-amber-200 transition-colors group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded border border-slate-300 w-4 h-4 flex-shrink-0 group-hover:border-amber-500 transition-colors"></div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">{t.titulo}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Pro: {t.processo?.tipo_regularizacao}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/agenda" className="block text-center py-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                  Ver agenda completa
                </Link>
              </div>
            </div>

            {/* QUICK ACTIONS MODERNA */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/20 blur-2xl translate-y-12 translate-x-12"></div>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-400" /> Atalhos Rápidos
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/clientes/novo" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-center">
                  <Users className="w-4 h-4 mx-auto mb-2 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Novo Cliente</span>
                </Link>
                <Link href="/financeiro" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-center">
                  <DollarSign className="w-4 h-4 mx-auto mb-2 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Financeiro</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
