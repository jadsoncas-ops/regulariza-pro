import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getTenantId } from '@/lib/tenant'

export async function GET() {
  const empresaId = await getTenantId()
  const processos = await prisma.processo.findMany({
    where: { empresaId },
    include: { cliente: true, imovel: true, financeiro: true, tarefas: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(processos)
}

export async function POST(req: Request) {
  try {
    const empresaId = await getTenantId()
    const data = await req.json()
    
    // Configuração do Workflow Engine
    let tarefasAutomaticas: any[] = []
    let statusInicial = data.status || 'em_analise'

    // Geração dinâmica de tarefas baseada no tipo de serviço
    const tipo = data.tipo_regularizacao?.toLowerCase() || ''
    
    if (tipo.includes('regularização') || tipo.includes('regularizacao') || tipo.includes('habite-se')) {
      tarefasAutomaticas = [
        { titulo: 'Visita técnica ao local', descricao: 'Coleta de dados primários', status: 'pendente', data: new Date() },
        { titulo: 'Levantamento fotográfico', descricao: 'Documentação visual do estado atual', status: 'pendente', data: new Date(Date.now() + 86400000) },
        { titulo: 'Medição e Croqui', descricao: 'Levantamento planimétrico', status: 'pendente', data: new Date(Date.now() + 86400000 * 2) },
        { titulo: 'Elaboração do Projeto Arquitetônico', descricao: 'Desenho CAD/BIM', status: 'pendente', data: new Date(Date.now() + 86400000 * 5) },
        { titulo: 'Emissão de ART/RRT', descricao: 'Responsabilidade técnica', status: 'pendente', data: new Date(Date.now() + 86400000 * 6) },
        { titulo: 'Memorial Descritivo', descricao: 'Especificações técnicas', status: 'pendente', data: new Date(Date.now() + 86400000 * 6) }
      ]
    } else if (tipo.includes('consultoria') || tipo.includes('laudo') || tipo.includes('vistoria')) {
      tarefasAutomaticas = [
        { titulo: 'Agendamento de Vistoria', descricao: 'Alinhar data com o cliente', status: 'pendente', data: new Date() },
        { titulo: 'Inspeção Técnica', descricao: 'Visita in loco', status: 'pendente', data: new Date(Date.now() + 86400000 * 2) },
        { titulo: 'Elaboração do Laudo/Parecer', descricao: 'Redação do documento técnico', status: 'pendente', data: new Date(Date.now() + 86400000 * 5) },
        { titulo: 'Entrega Técnica', descricao: 'Reunião com o cliente', status: 'pendente', data: new Date(Date.now() + 86400000 * 7) }
      ]
    } else if (tipo.includes('obra') || tipo.includes('administração') || tipo.includes('administracao')) {
      tarefasAutomaticas = [
        { titulo: 'Assinatura do Contrato', descricao: 'Formalização', status: 'pendente', data: new Date() },
        { titulo: 'Planejamento de Cronograma', descricao: 'Gantt / Orçamento', status: 'pendente', data: new Date(Date.now() + 86400000 * 2) },
        { titulo: 'Mobilização de Obra', descricao: 'Início das atividades', status: 'pendente', data: new Date(Date.now() + 86400000 * 5) }
      ]
    } else {
      // Default fallback
      tarefasAutomaticas = [
        { titulo: 'Análise de Viabilidade', descricao: 'Verificação inicial', status: 'pendente', data: new Date() },
        { titulo: 'Coleta de Documentos', descricao: 'Solicitar documentação ao cliente', status: 'pendente', data: new Date(Date.now() + 86400000) }
      ]
    }

    const processo = await prisma.processo.create({
      data: {
        empresaId,
        clienteId: data.clienteId,
        imovelId: data.imovelId,
        tipo_regularizacao: data.tipo_regularizacao,
        etapa_atual: data.etapa_atual || 'Análise Inicial',
        status: statusInicial,
        data_previsao: data.data_previsao ? new Date(data.data_previsao) : null,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
        tarefas: {
          create: tarefasAutomaticas.map(t => ({ ...t, empresaId }))
        },
        logs: {
          create: [
            { acao: 'Abertura de Processo Operacional', usuario: 'SISTEMA', modulo: 'Workflow', empresaId },
            { acao: 'Geração Automática de Workflow Executivo', usuario: 'SISTEMA', modulo: 'Workflow', empresaId }
          ]
        }
      },
      include: {
        tarefas: true,
        logs: true
      }
    })
    return NextResponse.json(processo)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Erro ao criar processo' }, { status: 500 })
  }
}
