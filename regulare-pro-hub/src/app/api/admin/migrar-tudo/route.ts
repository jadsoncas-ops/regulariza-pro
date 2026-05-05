import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Ordem de exclusão para respeitar as chaves estrangeiras
    await prisma.tarefa.deleteMany({})
    await prisma.financeiro.deleteMany({})
    await prisma.documento.deleteMany({})
    await prisma.checklist.deleteMany({})
    await prisma.evento.deleteMany({})
    await prisma.alerta.deleteMany({})
    await prisma.processo.deleteMany({})
    await prisma.imovel.deleteMany({})
    await prisma.cliente.deleteMany({})

    return NextResponse.json({ 
      success: true, 
      message: "Sistema resetado com sucesso! Todos os dados foram apagados." 
    })
  } catch (error) {
    console.error('ERRO AO RESETAR SISTEMA:', error)
    return NextResponse.json({ error: 'Falha ao resetar sistema' }, { status: 500 })
  }
}
