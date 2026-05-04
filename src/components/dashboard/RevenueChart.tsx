import { SectionHeader } from "./KpiGrid";

const data = [
  { m: "JUN", v: 32 },
  { m: "JUL", v: 48 },
  { m: "AGO", v: 41 },
  { m: "SET", v: 67 },
  { m: "OUT", v: 84 },
  { m: "NOV", v: 58 },
];

const max = Math.max(...data.map((d) => d.v));

export function RevenueChart() {
  return (
    <div>
      <SectionHeader title="Receita Faturada" code="FIN.003" />
      <div className="bg-surface border border-border p-5 shadow-block-sm">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="text-3xl font-display tracking-tighter tabular-nums">R$ 84k</div>
            <div className="text-[10px] font-mono text-muted-foreground mt-1">
              SEMESTRE · +24% vs ANT.
            </div>
          </div>
          <div className="flex gap-2 text-[10px] font-mono">
            <button className="px-2 py-1 border border-border text-muted-foreground hover:text-foreground">6M</button>
            <button className="px-2 py-1 border border-foreground bg-foreground text-background">1A</button>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 h-40 border-b border-l border-border pl-2 pb-1 relative">
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
            <div className="border-t border-dashed border-border/60" />
            <div className="border-t border-dashed border-border/60" />
            <div className="border-t border-dashed border-border/60" />
          </div>
          {data.map((d, i) => (
            <div
              key={d.m}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              <div
                className={[
                  "w-full transition-colors",
                  i === data.length - 2 ? "bg-primary" : "bg-foreground/15 group-hover:bg-foreground/40",
                ].join(" ")}
                style={{ height: `${(d.v / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2 pl-2 pt-2">
          {data.map((d) => (
            <div key={d.m} className="flex-1 text-center text-[10px] font-mono text-muted-foreground">
              {d.m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
