'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Briefcase, Users, DollarSign,
  FileText, Calendar, Settings, Bell, Plus,
  MapPin, Moon, Sun, Menu, X, ChevronRight, Zap
} from 'lucide-react'
import GlobalSearch from '@/components/GlobalSearch'

const NAV = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard',        icon: LayoutDashboard },
      { href: '/processos', label: 'Processos',        icon: Briefcase },
      { href: '/clientes',  label: 'Clientes',         icon: Users },
    ]
  },
  {
    section: 'Gestão',
    items: [
      { href: '/financeiro',  label: 'Financeiro',     icon: DollarSign },
      { href: '/documentos',  label: 'Documentos',     icon: FileText },
      { href: '/agenda',      label: 'Agenda',         icon: Calendar },
      { href: '/mapa',        label: 'Mapa',           icon: MapPin },
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
    <div className="ds-sidebar h-full flex flex-col">
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}>
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[13px] font-bold leading-none" style={{ color: '#E6EDF3' }}>RegularizaPro</p>
            <p className="text-[10px] mt-0.5 font-medium" style={{ color: '#484F58' }}>Hub Imobiliário</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md transition-colors" style={{ color: '#484F58' }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((section, si) => (
          <div key={section.section} className={si > 0 ? 'mt-1' : ''}>
            <span className="ds-nav-label">{section.section}</span>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={isActive(item.href) ? 'ds-nav-item-active flex' : 'ds-nav-item'}
                >
                  <item.icon className="w-4 h-4 shrink-0" strokeWidth={isActive(item.href) ? 2.5 : 1.75} />
                  <span>{item.label}</span>
                  {isActive(item.href) && (
                    <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Profile ── */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-[8px] cursor-pointer transition-colors"
          style={{ color: '#8B949E' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
            JC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: '#C9D1D9' }}>Jadson Castro</p>
            <p className="text-[10px] truncate" style={{ color: '#484F58' }}>Engenheiro Civil</p>
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: dark ? '#0A0C10' : '#F7F8FA' }}>

      {/* Desktop Sidebar — dark, narrow, 224px */}
      <aside className="hidden lg:flex lg:flex-col shrink-0" style={{ width: '224px' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10" style={{ width: '224px' }}>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">

        {/* ── Topbar ── */}
        <header className="ds-topbar shrink-0 z-10" style={{ height: '56px' }}>
          <div className="flex items-center h-full px-5 gap-4">

            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg transition-colors"
              style={{ color: '#6B7280' }}>
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <div className="flex-1 max-w-[400px]">
              <GlobalSearch />
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-1">
              {/* Dark toggle */}
              <button
                onClick={toggleDark}
                className="p-2 rounded-[8px] transition-colors"
                style={{ color: '#9CA3AF' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
                title={dark ? 'Modo claro' : 'Modo escuro'}
              >
                {dark ? <Sun className="w-4 h-4" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
              </button>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-[8px] transition-colors"
                style={{ color: '#9CA3AF' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
              >
                <Bell className="w-4 h-4" strokeWidth={1.75} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: '#EF4444' }} />
              </button>

              {/* Divider */}
              <div className="w-px h-5 mx-1" style={{ backgroundColor: '#E4E7EC' }} />

              {/* Primary CTA */}
              <Link
                href="/processos/novo"
                className="ds-btn-primary"
                style={{ fontSize: '12px', gap: '6px', padding: '7px 12px' }}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                Novo Processo
              </Link>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-6 py-8 lg:px-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
