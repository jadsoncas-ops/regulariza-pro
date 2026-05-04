import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { PageToolbar, FilterChip, PrimaryAction } from "@/components/shared/PageToolbar";
import { agenda } from "@/data/mock";

const dias = ["14 NOV", "15 NOV", "16 NOV", "17 NOV", "18 NOV"];
const semana = ["QUI", "SEX", "SÁB", "DOM", "SEG"];

const toneByTipo: Record<string, string> = {
  Visita: "border-l-primary",
  Levantamento: "border-l-foreground",
  Protocolo: "border-l-alert",
  Entrega: "border-l-success",
  Reunião: "border-l-muted-foreground",
};

export default function Agenda() {
  return (
    <AppLayout title="Agenda & Tarefas" subtitle="MOD.AGD / 07">
      <PageToolbar
        filters={
          <>
            <FilterChip label="VISÃO" value="SEMANA" active />
            <FilterChip label="RESPONSÁVEL" value="*" />
            <FilterChip label="TIPO" value="TODOS" />
          </>
        }
        action={<PrimaryAction>+ Nova Tarefa</PrimaryAction>}
      />

      <section>
        <SectionHeader title="Semana Operacional" code="AGD.001" />
        <div className="grid grid-cols-5 gap-px bg-surface-dark border border-surface-dark shadow-block min-h-[480px]">
          {dias.map((d, idx) => {
            const tarefas = agenda.filter((t) => t.data === d);
            const isToday = idx === 0;
            return (
              <div key={d} className="bg-surface flex flex-col">
                <div
                  className={[
                    "p-3 border-b border-border flex items-baseline justify-between",
                    isToday ? "bg-primary text-primary-foreground" : "",
                  ].join(" ")}
                >
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">
                      {semana[idx]}
                    </div>
                    <div className="font-display text-lg tabular-nums">{d.split(" ")[0]}</div>
                  </div>
                  <div className="font-mono text-[10px] opacity-70">
                    {String(tarefas.length).padStart(2, "0")}
                  </div>
                </div>
                <div className="p-2 flex flex-col gap-2 flex-1">
                  {tarefas.map((t) => (
                    <article
                      key={t.id}
                      className={`bg-background border border-border border-l-4 ${toneByTipo[t.tipo]} p-3 hover-lift cursor-pointer text-xs`}
                    >
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        {t.hora} · {t.tipo}
                      </div>
                      <div className="font-medium mt-1 leading-tight">{t.titulo}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 truncate">
                        {t.responsavel}
                        {t.processoRef && (
                          <span className="font-mono ml-1">· {t.processoRef}</span>
                        )}
                      </div>
                    </article>
                  ))}
                  {tarefas.length === 0 && (
                    <div className="border border-dashed border-border p-4 text-[10px] font-mono text-muted-foreground text-center uppercase tracking-widest">
                      sem tarefas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}
