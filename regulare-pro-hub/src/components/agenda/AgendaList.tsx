'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Trash2, 
  X, 
  Save, 
  AlertTriangle,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  CheckSquare,
  Edit2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Evento {
  id: string
  titulo: string
  descricao: string | null
  tipo: string
  processoId: string | null
  data_inicio: string
  data_fim: string | null
  local: string | null
  responsavel: string | null
  status: string
  processo: { id: string, cliente: { nome: string } } | null
}

interface Tarefa {
  id: string
  titulo: string
  descricao: string | null
  processoId: string | null
  data: string
  hora: string | null
  responsavel: string | null
  status: string
  processo: { id: string, cliente: { nome: string } } | null
}

interface AgendaListProps {
  initialEventos: Evento[]
  initialTarefas: Tarefa[]
  processos: { id: string, tipo_regularizacao: string, cliente: { nome: string } }[]
}

export default function AgendaList({ initialEventos, initialTarefas, processos }: AgendaListProps) {
  const [eventos, setEventos] = useState(initialEventos)
  const [tarefas, setTarefas] = useState(initialTarefas)
  const [activeTab, setActiveTab] = useState<'eventos' | 'tarefas'>('eventos')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isEventoModalOpen, setIsEventoModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Evento | Tarefa | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const filteredEventos = eventos.filter(e => 
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.processo?.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredTarefas = tarefas.filter(t => 
    t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.processo?.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSaveEvento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    const payload = {
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo,
      processoId: data.processoId || null,
      data_inicio: new Date(data.data_inicio as string).toISOString(),
      data_fim: data.data_fim ? new Date(data.data_fim as string).toISOString() : null,
      local: data.local,
      responsavel: data.responsavel,
      status: data.status,
    }

    try {
      const url = selectedItem ? `/api/eventos/${selectedItem.id}` : `/api/eventos`
      const method = selectedItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsEventoModalOpen(false)
        router.refresh()
        // Simplification for rapid UX update, relying on server refresh
        setTimeout(() => window.location.reload(), 500) 
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTarefa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    const payload = {
      titulo: data.titulo,
      descricao: data.descricao,
      processoId: data.processoId || null,
      data: new Date(data.data as string).toISOString(),
      hora: data.hora || null,
      responsavel: data.responsavel,
      status: data.status,
    }

    try {
      const url = selectedItem ? `/api/tarefas/${selectedItem.id}` : `/api/tarefas`
      const method = selectedItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsTarefaModalOpen(false)
        router.refresh()
        setTimeout(() => window.location.reload(), 500)
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, type: 'evento' | 'tarefa') => {
    if (!confirm('Deseja realmente excluir este registro?')) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/${type}s/${id}`, { method: 'DELETE' })
      if (res.ok) {
        if (type === 'evento') setEventos(prev => prev.filter(e => e.id !== id))
        else setTarefas(prev => prev.filter(t => t.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTarefaStatus = async (tarefa: Tarefa) => {
    const newStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida'
    
    try {
      const res = await fetch(`/api/tarefas/${tarefa.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: newStatus } : t))
        router.refresh()
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div className="space-y-8 font-mono">
      
      {/* TABS & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/20 p-4 border border-border rounded-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex border border-border rounded-sm bg-card p-1">
            <button 
              onClick={() => setActiveTab('eventos')}
              className={`px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest smooth-transition ${activeTab === 'eventos' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
            >
              AGENDA DE EVENTOS
            </button>
            <button 
              onClick={() => setActiveTab('tarefas')}
              className={`px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest smooth-transition ${activeTab === 'tarefas' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
            >
              TAREFAS & CHECKLISTS
            </button>
          </div>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="BUSCAR..."
            className="w-full bg-background border border-border px-10 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 smooth-transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              setSelectedItem(null)
              if (activeTab === 'eventos') setIsEventoModalOpen(true)
              else setIsTarefaModalOpen(true)
            }}
            className="flex-1 md:flex-none px-6 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-3.5 h-3.5" /> 
            NOVO {activeTab === 'eventos' ? 'EVENTO' : 'TAREFA'}
          </button>
        </div>
      </div>

      {/* CONTENT LIST */}
      <div className="border border-border bg-card shadow-md rounded-sm overflow-hidden">
        {activeTab === 'eventos' ? (
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4">DATA E HORA</th>
                <th className="px-6 py-4">COMPROMISSO / LOCAL</th>
                <th className="px-6 py-4">VÍNCULO</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEventos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic tracking-widest">NENHUM EVENTO ENCONTRADO</td></tr>
              ) : (
                filteredEventos.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/10 smooth-transition group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center border border-border bg-muted p-2 rounded-sm w-12 h-12">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none">{new Date(e.data_inicio).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                          <span className="text-sm font-bold text-foreground leading-none mt-1">{new Date(e.data_inicio).getDate()}</span>
                        </div>
                        <div>
                          <div className="font-bold">{new Date(e.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[9px] text-muted-foreground uppercase">{e.tipo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm">{e.titulo}</div>
                      {e.local && (
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase mt-1">
                          <MapPin className="w-3 h-3" /> {e.local}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {e.processo ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold">PRC-{e.processo.id.substring(0,8).toUpperCase()}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{e.processo.cliente.nome}</span>
                        </div>
                      ) : <span className="text-[9px] text-muted-foreground uppercase">SEM VÍNCULO</span>}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${e.status === 'concluido' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-amber-500 text-amber-500 bg-amber-500/10'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedItem(e); setIsEventoModalOpen(true); }} className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-blue-500 smooth-transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(e.id, 'evento')} className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-red-500 smooth-transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* TAREFAS TABLE */
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 w-16">STS</th>
                <th className="px-6 py-4">TAREFA</th>
                <th className="px-6 py-4">PROCESSO</th>
                <th className="px-6 py-4">PRAZO / RESP.</th>
                <th className="px-6 py-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTarefas.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground italic tracking-widest">NENHUMA TAREFA ENCONTRADA</td></tr>
              ) : (
                filteredTarefas.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/10 smooth-transition group">
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => handleToggleTarefaStatus(t)}
                        className={`w-5 h-5 rounded-sm border flex items-center justify-center smooth-transition ${t.status === 'concluida' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted-foreground/50 hover:border-primary text-transparent'}`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`font-bold text-sm ${t.status === 'concluida' ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground'}`}>
                        {t.titulo}
                      </div>
                      {t.descricao && <div className="text-[10px] text-muted-foreground mt-1 truncate max-w-xs">{t.descricao}</div>}
                    </td>
                    <td className="px-6 py-5">
                      {t.processo ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold">PRC-{t.processo.id.substring(0,8).toUpperCase()}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{t.processo.cliente.nome}</span>
                        </div>
                      ) : <span className="text-[9px] text-muted-foreground uppercase">SEM VÍNCULO</span>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className={`text-xs font-bold ${new Date(t.data) < new Date() && t.status !== 'concluida' ? 'text-rose-500' : 'text-foreground'}`}>
                          {new Date(t.data).toLocaleDateString('pt-BR')} {t.hora && `- ${t.hora}`}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase">{t.responsavel || 'SEM RESP.'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedItem(t); setIsTarefaModalOpen(true); }} className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-blue-500 smooth-transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t.id, 'tarefa')} className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-red-500 smooth-transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* EVENTO MODAL */}
      {isEventoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-2xl rounded-sm shadow-2xl my-8">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 sticky top-0">
              <h2 className="text-sm font-bold uppercase tracking-widest">{selectedItem ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button onClick={() => setIsEventoModalOpen(false)} className="p-2 hover:bg-muted rounded-sm smooth-transition"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveEvento} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título do Evento *</label>
                  <input name="titulo" defaultValue={(selectedItem as Evento)?.titulo || ''} required className="bg-background border border-border px-3 py-2 rounded-sm text-xs" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data/Hora Início *</label>
                  <input name="data_inicio" type="datetime-local" defaultValue={(selectedItem as Evento)?.data_inicio ? (selectedItem as Evento).data_inicio.slice(0,16) : ''} required className="bg-background border border-border px-3 py-2 rounded-sm text-xs" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo de Evento *</label>
                  <select name="tipo" defaultValue={(selectedItem as Evento)?.tipo || 'reuniao'} required className="bg-background border border-border px-3 py-2 rounded-sm text-xs uppercase">
                    <option value="reuniao">Reunião</option>
                    <option value="vistoria">Vistoria</option>
                    <option value="prazo">Prazo Protocolo</option>
                    <option value="cartorio">Ida ao Cartório</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vincular a Processo</label>
                  <select name="processoId" defaultValue={(selectedItem as Evento)?.processoId || ''} className="bg-background border border-border px-3 py-2 rounded-sm text-xs">
                    <option value="">Sem vínculo</option>
                    {processos.map(p => (
                      <option key={p.id} value={p.id}>PRC-{p.id.substring(0,6).toUpperCase()} - {p.cliente.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Local</label>
                  <input name="local" defaultValue={(selectedItem as Evento)?.local || ''} className="bg-background border border-border px-3 py-2 rounded-sm text-xs" />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <button type="submit" className="px-8 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition"><Save className="w-3.5 h-3.5 inline mr-2" /> SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAREFA MODAL */}
      {isTarefaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-xl rounded-sm shadow-2xl my-8">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 sticky top-0">
              <h2 className="text-sm font-bold uppercase tracking-widest">{selectedItem ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
              <button onClick={() => setIsTarefaModalOpen(false)} className="p-2 hover:bg-muted rounded-sm smooth-transition"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveTarefa} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título da Tarefa *</label>
                  <input name="titulo" defaultValue={(selectedItem as Tarefa)?.titulo || ''} required className="bg-background border border-border px-3 py-2 rounded-sm text-xs" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data Previsão *</label>
                  <input name="data" type="date" defaultValue={(selectedItem as Tarefa)?.data ? (selectedItem as Tarefa).data.split('T')[0] : ''} required className="bg-background border border-border px-3 py-2 rounded-sm text-xs" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hora (Opcional)</label>
                  <input name="hora" type="time" defaultValue={(selectedItem as Tarefa)?.hora || ''} className="bg-background border border-border px-3 py-2 rounded-sm text-xs" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vincular a Processo</label>
                  <select name="processoId" defaultValue={(selectedItem as Tarefa)?.processoId || ''} className="bg-background border border-border px-3 py-2 rounded-sm text-xs">
                    <option value="">Sem vínculo</option>
                    {processos.map(p => (
                      <option key={p.id} value={p.id}>PRC-{p.id.substring(0,6).toUpperCase()} - {p.cliente.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Responsável</label>
                  <input name="responsavel" defaultValue={(selectedItem as Tarefa)?.responsavel || ''} className="bg-background border border-border px-3 py-2 rounded-sm text-xs" />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <button type="submit" className="px-8 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition"><Save className="w-3.5 h-3.5 inline mr-2" /> SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
