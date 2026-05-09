import { ArrowUpRight, Sparkles, TrendingUp, ArrowRight } from "lucide-react";

export function HeroSection() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-card ink-grain">
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-[hsl(var(--accent)/0.10)] blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 p-8 md:p-12">
        {/* Editorial copy */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-6">
            <span className="font-mono">{today}</span>
            <span className="h-px w-8 bg-border" />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
              Sistema sincronizado
            </span>
          </div>

          <h1 className="font-serif text-[44px] md:text-[56px] leading-[0.98] tracking-tight text-foreground">
            {greeting}, João.
            <br />
            <span className="italic text-muted-foreground">Sua mesa hoje tem </span>
            <span className="text-gradient italic">12 frentes</span>
            <span className="italic text-muted-foreground"> abertas.</span>
          </h1>

          <p className="mt-6 text-[15px] text-muted-foreground max-w-xl leading-relaxed">
            Três processos exigem ação sua antes de sexta. A receita prevista do mês ultrapassou
            <span className="text-foreground font-semibold"> R$ 48.000</span>, com taxa de conversão em alta.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 h-11 pl-4 pr-5 rounded-xl gradient-accent text-white text-[13.5px] font-semibold shadow-pop hover:opacity-95 active:scale-[0.98] smooth-transition">
              <Sparkles className="h-4 w-4" />
              Diagnóstico com IA
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-foreground text-background text-[13.5px] font-semibold hover:opacity-90 smooth-transition">
              Ver pipeline
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-card text-foreground text-[13.5px] font-semibold hover:bg-muted/60 smooth-transition">
              Agenda do dia
            </button>
          </div>
        </div>

        {/* Stat column */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <BigStat title="Receita prevista" value="R$ 48.0k" trend="+18%" hint="vs R$ 38.1k mês anterior" />
          <div className="grid grid-cols-2 gap-3">
            <SmallStat label="Esta semana" value="+8" hint="novos processos" />
            <SmallStat label="Conversão" value="62%" hint="propostas" />
            <SmallStat label="Protocolados" value="28" hint="aguardando" />
            <SmallStat label="NPS" value="9.4" hint="últimos 30d" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BigStat({ title, value, trend, hint }: { title: string; value: string; trend: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-card flex items-end justify-between gap-4">
      <div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</div>
        <div className="font-serif text-[44px] leading-none tracking-tight text-foreground mt-2 number">{value}</div>
        <div className="text-[11.5px] text-muted-foreground mt-2">{hint}</div>
      </div>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] text-[11px] font-semibold">
        <TrendingUp className="h-3 w-3" />
        {trend}
      </span>
    </div>
  );
}

function SmallStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-card hover-lift">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="font-serif text-[26px] leading-none text-foreground mt-2 number">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1.5 truncate">{hint}</div>
    </div>
  );
}
