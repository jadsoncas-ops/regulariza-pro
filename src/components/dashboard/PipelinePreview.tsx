import { SectionHeader } from "./KpiGrid";
import { ArrowRight, AlertCircle, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface Card {
  ref: string;
  title: string;
  address: string;
  badge?: string;
  alert?: string;
  highlight?: boolean;
  responsavel: string;
  progress: number;
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
      { ref: "REQ-8842", title: "Desmembramento Gleba B", address: "Av. das Américas, 3301", badge: "Desmembramento", responsavel: "HT", progress: 25 },
      { ref: "REQ-8849", title: "Unificação de Lotes", address: "Rua Aurora, 102", badge: "Unificação", responsavel: "MB", progress: 40 },
    ],
  },
  {
    title: "Prefeitura · SMU",
    count: 17,
    cards: [
      { ref: "PRC-9105", title: "Habite-se Residencial", address: "Cond. Vale Verde, Q3", alert: "Laudo Bombeiros pendente", highlight: true, responsavel: "HT", progress: 70 },
      { ref: "PRC-9201", title: "Alvará de Execução", address: "Galpão Logístico Centro", badge: "Alvará", responsavel: "MB", progress: 55 },
    ],
  },
  {
    title: "Cartório · RGI",
    count: 4,
    cards: [
      { ref: "REG-7721", title: "Averbação de Construção", address: "Estrada do Mendanha, Lt 5", badge: "Averbação", responsavel: "HT", progress: 90 },
    ],
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function PipelinePreview() {
  return (
    <section>
      <SectionHeader
        title="Esteira de Tramitação"
        eyebrow="04 · Pipeline"
        action={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 h-8 border border-border rounded-lg text-[12px] font-medium text-muted-foreground hover:bg-muted smooth-transition">
              <Filter className="w-3.5 h-3.5" />
              Filtrar
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold text-foreground hover:bg-muted smooth-transition">
              Quadro completo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col, ci) => (
          <div key={col.title} className="flex flex-col gap-3 bg-card/60 backdrop-blur p-4 rounded-[24px] border border-border">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/70">0{ci + 1}</span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">{col.title}</span>
              </div>
              <span className="bg-foreground text-background px-2 py-0.5 rounded-md text-[10px] font-bold font-mono">
                {col.count}
              </span>
            </div>
            {col.cards.map((c) => (
              <motion.article
                variants={item}
                key={c.ref}
                className={`bg-card border p-4 rounded-2xl smooth-transition cursor-grab active:cursor-grabbing flex flex-col gap-3 hover-lift ${
                  c.highlight ? "border-[hsl(var(--destructive)/0.4)] shadow-[0_0_0_4px_hsl(var(--destructive)/0.06)]" : "border-border shadow-card"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground">{c.ref}</span>
                  {c.badge && (
                    <span className="text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                      {c.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-[18px] leading-tight text-foreground">{c.title}</h3>
                  <p className="text-[12px] text-muted-foreground mt-1 truncate">{c.address}</p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.highlight ? "bg-[hsl(var(--destructive))]" : "bg-foreground"}`}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{c.progress}%</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground">
                      {c.responsavel}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Responsável</span>
                  </div>
                  {c.alert ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[hsl(var(--destructive))]">
                      <AlertCircle className="w-3 h-3" />
                      {c.alert}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground">SLA · ok</span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
