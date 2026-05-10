import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

export async function GET() {
  try {
    const empresaId = await getTenantId()
    const templates = await prisma.taskTemplate.findMany({
      where: { empresaId },
      orderBy: { etapa: 'asc' }
    })
    return NextResponse.json(templates)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar templates' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const empresaId = await getTenantId()
    const data = await req.json()
    
    const template = await prisma.taskTemplate.create({
      data: {
        ...data,
        empresaId,
        prazo_dias: parseInt(data.prazo_dias) || 3
      }
    })
    
    return NextResponse.json(template)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar template' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const empresaId = await getTenantId()
    const data = await req.json()
    const { id, ...updateData } = data
    
    const template = await prisma.taskTemplate.update({
      where: { id, empresaId },
      data: {
        ...updateData,
        prazo_dias: updateData.prazo_dias ? parseInt(updateData.prazo_dias) : undefined
      }
    })
    
    return NextResponse.json(template)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar template' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const empresaId = await getTenantId()
    const { id } = await req.json()
    
    await prisma.taskTemplate.delete({
      where: { id, empresaId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir template' }, { status: 500 })
  }
}
