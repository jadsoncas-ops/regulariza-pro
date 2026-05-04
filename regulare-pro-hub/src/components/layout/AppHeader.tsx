"use client";
import { Search, Plus, Sparkles, Bell, Command, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 flex items-center justify-between px-8 shrink-0 z-50 shadow-sm"
    >
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <span className="text-xs font-medium text-muted-foreground">{subtitle}</span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Global Search / Command Palette Trigger */}
        <button className="hidden md:flex items-center justify-between gap-2 px-3 h-9 border border-border/60 bg-muted/30 hover:bg-muted/50 rounded-lg text-sm text-muted-foreground w-80 smooth-transition shadow-sm group">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 group-hover:text-foreground smooth-transition" />
            <span className="group-hover:text-foreground smooth-transition">Buscar processos, clientes...</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="flex items-center justify-center text-[10px] bg-background px-1.5 py-0.5 rounded border border-border shadow-sm font-medium">
              <Command className="h-3 w-3 mr-0.5" /> K
            </span>
          </div>
        </button>
        
        {/* Notifications */}
        <button className="h-9 w-9 flex items-center justify-center border border-border/60 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground smooth-transition relative shadow-sm">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background animate-pulse" />
        </button>

        {/* AI Assistant */}
        <Link
          href="/ia-regularizacao"
          className="flex items-center gap-2 h-9 px-4 border border-border/60 rounded-lg text-sm font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary smooth-transition shadow-sm group"
        >
          <Sparkles className="h-4 w-4 text-primary group-hover:animate-pulse" />
          IA Regularização
        </Link>
        
        {/* Primary Action */}
        <Link 
          href="/processos/novo"
          className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 smooth-transition shadow-[0_2px_10px_rgba(37,99,235,0.2)] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Novo Processo
          <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
        </Link>
      </div>
    </motion.header>
  );
}
