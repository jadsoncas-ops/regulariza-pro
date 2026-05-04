import { prisma } from '@/lib/prisma'
import DocumentoList from '@/components/documentos/DocumentoList'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const documentos = await prisma.documento.findMany({
    include: { 
      processo: { 
        select: { 
          id: true, 
          tipo_regularizacao: true,
          cliente: { select: { nome: true } } 
        } 
      },
      imovel: {
        select: { endereco: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Converter datas para string
  const safeDocumentos = documentos.map(d => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }))

  const processos = await prisma.processo.findMany({
    select: { id: true, tipo_regularizacao: true, cliente: { select: { nome: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full min-h-screen relative font-mono overflow-x-hidden">
      {/* HEADER TOP */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Central de Documentos <span className="text-muted-foreground font-normal ml-2">// MOD.DOC / 05</span>
          </h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">REPOSITÓRIO E GED IMOBILIÁRIO</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-border px-2 py-1.5 rounded-sm bg-card">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sis. Online
          </div>
        </div>
      </div>

      <DocumentoList initialDocumentos={safeDocumentos} processos={processos} />
    </div>
  )
}
