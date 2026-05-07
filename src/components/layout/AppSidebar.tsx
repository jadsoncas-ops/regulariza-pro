import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  Wallet,
  CalendarDays,
  Map,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  ChevronsLeft,
} from "lucide-react";
import { useState } from "react";

const nav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Processos", url: "/processos", icon: FolderKanban },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Imóveis", url: "/imoveis", icon: Building2 },
  { title: "Financeiro", url: "/financeiro", icon: Wallet },
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Mapa de Projetos", url: "/mapa", icon: Map },
  { title: "Documentos", url: "/documentos", icon: FileText },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

export function AppSidebar() {
  useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-[248px]"} shrink-0 h-screen sticky top-0 flex flex-col z-30 border-r border-border/60 bg-sidebar transition-[width] duration-300 ease-out`}
    >
      {/* Brand */}
      <div className={`h-16 flex items-center ${collapsed ? "justify-center" : "px-5"} border-b border-border/60`}>
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-foreground">Regulariza<span className="text-gradient">Pro</span></div>
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Engenharia & Regularização</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
        {!collapsed && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground px-3 mb-2">Workspace</div>
        )}
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-lg text-[13.5px] font-medium smooth-transition",
                  collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 h-9",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-card"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full gradient-primary shadow-glow" />
                  )}
                  <Icon className={`h-[17px] w-[17px] shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="my-3 h-px bg-border/60" />

        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            [
              "group flex items-center gap-3 rounded-lg text-[13.5px] font-medium smooth-transition",
              collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 h-9",
              isActive ? "bg-accent text-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
            ].join(" ")
          }
        >
          <Settings className="h-[17px] w-[17px] shrink-0 text-muted-foreground group-hover:text-foreground" />
          {!collapsed && <span>Configurações</span>}
        </NavLink>
      </nav>

      {/* User + collapse */}
      <div className="p-3 border-t border-border/60">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-white text-[12px] font-semibold shadow-card">JS</div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success border-2 border-sidebar" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-foreground truncate">João Silva</div>
              <div className="text-[11px] text-muted-foreground truncate">Engenheiro Civil</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground smooth-transition"
              aria-label="Colapsar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mt-3 mx-auto h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground smooth-transition"
            aria-label="Expandir"
          >
            <ChevronsLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
      </div>
    </aside>
  );
}
