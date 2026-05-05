import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: (await params).id },
      include: { 
        processos: {
          include: {
            financeiro: true,
            documentos: true
          }
        }
      }
    })
    
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(cliente)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await req.json()
    const cliente = await prisma.cliente.update({
      where: { id: (await params).id },
      data: {
        nome: data.nome,
        cpf_cnpj: data.cpf_cnpj,
        telefone: data.telefone || null,
        email: data.email || null,
        endereco: data.endereco || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        cep: data.cep || null,
        observacoes: data.observacoes || null,
      }
    })
    return NextResponse.json(cliente)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.cliente.delete({
      where: { id: (await params).id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 })
  }
}
