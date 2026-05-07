import { 
  FolderOpen, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send,
  DollarSign,
  TrendingUp,
  Wallet,
  Target,
  BarChart
} from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function KpiGrid() {
  const visaoGeral = [
    { label: "Ativos", value: "124", icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Concluídos", value: "89", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Atrasados", value: "12", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
    { label: "Em Análise", value: "45", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Protocolados", value: "28", icon: Send, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  const financeiro = [
    { label: "Receita Mensal", value: "R$ 45.2k", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Receita Prevista", value: "R$ 180k", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Pendentes", value: "R$ 22.5k", icon: Wallet, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Ticket Médio", value: "R$ 8.4k", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Faturamento Anual", value: "R$ 540k", icon: BarChart, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionHeader title="Visão Geral" />
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {visaoGeral.map((k) => (
            <KpiCard key={k.label} data={k} />
          ))}
        </motion.div>
      </section>

      <section>
        <SectionHeader title="Financeiro" />
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {financeiro.map((k) => (
            <KpiCard key={k.label} data={k} />
          ))}
        </motion.div>
      </section>
    </div>
  );
}

function KpiCard({ data }: { data: any }) {
  const Icon = data.icon;
  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden p-5 rounded-2xl border border-border/70 bg-card shadow-card hover-lift cursor-pointer group"
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 smooth-transition" />
      <div className="flex justify-between items-start">
        <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">{data.label}</span>
        <div className={`h-9 w-9 grid place-items-center rounded-xl border ${data.bg} group-hover:scale-110 smooth-transition`}>
          <Icon className={`w-4 h-4 ${data.color}`} />
        </div>
      </div>
      <div className="mt-4 text-[28px] font-bold tracking-tight text-foreground tabular-nums">{data.value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">Atualizado agora</div>
    </motion.div>
  );
}

export function SectionHeader({ title, action, code }: { title: string; action?: React.ReactNode; code?: string }) {
  return (
    <div className="flex justify-between items-center mb-5">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {code && <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{code}</span>}
      </div>
      {action}
    </div>
  );
}
