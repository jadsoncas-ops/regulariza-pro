'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Users, Building2, DollarSign,
  FileText, Calendar, Settings, Bell, Plus, MapPin,
  Moon, Sun, Menu, X, ChevronRight, BarChart3, Zap,
  BarChart2, Search, Sparkles, Command, ChevronLeft,
  ChevronDown, HelpCircle, User
} from 'lucide-react'
import GlobalSearch from '@/components/GlobalSearch'

const NAV = [
  { href: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/processos', label: 'Processos',   icon: Briefcase, badge: '42' },
  { href: '/clientes',  label: 'Clientes',    icon: Users },
  { href: '/imoveis',   label: 'Imóveis',     icon: Building2 },
  { href: '/financeiro',  label: 'Financeiro', icon: DollarSign },
  { href: '/relatorios',  label: 'Relatórios', icon: BarChart3 },
  { href: '/agenda',      label: 'Agenda',     icon: Calendar },
  { href: '/documentos',  label: 'Documentos', icon: FileText },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="app-shell bg-[#FDFDFD]">
      {/* ── HEADER ── */}
      <header className="header-premium">
        <div className="flex items-center gap-4 w-[220px] shrink-0">
          <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center shadow-lg border border-white/10 shrink-0">
            <Zap size={16} className="text-white fill-white/20" />
          </div>
          <AnimatePresence mode="wait">
            {expanded && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">Regulare Pro</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">SaaS Platform</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Search CMD+K */}
        <div className="flex-1 flex justify-center">
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="w-full max-w-md flex items-center gap-2 bg-slate-100 border border-slate-200/60 rounded-md px-3 py-1.5 text-slate-400 cursor-pointer hover:bg-slate-200/50 hover:border-slate-300 transition-all group"
          >
            <Search size={14} className="group-hover:text-slate-600 transition-colors" />
            <span className="flex-1 text-[11px] font-medium">Pesquisar em tudo...</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-black text-slate-400 shadow-sm font-mono">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-all group">
            <Sparkles size={12} className="group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline">IA Assist</span>
          </button>

          <Link href="/processos/novo" className="btn-premium">
            <Plus size={14} strokeWidth={3} />
            <span className="hidden sm:inline">Lançar</span>
          </Link>

          <div className="w-px h-4 bg-slate-200 mx-1" />

          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-md transition-all relative">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 border border-white rounded-full" />
          </button>

          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-100">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-sm">
              JC
            </div>
            <ChevronDown size={12} className="text-slate-400" />
          </div>
        </div>
      </header>

      <div className="workspace-container">
        {/* ── SIDEBAR ── */}
        <aside 
          className="sidebar-premium shrink-0"
          style={{ width: expanded ? 220 : 70 }}
        >
          <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-2.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item-premium group ${isActive(item.href) ? 'sidebar-item-active-premium' : ''}`}
                title={expanded ? '' : item.label}
              >
                <div className={`flex items-center justify-center transition-all ${expanded ? 'w-5' : 'w-full'}`}>
                  <item.icon size={expanded ? 16 : 18} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                </div>
                {expanded && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {item.label}
                  </motion.span>
                )}
                {expanded && item.badge && (
                  <span className="text-[9px] font-black bg-white/10 px-1.5 py-0.5 rounded text-slate-500">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/[0.05] flex flex-col gap-1">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-500 hover:bg-white/[0.05] hover:text-white transition-all w-full text-left"
            >
              <div className={`flex items-center justify-center transition-all ${expanded ? 'w-4' : 'w-full'}`}>
                {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </div>
              {expanded && <span className="text-[11px] font-bold uppercase tracking-widest">Recolher</span>}
            </button>
          </div>
        </aside>

        {/* ── WORKSPACE ── */}
        <main className="workspace-content">
          <div className="scroll-container">
            <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}
