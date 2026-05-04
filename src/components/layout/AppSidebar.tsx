import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  FolderOpen,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  DollarSign,
  BarChart2,
  Bot,
  Settings,
  Building,
} from "lucide-react";

const mainNav = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Processos", url: "/processos", icon: FolderOpen },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
  { title: "Documentos", url: "/documentos", icon: FileText },
];

const managementNav = [
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Relatórios", url: "/relatorios", icon: BarChart2 },
  { title: "IA Regularização", url: "/ia-regularizacao", icon: Bot },
];

function NavItem({
  item,
}: {
  item: { title: string; url: string; icon: any; badge?: string };
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.url}
      end={item.url === "/"}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium smooth-transition",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{item.title}</span>
      {item.badge && (
        <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

export function AppSidebar() {
  useLocation();
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col z-20 relative">
      <div className="p-6">
        <div
          className="font-bold text-xl tracking-tight flex items-center gap-2 text-foreground"
          aria-label="Regulare Pro Hub"
        >
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Building className="h-5 w-5 text-primary" />
          </div>
          REGULARE <span className="font-light">PRO</span>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
            Principal
          </div>
          {mainNav.map((i) => (
            <NavItem key={i.url} item={i} />
          ))}

          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-6 px-3">
            Gestão & IA
          </div>
          {managementNav.map((i) => (
            <NavItem key={i.url} item={i} />
          ))}

          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-6 px-3">
            Sistema
          </div>
          <NavItem
            item={{ title: "Configurações", url: "/configuracoes", icon: Settings }}
          />
        </nav>
      </div>

      <div className="mt-auto p-4 m-4 border border-border rounded-xl bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            JD
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">João Silva</div>
            <div className="text-xs text-muted-foreground">Engenheiro</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
