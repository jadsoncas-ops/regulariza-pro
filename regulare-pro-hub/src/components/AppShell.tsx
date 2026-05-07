'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Briefcase, Users, Building2, DollarSign,
  FileText, Calendar, Settings, Bell, Plus, MapPin,
  Moon, Sun, Menu, X, ChevronRight, BarChart3, Zap,
  BarChart2, Search
} from 'lucide-react'
import GlobalSearch from '@/components/GlobalSearch'

const NAV = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
      { href: '/processos', label: 'Processos',   icon: Briefcase },
      { href: '/clientes',  label: 'Clientes',    icon: Users },
      { href: '/imoveis',   label: 'Imóveis',     icon: Building2 },
    ]
  },
  {
    section: 'Gestão',
    items: [
      { href: '/financeiro',  label: 'Financeiro',     icon: DollarSign },
      { href: '/agenda',      label: 'Agenda',         icon: Calendar },
      { href: '/documentos',  label: 'Documentos',     icon: FileText },
      { href: '/mapa',        label: 'Mapa',           icon: MapPin },
      { href: '/relatorios',  label: 'Relatórios',     icon: BarChart3 },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ]
  },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="bg-[#071026] h-full flex flex-col border-r border-white/5 shadow-2xl relative z-10">
      
      {/* Glow Effect Top Left */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 blur-[60px] pointer-events-none" />

      {/* ── Logo ── */}
      <div className="px-6 py-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
            <Zap size={18} className="text-white fill-white/20" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[14px] font-black text-white tracking-tight leading-none uppercase">
              Regulariza<span className="text-blue-500">Pro</span>
            </div>
            <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
              Hub Imobiliário
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
        {NAV.map((section) => (
          <div key={section.section} className="space-y-2">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                      active 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} strokeWidth={active ? 2.5 : 1.5} className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={14} className="opacity-50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User ── */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[12px] font-bold text-white shadow-inner">
            JC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-white tracking-tight truncate group-hover:text-blue-400 transition-colors">
              Jadson Castro
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
              Diretor Técnico
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true'
    setDark(saved)
    document.body.classList.toggle('dark', saved)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.body.classList.toggle('dark', next)
    localStorage.setItem('darkMode', String(next))
  }

  const isFullPage = pathname === '/processos/novo'
  if (isFullPage) return <>{children}</>

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FB]">

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[240px] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)} />
          <div className="relative w-[280px] h-full shadow-2xl animate-fade-up">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* ── Topbar ── */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-6 gap-6 sticky top-0 z-20">

          {/* Mobile menu toggle */}
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          {/* Global search */}
          <div className="flex-1 max-w-lg relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <GlobalSearch />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggleDark} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-2" />

            <Link href="/processos/novo" className="btn-primary py-2 px-4 text-xs">
              <Plus size={16} strokeWidth={3} />
              <span className="hidden sm:inline">Novo Processo</span>
            </Link>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto bg-[#F4F7FB] scroll-smooth">
          <div className="max-w-[1600px] mx-auto p-8 lg:p-10">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
