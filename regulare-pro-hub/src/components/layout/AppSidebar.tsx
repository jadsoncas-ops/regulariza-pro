"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CalendarDays, 
  Settings,
  DollarSign,
  MapPin,
  Bell,
  Building,
  FolderOpen
} from "lucide-react";

const SIDEBAR_ITEMS = {
  operacao: [
    { name: "Painel Central", href: "/", icon: LayoutDashboard, id: "01" },
    { name: "Clientes", href: "/clientes", icon: Users, id: "02" },
    { name: "Imóveis / Lotes", href: "/imoveis", icon: Building, id: "03" },
    { name: "Processos", href: "/processos", icon: FolderOpen, id: "04" },
    { name: "Documentos", href: "/documentos", icon: FileText, id: "05" },
  ],
  gestao: [
    { name: "Financeiro", href: "/financeiro", icon: DollarSign, id: "06" },
    { name: "Agenda & Prazos", href: "/agenda", icon: CalendarDays, id: "07" },
    { name: "Mapa Zonal", href: "/mapa", icon: MapPin, id: "08" },
    { name: "Alertas", href: "/alertas", icon: Bell, id: "09" },
  ],
  sistema: [
    { name: "Configurações", href: "/configuracoes", icon: Settings, id: "10" },
  ]
};

export default function AppSidebar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col h-screen font-mono text-sm shadow-[2px_0_10px_rgba(0,0,0,0.02)] relative z-10">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <Image src="/logo.png" width={24} height={24} alt="Regulariza Pro" className="rounded-sm" />
        <span className="font-bold text-foreground tracking-tight text-lg">Regulariza <span className="font-normal text-muted-foreground">Pro</span></span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        
        {/* OPERAÇÃO */}
        <div>
          <h3 className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Operação</h3>
          <ul className="space-y-1">
            {SIDEBAR_ITEMS.operacao.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-sm smooth-transition ${
                      isActive 
                        ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold border-l-2 border-blue-600 shadow-sm" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] opacity-40">{item.id}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* GESTÃO */}
        <div>
          <h3 className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Gestão</h3>
          <ul className="space-y-1">
            {SIDEBAR_ITEMS.gestao.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-sm smooth-transition ${
                      isActive 
                        ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold border-l-2 border-blue-600 shadow-sm" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] opacity-40">{item.id}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* SISTEMA */}
        <div>
          <h3 className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Sistema</h3>
          <ul className="space-y-1">
            {SIDEBAR_ITEMS.sistema.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-sm smooth-transition ${
                      isActive 
                        ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold border-l-2 border-blue-600 shadow-sm" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] opacity-40">{item.id}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

      </nav>

      <div className="p-6 border-t border-border relative">
        {/* Profile Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full text-left flex flex-col gap-1 hover:bg-muted/50 p-2 -ml-2 rounded-sm smooth-transition"
        >
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">ID: MATR-882</p>
          <p className="text-xs font-bold text-foreground flex items-center justify-between">
            Arq. Helena Torres
            <Settings className="w-3 h-3 text-muted-foreground" />
          </p>
          <p className="text-[10px] text-muted-foreground">Engenheira Responsável</p>
        </button>

        {/* Preferences Popover */}
        {isMenuOpen && (
          <div className="absolute bottom-full left-6 mb-2 w-56 bg-card border border-border shadow-lg rounded-sm py-2 z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="px-4 py-2 border-b border-border mb-2">
              <p className="text-xs font-bold">Minha Conta</p>
            </div>
            <Link href="/configuracoes" className="block px-4 py-2 text-xs text-foreground hover:bg-muted smooth-transition">
              Preferências
            </Link>
            <button className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted smooth-transition flex justify-between items-center">
              Modo Escuro
              <div className="w-6 h-3 bg-muted rounded-full relative border border-border">
                <div className="absolute left-0 top-0 bottom-0 w-3 rounded-full bg-background border border-border"></div>
              </div>
            </button>
            <div className="h-[1px] bg-border my-2"></div>
            <button className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/10 smooth-transition font-bold">
              Sair do Sistema
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
