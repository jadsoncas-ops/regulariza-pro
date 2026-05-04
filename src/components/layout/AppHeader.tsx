import { Search, Plus, Sparkles, Bell } from "lucide-react";
import { Link } from "react-router-dom";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 flex items-center justify-between px-8 shrink-0 z-10">
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 h-10 border border-border bg-muted/30 rounded-lg text-sm text-muted-foreground w-80 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
          <Search className="h-4 w-4" />
          <input
            placeholder="Buscar processos, clientes, matrículas..."
            className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
          />
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</span>
        </div>
        
        <button className="h-10 w-10 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground smooth-transition relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-destructive rounded-full border-2 border-background" />
        </button>

        <Link
          to="/ia-regularizacao"
          className="flex items-center gap-2 h-10 px-4 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted smooth-transition"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Assistente IA
        </Link>
        <button className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 smooth-transition shadow-sm">
          <Plus className="h-4 w-4" />
          Novo Processo
        </button>
      </div>
    </header>
  );
}
