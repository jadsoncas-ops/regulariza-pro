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
    select: { id: true, nome: true, endereco: true, bairro: true, cidade: true, estado: true, cep: true },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* PAGE HEADER */}
      <div className="border-b border-[hsl(var(--border))] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Imóveis</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestão do acervo de lotes, terrenos e edificações</p>
          </div>
          <div className="flex items-center gap-3">
            {/* O componente ImovelList lidará com as ações de busca e novo imóvel para manter o estado local */}
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <ImovelList initialImoveis={imoveis} clientes={clientes} />
      </div>
    </div>
  )
}
