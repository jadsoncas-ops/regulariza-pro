import { SectionHeader } from "./KpiGrid";
import { ArrowRight, AlertCircle } from "lucide-react";

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
        badge: "Desmembramento",
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
        alert: "Laudo Bombeiros Pendente",
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
        action={
          <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 smooth-transition">
            Ver Quadro Completo
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3 bg-muted/20 p-4 rounded-xl border border-border">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center mb-1">
              <span>{col.title}</span>
              <span className="bg-background border border-border px-2 py-0.5 rounded-full text-[10px] font-bold text-foreground">
                {col.count}
              </span>
            </div>
            {col.cards.map((c) => (
              <article
                key={c.ref}
                className={`bg-card border p-4 rounded-lg hover:-translate-y-0.5 hover:shadow-sm smooth-transition cursor-pointer flex flex-col gap-2 ${
                  c.highlight ? "border-red-500/30 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]" : "border-border"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    {c.ref}
                  </span>
                  {c.badge && (
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {c.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight text-foreground">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{c.address}</p>
                </div>
                {c.alert && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-2 py-1.5 rounded-md">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium truncate">{c.alert}</span>
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
