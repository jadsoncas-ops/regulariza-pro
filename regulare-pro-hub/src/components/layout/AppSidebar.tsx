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
  FolderOpen,
  ArrowRightLeft,
  PlusCircle
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
    { name: "Migrar Sistema", href: "/migrar", icon: ArrowRightLeft, id: "11" },
  ]
};

export default function AppSidebar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen font-mono text-[11px] shadow-sm relative z-10 uppercase tracking-wider">
      <div className="p-8 border-b border-border flex flex-col gap-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
             <Image src="/logo.png" width={16} height={16} alt="Pro" className="invert dark:invert-0" />
          </div>
          <span className="font-black text-foreground tracking-tighter text-base italic">Regulariza <span className="text-primary">Pro</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[8px] font-bold text-muted-foreground tracking-[0.2em]">SISTEMA OPERACIONAL // v2.4</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-10">
        
        {/* OPERAÇÃO */}
        <div>
          <h3 className="px-3 text-[9px] font-black text-muted-foreground/50 tracking-[0.3em] mb-4">OPERAÇÃO</h3>
          <ul className="space-y-1.5">
            {SIDEBAR_ITEMS.operacao.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-sm transition-all duration-200 group ${
                      isActive 
                        ? "bg-foreground text-background font-black shadow-md translate-x-1" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-3.5 h-3.5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                      <span className="tracking-[0.1em]">{item.name}</span>
                    </div>
                    <span className={`text-[8px] ${isActive ? "opacity-40" : "opacity-20"}`}>{item.id}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* AÇÃO RÁPIDA */}
        <div className="px-3 mb-6">
          <Link 
            href="/processos/novo" 
            className="flex items-center gap-3 px-4 py-3 rounded-sm bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 smooth-transition group shadow-sm"
          >
            <PlusCircle className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Novo Projeto</span>
              <span className="text-[8px] opacity-70 font-bold uppercase tracking-tighter mt-1">Cadastro Unificado</span>
            </div>
          </Link>
        </div>

        {/* GESTÃO */}
        <div>
          <h3 className="px-3 text-[9px] font-black text-muted-foreground/50 tracking-[0.3em] mb-4">GESTÃO</h3>
          <ul className="space-y-1.5">
            {SIDEBAR_ITEMS.gestao.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-sm transition-all duration-200 group ${
                      isActive 
                        ? "bg-foreground text-background font-black shadow-md translate-x-1" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-3.5 h-3.5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                      <span className="tracking-[0.1em]">{item.name}</span>
                    </div>
                    <span className={`text-[8px] ${isActive ? "opacity-40" : "opacity-20"}`}>{item.id}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* SISTEMA */}
        <div>
          <h3 className="px-3 text-[9px] font-black text-muted-foreground/50 tracking-[0.3em] mb-4">SISTEMA</h3>
          <ul className="space-y-1.5">
            {SIDEBAR_ITEMS.sistema.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-sm transition-all duration-200 group ${
                      isActive 
                        ? "bg-foreground text-background font-black shadow-md translate-x-1" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-3.5 h-3.5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                      <span className="tracking-[0.1em]">{item.name}</span>
                    </div>
                    <span className={`text-[8px] ${isActive ? "opacity-40" : "opacity-20"}`}>{item.id}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

      </nav>

      <div className="p-8 border-t border-border bg-muted/10">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full text-left flex flex-col gap-2 hover:bg-muted p-3 -ml-3 rounded-sm transition-all group"
        >
          <div className="flex justify-between items-center">
            <p className="text-[8px] text-muted-foreground font-black tracking-widest">USER_SESSION: 0882</p>
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-black text-[10px] text-foreground italic group-hover:text-primary transition-colors">HELENA TORRES</span>
            <Settings className="w-3 h-3 text-muted-foreground group-hover:rotate-90 transition-transform duration-500" />
          </div>
        </button>

        {isMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-4 bg-card border border-border shadow-2xl rounded-sm py-2 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="px-4 py-3 border-b border-border mb-2">
              <p className="text-[9px] font-black uppercase tracking-widest">Terminal Settings</p>
            </div>
            <Link href="/configuracoes" className="block px-4 py-2 text-[10px] font-bold text-foreground hover:bg-muted transition-colors">
              PREFERÊNCIAS
            </Link>
            <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-foreground hover:bg-muted transition-colors flex justify-between items-center">
              MODO ESCURO
              <div className="w-8 h-4 bg-foreground rounded-sm relative p-0.5">
                <div className="w-3 h-3 bg-background rounded-sm"></div>
              </div>
            </button>
            <div className="h-[1px] bg-border my-2 mx-2"></div>
            <button className="w-full text-left px-4 py-2 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors">
              LOGOUT_SESSION
            </button>
          </div>
        )}
      </div>
    </aside>

  );
}
