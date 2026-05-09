'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Users, Building2, DollarSign,
  FileText, Calendar, Settings, Bell, Plus,
  BarChart3, Search, Sparkles, Command, ChevronLeft,
  ChevronRight, Zap
} from 'lucide-react'
import GlobalSearch from '@/components/GlobalSearch'

const NAV_MAIN = [
  { href: '/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/processos',   label: 'Processos',      icon: Briefcase,  badge: true },
  { href: '/clientes',    label: 'Clientes',       icon: Users },
  { href: '/imoveis',     label: 'Imóveis',        icon: Building2 },
  { href: '/financeiro',  label: 'Financeiro',     icon: DollarSign },
]
const NAV_TOOLS = [
  { href: '/relatorios',    label: 'Relatórios',     icon: BarChart3 },
  { href: '/agenda',        label: 'Agenda',          icon: Calendar },
  { href: '/documentos',    label: 'Documentos',      icon: FileText },
  { href: '/configuracoes', label: 'Configurações',   icon: Settings },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [processCount, setProcessCount] = useState(0)
  const pathname = usePathname()

  /* CMD+K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(true) }
      if (e.key === 'Escape') setIsSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* active process count */
  useEffect(() => {
    fetch('/api/processos').then(r => r.json())
      .then(d => { if (Array.isArray(d)) setProcessCount(d.filter((p: any) => p.status !== 'finalizado').length) })
      .catch(() => {})
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const W = collapsed ? 70 : 220

  return (
    <div className="flex h-screen w-full bg-slate-50/50 overflow-hidden font-sans">

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <motion.aside 
        initial={false}
        animate={{ width: W }}
        className="relative bg-white border-r border-slate-200/60 flex flex-col z-50 shrink-0"
      >
        {/* Top Header / Logo Area */}
        <div className="h-[64px] flex items-center px-5 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg shadow-slate-900/10 shrink-0">
            <Zap size={16} className="text-white fill-white/20" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 flex flex-col overflow-hidden"
              >
                <span className="text-sm font-bold text-slate-900 leading-tight tracking-tight whitespace-nowrap">Regulare Pro</span>
                <span className="text-[9px] font-bold text-[hsl(231,100%,60%)] uppercase tracking-[0.2em] whitespace-nowrap">Command Center</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-8 scrollbar-hide">
          
          {/* Main Navigation */}
          <div>
            {!collapsed && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Workspace</p>}
            <nav className="space-y-1">
              {NAV_MAIN.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${
                    isActive(item.href) 
                      ? 'bg-[hsl(231,100%,60%)] text-white shadow-lg shadow-blue-500/20' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={18} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                  {!collapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                  {item.badge && !collapsed && processCount > 0 && (
                    <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-md">
                      {processCount}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-14 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Tools Navigation */}
          <div>
            {!collapsed && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Intelligence</p>}
            <nav className="space-y-1">
              {NAV_TOOLS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${
                    isActive(item.href) 
                      ? 'bg-slate-100 text-slate-900' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={18} strokeWidth={2} />
                  {!collapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-14 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200/50"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative bg-[url('/grid.svg')] bg-repeat">
        
        {/* Global Header */}
        <header className="h-[64px] bg-white border-b border-slate-200/60 px-6 flex items-center justify-between z-40">
          <div className="flex-1 max-w-xl">
             <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 w-full bg-slate-50 border border-slate-200 h-10 px-4 rounded-xl text-slate-400 hover:border-slate-300 hover:bg-slate-100/50 transition-all group"
            >
              <Search size={14} className="group-hover:text-slate-600" />
              <span className="text-xs">Quick Search Project or Task...</span>
              <div className="ml-auto flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-[10px] font-black text-slate-400 font-mono">
                <Command size={10} /> K
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 ml-6">
            <button className="flex items-center gap-2 px-4 h-10 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100">
               <Sparkles size={14} className="fill-indigo-600/20" /> IA ASSIST
            </button>
            <div className="w-[1px] h-6 bg-slate-200 mx-1" />
            <div className="flex items-center gap-3 pl-2">
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 relative border border-slate-200/50">
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-[hsl(231,100%,60%)] flex items-center justify-center text-white font-black text-xs shadow-md border border-white/20">
                 JC
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <div className="flex-1 overflow-hidden h-[calc(100vh-64px)]">
           <div className="h-full w-full overflow-y-auto bg-slate-50/30 p-6 md:p-8 scrollbar-premium">
              <div className="max-w-[1600px] mx-auto animate-fade-up">
                {children}
              </div>
           </div>
        </div>

      </main>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}
