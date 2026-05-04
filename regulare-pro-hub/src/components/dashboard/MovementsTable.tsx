"use client";
import { SectionHeader } from "./KpiGrid";

const rows = [
  {
    proto: "DOC-449",
    obj: "Galpão Logístico — Alvará de Execução",
    stage: "Aprovado na Prefeitura",
    when: "Há 2h",
    status: "ok",
  },
  {
    proto: "DOC-447",
    obj: "Cond. Vale Verde Q3 — Habite-se",
    stage: "Exigência técnica",
    when: "Há 6h",
    status: "alert",
  },
  {
    proto: "DOC-441",
    obj: "Esp. Mendonça — Desmembramento",
    stage: "Análise documental iniciada",
    when: "Ontem",
    status: "neutral",
  },
  {
    proto: "DOC-438",
    obj: "Antônio Ribeiro — Usucapião",
    stage: "ITBI emitido",
    when: "12 Nov",
    status: "ok",
  },
  {
    proto: "DOC-432",
    obj: "Comercial Machado — Unificação",
    stage: "Entregue no Cartório / RGI",
    when: "10 Nov",
    status: "neutral",
  },
];

const dotConfig: Record<string, string> = {
  ok: "bg-emerald-500",
  alert: "bg-red-500",
  neutral: "bg-blue-500",
};

export function MovementsTable() {
  return (
    <section>
      <SectionHeader title="Atividades Recentes" />
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs text-muted-foreground font-semibold uppercase tracking-wider bg-muted/20">
          <div className="col-span-2">ID</div>
          <div className="col-span-5">Processo / Cliente</div>
          <div className="col-span-3">Ação Realizada</div>
          <div className="col-span-2 text-right">Tempo</div>
        </div>
        <div className="flex flex-col">
          {rows.map((r) => (
            <div
              key={r.proto}
              className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-0 text-sm items-center hover:bg-muted/30 smooth-transition cursor-pointer"
            >
              <div className="col-span-2 font-medium text-xs bg-muted text-muted-foreground w-fit px-2 py-0.5 rounded">{r.proto}</div>
              <div className="col-span-5 font-medium text-foreground truncate">{r.obj}</div>
              <div className="col-span-3 flex items-center gap-2 text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${dotConfig[r.status]}`} />
                {r.stage}
              </div>
              <div className="col-span-2 text-right text-xs text-muted-foreground">
                {r.when}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
