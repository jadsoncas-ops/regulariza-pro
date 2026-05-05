import { prisma } from '@/lib/prisma'
import { 
  FolderKanban, 
  CheckCircle2, 
  DollarSign, 
  CalendarClock,
  ArrowUpRight,
  TrendingUp,
  Clock,
  PlusCircle
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [
    processosAtivos,
    processosFinalizados,
    financeiroMes,
    tarefasPendentes,
    processosRecentes
  ] = await Promise.all([
    prisma.processo.count({ where: { status: { not: 'finalizado' } } }),
    prisma.processo.count({ where: { status: 'finalizado' } }),
    prisma.financeiro.aggregate({
      where: { tipo: 'receita', status: 'pago' },
      _sum: { valor: true }
    }),
    prisma.tarefa.count({ where: { status: 'pendente' } }),
    prisma.processo.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { cliente: { select: { nome: true } } }
    })
  ])

  const kpis = [
    {
      label: "Processos Ativos",
      value: processosAtivos,
      icon: FolderKanban,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      trend: "+2 esse mês"
    },
    {
      label: "Finalizados",
      value: processosFinalizados,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      trend: "Total geral"
    },
    {
      label: "Receita do Mês",
      value: `R$ ${(financeiroMes._sum.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
      trend: "Recebido / mês"
    },
    {
      label: "Tarefas de Hoje",
      value: tarefasPendentes,
      icon: CalendarClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      trend: "Pendentes"
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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Visão geral do negócio em tempo real</p>
          </div>
          <Link
            href="/processos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Projeto
          </Link>
        </div>
      </div>

      <div className="px-8 py-8 max-w-screen-xl mx-auto space-y-8">

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className={`bg-white border ${kpi.border} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 ${kpi.bg} rounded-lg`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {kpi.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* SECOND ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* RECENT PROCESSES */}
          <div className="xl:col-span-2 bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Processos Recentes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Últimos projetos abertos</p>
              </div>
              <Link href="/processos" className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors">
                Ver todos <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[hsl(var(--border))]">
              {processosRecentes.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FolderKanban className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Nenhum processo encontrado</p>
                  <Link href="/processos/novo" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Criar o primeiro projeto</Link>
                </div>
              ) : processosRecentes.map(p => {
                const status = statusLabel[p.status] || { label: p.status, color: "badge-gray" }
                return (
                  <Link
                    key={p.id}
                    href={`/processos/${p.id}`}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate">{p.tipo_regularizacao}</span>
                        <span className={`badge ${status.color} flex-shrink-0`}>{status.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{p.cliente.nome}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
              <h2 className="text-sm font-semibold text-slate-900">Ações Rápidas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Acesso direto às funções principais</p>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Novo Projeto Completo", href: "/processos/novo", desc: "Cliente + Imóvel + Processo", color: "bg-blue-600 hover:bg-blue-700", text: "text-white" },
                { label: "Cadastrar Cliente", href: "/clientes/novo", desc: "Novo requerente ou parceiro", color: "bg-slate-100 hover:bg-slate-200", text: "text-slate-700" },
                { label: "Financeiro", href: "/financeiro", desc: "Lançamentos e contratos", color: "bg-slate-100 hover:bg-slate-200", text: "text-slate-700" },
                { label: "Agenda", href: "/agenda", desc: "Reuniões e prazos", color: "bg-slate-100 hover:bg-slate-200", text: "text-slate-700" },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className={`flex flex-col px-4 py-3 ${action.color} ${action.text} rounded-lg transition-colors`}
                >
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className={`text-xs mt-0.5 ${i === 0 ? 'text-blue-100' : 'text-slate-500'}`}>{action.desc}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
