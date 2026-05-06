import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { 
  LayoutDashboard, 
  Layers, 
  FolderLock, 
  Clock, 
  Users, 
  Wallet, 
  Settings,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  Zap
} from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Regulariza Pro | Advanced Property Hub",
  description: "Futuristic SaaS for Real Estate Engineering Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} overflow-hidden bg-background`}>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          
          {/* SIDEBAR NEON */}
          <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl flex flex-col h-full z-20">
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <Zap className="w-6 h-6 text-primary fill-primary/20" />
              </div>
              <h1 className="text-lg font-black tracking-tighter text-white">
                REGULARIZA<span className="text-primary font-light">PRO</span>
              </h1>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-6">
              <Link href="/dashboard" className="sidebar-item-active">
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
              <Link href="/projetos" className="sidebar-item">
                <Layers className="w-5 h-5" /> Projetos
              </Link>
              <Link href="/vault" className="sidebar-item">
                <FolderLock className="w-5 h-5" /> Vault (Docs)
              </Link>
              <Link href="/prazos" className="sidebar-item">
                <Clock className="w-5 h-5" /> Timeline
              </Link>
              <Link href="/clientes" className="sidebar-item">
                <Users className="w-5 h-5" /> Clientes
              </Link>
              <Link href="/financeiro" className="sidebar-item">
                <Wallet className="w-5 h-5" /> Financeiro
              </Link>
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
              <Link href="/settings" className="sidebar-item !py-2 !text-xs opacity-70 hover:opacity-100">
                <Settings className="w-4 h-4" /> Configurações
              </Link>
              <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">Jadson Castro</p>
                  <p className="text-[10px] text-muted-foreground truncate">Admin Pro</p>
                </div>
                <LogOut className="w-4 h-4 text-muted-foreground hover:text-red-400 cursor-pointer transition-colors" />
              </div>
            </div>
          </aside>

          {/* MAIN STAGE */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* TOP BAR */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-10">
              <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-4 py-2 rounded-xl w-96">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  placeholder="Buscar projeto, cliente ou documento..." 
                  className="bg-transparent text-sm outline-none w-full text-slate-300 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="relative p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                  <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-warning rounded-full border-2 border-background shadow-[0_0_8px_rgba(255,165,0,0.5)]" />
                </div>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:scale-105 transition-all">
                  Novo Projeto <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth p-8">
              {children}
            </div>

          </main>

        </div>
      </body>
    </html>
  );
}
