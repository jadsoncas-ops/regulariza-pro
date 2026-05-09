import { NavLink } from "react-router-dom";
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
  Bell,
  ChevronsLeft,
  CircleDot,
} from "lucide-react";
import { useState } from "react";

const groups = [
  {
    label: "Operação",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard, hint: "G D" },
      { title: "Processos", url: "/processos", icon: FolderKanban, hint: "G P", count: 12 },
      { title: "Agenda", url: "/agenda", icon: CalendarDays, hint: "G A" },
      { title: "Tarefas", url: "/tarefas", icon: CircleDot, hint: "G T", count: 7 },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { title: "Clientes", url: "/clientes", icon: Users },
      { title: "Imóveis", url: "/imoveis", icon: Building2 },
      { title: "Documentos", url: "/documentos", icon: FileText },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { title: "Mapa de Projetos", url: "/mapa", icon: Map },
      { title: "Financeiro", url: "/financeiro", icon: Wallet },
      { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
      { title: "IA Regularização", url: "/ia-regularizacao", icon: Sparkles, accent: true },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? "w-[68px]" : "w-[260px]"} shrink-0 h-screen sticky top-0 flex flex-col z-30 bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out`}
    >
      {/* Brand */}
      <div className={`h-[72px] flex items-center ${collapsed ? "justify-center" : "px-5"}`}>
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-xl bg-sidebar-accent grid place-items-center ring-1 ring-sidebar-border">
            <span className="font-serif italic text-[20px] leading-none text-sidebar-accent-foreground">R</span>
            <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full gradient-accent ring-2 ring-sidebar" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-serif text-[19px] tracking-tight text-sidebar-accent-foreground">Regulariza<span className="italic text-[hsl(var(--sidebar-primary))]">Pro</span></div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/70">Engenharia · Cartório · Pref.</div>
            </div>
          )}
        </div>
      </div>

      {/* Workspace badge */}
      {!collapsed && (
        <div className="mx-4 mb-4 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Workspace</div>
              <div className="text-[13px] font-semibold text-sidebar-accent-foreground mt-0.5">Silva & Associados</div>
            </div>
            <div className="h-7 w-7 rounded-md gradient-accent grid place-items-center text-white text-[11px] font-bold">SA</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-5 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            {!collapsed && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45 px-3 mb-1.5">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  end={item.url === "/"}
                  className={({ isActive }) =>
                    [
                      "group relative flex items-center gap-3 rounded-lg text-[13px] font-medium smooth-transition",
                      collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 h-9",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r-full gradient-accent" />
                      )}
                      <Icon className={`h-[16px] w-[16px] shrink-0 ${(item as any).accent ? "text-[hsl(var(--sidebar-primary))]" : ""}`} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {(item as any).count !== undefined && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-sidebar-accent text-sidebar-foreground/80 group-hover:text-sidebar-accent-foreground">
                              {(item as any).count}
                            </span>
                          )}
                          {(item as any).hint && (item as any).count === undefined && (
                            <span className="text-[10px] font-mono text-sidebar-foreground/40 opacity-0 group-hover:opacity-100 smooth-transition">
                              {(item as any).hint}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavLink
          to="/alertas"
          className={({ isActive }) =>
            [
              "group flex items-center gap-3 rounded-lg text-[13px] font-medium smooth-transition",
              collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 h-9",
              isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            ].join(" ")
          }
        >
          <Bell className="h-[16px] w-[16px] shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">Alertas</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
            </>
          )}
        </NavLink>
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            [
              "group flex items-center gap-3 rounded-lg text-[13px] font-medium smooth-transition",
              collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 h-9",
              isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            ].join(" ")
          }
        >
          <Settings className="h-[16px] w-[16px] shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </NavLink>

        <div className={`mt-3 flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent ring-1 ring-sidebar-border grid place-items-center text-sidebar-accent-foreground text-[12px] font-semibold">JS</div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[hsl(var(--success))] border-2 border-sidebar" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-sidebar-accent-foreground truncate">João Silva</div>
              <div className="text-[11px] text-sidebar-foreground/60 truncate">Engenheiro Civil · CREA</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="h-7 w-7 grid place-items-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground smooth-transition"
              aria-label="Colapsar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mt-2 mx-auto h-7 w-7 grid place-items-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground smooth-transition"
            aria-label="Expandir"
          >
            <ChevronsLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
      </div>
    </aside>
  );
}
