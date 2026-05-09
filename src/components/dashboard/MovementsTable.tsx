import { SectionHeader } from "./KpiGrid";
import { ArrowUpRight } from "lucide-react";

const rows = [
  { proto: "DOC-449", obj: "Galpão Logístico — Alvará de Execução", who: "Marcos B.", stage: "Aprovado na Prefeitura", when: "Há 2h", status: "ok" },
  { proto: "DOC-447", obj: "Cond. Vale Verde Q3 — Habite-se", who: "Helena T.", stage: "Exigência técnica", when: "Há 6h", status: "alert" },
  { proto: "DOC-441", obj: "Esp. Mendonça — Desmembramento", who: "Marcos B.", stage: "Análise documental iniciada", when: "Ontem", status: "neutral" },
  { proto: "DOC-438", obj: "Antônio Ribeiro — Usucapião", who: "Helena T.", stage: "ITBI emitido", when: "12 Nov", status: "ok" },
  { proto: "DOC-432", obj: "Comercial Machado — Unificação", who: "Marcos B.", stage: "Entregue no Cartório / RGI", when: "10 Nov", status: "neutral" },
];

const dotConfig: Record<string, string> = {
  ok: "bg-[hsl(var(--success))]",
  alert: "bg-[hsl(var(--destructive))]",
  neutral: "bg-foreground/40",
};

export function MovementsTable() {
  return (
    <section>
      <SectionHeader
        title="Atividades Recentes"
        eyebrow="05 · Histórico"
        action={
          <button className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground smooth-transition">
            Tudo <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        }
      />
      <div className="bg-card border border-border rounded-[24px] shadow-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-border text-[10px] text-muted-foreground font-mono uppercase tracking-[0.16em] bg-muted/30">
          <div className="col-span-2">ID</div>
          <div className="col-span-5">Processo / Cliente</div>
          <div className="col-span-2">Responsável</div>
          <div className="col-span-2">Etapa</div>
          <div className="col-span-1 text-right">Quando</div>
        </div>
        <div className="flex flex-col">
          {rows.map((r, i) => (
            <div
              key={r.proto}
              className={`grid grid-cols-12 gap-4 px-6 py-4 text-sm items-center hover:bg-muted/30 smooth-transition cursor-pointer ${
                i !== rows.length - 1 ? "border-b border-border/60" : ""
              }`}
            >
              <div className="col-span-2 font-mono text-[11px] text-muted-foreground">{r.proto}</div>
              <div className="col-span-5 font-serif text-[16px] leading-tight text-foreground truncate">{r.obj}</div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-muted grid place-items-center text-[9px] font-bold text-foreground">
                  {r.who.split(" ")[0][0]}
                  {r.who.split(" ")[1]?.[0]}
                </span>
                <span className="text-[12px] text-muted-foreground">{r.who}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${dotConfig[r.status]}`} />
                <span className="truncate">{r.stage}</span>
              </div>
              <div className="col-span-1 text-right text-[11px] font-mono text-muted-foreground">{r.when}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
