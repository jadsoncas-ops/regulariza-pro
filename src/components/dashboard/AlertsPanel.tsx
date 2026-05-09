import { SectionHeader } from "./KpiGrid";
import { AlertTriangle, Clock, FileWarning, ArrowRight } from "lucide-react";

const alerts = [
  {
    icon: AlertTriangle,
    title: "Prazo da Prefeitura",
    body: "Processo PRC-9105 vence em 3 dias",
    meta: "Helena Torres",
    tone: "destructive",
    ref: "PRC-9105",
  },
  {
    icon: FileWarning,
    title: "Documento pendente",
    body: "Matrícula atualizada — A. Ribeiro",
    meta: "Cartório RGI",
    tone: "warning",
    ref: "DOC-447",
  },
  {
    icon: Clock,
    title: "Processo parado",
    body: "REG-7721 há 12 dias sem movimento",
    meta: "Marcos Barros",
    tone: "neutral",
    ref: "REG-7721",
  },
];

const toneConfig: Record<string, { bg: string; icon: string; text: string }> = {
  destructive: { bg: "bg-[hsl(var(--destructive)/0.12)]", icon: "text-[hsl(var(--destructive))]", text: "text-[hsl(var(--destructive))]" },
  warning:     { bg: "bg-[hsl(var(--warning)/0.14)]",     icon: "text-[hsl(var(--warning))]",     text: "text-[hsl(var(--warning))]" },
  neutral:     { bg: "bg-muted",                          icon: "text-foreground/70",             text: "text-muted-foreground" },
};

export function AlertsPanel() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Alertas Inteligentes"
        eyebrow="03 · Atenção"
        action={<span className="text-[11px] font-mono text-muted-foreground">{alerts.length} ativos</span>}
      />
      <div className="flex flex-col gap-2.5 bg-card border border-border rounded-[24px] p-3 shadow-card">
        {alerts.map((a) => {
          const Icon = a.icon;
          const c = toneConfig[a.tone];
          return (
            <button
              key={a.title}
              className="group text-left flex items-start gap-3 p-3.5 rounded-xl hover:bg-muted/60 smooth-transition relative"
            >
              <div className={`h-9 w-9 grid place-items-center rounded-xl ${c.bg} shrink-0`}>
                <Icon className={`h-4 w-4 ${c.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13.5px] font-semibold text-foreground">{a.title}</div>
                  <span className="text-[10px] font-mono text-muted-foreground/80">{a.ref}</span>
                </div>
                <div className="text-[12.5px] text-muted-foreground mt-0.5">{a.body}</div>
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground/70 mt-1.5 font-medium">{a.meta}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 smooth-transition shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
