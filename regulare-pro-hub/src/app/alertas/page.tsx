import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AlertasPage() {
  const alertasMock = [
    { type: 'danger', icon: '⚠️', title: 'Prazo da Prefeitura — PRC-9105', desc: 'Vence em 3 dias · exigência técnica em aberto', time: 'HÁ 1H' },
    { type: 'danger', icon: '💰', title: 'Pagamento atrasado — Fábrica Aurora', desc: 'R$ 14.400 · vencido há 4 dias', time: 'HÁ 4H' },
    { type: 'dark', icon: '📄', title: 'Documento pendente — REQ-8849', desc: 'Memorial descritivo não anexado', time: 'ONTEM' },
    { type: 'dark', icon: '🕒', title: 'Processo parado — REG-7721', desc: '12 dias sem movimentação no cartório', time: '12 NOV' },
    { type: 'dark', icon: '⚠️', title: 'Vistoria agendada — Cond. Vale Verde', desc: 'Amanhã 09:00 - Helena Torres', time: '13 NOV' },
    { type: 'dark', icon: '📄', title: 'ART não assinada — PRC-9105', desc: 'Aguarda assinatura do responsável técnico', time: '10 NOV' },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP - ENGARQ STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Central de Alertas <span className="text-muted-foreground font-normal ml-2">// MOD.ALR / 09</span>
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
            <div className="px-3 py-2 bg-foreground text-background border-r border-border">SEVERIDADE TODAS</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">TIPO *</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer">LIDOS OCULTAR</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest bg-card hover:bg-muted smooth-transition shadow-sm text-muted-foreground">
              MARCAR TODOS COMO LIDOS
            </button>
          </div>
        </div>

        {/* ALERTAS */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Alertas do Sistema <span className="opacity-50">ALR.001</span>
          </h2>
          
          <div className="flex flex-col gap-0 border border-border bg-card shadow-sm rounded-sm">
            {alertasMock.map((alerta, index) => {
              const isDanger = alerta.type === 'danger';
              return (
                <div key={index} className={`flex justify-between items-center p-5 border-b border-border last:border-b-0 hover:bg-muted/10 smooth-transition cursor-pointer relative overflow-hidden group`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isDanger ? 'bg-rose-500' : 'bg-foreground'}`}></div>
                  <div className="flex items-start gap-4 ml-2">
                    <div className={`mt-0.5 ${isDanger ? 'text-rose-500 grayscale-0' : 'grayscale'}`}>{alerta.icon}</div>
                    <div>
                      <div className="text-sm font-bold text-foreground group-hover:text-blue-600 smooth-transition">{alerta.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{alerta.desc}</div>
                    </div>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {alerta.time}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
