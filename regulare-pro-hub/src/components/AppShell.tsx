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
    <div className="bg-slate-950/80 backdrop-blur-xl h-full flex flex-col border-r border-white/5 shadow-2xl relative z-50">
      
      {/* ── Logo ── */}
      <div className="px-6 py-8 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-all duration-300">
            <Zap size={18} className="text-white fill-white/20" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-black text-white tracking-tighter leading-none uppercase">
              Regulariza<span className="text-blue-500">Pro</span>
            </div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Enterprise</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
        {NAV.map((section) => (
          <div key={section.section} className="space-y-2">
            <h3 className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] mb-4">
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
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                      active 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    <item.icon size={18} strokeWidth={active ? 2 : 1.5} className={`${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1">{item.label}</span>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User & Config ── */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-slate-950/40">
        <Link 
          href="/configuracoes" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
            isActive('/configuracoes') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
          }`}
        >
          <Settings size={18} strokeWidth={1.5} />
          <span>Configurações</span>
        </Link>
        
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group border border-transparent hover:border-white/5 mt-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[12px] font-black text-white shrink-0 shadow-lg">
            JC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-white tracking-tight truncate">
              Jadson Castro
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Diretor Sênior
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
      </div>
    </div>
  )
}

import RightPanel from '@/components/RightPanel';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const pathname = usePathname()

  const isFullPage = pathname === '/processos/novo'
  if (isFullPage) return <div className="bg-slate-950 min-h-screen">{children}</div>

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[240px] flex-shrink-0 relative z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)} />
          <div className="relative w-[280px] h-full shadow-2xl animate-fade-up">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />

        {/* ── Topbar ── */}
        <header className="h-16 flex-shrink-0 bg-slate-950/40 backdrop-blur-md border-b border-white/5 flex items-center px-8 gap-6 sticky top-0 z-20">

          {/* Mobile menu toggle */}
          <button className="lg:hidden p-2 text-slate-400 hover:bg-white/5 rounded-xl transition-all" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          {/* Global search */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                placeholder="Buscar em todo o ecossistema..."
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all placeholder:text-slate-600 text-white"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 ml-auto">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all relative border border-transparent hover:border-white/5">
              <Bell size={18} strokeWidth={1.5} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950" />
            </button>

            <div className="w-px h-6 bg-white/5 mx-2" />

            {/* Contextual panel toggle */}
            <button onClick={() => setRightOpen(true)} className="btn-outline py-2.5 px-4 text-xs gap-2 font-black uppercase tracking-widest flex items-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>
              <span>Info</span>
            </button>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative z-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
            {children}
          </div>
        </main>

        {/* Right contextual panel */}
        <RightPanel isOpen={rightOpen} onClose={() => setRightOpen(false)} />

      </div>
    </div>
  )
}
