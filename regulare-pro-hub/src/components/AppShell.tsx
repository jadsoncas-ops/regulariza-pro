'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Briefcase, Users, Building2, DollarSign,
  FileText, Calendar, Settings, Bell, Search, Plus,
  Zap, LogOut, Menu, X, Moon, Sun, MapPin
} from 'lucide-react'

const NAV = [
  { section: 'Principal', items: [
    { href: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/processos', label: 'Processos',   icon: Briefcase },
    { href: '/clientes',  label: 'Clientes',    icon: Users },
    { href: '/imoveis',   label: 'Imóveis',     icon: Building2 },
  ]},
  { section: 'Gestão', items: [
    { href: '/financeiro',  label: 'Financeiro',       icon: DollarSign },
    { href: '/documentos',  label: 'Documentos',       icon: FileText },
    { href: '/agenda',      label: 'Agenda',           icon: Calendar },
    { href: '/mapa',        label: 'Mapa de Projetos', icon: MapPin },
  ]},
  { section: 'Sistema', items: [
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
    { href: '/admin',         label: 'Admin / Reset', icon: Zap },
  ]},
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="sidebar h-full overflow-hidden flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">RegularizaPro</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Hub Imobiliário</p>
          </div>
        </div>
        {onClose && <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(section => (
          <div key={section.section}>
            <span className="sidebar-section-label">{section.section}</span>
            {section.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`${isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item'} mb-0.5 block`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-blue-600">JC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">Jadson Castro</p>
            <p className="text-[10px] text-slate-400">Engenheiro Civil</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-400 transition-colors" />
        </div>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const pathname = usePathname()

  // Load dark mode preference
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: dark ? '#0f172a' : '#f8fafc' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-60 z-10"><SidebarContent onClose={() => setMobileOpen(false)} /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        <header className="topbar h-14 flex items-center px-6 gap-4 shrink-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-slate-500">
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Buscar processos, clientes..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={dark ? 'Modo claro' : 'Modo escuro'}
            >
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* CTA */}
            <Link href="/processos/novo" className="btn-primary py-2 px-3 text-xs">
              <Plus className="w-3.5 h-3.5" /> Novo Processo
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
