import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

export async function GET() {
  const empresaId = await getTenantId()
  const clientes = await prisma.cliente.findMany({
    where: { empresaId },
    include: {
      imoveis: true,
      processos: true,
      financeiro: true
    },
    orderBy: { nome: 'asc' }
  })
  return NextResponse.json(clientes)
}

export async function POST(req: Request) {
  try {
    const empresaId = await getTenantId()
    const data = await req.json()
    const cliente = await prisma.cliente.create({
      data: {
        empresaId,
        nome: data.nome.toUpperCase(),
        cpf_cnpj: data.cpf_cnpj,
        rg_ie: data.rg_ie || null,
        telefone: data.telefone,
        email: data.email?.toUpperCase() || null,
        cep: data.cep,
        endereco: data.endereco?.toUpperCase() || null,
        numero: data.numero,
        bairro: data.bairro?.toUpperCase() || null,
        cidade: data.cidade?.toUpperCase() || null,
        estado: data.estado?.toUpperCase() || null,
        observacoes: data.observacoes?.toUpperCase() || null,
        status: 'ativo'
      }
    })
    return NextResponse.json(cliente)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}
