import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { PageToolbar, FilterChip, PrimaryAction, GhostAction } from "@/components/shared/PageToolbar";
import { processos, stages, imoveis, clientes } from "@/data/mock";

export default function Processos() {
  return (
    <AppLayout title="Processos de Regularização" subtitle="MOD.PRC / 04">
      <PageToolbar
        filters={
          <>
            <FilterChip label="VISÃO" value="KANBAN" active />
            <FilterChip label="RESPONSÁVEL" value="*" />
            <FilterChip label="TIPO" value="TODOS" />
            <FilterChip label="PRAZO" value="< 30 DIAS" />
          </>
        }
        action={
          <>
            <GhostAction>Lista</GhostAction>
            <GhostAction>Timeline</GhostAction>
            <PrimaryAction>+ Novo Processo</PrimaryAction>
          </>
        }
      />

      <section>
        <SectionHeader title="Esteira de Tramitação" code="PRC.001" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stages.map((stage) => {
            const items = processos.filter((p) => p.stage === stage);
            return (
              <div key={stage} className="flex flex-col gap-3 min-w-0">
                <div className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between border-b border-border pb-2">
                  <span className="truncate">{stage}</span>
                  <span className="font-mono tabular-nums bg-surface border border-border px-1.5 text-foreground">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.length === 0 && (
                    <div className="border border-dashed border-border p-4 text-[10px] font-mono text-muted-foreground text-center uppercase tracking-widest">
                      vazio
                    </div>
                  )}
                  {items.map((p) => {
                    const imv = imoveis.find((i) => i.id === p.imovelId);
                    const cli = clientes.find((c) => c.id === imv?.clienteId);
                    return (
                      <article
                        key={p.id}
                        className={[
                          "bg-surface border p-3 hover-lift cursor-pointer text-xs",
                          p.highlight ? "border-l-4 border-l-alert border-y-border border-r-border" : "border-border",
                        ].join(" ")}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-[9px] bg-background border border-border px-1 text-foreground">
                            {p.ref}
                          </span>
                          {p.highlight ? (
                            <span className="text-[8px] font-bold text-alert uppercase tracking-wider font-display">
                              Exigência
                            </span>
                          ) : (
                            <span className="size-1.5 bg-primary mt-1" />
                          )}
                        </div>
                        <div className="font-medium text-sm leading-tight">{p.tipo}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {cli?.nome}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {imv?.endereco}
                        </div>
                        <div className="mt-3 pt-2 border-t border-border flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          <span>PRAZO {p.prazo}</span>
                          <span className="size-4 bg-surface-dark text-foreground flex items-center justify-center text-[8px]">
                            {p.responsavel
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}
