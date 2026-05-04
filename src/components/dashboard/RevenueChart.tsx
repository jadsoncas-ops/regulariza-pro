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
    <div className="h-full flex flex-col">
      <SectionHeader title="Evolução Financeira" />
      <div className="bg-card border border-border p-6 rounded-xl flex-1 flex flex-col shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">R$ 84k</div>
            <div className="text-sm text-emerald-500 font-medium mt-1 flex items-center gap-1">
              <span>+24%</span>
              <span className="text-muted-foreground font-normal">vs último semestre</span>
            </div>
          </div>
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            <button className="px-3 py-1 rounded-md text-xs font-medium bg-background text-foreground shadow-sm">6M</button>
            <button className="px-3 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground smooth-transition">1A</button>
          </div>
        </div>
        
        <div className="flex-1 flex items-end justify-between gap-4 border-b border-border/50 pb-2 relative mt-4 min-h-[160px]">
          {data.map((d, i) => (
            <div
              key={d.m}
              className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
            >
              <div
                className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ${
                  i === data.length - 2 ? "bg-primary" : "bg-primary/20 group-hover:bg-primary/40"
                }`}
                style={{ height: `${(d.v / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-between gap-4 pt-3">
          {data.map((d) => (
            <div key={d.m} className="flex-1 text-center text-xs font-medium text-muted-foreground">
              {d.m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
