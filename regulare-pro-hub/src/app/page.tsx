import { prisma } from '@/lib/prisma'
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ListTodo, 
  ArrowUpRight,
  TrendingUp,
  FolderOpen,
  PlusCircle
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // BUSCA DE DADOS SIMPLIFICADA
  const [
    processosAtivos,
    processosFinalizados,
    financeiroMes,
    tarefasHoje
  ] = await Promise.all([
    prisma.processo.count({ where: { status: { not: 'finalizado' } } }),
    prisma.processo.count({ where: { status: 'finalizado' } }),
    prisma.financeiro.aggregate({
      where: { 
        tipo: 'receita',
        status: 'pago' 
      },
      _sum: { valor: true }
    }),
    prisma.tarefa.count({
      where: {
        status: 'pendente'
      }
    })
  ])

  const stats = [
    { name: 'Processos Ativos', value: processosAtivos, icon: FolderOpen, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { name: 'Finalizados', value: processosFinalizados, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { name: 'Receita do Mês', value: `R$ ${(financeiroMes._sum.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { name: 'Tarefas de Hoje', value: tarefasHoje, icon: ListTodo, color: 'text-rose-600', bg: 'bg-rose-500/10' },
  ]

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full font-mono">
      {/* HEADER SIMPLES */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">Visão Geral</h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Status operacional em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/processos/novo" className="bg-foreground text-background px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
            <PlusCircle className="w-3.5 h-3.5" /> Novo Projeto
          </Link>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-sm shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 ${stat.bg} rounded-sm`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-20" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tighter text-foreground">{stat.value}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AÇÕES RÁPIDAS E ATIVIDADE RECENTE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* PROCESSOS RECENTES */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest">Processos em Aberto</span>
            <Link href="/processos" className="text-[9px] font-bold text-primary hover:underline uppercase">Ver Todos</Link>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {/* Espaço para lista de processos simplificada */}
              <p className="text-[10px] text-muted-foreground uppercase text-center py-8 italic">Acesse a aba de Processos para gestão completa via Kanban.</p>
            </div>
          </div>
        </div>

        {/* FINANCEIRO RÁPIDO */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pendente de Recebimento</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="p-4 flex flex-col items-center justify-center py-12">
             <div className="text-4xl font-black tracking-tighter text-foreground mb-2">R$ 0,00</div>
             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Total a receber em contratos ativos</p>
          </div>
        </div>

      </div>
    </div>
  )
}
