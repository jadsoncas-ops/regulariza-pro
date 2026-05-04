import { SectionHeader } from "./KpiGrid";

interface Card {
  ref: string;
  title: string;
  address: string;
  badge?: string;
  alert?: string;
  highlight?: boolean;
}

interface Column {
  title: string;
  count: number;
  cards: Card[];
}

const columns: Column[] = [
  {
    title: "Análise Documental",
    count: 12,
    cards: [
      {
        ref: "REQ-8842",
        title: "Desmembramento Gleba B",
        address: "Av. das Américas, 3301",
        badge: "Desmembr.",
      },
      {
        ref: "REQ-8849",
        title: "Unificação de Lotes",
        address: "Rua Aurora, 102",
        badge: "Unificação",
      },
    ],
  },
  {
    title: "Prefeitura / SMU",
    count: 17,
    cards: [
      {
        ref: "PRC-9105",
        title: "Habite-se Residencial",
        address: "Cond. Vale Verde, Q3",
        alert: "Exigência: Laudo Bombeiros",
        highlight: true,
      },
      {
        ref: "PRC-9201",
        title: "Alvará de Execução",
        address: "Galpão Logístico Centro",
        badge: "Alvará",
      },
    ],
  },
  {
    title: "Cartório / RGI",
    count: 4,
    cards: [
      {
        ref: "REG-7721",
        title: "Averbação de Construção",
        address: "Estrada do Mendanha, Lt 5",
        badge: "Averbação",
      },
    ],
  },
];

export function PipelinePreview() {
  return (
    <section>
      <SectionHeader
        title="Esteira de Tramitação"
        code="FLW.002"
        action={
          <button className="text-[10px] font-mono font-medium bg-surface border border-border px-2 py-1 hover:border-foreground transition-colors">
            VER QUADRO COMPLETO →
          </button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center font-display">
              <span>{col.title}</span>
              <span className="text-foreground bg-surface border border-border px-1.5 tabular-nums font-mono">
                {String(col.count).padStart(2, "0")}
              </span>
            </div>
            {col.cards.map((c) => (
              <article
                key={c.ref}
                className={[
                  "border bg-surface p-4 hover-lift cursor-pointer",
                  c.highlight ? "border-l-4 border-l-alert border-y-border border-r-border" : "border-border",
                ].join(" ")}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono bg-background text-foreground border border-border px-1">
                    {c.ref}
                  </span>
                  {c.alert ? (
                    <span className="text-[9px] font-bold text-alert uppercase tracking-wider font-display">
                      Exigência
                    </span>
                  ) : (
                    <span className="size-2 bg-primary" />
                  )}
                </div>
                <div className="font-medium text-sm leading-tight">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.address}</div>
                {c.alert && (
                  <div className="mt-3 pt-2 border-t border-border text-[10px]">
                    {c.alert}
                  </div>
                )}
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
