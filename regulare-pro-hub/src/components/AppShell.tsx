'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  DollarSign,
  FileText,
  Calendar,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  Zap,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
      { href: '/processos',  label: 'Processos',  icon: Briefcase,  badge: true },
      { href: '/clientes',   label: 'Clientes',   icon: Users },
      { href: '/imoveis',    label: 'Imóveis',    icon: Building2 },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/financeiro',  label: 'Financeiro',  icon: DollarSign },
      { href: '/documentos',  label: 'Documentos',  icon: FileText },
      { href: '/agenda',      label: 'Agenda',      icon: Calendar },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
      { href: '/admin',         label: 'Admin',          icon: Zap },
    ],
  },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* LOGO */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-4.5 h-4.5 text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">RegularizaPro</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Hub Imobiliário</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="sidebar-section-label">{section.label}</p>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={isActive(item.href) ? 'sidebar-item-active mb-0.5 block' : 'sidebar-item mb-0.5 block'}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* USER */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-blue-600">JC</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">Jadson Castro</p>
            <p className="text-[11px] text-slate-400 truncate">Engenheiro Civil</p>
          </div>
          <LogOut className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
        </div>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Hide shell on wizard pages
  const isFullPage = pathname === '/processos/novo'

  if (isFullPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 shrink-0">
        <Sidebar />
      </div>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-60">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* SEARCH */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Buscar processos, clientes, imóveis..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* NOTIFICATION */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* CTA */}
            <Link
              href="/processos/novo"
              className="btn-primary text-xs py-2 px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Processo
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
