'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, PlusCircle, Calendar, CheckSquare, 
  MapPin, Clock, ArrowUpRight, X, Edit, Trash2,
  CalendarDays, CheckCircle2
} from 'lucide-react'

// --- Tipagens ---
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

// --- Componentes de UI Internos ---
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1.5">{children}</label>
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    />
  )
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
    >
      {children}
    </select>
  )
}

// --- Componente Principal ---
export default function AgendaList({ initialEventos, initialTarefas, processos }: AgendaListProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'eventos' | 'tarefas'>('eventos')
  const [search, setSearch] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'evento' | 'tarefa'>('evento')
  const [selectedItem, setSelectedItem] = useState<Evento | Tarefa | null>(null)
  const [loading, setLoading] = useState(false)

  // Filtros
  const filteredEventos = initialEventos.filter(e => 
    e.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (e.processo?.cliente.nome.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredTarefas = initialTarefas.filter(t => 
    t.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (t.processo?.cliente.nome.toLowerCase().includes(search.toLowerCase()))
  )

  const openModal = (type: 'evento' | 'tarefa', item: Evento | Tarefa | null = null) => {
    setModalType(type)
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  // Helpers de Cor
  const getBadgeTypeColor = (tipo: string) => {
    switch(tipo) {
      case 'reuniao': return 'badge-blue';
      case 'vistoria': return 'badge-amber';
      case 'prazo': return 'badge-red';
      default: return 'badge-gray';
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'concluido' || status === 'concluida') return 'badge-green'
    if (status === 'pendente' || status === 'agendado') return 'badge-blue'
    return 'badge-gray'
  }

  // --- Handlers de API ---
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
        payload.processoId = data.processoId || null
      } else {
        payload.data = new Date(data.data as string).toISOString()
        payload.hora = data.hora || null
        payload.processoId = data.processoId || null
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        closeModal()
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, type: 'evento' | 'tarefa') => {
    if (!confirm('Deseja realmente excluir este registro?')) return
    try {
      const res = await fetch(`/api/${type}s/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const handleToggleTarefa = async (tarefa: Tarefa) => {
    const newStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida'
    try {
      const res = await fetch(`/api/tarefas/${tarefa.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) router.refresh()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Agenda & Tarefas</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestão de prazos, vistorias e demandas da equipe</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar compromisso..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[hsl(var(--border))] rounded-md text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 bg-white"
              />
            </div>
            <button
              onClick={() => openModal('evento')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4" /> Novo Evento
            </button>
            <button
              onClick={() => openModal('tarefa')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              <CheckSquare className="w-4 h-4" /> Nova Tarefa
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-6 mt-6 -mb-5 border-t border-[hsl(var(--border))] pt-1">
          <button
            onClick={() => setActiveTab('eventos')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'eventos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" /> Eventos & Reuniões
          </button>
          <button
            onClick={() => setActiveTab('tarefas')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tarefas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ListTodo className="w-4 h-4" /> Tarefas & Checklists
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* LISTAGEM DE EVENTOS */}
        {activeTab === 'eventos' && (
          <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-[hsl(var(--border))] bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24 text-center">Data</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Evento</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vinculado a</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filteredEventos.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">Nenhum evento agendado.</td></tr>
                ) : filteredEventos.map(e => {
                  const date = new Date(e.data_inicio)
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg w-14 h-14 mx-auto">
                          <span className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">{date.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                          <span className="text-lg font-bold text-slate-800 leading-none">{date.getDate()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-800">{e.titulo}</p>
                          <span className={`badge ${getBadgeTypeColor(e.tipo)} capitalize text-[10px]`}>{e.tipo}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {e.local && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {e.local}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {e.processo ? (
                          <div>
                            <Link href={`/processos/${e.processo.id}`} className="text-xs font-medium text-blue-600 hover:underline">
                              #{e.processo.id.substring(0,6).toUpperCase()}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">{e.processo.cliente.nome}</p>
                          </div>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getStatusColor(e.status)} capitalize`}>{e.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal('evento', e)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(e.id, 'evento')} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* LISTAGEM DE TAREFAS */}
        {activeTab === 'tarefas' && (
          <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-[hsl(var(--border))] bg-slate-50">
                <tr>
                  <th className="px-6 py-3 w-12 text-center"></th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tarefa</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vinculado a</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prazo</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filteredTarefas.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">Nenhuma tarefa pendente.</td></tr>
                ) : filteredTarefas.map(t => {
                  const isDone = t.status === 'concluida'
                  const isLate = new Date(t.data) < new Date() && !isDone
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleToggleTarefa(t)}
                          className={`flex items-center justify-center w-5 h-5 rounded-md border transition-all ${
                            isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-blue-500 text-transparent'
                          }`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <p className={`font-medium ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.titulo}</p>
                      </td>
                      <td className="px-6 py-4">
                        {t.processo ? (
                          <div>
                            <Link href={`/processos/${t.processo.id}`} className="text-xs font-medium text-blue-600 hover:underline">
                              #{t.processo.id.substring(0,6).toUpperCase()}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">{t.processo.cliente.nome}</p>
                          </div>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`w-3.5 h-3.5 ${isLate ? 'text-red-500' : 'text-slate-400'}`} />
                          <span className={`text-xs font-medium ${isLate ? 'text-red-600' : 'text-slate-600'}`}>
                            {new Date(t.data).toLocaleDateString('pt-BR')} {t.hora && `às ${t.hora}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal('tarefa', t)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(t.id, 'tarefa')} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL GLOBAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">
                {selectedItem ? `Editar ${modalType === 'evento' ? 'Evento' : 'Tarefa'}` : `Novo ${modalType === 'evento' ? 'Evento' : 'Tarefa'}`}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-5">
                
                {/* Campos Comuns */}
                <div>
                  <Label>Título *</Label>
                  <Input name="titulo" defaultValue={selectedItem?.titulo || ''} required placeholder={`Ex: ${modalType === 'evento' ? 'Reunião com cliente' : 'Revisar planta'}`} />
                </div>
                
                <div>
                  <Label>Vincular a Processo</Label>
                  <Select name="processoId" defaultValue={selectedItem?.processoId || ''}>
                    <option value="">Nenhum processo</option>
                    {processos.map(p => (
                      <option key={p.id} value={p.id}>#{p.id.substring(0,6).toUpperCase()} - {p.cliente.nome}</option>
                    ))}
                  </Select>
                </div>

                {/* Campos Específicos de Evento */}
                {modalType === 'evento' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data/Hora Início *</Label>
                        <Input name="data_inicio" type="datetime-local" required defaultValue={(selectedItem as Evento)?.data_inicio?.slice(0,16) || ''} />
                      </div>
                      <div>
                        <Label>Data/Hora Fim</Label>
                        <Input name="data_fim" type="datetime-local" defaultValue={(selectedItem as Evento)?.data_fim?.slice(0,16) || ''} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <Select name="tipo" defaultValue={(selectedItem as Evento)?.tipo || 'reuniao'}>
                          <option value="reuniao">Reunião</option>
                          <option value="vistoria">Vistoria</option>
                          <option value="prazo">Prazo</option>
                          <option value="outro">Outro</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select name="status" defaultValue={selectedItem?.status || 'agendado'}>
                          <option value="agendado">Agendado</option>
                          <option value="concluido">Concluído</option>
                          <option value="cancelado">Cancelado</option>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Local / Link da Reunião</Label>
                      <Input name="local" defaultValue={(selectedItem as Evento)?.local || ''} placeholder="Endereço ou link do Google Meet" />
                    </div>
                  </>
                )}

                {/* Campos Específicos de Tarefa */}
                {modalType === 'tarefa' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data Limite *</Label>
                        <Input name="data" type="date" required defaultValue={(selectedItem as Tarefa)?.data?.split('T')[0] || ''} />
                      </div>
                      <div>
                        <Label>Hora (Opcional)</Label>
                        <Input name="hora" type="time" defaultValue={(selectedItem as Tarefa)?.hora || ''} />
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select name="status" defaultValue={selectedItem?.status || 'pendente'}>
                        <option value="pendente">Pendente</option>
                        <option value="concluida">Concluída</option>
                      </Select>
                    </div>
                  </>
                )}

              </div>

              {/* Ações do Modal */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-60">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
import { ListTodo } from 'lucide-react'
