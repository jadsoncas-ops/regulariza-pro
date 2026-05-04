import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { PageToolbar, FilterChip, PrimaryAction, GhostAction, StatusBadge } from "@/components/shared/PageToolbar";
import { clientes } from "@/data/mock";

const pipelineStages: Array<{ key: string; label: string; tone: any }> = [
  { key: "Lead", label: "Lead", tone: "neutral" },
  { key: "Contato", label: "Contato", tone: "neutral" },
  { key: "Proposta", label: "Proposta", tone: "warn" },
  { key: "Contrato", label: "Contrato", tone: "primary" },
  { key: "Execução", label: "Execução", tone: "primary" },
  { key: "Finalizado", label: "Finalizado", tone: "ok" },
];

export default function Clientes() {
  const counts = pipelineStages.map((s) => ({
    ...s,
    count: clientes.filter((c) => c.pipeline === s.key).length,
  }));

  return (
    <AppLayout title="Clientes — CRM" subtitle="MOD.CLI / 02">
      <PageToolbar
        filters={
          <>
            <FilterChip label="TIPO" value="TODOS" active />
            <FilterChip label="PIPELINE" value="*" />
            <FilterChip label="CIDADE" value="SP+1" />
          </>
        }
        action={
          <>
            <GhostAction>Importar CSV</GhostAction>
            <PrimaryAction>+ Novo Cliente</PrimaryAction>
          </>
        }
      />

      <section>
        <SectionHeader title="Pipeline Comercial" code="CRM.001" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-surface-dark border border-surface-dark shadow-block">
          {counts.map((s) => (
            <div key={s.key} className="bg-surface p-4 hover:bg-background transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <div className="text-3xl font-display tracking-tighter tabular-nums mt-2">
                {String(s.count).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Carteira de Clientes" code="CRM.002" />
        <div className="bg-surface border border-border shadow-block-sm">
          <div className="grid grid-cols-12 gap-4 p-3 border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-widest font-display bg-surface-mid/40">
            <div className="col-span-1">ID</div>
            <div className="col-span-3">Cliente</div>
            <div className="col-span-2">CPF / CNPJ</div>
            <div className="col-span-3">Contato</div>
            <div className="col-span-2">Pipeline</div>
            <div className="col-span-1 text-right">Proc.</div>
          </div>
          {clientes.map((c) => {
            const stage = pipelineStages.find((s) => s.key === c.pipeline)!;
            return (
              <div
                key={c.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-border last:border-b-0 text-sm items-center hover:bg-background cursor-pointer"
              >
                <div className="col-span-1 font-mono text-xs">{c.id}</div>
                <div className="col-span-3">
                  <div className="font-medium truncate">{c.nome}</div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                    {c.tipo} · {c.cidade}
                  </div>
                </div>
                <div className="col-span-2 font-mono text-xs text-muted-foreground">{c.doc}</div>
                <div className="col-span-3 text-xs text-muted-foreground">
                  <div className="truncate text-foreground">{c.email}</div>
                  <div className="font-mono">{c.telefone}</div>
                </div>
                <div className="col-span-2">
                  <StatusBadge label={c.pipeline} tone={stage.tone} />
                </div>
                <div className="col-span-1 text-right font-mono tabular-nums">
                  {String(c.processosAtivos).padStart(2, "0")}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}
