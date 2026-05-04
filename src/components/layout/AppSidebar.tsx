import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  FileText,
  Wallet,
  CalendarDays,
  Map,
  Bell,
  Settings,
} from "lucide-react";

const operacao = [
  { title: "Painel Central", url: "/", icon: LayoutDashboard, code: "01" },
  { title: "Clientes", url: "/clientes", icon: Users, code: "02" },
  { title: "Imóveis / Lotes", url: "/imoveis", icon: Building2, code: "03" },
  { title: "Processos", url: "/processos", icon: FolderKanban, code: "04", badge: "42" },
  { title: "Documentos", url: "/documentos", icon: FileText, code: "05" },
];

const gestao = [
  { title: "Financeiro", url: "/financeiro", icon: Wallet, code: "06" },
  { title: "Agenda & Prazos", url: "/agenda", icon: CalendarDays, code: "07" },
  { title: "Mapa Zonal", url: "/mapa", icon: Map, code: "08" },
  { title: "Alertas", url: "/alertas", icon: Bell, code: "09" },
];

function NavItem({
  item,
}: {
  item: { title: string; url: string; icon: any; code: string; badge?: string };
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.url}
      end={item.url === "/"}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 px-3 py-2 text-sm font-medium border-l-2 transition-colors",
          isActive
            ? "bg-surface text-primary border-primary shadow-block-sm"
            : "text-muted-foreground border-transparent hover:bg-surface-mid hover:text-foreground",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{item.title}</span>
      {item.badge ? (
        <span className="font-mono text-[10px] tabular-nums bg-surface-dark text-foreground px-1.5 py-0.5">
          {item.badge}
        </span>
      ) : (
        <span className="font-mono text-[10px] text-surface-dark group-hover:text-muted-foreground">
          {item.code}
        </span>
      )}
    </NavLink>
  );
}

export function AppSidebar() {
  useLocation();
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-background flex flex-col z-20 relative">
      <div className="p-6">
        <div
          className="font-display font-bold text-xl tracking-tighter flex items-baseline gap-2"
          aria-label="EngArqGestão"
        >
          <span className="size-2 bg-primary inline-block" />
          ENGARQ<span className="text-muted-foreground">.GESTÃO</span>
        </div>

        <nav className="mt-10 flex flex-col">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-3 font-display">
            Operação
          </div>
          {operacao.map((i) => (
            <NavItem key={i.url} item={i} />
          ))}

          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 mt-8 px-3 font-display">
            Gestão
          </div>
          {gestao.map((i) => (
            <NavItem key={i.url} item={i} />
          ))}

          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 mt-8 px-3 font-display">
            Sistema
          </div>
          <NavItem
            item={{ title: "Configurações", url: "/configuracoes", icon: Settings, code: "10" }}
          />
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border bg-surface">
        <div className="font-mono text-[10px] text-muted-foreground mb-1">ID: MATR-882</div>
        <div className="text-sm font-semibold tracking-tight">Arq. Helena Torres</div>
        <div className="text-xs text-muted-foreground">Engenheira Responsável</div>
      </div>
    </aside>
  );
}
