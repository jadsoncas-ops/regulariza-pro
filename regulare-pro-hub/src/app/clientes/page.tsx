import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: { processos: true },
    orderBy: { createdAt: 'desc' }
  })

  // Mocking the pipeline stages for the visual layout based on the design
  const pipelineStats = {
    lead: 1,
    contato: 1,
    proposta: 1,
    contrato: 1,
    execucao: 4,
    finalizado: 0
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full min-h-screen relative font-mono">
      {/* HEADER TOP - REGULARIZA PRO STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Gestão de Clientes <span className="text-muted-foreground font-normal ml-2">// MOD.CLI / 02</span>
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
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">PIPELINE *</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer">CIDADE SP+1</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest bg-card hover:bg-muted smooth-transition shadow-sm">
              IMPORTAR CSV
            </button>
            <Link href="/clientes/novo" className="px-4 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
              + NOVO CLIENTE
            </Link>
          </div>
        </div>

        {/* PIPELINE COMERCIAL */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Indicadores <span className="opacity-50">CRM.001</span>
          </h2>
          <div className="grid grid-cols-2 gap-0 border border-border bg-card shadow-sm rounded-sm overflow-hidden">
            <div className="p-4 border-r border-border flex flex-col">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Total de Clientes</div>
              <div className="text-3xl font-bold text-foreground">{clientes.length}</div>
            </div>
            <div className="p-4 flex flex-col">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Processos Vinculados</div>
              <div className="text-3xl font-bold text-foreground">{clientes.reduce((acc, c) => acc + c.processos.length, 0)}</div>
            </div>
          </div>
        </section>

        {/* CARTEIRA DE CLIENTES */}
        <section>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Carteira de Clientes <span className="opacity-50">CRM.002</span>
          </h2>
          <div className="border border-border bg-card shadow-sm rounded-sm overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-16">ID</th>
                  <th className="px-4 py-3">CLIENTE</th>
                  <th className="px-4 py-3">CPF / CNPJ</th>
                  <th className="px-4 py-3">CONTATO</th>
                  <th className="px-4 py-3">PIPELINE</th>
                  <th className="px-4 py-3 text-right">PROC.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhum cliente cadastrado.</td>
                  </tr>
                ) : clientes.map((c, i) => {
                  const numId = (i + 1).toString().padStart(3, '0');
                  return (
                  <tr key={c.id} className="hover:bg-muted/20 smooth-transition group">
                    <td className="px-4 py-4 font-bold text-muted-foreground">
                      CLI-{numId}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/clientes/${c.id}`} className="font-bold text-sm text-foreground hover:text-blue-600 hover:underline">
                        {c.nome}
                      </Link>
                      <div className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider">
                        {c.cpf_cnpj.length > 14 ? 'PJ' : 'PF'} - {c.endereco?.split(',')[0] || 'SEM ENDEREÇO'}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-muted-foreground">
                      {c.cpf_cnpj}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <div className="truncate w-48">{c.email || '-'}</div>
                      <div className="mt-1">{c.telefone || '-'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="border border-blue-600 text-blue-600 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest w-fit flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                        EXECUÇÃO
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-foreground">
                      {c.processos.length.toString().padStart(2, '0')}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
