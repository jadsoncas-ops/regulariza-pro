"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  FileText,
  CalendarDays,
  DollarSign,
  BarChart3,
  TrendingUp,
  Settings,
  PlusCircle,
  ChevronRight
} from "lucide-react";

const NAV = [
  {
    section: null,
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    section: "CRM",
    items: [
      { name: "Clientes", href: "/clientes", icon: Users },
      { name: "Imóveis", href: "/imoveis", icon: Building2 },
    ]
  },
  {
    section: "Operação",
    items: [
      { name: "Processos", href: "/processos", icon: FolderKanban },
      { name: "Documentos", href: "/documentos", icon: FileText },
      { name: "Agenda", href: "/agenda", icon: CalendarDays },
    ]
  },
  {
    section: "Gestão",
    items: [
      { name: "Financeiro", href: "/financeiro", icon: DollarSign },
      { name: "Inteligência BI", href: "/bi", icon: TrendingUp },
      { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
    ]
  },
  {
    section: "Sistema",
    items: [
      { name: "Configurações", href: "/configuracoes", icon: Settings },
    ]
  }
];

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-[220px] flex-shrink-0 h-screen flex flex-col bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] overflow-hidden">
      
      {/* LOGO */}
      <div className="px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <div>
            <span className="text-white font-semibold text-sm leading-none">Regulariza Pro</span>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Engenharia & Gestão</p>
          </div>
        </div>
      </div>

      {/* CTA - NOVO PROJETO */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/processos/novo"
          className="flex items-center gap-2 w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Novo Projeto
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-5">
        {NAV.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <p className="px-2 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {group.section}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-[hsl(var(--sidebar-muted))] text-white font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[hsl(var(--sidebar-muted))]"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-400" : ""}`} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* USER FOOTER */}
      <div className="px-3 pb-4 pt-3 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[hsl(var(--sidebar-muted))] cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">JC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">Jadson Castro</p>
            <p className="text-[10px] text-slate-500 truncate">Administrador</p>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
