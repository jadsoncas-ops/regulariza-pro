import { prisma } from './prisma';

export async function getClientProcessoDetail(clientId: string, processoId: string) {
  const processo = await prisma.processo.findFirst({
    where: { 
      id: processoId,
      clienteId: clientId
    },
    include: {
      imovel: true,
      cliente: true,
      documentos: {
        where: {
          OR: [
            { status: 'verificado' },
            { status: 'pendente' }
          ]
        },
        orderBy: { createdAt: 'desc' }
      },
      financeiro: {
        where: { tipo: 'receita' },
        orderBy: { createdAt: 'desc' }
      },
      checklists: true,
      protocolos: true
    }
  });

  if (!processo) return null;

  // Map to client-friendly format
  return {
    id: processo.id,
    codigo: processo.codigo_projeto,
    tipo: processo.tipo_regularizacao,
    etapa: processo.etapa_atual,
    status: processo.status,
    responsavel: processo.responsavel || 'Equipe Técnica',
    imovel: processo.imovel,
    percentual: calculateProgress(processo.etapa_atual),
    documentos: processo.documentos.map(d => ({
      id: d.id,
      nome: d.nome,
      url: d.status === 'verificado' ? d.url : null,
      status: d.status,
      categoria: d.categoria,
      isPending: d.status === 'pendente'
    })),
    financeiro: {
      total: processo.valor_total || 0,
      pago: processo.financeiro.filter(f => f.status === 'pago').reduce((a, b) => a + b.valor, 0),
      historico: processo.financeiro.map(f => ({
        id: f.id,
        descricao: f.descricao,
        valor: f.valor,
        data: f.data_pagamento || f.createdAt,
        status: f.status
      }))
    },
    etapas: [
      { id: '1', nome: 'Levantamento Cadastral', status: checkEtapaStatus(processo.etapa_atual, 'Levantamento Cadastral') },
      { id: '2', nome: 'Projeto Arquitetônico', status: checkEtapaStatus(processo.etapa_atual, 'Projeto Arquitetônico') },
      { id: '3', nome: 'Memorial Descritivo', status: checkEtapaStatus(processo.etapa_atual, 'Memorial Descritivo') },
      { id: '4', nome: 'ART', status: checkEtapaStatus(processo.etapa_atual, 'ART') },
      { id: '5', nome: 'Protocolo Prefeitura', status: checkEtapaStatus(processo.etapa_atual, 'Protocolo Prefeitura') },
      { id: '6', nome: 'Habite-se', status: checkEtapaStatus(processo.etapa_atual, 'Habite-se') },
      { id: '7', nome: 'Certidão de Área Construída', status: checkEtapaStatus(processo.etapa_atual, 'Certidão de Área Construída') },
      { id: '8', nome: 'Cartório', status: checkEtapaStatus(processo.etapa_atual, 'Cartório') },
    ]
  };
}

function calculateProgress(etapa: string | null) {
  const etapas = [
    'Levantamento Cadastral',
    'Projeto Arquitetônico',
    'Memorial Descritivo',
    'ART',
    'Protocolo Prefeitura',
    'Habite-se',
    'Certidão de Área Construída',
    'Cartório'
  ];
  if (!etapa) return 5;
  const idx = etapas.indexOf(etapa);
  if (idx === -1) return 10;
  return Math.round(((idx + 1) / etapas.length) * 100);
}

function checkEtapaStatus(atual: string | null, etapa: string) {
  const etapas = [
    'Levantamento Cadastral',
    'Projeto Arquitetônico',
    'Memorial Descritivo',
    'ART',
    'Protocolo Prefeitura',
    'Habite-se',
    'Certidão de Área Construída',
    'Cartório'
  ];
  const idxAtual = etapas.indexOf(atual || '');
  const idxEtapa = etapas.indexOf(etapa);
  
  if (idxAtual === -1) return 'pendente';
  if (idxAtual > idxEtapa) return 'concluido';
  if (idxAtual === idxEtapa) return 'em_andamento';
  return 'pendente';
}
