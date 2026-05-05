import { 
  Search, 
  Bell, 
  AlertTriangle, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  ChevronRight,
  Filter,
  MoreVertical,
  Check,
  Plus
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AlertasPage() {
  const alertasMock = [
    { 
      type: 'danger', 
      icon: AlertTriangle, 
      title: 'Prazo da Prefeitura — PRC-9105', 
      desc: 'Vence em 3 dias · exigência técnica em aberto', 
      time: 'Há 1h',
      status: 'urgente'
    },
    { 
      type: 'danger', 
      icon: CheckCircle2, 
      title: 'Pagamento atrasado — Fábrica Aurora', 
      desc: 'R$ 14.400 · vencido há 4 dias', 
      time: 'Há 4h',
      status: 'atrasado'
    },
    { 
      type: 'dark', 
      icon: FileText, 
      title: 'Documento pendente — REQ-8849', 
      desc: 'Memorial descritivo não anexado', 
      time: 'Ontem',
      status: 'pendente'
    },
    { 
      type: 'dark', 
      icon: Clock, 
      title: 'Processo parado — REG-7721', 
      desc: '12 dias sem movimentação no cartório', 
      time: '12 Nov',
      status: 'atenção'
    },
    { 
      type: 'dark', 
      icon: Calendar, 
      title: 'Vistoria agendada — Cond. Vale Verde', 
      desc: 'Amanhã 09:00 - Helena Torres', 
      time: '13 Nov',
      status: 'agendado'
    },
    { 
      type: 'dark', 
      icon: FileText, 
      title: 'ART não assinada — PRC-9105', 
      desc: 'Aguarda assinatura do responsável técnico', 
      time: '10 Nov',
      status: 'pendente'
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Central de Alertas</h1>
            <p className="text-sm text-slate-500 mt-0.5">Notificações automáticas e inteligência de prazos</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors shadow-sm">
              <Check className="w-4 h-4" /> Marcar todos como lidos
            </button>
            <Link 
              href="/processos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Novo Processo
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-6">
        
        {/* FILTER BAR */}
        <div className="flex items-center justify-between bg-white p-3 border border-[hsl(var(--border))] rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                placeholder="Filtrar notificações..." 
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs w-64 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="h-4 w-px bg-slate-200 mx-2"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Filter className="w-3.5 h-3.5" /> Prioridade
            </button>
          </div>
        </div>

        {/* ALERTS LIST */}
        <section className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {alertasMock.map((alerta, index) => {
              const isDanger = alerta.type === 'danger';
              return (
                <div key={index} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className="flex items-start gap-5 flex-1">
                    <div className={`p-2.5 rounded-xl ${
                      isDanger ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <alerta.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-sm font-semibold ${isDanger ? 'text-slate-900' : 'text-slate-700'}`}>
                          {alerta.title}
                        </h3>
                        <span className={`badge ${
                          alerta.status === 'urgente' ? 'badge-red' : 
                          alerta.status === 'atrasado' ? 'badge-red' : 
                          alerta.status === 'agendado' ? 'badge-blue' : 'badge-gray'
                        } capitalize text-[10px]`}>
                          {alerta.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{alerta.desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className="text-[11px] font-medium text-slate-400">{alerta.time}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* EMPTY STATE HELPER (HIDDEN IF LIST HAS CONTENT) */}
        {alertasMock.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Nenhum alerta pendente</h3>
            <p className="text-xs text-slate-500 mt-1">Sua central de operações está em dia.</p>
          </div>
        )}
      </div>
    </div>
  )
}
