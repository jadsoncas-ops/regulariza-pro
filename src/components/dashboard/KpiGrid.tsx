interface Kpi {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

const kpis: Kpi[] = [
  { label: "Em Andamento", value: "42", hint: "+3 esta semana" },
  { label: "Alvarás (Mês)", value: "08", hint: "5 deferidos" },
  { label: "Receita Prevista", value: "R$ 184k", hint: "Meta: 92%" },
  { label: "Retidos Órgãos", value: "17", hint: "Prefeitura · Cartório", accent: true },
];

export function KpiGrid() {
  return (
    <section>
      <SectionHeader title="Indicadores Operacionais" code="OPR.001" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-dark border border-surface-dark shadow-block">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={[
              "p-5 flex flex-col justify-between h-32 transition-colors cursor-crosshair",
              k.accent
                ? "bg-primary text-primary-foreground shadow-[inset_0_0_30px_rgba(0,0,0,0.2)]"
                : "bg-surface hover:bg-background",
            ].join(" ")}
          >
            <div
              className={[
                "text-[11px] uppercase tracking-widest font-semibold flex justify-between font-display",
                k.accent ? "text-primary-foreground/80" : "text-muted-foreground",
              ].join(" ")}
            >
              <span>{k.label}</span>
              {k.accent && <span className="size-2 bg-primary-foreground rounded-full" />}
            </div>
            <div>
              <div className="text-4xl tracking-tighter tabular-nums font-display">{k.value}</div>
              {k.hint && (
                <div
                  className={[
                    "text-[10px] mt-1 font-mono",
                    k.accent ? "text-primary-foreground/70" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {k.hint}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionHeader({ title, code, action }: { title: string; code: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-end mb-4 border-b border-border pb-2">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest font-display">{title}</h2>
        <span className="text-[10px] font-mono text-muted-foreground">{code}</span>
      </div>
      {action}
    </div>
  );
}
