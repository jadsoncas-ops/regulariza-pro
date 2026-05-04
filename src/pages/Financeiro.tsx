import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/dashboard/KpiGrid";
import { PageToolbar, FilterChip, PrimaryAction, StatusBadge } from "@/components/shared/PageToolbar";
import { financeiro } from "@/data/mock";

const toneByStatus: Record<string, any> = {
  Pago: "ok",
  "Em aberto": "warn",
  Atrasado: "alert",
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function Financeiro() {
  const receitas = financeiro.filter((f) => f.tipo === "Receita");
  const despesas = financeiro.filter((f) => f.tipo === "Despesa");
  const totalReceita = receitas.reduce((s, r) => s + r.valor, 0);
  const totalDespesa = despesas.reduce((s, r) => s + r.valor, 0);
  const aReceber = receitas.filter((r) => r.status !== "Pago").reduce((s, r) => s + r.valor, 0);
  const ticket = totalReceita / receitas.length;

  const kpis = [
    { label: "Faturamento", value: fmt(totalReceita), hint: `${receitas.length} lançamentos` },
    { label: "A Receber", value: fmt(aReceber), hint: "Próximos 60 dias" },
    { label: "Despesas", value: fmt(totalDespesa), hint: `${despesas.length} lançamentos` },
    { label: "Ticket Médio", value: fmt(ticket), hint: "Por contrato", accent: true },
  ];

  return (
    <AppLayout title="Financeiro" subtitle="MOD.FIN / 06">
      <PageToolbar
        filters={
          <>
            <FilterChip label="PERÍODO" value="NOV/2026" active />
            <FilterChip label="TIPO" value="*" />
            <FilterChip label="STATUS" value="ABERTOS" />
          </>
        }
        action={<PrimaryAction>+ Lançamento</PrimaryAction>}
      />

      <section>
        <SectionHeader title="Indicadores" code="FIN.001" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-dark border border-surface-dark shadow-block">
          {kpis.map((k) => (
            <div
              key={k.label}
              className={[
                "p-5 h-32 flex flex-col justify-between",
                k.accent ? "bg-primary text-primary-foreground" : "bg-surface",
              ].join(" ")}
            >
              <div
                className={[
                  "text-[11px] uppercase tracking-widest font-semibold font-display",
                  k.accent ? "text-primary-foreground/80" : "text-muted-foreground",
                ].join(" ")}
              >
                {k.label}
              </div>
              <div>
                <div className="text-3xl font-display tracking-tighter tabular-nums">{k.value}</div>
                <div
                  className={[
                    "text-[10px] mt-1 font-mono",
                    k.accent ? "text-primary-foreground/70" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {k.hint}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FinTable title="Contas a Receber" code="FIN.002" rows={receitas} />
        <FinTable title="Contas a Pagar" code="FIN.003" rows={despesas} />
      </div>
    </AppLayout>
  );

  function FinTable({
    title,
    code,
    rows,
  }: {
    title: string;
    code: string;
    rows: typeof financeiro;
  }) {
    return (
      <section>
        <SectionHeader title={title} code={code} />
        <div className="bg-surface border border-border shadow-block-sm">
          <div className="grid grid-cols-12 gap-3 p-3 border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-widest font-display bg-surface-mid/40">
            <div className="col-span-5">Descrição</div>
            <div className="col-span-2">Venc.</div>
            <div className="col-span-3 text-right">Valor</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-12 gap-3 p-4 border-b border-border last:border-b-0 text-sm items-center hover:bg-background cursor-pointer"
            >
              <div className="col-span-5 min-w-0">
                <div className="font-medium truncate">{r.categoria}</div>
                {r.cliente && (
                  <div className="text-[10px] text-muted-foreground truncate">{r.cliente}</div>
                )}
              </div>
              <div className="col-span-2 font-mono text-xs">{r.vencimento}</div>
              <div className="col-span-3 text-right font-display tabular-nums">{fmt(r.valor)}</div>
              <div className="col-span-2 text-right">
                <StatusBadge label={r.status} tone={toneByStatus[r.status]} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}
