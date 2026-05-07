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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function PipelinePreview() {
  return (
    <section>
      <SectionHeader
        title="Esteira de Tramitação"
        action={
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted smooth-transition">
              <Filter className="w-3.5 h-3.5" />
              Filtrar
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 smooth-transition">
              Ver Quadro Completo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-4 bg-muted/30 p-5 rounded-2xl border border-border">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center mb-1">
              <span>{col.title}</span>
              <span className="bg-background border border-border px-2 py-0.5 rounded-full text-[10px] font-bold text-foreground shadow-sm">
                {col.count}
              </span>
            </div>
            {col.cards.map((c) => (
              <motion.article
                variants={item}
                key={c.ref}
                className={`bg-card border p-4 rounded-xl hover:-translate-y-1 hover:shadow-md smooth-transition cursor-grab active:cursor-grabbing flex flex-col gap-3 ${
                  c.highlight ? "border-red-500/30 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]" : "border-border shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                    {c.ref}
                  </span>
                  {c.badge && (
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                      {c.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight text-foreground">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 truncate">{c.address}</p>
                </div>
                {c.alert && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium truncate">{c.alert}</span>
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
