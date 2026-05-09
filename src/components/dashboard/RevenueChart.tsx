import { SectionHeader } from "./KpiGrid";
import { useState } from "react";

const data6m = [
  { m: "JUN", v: 32 },
  { m: "JUL", v: 48 },
  { m: "AGO", v: 41 },
  { m: "SET", v: 67 },
  { m: "OUT", v: 84 },
  { m: "NOV", v: 58 },
];
const data1y = [
  { m: "DEZ", v: 22 }, { m: "JAN", v: 28 }, { m: "FEV", v: 31 }, { m: "MAR", v: 38 },
  { m: "ABR", v: 42 }, { m: "MAI", v: 51 }, { m: "JUN", v: 32 }, { m: "JUL", v: 48 },
  { m: "AGO", v: 41 }, { m: "SET", v: 67 }, { m: "OUT", v: 84 }, { m: "NOV", v: 58 },
];

export function RevenueChart() {
  const [range, setRange] = useState<"6M" | "1A">("6M");
  const data = range === "6M" ? data6m : data1y;
  const max = Math.max(...data.map((d) => d.v));
  const min = Math.min(...data.map((d) => d.v));

  const W = 600, H = 200, P = 8;
  const stepX = (W - P * 2) / (data.length - 1);
  const points = data.map((d, i) => ({
    x: P + i * stepX,
    y: P + (1 - (d.v - min) / (max - min || 1)) * (H - P * 2),
    ...d,
  }));

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  return (
    <div className="h-full flex flex-col">
      <SectionHeader title="Evolução Financeira" eyebrow="02 · Receita" />
      <div className="bg-card border border-border p-7 rounded-[24px] flex-1 flex flex-col shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
              Receita acumulada
            </div>
            <div className="font-serif text-[40px] leading-none text-foreground tracking-tight number">R$ 84k</div>
            <div className="text-sm text-[hsl(var(--success))] font-medium mt-2 flex items-center gap-1.5">
              <span className="font-mono">+24%</span>
              <span className="text-muted-foreground font-normal">vs último período</span>
            </div>
          </div>
          <div className="flex gap-1 bg-muted/60 p-1 rounded-xl">
            {(["6M", "1A"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3.5 h-7 rounded-lg text-xs font-medium smooth-transition ${
                  range === r ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1 min-h-[200px]">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.28" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((t) => (
              <line key={t} x1={P} x2={W - P} y1={P + t * (H - P * 2)} y2={P + t * (H - P * 2)}
                stroke="hsl(var(--border))" strokeDasharray="2 4" />
            ))}
            <path d={areaPath} fill="url(#rev-area)" />
            <path d={linePath} fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 2 ? 4 : 2.5}
                fill="hsl(var(--card))" stroke="hsl(var(--accent))" strokeWidth="2" />
            ))}
          </svg>
        </div>

        <div className="flex justify-between gap-2 pt-4 mt-1 border-t border-border/50">
          {data.map((d, i) => (
            <div key={d.m + i} className="flex-1 text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {d.m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
