import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  FileText, 
  CreditCard, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClienteDetalhesPage({ params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      processos: {
        include: {
          financeiro: true,
          documentos: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!cliente) {
    notFound()
  }

  // Cálculos financeiros
  let totalFaturado = 0
  let totalRecebido = 0
  
  cliente.processos.forEach(p => {
    p.financeiro.forEach(f => {
      totalFaturado += f.honorarios
      totalRecebido += f.valor_pago
    })
  })

  const totalPendente = totalFaturado - totalRecebido

  return (
    <div className="p-8 max-w-7xl mx-auto w-full font-mono">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link 
            href="/clientes" 
            className="p-2 border border-border rounded-sm hover:bg-muted smooth-transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{cliente.nome}</h1>
              <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                {cliente.cpf_cnpj.length > 14 ? 'CLIENTE PJ' : 'CLIENTE PF'}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              Registro: {new Date(cliente.createdAt).toLocaleDateString('pt-BR')} • ID: {cliente.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link 
            href={`/processos/novo?clienteId=${cliente.id}`}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Processo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INFO */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Informações Gerais</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Documento</span>
                <p className="text-xs font-bold">{cliente.cpf_cnpj}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Telefone</span>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  {cliente.telefone || 'NÃO INFORMADO'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Email</span>
                <div className="flex items-center gap-2 text-xs font-bold break-all">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  {cliente.email || 'NÃO INFORMADO'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Endereço</span>
                <div className="flex items-start gap-2 text-xs font-bold">
                  <MapPin className="w-3 h-3 text-muted-foreground mt-0.5" />
                  <span className="leading-relaxed">{cliente.endereco || 'NÃO INFORMADO'}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border mt-4">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Observações</span>
                <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">
                  {cliente.observacoes || 'SEM OBSERVAÇÕES REGISTRADAS.'}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Resumo Financeiro</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-end border-b border-border pb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Total Faturado</span>
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFaturado)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Recebido</span>
                  <span className="text-sm font-bold text-emerald-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRecebido)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-muted/20 p-3 rounded-sm">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Saldo Pendente</span>
                <span className={`text-sm font-bold ${totalPendente > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: PROCESSES AND CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">Processos Vinculados ({cliente.processos.length})</h2>
              </div>
            </div>
            
            <div className="divide-y divide-border">
              {cliente.processos.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground space-y-3">
                  <AlertCircle className="w-8 h-8 mx-auto opacity-20" />
                  <p className="text-xs uppercase tracking-widest font-bold">Nenhum processo vinculado a este cliente.</p>
                </div>
              ) : (
                cliente.processos.map((p) => (
                  <div key={p.id} className="p-6 hover:bg-muted/10 smooth-transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Link href={`/processos/${p.id}`} className="font-bold text-sm hover:text-primary hover:underline">
                          {p.tipo_regularizacao.toUpperCase()}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-tighter border ${
                          p.status === 'concluído' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-blue-500/30 text-blue-500 bg-blue-500/5'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <MapPin className="w-3 h-3" />
                        {p.endereco}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">Início</div>
                        <div className="text-xs font-bold">{new Date(p.data_inicio).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">Docs</div>
                        <div className="text-xs font-bold">{p.documentos.length.toString().padStart(2, '0')}</div>
                      </div>
                      <div className="h-8 w-px bg-border hidden md:block"></div>
                      <Link 
                        href={`/processos/${p.id}`}
                        className="px-4 py-2 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-muted smooth-transition"
                      >
                        VER DETALHES
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* QUICK DOCUMENT VIEW */}
          <section className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 border-b border-border">
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Documentação Consolidada</h2>
            </div>
            <div className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                {cliente.processos.flatMap(p => p.documentos).slice(0, 6).map((doc) => (
                  <div key={doc.id} className="bg-card p-4 flex items-center justify-between hover:bg-muted/10 smooth-transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-xs font-bold truncate w-32 md:w-48">{doc.nome}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">{doc.tipo}</div>
                      </div>
                    </div>
                    <button className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">Baixar</button>
                  </div>
                ))}
                {cliente.processos.flatMap(p => p.documentos).length === 0 && (
                  <div className="bg-card p-12 text-center text-muted-foreground col-span-2 text-[10px] font-bold uppercase tracking-widest italic">
                    Nenhum documento anexado.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
