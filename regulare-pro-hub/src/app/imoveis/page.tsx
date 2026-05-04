import { prisma } from '@/lib/prisma'
import ImovelList from '@/components/imoveis/ImovelList'

export const dynamic = 'force-dynamic'

export default async function ImoveisPage() {
  const imoveis = await prisma.imovel.findMany({
    include: { 
      cliente: { select: { id: true, nome: true, cpf_cnpj: true } },
      processos: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const clientes = await prisma.cliente.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full min-h-screen relative font-mono">
      {/* HEADER TOP */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Gestão de Imóveis e Lotes <span className="text-muted-foreground font-normal ml-2">// MOD.IMO / 03</span>
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">SISTEMA CENTRAL DE CADASTRO IMOBILIÁRIO</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            DB.Connected
          </div>
        </div>
      </div>

      <ImovelList initialImoveis={imoveis} clientes={clientes} />
    </div>
  )
}
