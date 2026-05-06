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
    <div className="sidebar h-full flex flex-col" style={{ width: 220 }}>

      {/* ── Logo ── */}
      <div style={{
        padding: '16px 14px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
            flexShrink: 0,
          }}>
            <Zap size={15} color="#fff" strokeWidth={2.5} fill="rgba(255,255,255,0.3)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E5E7EB', letterSpacing: '-0.02em', lineHeight: 1 }}>
              RegularizaPro
            </div>
            <div style={{ fontSize: 10, color: 'rgba(107,114,128,0.7)', marginTop: 2, letterSpacing: '0.02em' }}>
              Hub Imobiliário
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ color: '#4B5563', padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px', scrollbarWidth: 'none' }}>
        {NAV.map((section, si) => (
          <div key={section.section}>
            <span className="sidebar-section-label"
              style={{ marginTop: si === 0 ? 12 : undefined }}>
              {section.section}
            </span>
            {section.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={isActive(item.href) ? 'sidebar-item-active' : 'sidebar-item'}
                style={{ display: 'flex' }}
              >
                <item.icon size={15} strokeWidth={isActive(item.href) ? 2.2 : 1.75} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive(item.href) && (
                  <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* ── User ── */}
      <div style={{
        padding: '10px 8px',
        borderTop: '1px solid rgba(255,255,255,0.055)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
          transition: 'background 0.12s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            JC
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#D1D5DB', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Jadson Castro
            </div>
            <div style={{ fontSize: 10, color: '#4B5563', marginTop: 1 }}>
              Engenheiro Civil
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
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      backgroundColor: dark ? '#080A0F' : '#F5F7FB',
    }}>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block" style={{ width: 220, flexShrink: 0 }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'relative', zIndex: 10, width: 220 }}>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Topbar ── */}
        <header className="topbar" style={{ flexShrink: 0 }}>

          {/* Mobile menu toggle */}
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}
            style={{ padding: 6, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', marginRight: 4 }}>
            <Menu size={18} />
          </button>

          {/* Global search */}
          <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: '#9CA3AF', pointerEvents: 'none',
            }} />
            <GlobalSearch />
          </div>

          {/* Right side actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>

            {/* Dark mode */}
            <button onClick={toggleDark}
              style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer',
                color: '#9CA3AF', transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
            >
              {dark ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
            </button>

            {/* Notifications */}
            <button style={{
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer',
              color: '#9CA3AF', position: 'relative',
              transition: 'background 0.12s, color 0.12s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
            >
              <Bell size={15} strokeWidth={1.75} />
              <span className="animate-pulse-dot" style={{
                position: 'absolute', top: 8, right: 8,
                width: 6, height: 6, background: '#EF4444', borderRadius: '50%',
                border: '1.5px solid white',
              }} />
            </button>

            <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

            {/* CTA */}
            <Link href="/processos/novo" className="btn-primary" style={{ fontSize: 12, padding: '7px 13px' }}>
              <Plus size={14} strokeWidth={2.5} />
              Novo Processo
            </Link>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 28px' }}>
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
