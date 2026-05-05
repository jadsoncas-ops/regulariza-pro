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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Documentos</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestão eletrônica de arquivos e certidões</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Ações principais no componente List */}
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <DocumentoList initialDocumentos={safeDocumentos} processos={processos} />
      </div>
    </div>
  )
}
