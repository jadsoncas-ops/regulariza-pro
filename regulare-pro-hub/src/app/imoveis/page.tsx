import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ImoveisPage() {
  // We're querying Processos since "Imóvel" data (area, endereco) is stored inside Processo.
  const imoveis = await prisma.processo.findMany({
    include: { cliente: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP - ENGARQ STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Imóveis & Lotes <span className="text-muted-foreground font-normal ml-2">// MOD.IMV / 03</span>
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
            <div className="px-3 py-2 bg-foreground text-background border-r border-border">TIPO TODOS</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">STATUS ATIVOS</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer">ÁREA &lt; 5.000 M²</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/processos/novo" className="px-4 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
              + CADASTRAR IMÓVEL
            </Link>
          </div>
        </div>

        {/* CADASTRO PREDIAL */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Cadastro Predial <span className="opacity-50">IMV.001</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {imoveis.length === 0 ? (
              <div className="col-span-full border border-dashed border-border p-12 text-center text-muted-foreground bg-card">
                Nenhum imóvel/lote cadastrado.
              </div>
            ) : imoveis.map((p, i) => {
              const numId = (i + 1).toString().padStart(3, '0');
              const isExigencia = p.status === 'exigência';
              const isFinalizado = p.status === 'finalizado' || p.status === 'aprovado';
              
              let tagColor = "text-blue-600 border-blue-600";
              let dotColor = "bg-blue-600";
              let statusText = "EM ANÁLISE";

              if (isExigencia) {
                tagColor = "text-rose-500 border-rose-500";
                dotColor = "bg-rose-500";
                statusText = "DOC. PENDENTE";
              } else if (isFinalizado) {
                tagColor = "text-emerald-500 border-emerald-500";
                dotColor = "bg-emerald-500";
                statusText = "REGULARIZADO";
              } else if (p.status === 'prospecção') {
                tagColor = "text-muted-foreground border-border";
                dotColor = "bg-muted-foreground";
                statusText = "INICIAR";
              }

              return (
                <div key={p.id} className={`bg-card border ${isExigencia ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.05)]' : 'border-border shadow-sm'} p-6 rounded-sm flex flex-col group hover:border-blue-600 smooth-transition`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        MATR. 88.402 — IMV-{numId}
                      </div>
                      <div className="font-bold text-lg text-foreground truncate w-64">{p.endereco.split(',')[0]}</div>
                      <div className="text-xs text-muted-foreground">{p.endereco.split(',')[1] || p.endereco}</div>
                    </div>
                    <div className={`border ${tagColor} px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                      {statusText}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-border mb-4">
                    <div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Terreno</div>
                      <div className="font-bold text-base">{p.area_terreno || '0'} m²</div>
                    </div>
                    <div className="border-l border-border pl-4">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Construído</div>
                      <div className="font-bold text-base">{p.area_construida || '0'} m²</div>
                    </div>
                    <div className="border-l border-border pl-4">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tipo</div>
                      <div className="font-bold text-sm text-muted-foreground mt-0.5">{p.tipo_regularizacao.includes('Habite') ? 'Residencial' : 'Comercial'}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="text-xs text-muted-foreground">
                      Cliente: <Link href={`/clientes/${p.cliente.id}`} className="font-medium text-foreground hover:underline">{p.cliente.nome}</Link>
                    </div>
                    <Link href={`/processos/${p.id}`} className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground smooth-transition">
                      Abrir →
                    </Link>
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
