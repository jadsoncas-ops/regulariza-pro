import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { PageToolbar, FilterChip, PrimaryAction, StatusBadge } from "@/components/shared/PageToolbar";
import { imoveis, clientes } from "@/data/mock";

const toneByStatus: Record<string, any> = {
  Regularizado: "ok",
  "Em análise": "primary",
  "Documento pendente": "alert",
  Iniciar: "neutral",
};

export default function Imoveis() {
  return (
    <AppLayout title="Imóveis & Lotes" subtitle="MOD.IMV / 03">
      <PageToolbar
        filters={
          <>
            <FilterChip label="TIPO" value="TODOS" active />
            <FilterChip label="STATUS" value="ATIVOS" />
            <FilterChip label="ÁREA" value="< 5.000 m²" />
          </>
        }
        action={<PrimaryAction>+ Cadastrar Imóvel</PrimaryAction>}
      />

      <section>
        <SectionHeader title="Cadastro Predial" code="IMV.001" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {imoveis.map((i) => {
            const cli = clientes.find((c) => c.id === i.clienteId);
            return (
              <article
                key={i.id}
                className="bg-surface border border-border p-5 hover-lift cursor-pointer relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      MATR. {i.matricula} · {i.id}
                    </div>
                    <div className="font-medium mt-1 leading-tight">{i.endereco}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{i.cidade}</div>
                  </div>
                  <StatusBadge label={i.status} tone={toneByStatus[i.status]} />
                </div>

                <div className="grid grid-cols-3 gap-px bg-border border border-border">
                  <div className="bg-background p-3">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground tracking-widest">
                      Terreno
                    </div>
                    <div className="font-display text-lg tabular-nums mt-1">
                      {i.areaTerreno.toLocaleString("pt-BR")}
                      <span className="text-[10px] text-muted-foreground ml-1">m²</span>
                    </div>
                  </div>
                  <div className="bg-background p-3">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground tracking-widest">
                      Construído
                    </div>
                    <div className="font-display text-lg tabular-nums mt-1">
                      {i.areaConstruida.toLocaleString("pt-BR")}
                      <span className="text-[10px] text-muted-foreground ml-1">m²</span>
                    </div>
                  </div>
                  <div className="bg-background p-3">
                    <div className="text-[9px] font-mono uppercase text-muted-foreground tracking-widest">
                      Tipo
                    </div>
                    <div className="font-display text-sm mt-2 leading-tight">{i.tipo}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">
                    Cliente: <span className="text-foreground font-medium">{cli?.nome}</span>
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground hover:text-primary">
                    ABRIR →
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}
