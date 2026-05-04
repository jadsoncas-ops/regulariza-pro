import { SectionHeader } from "./KpiGrid";
import { AlertTriangle, Clock, FileWarning } from "lucide-react";

const alerts = [
  {
    icon: AlertTriangle,
    title: "Prazo da Prefeitura",
    body: "PRC-9105 vence em 3 dias",
    tone: "alert",
  },
  {
    icon: FileWarning,
    title: "Documento pendente",
    body: "Matrícula atualizada — Cliente A. Ribeiro",
    tone: "warn",
  },
  {
    icon: Clock,
    title: "Processo parado",
    body: "REG-7721 há 12 dias sem movimentação",
    tone: "neutral",
  },
];

const tone: Record<string, string> = {
  alert: "border-l-alert text-alert",
  warn: "border-l-foreground text-foreground",
  neutral: "border-l-muted-foreground text-muted-foreground",
};

export function AlertsPanel() {
  return (
    <div>
      <SectionHeader title="Alertas Ativos" code="ALR.005" />
      <div className="flex flex-col gap-2">
        {alerts.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.title}
              className={`bg-surface border border-border border-l-4 ${tone[a.tone]} p-4 hover-lift cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.body}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
