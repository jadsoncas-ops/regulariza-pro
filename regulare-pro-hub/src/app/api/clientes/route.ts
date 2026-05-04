import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const clientes = await prisma.cliente.findMany()
  return NextResponse.json(clientes)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const cliente = await prisma.cliente.create({
      data: {
        nome: data.nome,
        cpf_cnpj: data.cpf_cnpj,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
      }
    })
    return NextResponse.json(cliente)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}
