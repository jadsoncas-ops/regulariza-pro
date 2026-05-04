import { SectionHeader } from "./KpiGrid";

const rows = [
  {
    proto: "DOC-449",
    obj: "Galpão Logístico — Alvará de Execução",
    stage: "Prefeitura",
    when: "há 2h",
    status: "ok",
  },
  {
    proto: "DOC-447",
    obj: "Cond. Vale Verde Q3 — Habite-se",
    stage: "Exigência técnica",
    when: "há 6h",
    status: "alert",
  },
  {
    proto: "DOC-441",
    obj: "Esp. Mendonça — Desmembramento",
    stage: "Análise documental",
    when: "ontem",
    status: "neutral",
  },
  {
    proto: "DOC-438",
    obj: "Antônio Ribeiro — Usucapião",
    stage: "ITBI emitido",
    when: "12 NOV",
    status: "ok",
  },
  {
    proto: "DOC-432",
    obj: "Comercial Machado — Unificação",
    stage: "Cartório / RGI",
    when: "10 NOV",
    status: "neutral",
  },
];

const dot: Record<string, string> = {
  ok: "bg-success",
  alert: "bg-alert",
  neutral: "bg-muted-foreground",
};

export function MovementsTable() {
  return (
    <section>
      <SectionHeader title="Log de Movimentações" code="LOG.004" />
      <div className="bg-surface border border-border shadow-block-sm">
        <div className="grid grid-cols-12 gap-4 p-3 border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-surface-mid/40 font-display">
          <div className="col-span-2">Protocolo</div>
          <div className="col-span-5">Objeto / Localização</div>
          <div className="col-span-3">Estágio</div>
          <div className="col-span-2 text-right">Atualização</div>
        </div>
        {rows.map((r) => (
          <div
            key={r.proto}
            className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-b-0 text-sm items-center hover:bg-background transition-colors cursor-pointer"
          >
            <div className="col-span-2 font-mono text-xs">{r.proto}</div>
            <div className="col-span-5 font-medium truncate">{r.obj}</div>
            <div className="col-span-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`size-1.5 rounded-full ${dot[r.status]}`} />
              {r.stage}
            </div>
            <div className="col-span-2 text-right font-mono text-[10px] tabular-nums text-muted-foreground uppercase">
              {r.when}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
