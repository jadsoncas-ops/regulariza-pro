import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const report: any = {
      timestamp: new Date(),
      integrity: {
        orphanedProcesses: [],
        orphanedProperties: [],
        orphanedFinance: [],
        brokenClientRelations: 0
      },
      consistency: {
        totalProcessos: 0,
        unlinkedProcessos: 0,
        duplicateCodes: []
      },
      financialHealth: {
        unlinkedRecords: 0,
        missingValues: 0
      }
    }

    // 1. Audit Relationships
    const [processos, properties, finance, clients] = await Promise.all([
      prisma.processo.findMany({ include: { cliente: true, imovel: true } }),
      prisma.imovel.findMany({ include: { cliente: true } }),
      prisma.financeiro.findMany(),
      prisma.cliente.findMany()
    ])

    report.consistency.totalProcessos = processos.length

    // Check Orphaned Processes
    processos.forEach(p => {
      if (!p.cliente) report.integrity.brokenClientRelations++
      if (p.imovelId && !p.imovel) report.integrity.orphanedProcesses.push({ id: p.id, code: p.codigo_projeto })
      if (!p.imovelId) report.consistency.unlinkedProcessos++
    })

    // Check Orphaned Properties
    properties.forEach(pr => {
      if (!pr.cliente) report.integrity.orphanedProperties.push({ id: pr.id, address: pr.endereco })
    })

    // Duplicate Codes
    const codes = processos.map(p => p.codigo_projeto).filter(Boolean)
    const duplicates = codes.filter((item, index) => codes.indexOf(item) !== index)
    report.consistency.duplicateCodes = [...new Set(duplicates)]

    // Financial Audit
    finance.forEach(f => {
      if (f.processoId && !processos.find(p => p.id === f.processoId)) {
        report.integrity.orphanedFinance.push(f.id)
      }
      if (f.valor === 0 && f.status === 'pendente') report.financialHealth.missingValues++
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('SYSTEM_AUDIT_ERROR:', error)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}
