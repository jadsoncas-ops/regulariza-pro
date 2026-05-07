import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Resetting database in order of dependencies
    await prisma.log.deleteMany({})
    await prisma.protocolo.deleteMany({})
    await prisma.tarefa.deleteMany({})
    await prisma.financeiro.deleteMany({})
    await prisma.documento.deleteMany({})
    await prisma.evento.deleteMany({})
    await prisma.checklist.deleteMany({})
    await prisma.alerta.deleteMany({})
    await prisma.processo.deleteMany({})
    await prisma.imovel.deleteMany({})
    await prisma.cliente.deleteMany({})

    return NextResponse.json({ success: true, message: 'Database reset successfully' })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 })
  }
}
