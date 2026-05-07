import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";

export function HeroSection() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card noise">
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[hsl(252_95%_65%/0.18)] blur-3xl pointer-events-none" />

      <div className="relative px-8 py-10 md:px-12 md:py-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 border border-border/70 backdrop-blur text-[11px] font-medium text-muted-foreground mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Tudo operando normalmente · sincronizado há instantes
          </div>
          <h1 className="text-[34px] md:text-[42px] leading-[1.05] font-bold tracking-tight text-foreground">
            {greeting}, João.
            <br />
            Você possui <span className="text-gradient">12 processos ativos</span> e
            <span className="text-gradient"> R$ 48.000</span> previstos.
          </h1>
          <p className="mt-4 text-[15px] text-muted-foreground max-w-xl leading-relaxed">
            Visão consolidada de tramitações, prefeitura, cartório e financeiro. Tudo conectado, em tempo real.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl gradient-primary text-white text-[13.5px] font-semibold shadow-glow hover:opacity-95 active:scale-[0.98] smooth-transition">
              <Sparkles className="h-4 w-4" />
              Diagnóstico com IA
            </button>
            <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-card border border-border/70 text-foreground text-[13.5px] font-semibold hover:bg-muted/60 smooth-transition shadow-card">
              Ver pipeline
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:min-w-[340px]">
          <MiniStat label="Esta semana" value="+8" hint="novos processos" trend="+24%" />
          <MiniStat label="Protocolados" value="28" hint="aguardando análise" trend="+12%" />
          <MiniStat label="Receita MTD" value="R$45.2k" hint="vs R$38.1k mês anterior" trend="+18%" />
          <MiniStat label="Conversão" value="62%" hint="propostas → contratos" trend="+5pp" />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, hint, trend }: { label: string; value: string; hint: string; trend: string }) {
  return (
    <div className="rounded-2xl bg-card/70 backdrop-blur border border-border/70 p-4 shadow-card hover-lift">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <div className="text-[22px] font-bold tracking-tight text-foreground">{value}</div>
        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-success">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground truncate">{hint}</div>
    </div>
  );
}
