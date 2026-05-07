'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Briefcase, Users, Building2, DollarSign,
  FileText, Calendar, Settings, Bell, Plus, MapPin,
  Moon, Sun, Menu, X, ChevronRight, BarChart3, Zap,
  Search, LogOut, ChevronDown
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
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="bg-slate-900 h-full flex flex-col border-r border-slate-800 shadow-xl">
      
      {/* ── Logo ── */}
      <div className="px-5 py-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Zap size={16} className="text-white fill-white/20" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[14px] font-black text-white tracking-tighter leading-none uppercase">
              Regulariza<span className="text-blue-500">Pro</span>
            </div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        {NAV.map((section) => (
          <div key={section.section} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3">
              {section.section}
            </h3>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      active 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <item.icon size={16} strokeWidth={active ? 2.5 : 2} className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User & Config ── */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <Link 
          href="/configuracoes" 
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
            isActive('/configuracoes') ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Settings size={16} strokeWidth={2} />
          <span>Configurações</span>
        </Link>
        
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-all group mt-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            JC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-white tracking-tight truncate">
              Jadson Castro
            </div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">
              Diretor
            </div>
          </div>
          <ChevronDown size={12} className="text-slate-600 group-hover:text-slate-400" />
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
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[200px] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)} />
          <div className="relative w-[260px] h-full shadow-2xl animate-fade-up">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">

        {/* ── Topbar ── */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-20 shadow-sm">

          {/* Mobile menu toggle */}
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>

          {/* Global search */}
          <div className="flex-1 max-w-md">
            <GlobalSearch />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={toggleDark} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-2" />

            <Link href="/processos/novo" className="btn-primary py-1.5 px-3 text-xs gap-1.5">
              <Plus size={14} strokeWidth={3} />
              <span>Novo</span>
            </Link>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1400px] mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
