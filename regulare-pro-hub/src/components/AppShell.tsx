'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Users, Building2, DollarSign,
  FileText, Calendar, Settings, Bell, Plus,
  BarChart3, Search, Sparkles, Command, ChevronLeft,
  ChevronRight, ChevronDown, Zap
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
  const W = collapsed ? 60 : 228

  return (
    <div className="app-shell" style={{ '--sidebar-width': `${W}px` } as any}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="header-premium" style={{ gridColumn: '1 / -1' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0" style={{ width: W - 16 }}>
          <div className="w-7 h-7 rounded-lg bg-[hsl(231,100%,60%)] flex items-center justify-center shadow-md shrink-0">
            <Zap size={14} className="text-white fill-white/30" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-[12px] font-bold text-slate-900 leading-none tracking-tight whitespace-nowrap">Regulare Pro</span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">Command Center</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global search */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="cmd-bar w-full max-w-md group"
          >
            <Search size={13} className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            <span className="flex-1 text-left text-[12px] text-slate-400">Pesquisar em tudo...</span>
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-slate-400 shadow-sm mono">
              <Command size={9} />K
            </div>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button className="btn btn-ghost btn-sm gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100">
            <Sparkles size={12} />
            <span className="hidden md:inline font-semibold">IA Assist</span>
          </button>

          <Link href="/processos/novo" className="btn btn-primary btn-sm">
            <Plus size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">Lançar</span>
          </Link>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-lg transition-colors relative">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border border-white rounded-full" />
          </button>

          <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-100 cursor-pointer group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-950 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
              JC
            </div>
            <ChevronDown size={11} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </header>

      <div className="workspace-container">
        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <aside className="sidebar-premium" style={{ width: W }}>
          <div className="flex-1 py-3 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide">

            {/* Nav sections */}
            {!collapsed && (
              <p className="nav-section-label">Workspace</p>
            )}

            <div className="px-2 space-y-0.5">
              {NAV_MAIN.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`sidebar-item-premium ${isActive(item.href) ? 'sidebar-item-active-premium' : ''}`}
                >
                  <div className={`flex items-center justify-center shrink-0 ${collapsed ? 'w-full' : 'w-4'}`}>
                    <item.icon
                      size={collapsed ? 18 : 15}
                      strokeWidth={isActive(item.href) ? 2.5 : 2}
                      className={isActive(item.href) ? 'text-[hsl(231,100%,70%)]' : ''}
                    />
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-ellipsis overflow-hidden">{item.label}</span>
                      {item.badge && processCount > 0 && (
                        <span className="text-[9px] font-bold bg-[hsl(231,100%,60%)] text-white px-1.5 py-0.5 rounded-md">
                          {processCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>

            <div className={`my-3 ${collapsed ? 'mx-3' : 'mx-3'} h-px bg-white/[0.05]`} />

            {!collapsed && (
              <p className="nav-section-label">Ferramentas</p>
            )}

            <div className="px-2 space-y-0.5">
              {NAV_TOOLS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`sidebar-item-premium ${isActive(item.href) ? 'sidebar-item-active-premium' : ''}`}
                >
                  <div className={`flex items-center justify-center shrink-0 ${collapsed ? 'w-full' : 'w-4'}`}>
                    <item.icon
                      size={collapsed ? 18 : 15}
                      strokeWidth={isActive(item.href) ? 2.5 : 2}
                      className={isActive(item.href) ? 'text-[hsl(231,100%,70%)]' : ''}
                    />
                  </div>
                  {!collapsed && <span className="flex-1 text-ellipsis overflow-hidden">{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>

          {/* Collapse toggle */}
          <div className="p-2 border-t border-white/[0.05]">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="sidebar-item-premium w-full justify-center"
            >
              <div className={`flex items-center justify-center ${collapsed ? 'w-full' : 'w-4'}`}>
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </div>
              {!collapsed && <span className="flex-1 text-[11px]">Recolher</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────── */}
        <main className="workspace-content">
          <div className="scroll-container">
            <div className="max-w-[1600px] mx-auto animate-fade-up">
              {children}
            </div>
          </div>
        </main>
      </div>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}
