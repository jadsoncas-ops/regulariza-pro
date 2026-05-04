import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  // Puxar tarefas do banco
  const tarefas = await prisma.tarefa.findMany({
    include: { processo: { include: { cliente: true } } },
    orderBy: [{ data: 'asc' }, { hora: 'asc' }]
  })

  // Dynamic week mapping starting from today
  const today = new Date();
  const weekDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
    const numStr = d.getDate().toString().padStart(2, '0');
    return { day: dayStr, num: numStr, dateObj: d, active: i === 0 };
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP - ENGARQ STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Agenda & Prazos <span className="text-muted-foreground font-normal ml-2">// MOD.AGO / 07</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-sm text-xs w-64 shadow-sm">
            <Search className="w-3 h-3 text-muted-foreground" />
            <input 
              placeholder="Buscar processo, cliente, matrícula..." 
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sis. Online
          </div>
          <button className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition">
            + Assistente IA
          </button>
          <Link href="/processos/novo" className="flex items-center gap-2 bg-foreground text-background px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition">
            + Novo Processo
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {/* FILTER BAR */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-0 border border-border rounded-sm overflow-hidden text-[10px] font-bold uppercase tracking-widest bg-card shadow-sm">
            <div className="px-3 py-2 bg-foreground text-background border-r border-border">VISÃO SEMANA</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">RESPONSÁVEL *</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer">TIPO TODOS</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/agenda/nova" className="px-4 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
              + NOVA TAREFA
            </Link>
          </div>
        </div>

        {/* CALENDÁRIO */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Semana Operacional <span className="opacity-50">AGO.001</span>
          </h2>
          
          <div className="flex flex-col border border-border bg-card shadow-sm rounded-sm overflow-hidden min-h-[600px]">
            {/* Headers da semana */}
            <div className="grid grid-cols-5 border-b border-border">
              {weekDays.map((d, i) => (
                <div key={i} className={`p-4 border-r border-border last:border-r-0 flex justify-between items-start ${d.active ? 'bg-blue-600 text-white' : 'text-foreground'}`}>
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${d.active ? 'text-blue-100' : 'text-muted-foreground'}`}>{d.day}</div>
                    <div className="text-2xl font-bold mt-1">{d.num}</div>
                  </div>
                  <div className={`text-[9px] font-bold ${d.active ? 'text-blue-100' : 'text-muted-foreground'}`}>0{i+1}</div>
                </div>
              ))}
            </div>

            {/* Corpo da semana */}
            <div className="grid grid-cols-5 flex-1 relative bg-muted/5">
              {/* Vertical dividers */}
              <div className="absolute inset-0 grid grid-cols-5 pointer-events-none">
                <div className="border-r border-border"></div>
                <div className="border-r border-border"></div>
                <div className="border-r border-border"></div>
                <div className="border-r border-border"></div>
                <div></div>
              </div>

              {/* Tasks mapping */}
              {weekDays.map((d, i) => {
                const dayTasks = tarefas.filter(t => new Date(t.data).getDate() === d.dateObj.getDate() && new Date(t.data).getMonth() === d.dateObj.getMonth());
                return (
                <div key={i} className="p-3 space-y-3 relative z-10">
                  {dayTasks.length === 0 ? (
                    <div className="border border-dashed border-border p-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-card">
                      Sem Tarefas
                    </div>
                  ) : dayTasks.map((task, index) => (
                    <div key={index} className={`bg-card border-l-4 border-t border-r border-b border-border border-l-blue-600 p-3 rounded-sm shadow-sm hover:shadow-md smooth-transition cursor-pointer group`}>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span className="text-foreground">{task.hora || 'S/Hora'}</span> - {task.status}
                      </div>
                      <div className="font-bold text-xs text-foreground mb-1 leading-tight group-hover:text-blue-600 smooth-transition">{task.titulo}</div>
                      <div className="text-[10px] text-muted-foreground">{task.responsavel || 'Sem Responsável'} - {task.processo?.cliente?.nome || 'Geral'}</div>
                    </div>
                  ))}
                </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
