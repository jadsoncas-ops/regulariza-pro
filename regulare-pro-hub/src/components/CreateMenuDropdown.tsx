'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Users, Building2, Briefcase, DollarSign, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function CreateMenuDropdown() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions = [
    { label: 'Novo Cliente', icon: Users, href: '/clientes?novo=true' },
    { label: 'Novo Imóvel', icon: Building2, href: '/imoveis?novo=true' },
    { label: 'Novo Processo', icon: Briefcase, href: '/processos?novo=true' },
    { label: 'Nova Receita', icon: DollarSign, href: '/financeiro?novo=receita' },
    { label: 'Nova Despesa', icon: DollarSign, href: '/financeiro?novo=despesa' },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="btn-primary py-2 px-3 text-sm gap-2 flex items-center font-bold"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Novo</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-down">
          <div className="p-1">
            {actions.map((action, i) => (
              <Link 
                key={i} 
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <action.icon size={16} className="text-slate-500" />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
