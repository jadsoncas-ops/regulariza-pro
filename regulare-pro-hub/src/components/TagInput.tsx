'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { X, Plus, Hash } from 'lucide-react'

// Cores para tags (cycling)
const TAG_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200' },
  { bg: 'bg-purple-100', text: 'text-purple-700',  border: 'border-purple-200' },
  { bg: 'bg-emerald-100',text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-amber-100',  text: 'text-amber-700',   border: 'border-amber-200' },
  { bg: 'bg-rose-100',   text: 'text-rose-700',    border: 'border-rose-200' },
  { bg: 'bg-cyan-100',   text: 'text-cyan-700',    border: 'border-cyan-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700',  border: 'border-indigo-200' },
  { bg: 'bg-orange-100', text: 'text-orange-700',  border: 'border-orange-200' },
]

export function tagColor(tag: string) {
  let hash = 0
  for (const c of tag) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

// Chip visual de tag
export function TagChip({ tag, onRemove, size = 'md' }: { tag: string; onRemove?: () => void; size?: 'sm' | 'md' }) {
  const colors = tagColor(tag)
  const label = tag.startsWith('#') ? tag : `#${tag}`
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    }`}>
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:opacity-70 transition-opacity ml-0.5">
          <X className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        </button>
      )}
    </span>
  )
}

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Adicionar tag...' }: TagInputProps) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSug, setShowSug] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    clearTimeout(debounce.current)
    if (!input.trim()) { setSuggestions([]); return }
    debounce.current = setTimeout(async () => {
      const q = input.replace(/^#/, '')
      const res = await fetch(`/api/sugestoes?campo=tags&q=${encodeURIComponent(q)}`).catch(() => null)
      if (res?.ok) {
        const data = await res.json()
        setSuggestions(data.filter((t: string) => !tags.includes(t)))
        setShowSug(true)
      }
    }, 250)
  }, [input, tags])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSug(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addTag = (raw: string) => {
    const tag = (raw.startsWith('#') ? raw : `#${raw}`).toLowerCase().replace(/\s+/g, '-')
    if (!tag || tag === '#' || tags.includes(tag)) return
    onChange([...tags, tag])
    setInput('')
    setSuggestions([])
    setShowSug(false)
  }

  const removeTag = (tag: string) => onChange(tags.filter(t => t !== tag))

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && input.trim()) {
      e.preventDefault()
      addTag(input.trim())
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="input-field min-h-[42px] flex flex-wrap gap-1.5 cursor-text p-2"
        onClick={() => (ref.current?.querySelector('input') as HTMLInputElement)?.focus()}>
        {tags.map(tag => (
          <TagChip key={tag} tag={tag} onRemove={() => removeTag(tag)} />
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => input && setShowSug(true)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
        />
      </div>

      {showSug && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-fade-up">
          {suggestions.slice(0, 8).map(s => (
            <button key={s} type="button" onMouseDown={() => addTag(s)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 transition-colors text-left">
              <TagChip tag={s} size="sm" />
            </button>
          ))}
          {input.replace('#', '').length > 0 && !suggestions.includes(`#${input.replace('#', '')}`) && (
            <button type="button" onMouseDown={() => addTag(input)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-slate-100 font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Criar tag <strong className="ml-1">#{input.replace('#', '')}</strong>
            </button>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-400 mt-1.5">
        Pressione <kbd className="bg-slate-100 px-1 rounded text-[9px]">Enter</kbd>, vírgula ou espaço para adicionar
      </p>
    </div>
  )
}
