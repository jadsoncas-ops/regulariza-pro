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

export function KpiGrid() {
  const visaoGeral = [
    { label: "Ativos", value: "124", icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Concluídos", value: "89", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Atrasados", value: "12", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Em Análise", value: "45", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Protocolados", value: "28", icon: Send, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const financeiro = [
    { label: "Receita Mensal", value: "R$ 45.2k", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Receita Prevista", value: "R$ 180k", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pendentes", value: "R$ 22.5k", icon: Wallet, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Ticket Médio", value: "R$ 8.4k", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Faturamento Anual", value: "R$ 540k", icon: BarChart, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionHeader title="Visão Geral" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {visaoGeral.map((k) => (
            <KpiCard key={k.label} data={k} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Financeiro" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {financeiro.map((k) => (
            <KpiCard key={k.label} data={k} />
          ))}
        </div>
      </section>
    </div>
  );
}

function KpiCard({ data }: { data: any }) {
  const Icon = data.icon;
  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 smooth-transition flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-muted-foreground">{data.label}</span>
        <div className={`p-2 rounded-lg ${data.bg}`}>
          <Icon className={`w-4 h-4 ${data.color}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{data.value}</div>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {action}
    </div>
  );
}
