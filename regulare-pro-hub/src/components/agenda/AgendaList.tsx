'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, PlusCircle, Calendar, CheckSquare, 
  MapPin, Clock, ArrowUpRight, X, Edit, Trash2,
  CalendarDays, CheckCircle2, ChevronLeft, ChevronRight,
  MoreHorizontal, Users, Filter, Bell, ListTodo
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Evento {
  id: string; titulo: string; descricao: string | null; tipo: string;
  processoId: string | null; data_inicio: string; data_fim: string | null;
  local: string | null; responsavel: string | null; status: string;
  processo: { id: string, cliente: { nome: string } } | null;
}

interface Tarefa {
  id: string; titulo: string; descricao: string | null; processoId: string | null;
  data: string; hora: string | null; responsavel: string | null; status: string;
  processo: { id: string, cliente: { nome: string } } | null;
}

interface AgendaListProps {
  initialEventos: Evento[]
  initialTarefas: Tarefa[]
  processos: { id: string, tipo_regularizacao: string, cliente: { nome: string } }[]
}

const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const HOURS = Array.from({ length: 14 }).map((_, i) => i + 7) // 07:00 to 20:00

export default function AgendaList({ initialEventos, initialTarefas, processos }: AgendaListProps) {
  const router = useRouter()
  const [view, setView] = useState<'week' | 'list'>('week')
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalType, setModalType] = useState<'evento' | 'tarefa'>('evento')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  // Date Management
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekDays = useMemo(() => {
    const start = new Date(currentDate)
    start.setDate(currentDate.getDate() - currentDate.getDay())
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [currentDate])

  const openDrawer = (type: 'evento' | 'tarefa', item: any = null) => {
    setModalType(type)
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const getEventPosition = (evento: Evento) => {
    const start = new Date(evento.data_inicio)
    const h = start.getHours()
    const m = start.getMinutes()
    const top = (h - 7) * 80 + (m / 60) * 80
    return { top: `${top}px`, height: '70px' }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const endpoint = modalType === 'evento' ? '/api/eventos' : '/api/tarefas'
      const url = selectedItem ? `${endpoint}/${selectedItem.id}` : endpoint
      const method = selectedItem ? 'PATCH' : 'POST'
      let payload: any = { ...data }
      
      if (modalType === 'evento') {
        payload.data_inicio = new Date(data.data_inicio as string).toISOString()
        payload.data_fim = data.data_fim ? new Date(data.data_fim as string).toISOString() : null
      } else {
        payload.data = new Date(data.data as string).toISOString()
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setDrawerOpen(false)
        router.refresh()
        setTimeout(() => window.location.reload(), 300)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      
      {/* ── LEFT SIDE: CALENDAR GRID ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sub Header / Navigation */}
        <div className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
               <button onClick={() => setView('week')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Semana</button>
               <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Lista</button>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-all"><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">Hoje</button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-all"><ChevronRight size={16} /></button>
               </div>
               <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
               </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  placeholder="Pesquisar agenda..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  value={search} onChange={e => setSearch(e.target.value)}
                />
             </div>
             <button onClick={() => openDrawer('evento')} className="btn-premium px-5 py-2">
                <PlusCircle size={16} /> EVENTO
             </button>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="flex-1 overflow-y-auto bg-white relative scrollbar-hide">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] min-w-[1000px] h-full border-b border-slate-100">
            {/* Header: Days */}
            <div className="h-14 border-b border-slate-100 sticky top-0 bg-white z-10" />
            {weekDays.map((d, i) => (
              <div key={i} className="h-14 border-b border-slate-100 border-l border-slate-50 flex flex-col items-center justify-center sticky top-0 bg-white z-10">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{DAYS[i]}</span>
                <span className={`text-lg font-bold mt-1 leading-none ${d.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-slate-900'}`}>{d.getDate()}</span>
              </div>
            ))}

            {/* Grid Body */}
            <div className="contents relative">
              {HOURS.map(h => (
                <div key={h} className="contents">
                  <div className="h-20 border-b border-slate-50 flex items-start justify-center pr-2 pt-2 text-[10px] font-bold text-slate-300 font-mono">
                    {h}:00
                  </div>
                  {weekDays.map((_, dayIdx) => (
                    <div key={dayIdx} className="h-20 border-b border-slate-50 border-l border-slate-50 relative group hover:bg-slate-50/50 transition-colors">
                       {/* Render Events for this day and hour */}
                       {initialEventos
                        .filter(e => {
                          const ed = new Date(e.data_inicio)
                          return ed.getDate() === weekDays[dayIdx].getDate() && ed.getHours() === h
                        })
                        .map(e => (
                          <motion.div 
                            key={e.id}
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className={`absolute left-1 right-1 z-10 rounded-xl p-3 border-l-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                              e.tipo === 'reuniao' ? 'bg-primary/5 border-primary text-primary' :
                              e.tipo === 'vistoria' ? 'bg-amber-50 border-amber-500 text-amber-700' :
                              'bg-rose-50 border-rose-500 text-rose-700'
                            }`}
                            style={getEventPosition(e)}
                            onClick={() => openDrawer('evento', e)}
                          >
                             <div className="flex items-start justify-between">
                                <p className="text-[10px] font-bold uppercase truncate pr-4 leading-tight">{e.titulo}</p>
                                <Clock size={10} className="opacity-40" />
                             </div>
                             <p className="text-[9px] font-bold opacity-60 mt-1 uppercase tracking-tighter truncate">{e.processo?.cliente.nome || 'Evento Avulso'}</p>
                          </motion.div>
                        ))
                       }
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT DRAWER ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[150] bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[160] shadow-2xl flex flex-col"
            >
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${modalType === 'evento' ? 'bg-primary shadow-primary/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
                        {modalType === 'evento' ? <Calendar size={20} /> : <ListTodo size={20} />}
                     </div>
                     <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">{selectedItem ? 'Editar' : 'Criar'} {modalType}</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Regulariza Pro Agenda</p>
                     </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-all">
                     <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">TÍTULO & TIPO</p>
                     <input name="titulo" defaultValue={selectedItem?.titulo || ''} required placeholder="Ex: Vistoria Técnica Lote 42" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                     {modalType === 'evento' && (
                        <select name="tipo" defaultValue={selectedItem?.tipo || 'reuniao'} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all">
                           <option value="reuniao">Reunião</option>
                           <option value="vistoria">Vistoria</option>
                           <option value="prazo">Prazo Crítico</option>
                           <option value="outro">Outro</option>
                        </select>
                     )}
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">VÍNCULO OPERACIONAL</p>
                     <select name="processoId" defaultValue={selectedItem?.processoId || ''} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all">
                        <option value="">Nenhum processo vinculado</option>
                        {processos.map(p => (
                           <option key={p.id} value={p.id}>{p.tipo_regularizacao} — {p.cliente.nome}</option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">HORÁRIO & PRAZO</p>
                     {modalType === 'evento' ? (
                        <div className="grid grid-cols-1 gap-4">
                           <input name="data_inicio" type="datetime-local" defaultValue={selectedItem?.data_inicio?.slice(0,16) || ''} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                           <input name="data_fim" type="datetime-local" defaultValue={selectedItem?.data_fim?.slice(0,16) || ''} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 gap-4">
                           <input name="data" type="date" defaultValue={selectedItem?.data?.split('T')[0] || ''} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                           <input name="hora" type="time" defaultValue={selectedItem?.hora || ''} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                        </div>
                     )}
                  </div>

                  {modalType === 'evento' && (
                     <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">LOCALIZAÇÃO</p>
                        <div className="relative">
                           <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input name="local" defaultValue={selectedItem?.local || ''} placeholder="Endereço ou Link" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
                        </div>
                     </div>
                  )}

                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">OBSERVAÇÕES</p>
                     <textarea name="descricao" defaultValue={selectedItem?.descricao || ''} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 text-sm font-medium text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none" />
                  </div>
               </form>

               <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                  {selectedItem && (
                     <button type="button" onClick={() => { if(confirm('Excluir permanentemente?')) router.refresh() }} className="p-4 bg-white border border-slate-200 text-rose-500 rounded-2xl hover:bg-rose-50 transition-all shadow-sm">
                        <Trash2 size={20} />
                     </button>
                  )}
                  <button type="submit" onClick={(e: any) => e.currentTarget.form?.requestSubmit()} disabled={loading} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                     {loading ? 'SALVANDO...' : 'SALVAR NA AGENDA'}
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
