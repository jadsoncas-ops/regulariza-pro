import { prisma } from '@/lib/prisma'
import { Search, FileText } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const processos = await prisma.processo.findMany({
    include: { documentos: true, checklists: true, cliente: true },
    orderBy: { updatedAt: 'desc' }
  })

  const documentos = await prisma.documento.findMany({
    include: { processo: { include: { cliente: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP - ENGARQ STYLE */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          Central de Documentos <span className="text-muted-foreground font-normal ml-2">// MOD.DOC / 05</span>
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
            <div className="px-3 py-2 bg-foreground text-background border-r border-border">PROCESSO *</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer border-r border-border">TIPO TODOS</div>
            <div className="px-3 py-2 hover:bg-muted smooth-transition cursor-pointer">STATUS ATIVOS</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/documentos/novo" className="px-4 py-2 bg-foreground text-background rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/90 smooth-transition shadow-sm">
              + UPLOAD DOCUMENTO
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* DOCUMENTOS RECENTES */}
          <section className="lg:col-span-2">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Documentos Recentes <span className="opacity-50">DOC.001</span>
            </h2>
            <div className="border border-border bg-card shadow-sm rounded-sm overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 w-16">ID</th>
                    <th className="px-4 py-3">ARQUIVO</th>
                    <th className="px-4 py-3">TIPO</th>
                    <th className="px-4 py-3">PROCESSO</th>
                    <th className="px-4 py-3">V</th>
                    <th className="px-4 py-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documentos.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum documento encontrado.</td></tr>
                  )}
                  {documentos.map(doc => (
                    <tr key={doc.id} className="hover:bg-muted/20 smooth-transition group cursor-pointer">
                      <td className="px-4 py-4 font-bold text-muted-foreground">
                        {doc.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-bold text-sm text-foreground group-hover:text-blue-600 smooth-transition">{doc.nome}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{doc.tamanho ? `${Math.round(doc.tamanho/1024)} KB` : '-'} - {new Date(doc.createdAt).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{doc.tipo}</td>
                      <td className="px-4 py-4 font-bold text-muted-foreground">{doc.processo?.cliente?.nome || '-'}</td>
                      <td className="px-4 py-4 text-muted-foreground">v1</td>
                      <td className="px-4 py-4 text-right">
                        <span className="border border-emerald-500 text-emerald-500 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> SALVO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CHECKLIST INTELIGENTE */}
          <section>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Checklist Inteligente <span className="opacity-50">DOC.002</span>
            </h2>
            <div className="border border-border bg-card shadow-sm rounded-sm p-6 relative">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                HABITE-SE RESIDENCIAL - PRC-9105
              </div>
              
              <div className="flex justify-between items-end mb-2">
                <div className="text-4xl font-bold text-foreground">4/7</div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">57% COMPLETO</div>
              </div>
              
              <div className="w-full h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-blue-600 w-[57%]"></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border border-emerald-500 bg-emerald-500/10 rounded-sm flex items-center justify-center text-emerald-500">✓</div>
                  <span className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">Matrícula atualizada</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border border-emerald-500 bg-emerald-500/10 rounded-sm flex items-center justify-center text-emerald-500">✓</div>
                  <span className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">IPTU do exercício</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border border-emerald-500 bg-emerald-500/10 rounded-sm flex items-center justify-center text-emerald-500">✓</div>
                  <span className="text-sm font-medium text-emerald-600">Escritura / Contrato</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border border-emerald-500 bg-emerald-500/10 rounded-sm flex items-center justify-center text-emerald-500">✓</div>
                  <span className="text-sm font-medium text-emerald-600">Planta baixa assinada</span>
                </div>
                <div className="flex items-center gap-3 border border-border p-2 bg-muted/20 rounded-sm">
                  <div className="w-4 h-4 border border-border rounded-sm flex items-center justify-center text-muted-foreground text-[10px]">⚠️</div>
                  <span className="text-sm font-medium text-foreground">Memorial descritivo</span>
                </div>
                <div className="flex items-center gap-3 border border-border p-2 bg-muted/20 rounded-sm">
                  <div className="w-4 h-4 border border-border rounded-sm flex items-center justify-center text-muted-foreground text-[10px]">⚠️</div>
                  <span className="text-sm font-medium text-foreground">ART de execução</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border border-border rounded-sm"></div>
                  <span className="text-sm font-medium text-muted-foreground">Habite-se anterior</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2 border border-dashed border-border text-muted-foreground text-[10px] font-bold uppercase tracking-widest hover:border-foreground hover:text-foreground smooth-transition rounded-sm">
                ↑ ANEXAR PENDENTE
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
