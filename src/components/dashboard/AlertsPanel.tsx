import { SectionHeader } from "./KpiGrid";
import { AlertTriangle, Clock, FileWarning } from "lucide-react";

const alerts = [
  {
    icon: AlertTriangle,
    title: "Prazo da Prefeitura",
    body: "Processo PRC-9105 vence em 3 dias",
    tone: "destructive",
  },
  {
    icon: FileWarning,
    title: "Documento Pendente",
    body: "Matrícula atualizada — Cliente A. Ribeiro",
    tone: "warning",
  },
  {
    icon: Clock,
    title: "Processo Parado",
    body: "REG-7721 há 12 dias sem movimentação",
    tone: "neutral",
  },
];

const toneConfig: Record<string, { bg: string; icon: string; border: string }> = {
  destructive: { bg: "bg-red-500/10", icon: "text-red-500", border: "border-red-500/20" },
  warning: { bg: "bg-orange-500/10", icon: "text-orange-500", border: "border-orange-500/20" },
  neutral: { bg: "bg-blue-500/10", icon: "text-blue-500", border: "border-blue-500/20" },
};

export function AlertsPanel() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Alertas Inteligentes" />
      <div className="flex flex-col gap-3">
        {alerts.map((a) => {
          const Icon = a.icon;
          const config = toneConfig[a.tone];
          return (
            <div
              key={a.title}
              className={`bg-card border ${config.border} p-4 rounded-xl hover:bg-muted/50 smooth-transition cursor-pointer flex items-start gap-4`}
            >
              <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
                <Icon className={`h-4 w-4 ${config.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{a.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{a.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
