import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MapaPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP - ENGARQ STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Mapa Zonal de Imóveis <span className="text-muted-foreground font-normal ml-2">// MOD.MAP / 08</span>
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
            <div className="px-3 py-2 bg-foreground text-background border-r border-border">STATUS TODOS</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">TIPO *</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer">ZONA SP+REG</div>
          </div>
        </div>

        {/* MAPA */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Distribuição Geoespacial <span className="opacity-50">MAP.001</span>
          </h2>
          
          <div className="flex flex-col lg:flex-row border border-border bg-card shadow-sm rounded-sm overflow-hidden min-h-[600px]">
            
            {/* GRÁFICO / MAPA ESQUEMÁTICO (Visual Mock) */}
            <div className="flex-1 border-r border-border p-6 relative bg-muted/5 flex items-center justify-center">
              <div className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-background px-2 py-1 border border-border">
                MAPA ESQUEMÁTICO — ZL-001
              </div>
              
              {/* Fake Map Grid & Points */}
              <div className="w-[80%] h-[80%] border border-muted-foreground/20 rounded-full relative">
                <svg className="absolute inset-0 w-full h-full text-muted-foreground/30" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 0,50 Q 25,20 50,50 T 100,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M 0,80 Q 25,90 50,20 T 100,40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" />
                </svg>
                
                {/* Points */}
                <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-blue-600 rounded-sm hover:scale-150 smooth-transition cursor-pointer shadow-md" title="IMV-001"></div>
                <div className="absolute top-[60%] left-[30%] w-3 h-3 bg-emerald-500 rounded-sm hover:scale-150 smooth-transition cursor-pointer shadow-md" title="IMV-004"></div>
                <div className="absolute top-[50%] left-[50%] w-3 h-3 bg-blue-600 rounded-sm hover:scale-150 smooth-transition cursor-pointer shadow-md" title="IMV-003"></div>
                <div className="absolute top-[40%] left-[70%] w-3 h-3 bg-blue-600 rounded-sm hover:scale-150 smooth-transition cursor-pointer shadow-md" title="IMV-005"></div>
                <div className="absolute top-[35%] left-[80%] w-3 h-3 bg-rose-500 rounded-sm hover:scale-150 smooth-transition cursor-pointer shadow-md animate-pulse" title="IMV-002"></div>
                <div className="absolute top-[75%] left-[75%] w-3 h-3 bg-foreground rounded-sm hover:scale-150 smooth-transition cursor-pointer shadow-md" title="IMV-006"></div>
              </div>

              <div className="absolute bottom-4 right-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-background px-2 py-1 border border-border">
                NT — ESC. APROX.
              </div>
            </div>

            {/* LEGENDA E LISTA DE IMÓVEIS */}
            <div className="w-full lg:w-96 flex flex-col">
              <div className="p-6 border-b border-border">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Legenda</h3>
                <ul className="space-y-3 text-xs font-medium text-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-sm"></span> Regularizado
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-sm"></span> Em análise
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-500 rounded-sm"></span> Documento pendente
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-foreground rounded-sm"></span> A iniciar
                  </li>
                </ul>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Imóveis no Mapa</h3>
                <div className="space-y-3">
                  <div className="border border-border p-3 rounded-sm bg-background hover:border-blue-600 smooth-transition cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-muted-foreground">IMV-001</span>
                      <span className="border border-blue-600 text-blue-600 px-1.5 py-[1px] rounded-sm text-[8px] font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1 h-1 bg-blue-600 rounded-full"></span> EM ANÁLISE</span>
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">Av. das Américas, 3301</div>
                    <div className="text-[10px] text-muted-foreground truncate">Espólio de Mendonça</div>
                  </div>
                  
                  <div className="border border-rose-500/50 bg-rose-500/5 p-3 rounded-sm hover:border-rose-500 smooth-transition cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-muted-foreground">IMV-002</span>
                      <span className="border border-rose-500 text-rose-500 px-1.5 py-[1px] rounded-sm text-[8px] font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1 h-1 bg-rose-500 rounded-full"></span> DOCUMENTO PENDENTE</span>
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">Rua Aurora, 102</div>
                    <div className="text-[10px] text-muted-foreground truncate">Comercial Machado & Cia</div>
                  </div>

                  <div className="border border-border p-3 rounded-sm bg-background hover:border-blue-600 smooth-transition cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-muted-foreground">IMV-003</span>
                      <span className="border border-blue-600 text-blue-600 px-1.5 py-[1px] rounded-sm text-[8px] font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1 h-1 bg-blue-600 rounded-full"></span> EM ANÁLISE</span>
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">Cond. Vale Verde, Q3 — Lote 12</div>
                    <div className="text-[10px] text-muted-foreground truncate">Cond. Jardins do Vale</div>
                  </div>

                  <div className="border border-border p-3 rounded-sm bg-background hover:border-blue-600 smooth-transition cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-muted-foreground">IMV-004</span>
                      <span className="border border-blue-600 text-blue-600 px-1.5 py-[1px] rounded-sm text-[8px] font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1 h-1 bg-blue-600 rounded-full"></span> EM ANÁLISE</span>
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">Galpão Logístico — Av. Industrial, 4400</div>
                    <div className="text-[10px] text-muted-foreground truncate">Fábrica Têxtil Aurora</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
