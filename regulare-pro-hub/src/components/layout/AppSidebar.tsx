"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CalendarDays, 
  Settings,
  DollarSign,
  Building,
  FolderOpen,
  ArrowRightLeft
} from "lucide-react";

const SIDEBAR_ITEMS = {
  crm: [
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Imóveis", href: "/imoveis", icon: Building },
  ],
  operacao: [
    { name: "Processos", href: "/processos", icon: FolderOpen },
    { name: "Documentos", href: "/documentos", icon: FileText },
    { name: "Agenda", href: "/agenda", icon: CalendarDays },
  ],
  gestao: [
    { name: "Financeiro", href: "/financeiro", icon: DollarSign },
    { name: "Relatórios", href: "/relatorios", icon: ArrowRightLeft },
  ]
};

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-background border-r border-border flex flex-col font-mono sticky top-0 overflow-hidden z-50">
      {/* LOGO */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
            <span className="text-background font-black text-xs">RP</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase leading-none text-foreground">Regulariza Pro</h1>
            <span className="text-[8px] text-muted-foreground font-bold tracking-[0.2em] uppercase">SaaS de Engenharia</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-8">
        
        {/* DASHBOARD */}
        <div className="px-3">
          <Link 
            href="/" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all ${
              pathname === "/" ? "bg-foreground text-background font-black shadow-md" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest">Dashboard</span>
          </Link>
        </div>

        {/* CRM */}
        <div>
          <h3 className="px-6 text-[9px] font-black text-muted-foreground/40 tracking-[0.3em] mb-3 uppercase">CRM</h3>
          <ul className="px-3 space-y-1">
            {SIDEBAR_ITEMS.crm.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest transition-all ${
                      isActive ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:bg-muted/50 text-muted-foreground/80"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* OPERAÇÃO */}
        <div>
          <h3 className="px-6 text-[9px] font-black text-muted-foreground/40 tracking-[0.3em] mb-3 uppercase">Operação</h3>
          <ul className="px-3 space-y-1">
            {SIDEBAR_ITEMS.operacao.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest transition-all ${
                      isActive ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:bg-muted/50 text-muted-foreground/80"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* GESTÃO */}
        <div>
          <h3 className="px-6 text-[9px] font-black text-muted-foreground/40 tracking-[0.3em] mb-3 uppercase">Gestão</h3>
          <ul className="px-3 space-y-1">
            {SIDEBAR_ITEMS.gestao.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest transition-all ${
                      isActive ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:bg-muted/50 text-muted-foreground/80"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

      {/* FOOTER - CONFIGURAÇÕES */}
      <div className="p-4 border-t border-border">
        <Link 
          href="/configuracoes" 
          className={`flex items-center gap-3 px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest transition-all ${
            pathname === "/configuracoes" ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
