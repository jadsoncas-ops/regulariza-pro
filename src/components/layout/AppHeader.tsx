import { Search, Plus } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 flex items-center justify-between px-8 shrink-0 z-10">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-medium font-display tracking-tight">{title}</h1>
        {subtitle && (
          <span className="font-mono text-xs text-muted-foreground">// {subtitle}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 h-9 border border-border bg-surface text-xs text-muted-foreground w-72">
          <Search className="h-3.5 w-3.5" />
          <input
            placeholder="Buscar processo, cliente, matrícula…"
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
          />
          <span className="font-mono text-[10px] border border-border px-1">⌘K</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground border-l border-border pl-4">
          <span className="flex items-center gap-2">
            <span className="size-1.5 bg-success rounded-full animate-pulse" />
            SIS. ONLINE
          </span>
        </div>
        <button className="flex items-center gap-2 h-9 px-3 bg-foreground text-background text-xs font-semibold font-display uppercase tracking-wider hover:bg-primary transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Novo Processo
        </button>
      </div>
    </header>
  );
}
