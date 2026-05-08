'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Users, Building2, DollarSign,
  FileText, Calendar, Settings, Bell, Plus, MapPin,
  Moon, Sun, Menu, X, ChevronRight, BarChart3, Zap,
  BarChart2, Search, Sparkles, Command
} from 'lucide-react'
import GlobalSearch from '@/components/GlobalSearch'

const NAV = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
      { href: '/processos', label: 'Processos',   icon: Briefcase, badge: '42' },
      { href: '/clientes',  label: 'Clientes',    icon: Users },
      { href: '/imoveis',   label: 'Imóveis',     icon: Building2 },
    ]
  },
  {
    section: 'Gestão & IA',
    items: [
      { href: '/financeiro',  label: 'Financeiro',     icon: DollarSign },
      { href: '/relatorios',  label: 'Relatórios',     icon: BarChart3 },
      { href: '/mapa',        label: 'Mapa Zonal',      icon: MapPin },
      { href: '/alertas',     label: 'Alertas',         icon: Bell },
      { href: '/ia',          label: 'Assistente IA',   icon: Sparkles },
    ]
  },
  {
    section: 'Ferramentas',
    items: [
      { href: '/agenda',      label: 'Agenda',         icon: Calendar },
      { href: '/documentos',  label: 'Documentos',     icon: FileText },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ]
  },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="sidebar-premium h-full flex flex-col overflow-hidden">
      {/* ── Logo ── */}
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(45,91,255,0.4)]">
          <Zap size={16} className="text-white fill-white/20" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-tight leading-none uppercase">Regulare Pro</span>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hub Imobiliário</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        {NAV.map((section) => (
          <div key={section.section} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 opacity-50">
              {section.section}
            </h3>
            {section.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-item-premium ${isActive(item.href) ? 'sidebar-item-active-premium' : ''}`}
              >
                <item.icon size={16} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded-md text-slate-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* ── User Profile ── */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
            JC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Jadson Castro</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Engenheiro Civil</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isFullPage = pathname === '/processos/novo'
  if (isFullPage) return <>{children}</>

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-64"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Glass Header */}
        <header className="glass h-16 flex items-center px-6 gap-4 border-b border-slate-200/60 z-30">
          <button className="lg:hidden p-2 -ml-2 text-slate-500" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          {/* Search CMD+K Pattern */}
          <div className="flex-1 max-w-xl relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <div className="w-full flex items-center gap-2 bg-slate-100/50 border border-slate-200/50 rounded-xl px-10 py-2.5 text-sm text-slate-400 cursor-pointer hover:bg-slate-100 transition-all">
              <span className="flex-1">Buscar processos, clientes...</span>
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-500 shadow-sm">
                <Command size={10} />
                <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* IA Button Sparkles Pattern */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all group">
              <Sparkles size={14} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              <span>IA Regularização</span>
            </button>

            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <Link href="/processos/novo" className="btn-premium">
              <Plus size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Novo Processo</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
