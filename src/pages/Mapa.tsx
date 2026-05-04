import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { PageToolbar, FilterChip, StatusBadge } from "@/components/shared/PageToolbar";
import { imoveis, clientes } from "@/data/mock";

const toneByStatus: Record<string, any> = {
  Regularizado: "ok",
  "Em análise": "primary",
  "Documento pendente": "alert",
  Iniciar: "neutral",
};

// Pseudo coordinates inside a fake city grid
const pins = imoveis.map((i, idx) => ({
  ...i,
  x: 12 + ((idx * 137) % 76),
  y: 14 + ((idx * 83) % 72),
}));

export default function MapaPage() {
  return (
    <AppLayout title="Mapa Zonal de Imóveis" subtitle="MOD.MAP / 08">
      <PageToolbar
        filters={
          <>
            <FilterChip label="STATUS" value="TODOS" active />
            <FilterChip label="TIPO" value="*" />
            <FilterChip label="ZONA" value="SP+REG" />
          </>
        }
      />

      <section>
        <SectionHeader title="Distribuição Geoespacial" code="MAP.001" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-surface-dark border border-surface-dark shadow-block">
          {/* Map canvas */}
          <div className="lg:col-span-2 bg-surface relative h-[560px] overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-50" />
            {/* Diagonal blueprint lines */}
            <svg
              className="absolute inset-0 w-full h-full text-border"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path d="M0 60 L40 30 L70 55 L100 25" stroke="currentColor" strokeWidth="0.2" fill="none" />
              <path d="M0 80 L30 70 L60 85 L100 55" stroke="currentColor" strokeWidth="0.2" fill="none" />
              <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.15" fill="none" strokeDasharray="0.5 0.5" />
            </svg>
            <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-background/80 border border-border px-2 py-1">
              MAPA ESQUEMÁTICO · ZL-001
            </div>
            <div className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-background/80 border border-border px-2 py-1">
              N ↑ · ESC. APROX.
            </div>

            {pins.map((p) => {
              const cls =
                p.status === "Regularizado"
                  ? "bg-success border-success"
                  : p.status === "Em análise"
                  ? "bg-primary border-primary"
                  : p.status === "Documento pendente"
                  ? "bg-alert border-alert"
                  : "bg-muted-foreground border-muted-foreground";
              return (
                <div
                  key={p.id}
                  className="absolute group"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <div className={`size-3 ${cls} ring-4 ring-background`} />
                  <div className="absolute left-5 top-0 hidden group-hover:block bg-background border border-border p-2 text-[10px] font-mono whitespace-nowrap z-20 shadow-block-sm">
                    <div className="text-foreground font-semibold">{p.id} · {p.matricula}</div>
                    <div className="text-muted-foreground">{p.endereco}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side legend + list */}
          <div className="bg-surface p-5 flex flex-col gap-5 max-h-[560px] overflow-auto">
            <div>
              <div className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Legenda
              </div>
              <ul className="flex flex-col gap-2 text-xs">
                <li className="flex items-center gap-2"><span className="size-2.5 bg-success" /> Regularizado</li>
                <li className="flex items-center gap-2"><span className="size-2.5 bg-primary" /> Em análise</li>
                <li className="flex items-center gap-2"><span className="size-2.5 bg-alert" /> Documento pendente</li>
                <li className="flex items-center gap-2"><span className="size-2.5 bg-muted-foreground" /> A iniciar</li>
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <div className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Imóveis no mapa
              </div>
              <div className="flex flex-col gap-2">
                {imoveis.map((i) => {
                  const cli = clientes.find((c) => c.id === i.clienteId);
                  return (
                    <div
                      key={i.id}
                      className="border border-border bg-background p-3 hover-lift cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-mono text-[10px] text-muted-foreground">{i.id}</div>
                        <StatusBadge label={i.status} tone={toneByStatus[i.status]} />
                      </div>
                      <div className="text-xs font-medium truncate">{i.endereco}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{cli?.nome}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
