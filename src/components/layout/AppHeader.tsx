import { Search, Plus, Bell, Command, Moon, Sun, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <header className="h-[72px] sticky top-0 z-40 flex items-center justify-between gap-6 px-8 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-[0.16em]">
          <span>Workspace</span>
          <span className="opacity-50">/</span>
          <span className="text-foreground/80">{title}</span>
        </div>
        <h1 className="font-serif text-[26px] leading-tight tracking-tight text-foreground truncate mt-0.5">
          {subtitle ?? title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden md:flex items-center justify-between gap-3 px-3 h-10 rounded-xl border border-border bg-card hover:bg-muted/60 text-sm text-muted-foreground w-[360px] smooth-transition shadow-card group">
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 group-hover:text-foreground smooth-transition" />
            <span>Buscar processo, matrícula, CPF, endereço…</span>
          </div>
          <kbd className="flex items-center gap-0.5 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/70">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        <button className="hidden lg:inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-card text-foreground text-[13px] font-medium hover:bg-muted/60 smooth-transition shadow-card">
          <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
          IA
          <span className="text-[10px] font-mono text-muted-foreground">⌘J</span>
        </button>

        <button
          onClick={() => setDark((v) => !v)}
          className="h-10 w-10 grid place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 smooth-transition shadow-card"
          aria-label="Alternar tema"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className="h-10 w-10 grid place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 smooth-transition relative shadow-card" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[hsl(var(--accent))] ring-2 ring-card" />
        </button>

        <button className="flex items-center gap-2 h-10 pl-3 pr-4 rounded-xl bg-foreground text-background text-[13px] font-semibold hover:opacity-90 active:scale-[0.98] smooth-transition shadow-pop">
          <Plus className="h-4 w-4" />
          Novo Processo
        </button>
      </div>
    </header>
  );
}
