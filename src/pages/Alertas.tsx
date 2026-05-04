import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { PageToolbar, FilterChip, GhostAction } from "@/components/shared/PageToolbar";
import { AlertTriangle, Clock, FileWarning, CircleDollarSign } from "lucide-react";

const items = [
  { icon: AlertTriangle, title: "Prazo da Prefeitura — PRC-9105", body: "Vence em 3 dias · exigência técnica em aberto", when: "há 1h", tone: "alert" },
  { icon: CircleDollarSign, title: "Pagamento atrasado — Fábrica Aurora", body: "R$ 14.400 · vencido há 4 dias", when: "há 4h", tone: "alert" },
  { icon: FileWarning, title: "Documento pendente — REQ-8849", body: "Memorial descritivo não anexado", when: "ontem", tone: "warn" },
  { icon: Clock, title: "Processo parado — REG-7721", body: "12 dias sem movimentação no cartório", when: "12 NOV", tone: "warn" },
  { icon: AlertTriangle, title: "Vistoria agendada — Cond. Vale Verde", body: "Amanhã 09:00 · Helena Torres", when: "13 NOV", tone: "neutral" },
  { icon: FileWarning, title: "ART não assinada — PRC-9105", body: "Aguarda assinatura do responsável técnico", when: "10 NOV", tone: "warn" },
];

const tone: Record<string, string> = {
  alert: "border-l-alert",
  warn: "border-l-foreground",
  neutral: "border-l-muted-foreground",
};

export default function Alertas() {
  return (
    <AppLayout title="Central de Alertas" subtitle="MOD.ALR / 09">
      <PageToolbar
        filters={
          <>
            <FilterChip label="SEVERIDADE" value="TODAS" active />
            <FilterChip label="TIPO" value="*" />
            <FilterChip label="LIDOS" value="OCULTAR" />
          </>
        }
        action={<GhostAction>Marcar todos como lidos</GhostAction>}
      />

      <section>
        <SectionHeader title="Alertas do Sistema" code="ALR.001" />
        <div className="flex flex-col gap-2">
          {items.map((a) => {
            const Icon = a.icon;
            return (
              <article
                key={a.title}
                className={`bg-surface border border-border border-l-4 ${tone[a.tone]} p-4 hover-lift cursor-pointer flex items-start gap-4`}
              >
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${a.tone === "alert" ? "text-alert" : "text-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.body}</div>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                  {a.when}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}
