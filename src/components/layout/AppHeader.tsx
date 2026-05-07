import { Search, Plus, Bell, Command, Moon, Sun } from "lucide-react";
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
    <header className="h-16 sticky top-0 z-40 flex items-center justify-between px-8 border-b border-border/60 glass">
      <div className="flex flex-col justify-center min-w-0">
        <h1 className="text-[17px] font-semibold tracking-tight text-foreground truncate">{title}</h1>
        {subtitle && <span className="text-[12px] font-medium text-muted-foreground truncate">{subtitle}</span>}
      </div>

      <div className="flex items-center gap-2.5">
        <button className="hidden md:flex items-center justify-between gap-3 px-3 h-9 rounded-lg border border-border/70 bg-card hover:bg-muted/60 text-sm text-muted-foreground w-[340px] smooth-transition shadow-card group">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 group-hover:text-foreground smooth-transition" />
            <span>Buscar processo, cliente, matrícula, CPF, endereço...</span>
          </div>
          <kbd className="flex items-center gap-0.5 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/70">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        <button
          onClick={() => setDark((v) => !v)}
          className="h-9 w-9 grid place-items-center rounded-lg border border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 smooth-transition shadow-card"
          aria-label="Alternar tema"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className="h-9 w-9 grid place-items-center rounded-lg border border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 smooth-transition relative shadow-card" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card animate-pulse-glow" />
        </button>

        <button className="flex items-center gap-2 h-9 px-3.5 rounded-lg gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-95 active:scale-[0.98] smooth-transition">
          <Plus className="h-4 w-4" />
          Novo Processo
        </button>
      </div>
    </header>
  );
}
