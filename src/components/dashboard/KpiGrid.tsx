import { FolderOpen, CheckCircle2, AlertCircle, Clock, Send, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 26 } },
};

const stats = [
  { label: "Ativos", value: "124", delta: "+6", icon: FolderOpen, tone: "ink" },
  { label: "Concluídos", value: "89", delta: "+12", icon: CheckCircle2, tone: "success" },
  { label: "Atrasados", value: "12", delta: "−3", icon: AlertCircle, tone: "danger" },
  { label: "Em análise", value: "45", delta: "+4", icon: Clock, tone: "warning" },
  { label: "Protocolados", value: "28", delta: "+2", icon: Send, tone: "ink" },
];

const toneMap: Record<string, { dot: string; chip: string }> = {
  ink:      { dot: "bg-foreground",            chip: "text-muted-foreground" },
  success:  { dot: "bg-[hsl(var(--success))]", chip: "text-[hsl(var(--success))]" },
  warning:  { dot: "bg-[hsl(var(--warning))]", chip: "text-[hsl(var(--warning))]" },
  danger:   { dot: "bg-[hsl(var(--destructive))]", chip: "text-[hsl(var(--destructive))]" },
};

export function KpiGrid() {
  return (
    <section>
      <SectionHeader
        title="Pulse Operacional"
        eyebrow="01 · Indicadores"
        action={
          <button className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground smooth-transition">
            Personalizar <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((k) => {
          const Icon = k.icon;
          const tone = toneMap[k.tone];
          return (
            <motion.div
              key={k.label}
              variants={item}
              initial="hidden"
              animate="show"
              className="group relative rounded-2xl border border-border bg-card p-5 shadow-card hover-lift overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{k.label}</span>
                </div>
                <Icon className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-[40px] leading-none text-foreground tracking-tight number">{k.value}</div>
                <span className={`text-[11px] font-mono font-semibold ${tone.chip}`}>{k.delta}</span>
              </div>
              <div className="absolute inset-x-5 bottom-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function SectionHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</span>
        )}
        <h2 className="font-serif text-[28px] leading-none tracking-tight text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}
