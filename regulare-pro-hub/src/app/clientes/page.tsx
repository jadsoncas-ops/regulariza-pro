import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'
import Link from 'next/link'
import ClientList from '@/components/clientes/ClientList'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: { 
      processos: {
        include: {
          financeiro: true
        }
      } 
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calcular estatísticas reais
  const totalClientes = clientes.length
  const totalProcessos = clientes.reduce((acc, c) => acc + c.processos.length, 0)
  
  let receitaTotal = 0
  clientes.forEach(c => {
    c.processos.forEach(p => {
      p.financeiro.forEach(f => {
        receitaTotal += f.honorarios
      })
    })
  })

  const ticketMedio = totalProcessos > 0 ? receitaTotal / totalProcessos : 0

  const stats = {
    totalClientes,
    totalProcessos,
    receitaTotal,
    ticketMedio
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full min-h-screen relative font-mono">
      {/* HEADER TOP - REGULARIZA PRO STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Gestão de Clientes <span className="text-muted-foreground font-normal ml-2">// MOD.CLI / 02</span>
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">SISTEMA DE GESTÃO DE REGULARIZAÇÃO IMOBILIÁRIA</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            DB.Connected
          </div>
          <button className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition">
            SYNC.DATA
          </button>
        </div>
      </div>

      <ClientList initialClientes={clientes} stats={stats} />
    </div>
  )
}

