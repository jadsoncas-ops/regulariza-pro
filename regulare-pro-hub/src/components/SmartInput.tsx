'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Plus, ChevronDown } from 'lucide-react'

interface SmartInputProps {
  campo: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  label?: string
}

export function SmartInput({ campo, value, onChange, placeholder, className = '', label }: SmartInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Fetch suggestions when value changes
  useEffect(() => {
    clearTimeout(debounce.current)
    if (value.length < 1) { setSuggestions([]); return }

    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/sugestoes?campo=${campo}&q=${encodeURIComponent(value)}`)
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data.filter((s: string) => s !== value) : [])
        setOpen(true)
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }, 250)
  }, [value, campo])

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (s: string) => { onChange(s); setOpen(false) }

  const isNewValue = value.length > 1 && !suggestions.includes(value)

  return (
    <div ref={ref} className="relative">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => value.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={`input-field pr-8 ${className}`}
          autoComplete="off"
        />
        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (suggestions.length > 0 || isNewValue) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-fade-up">
          {/* Sugestões existentes */}
          {suggestions.slice(0, 8).map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={() => select(s)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
            >
              <Check className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              {s}
            </button>
          ))}

          {/* Salvar novo valor */}
          {isNewValue && (
            <button
              type="button"
              onMouseDown={() => select(value)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100 font-medium"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Usar <strong className="mx-1">&quot;{value}&quot;</strong> como nova opção
            </button>
          )}
        </div>
      )}
    </div>
  )
}
