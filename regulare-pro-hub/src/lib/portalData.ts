import { prisma } from './prisma';

export async function getClientPortalData(clientId: string) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clientId },
    include: {
      processos: {
        include: {
          imovel: true,
          financeiro: true,
          documentos: true,
          logs: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      },
      imoveis: true,
      financeiro: true
    }
  });

  if (!cliente) return null;

  // Process data for the portal view (simplify names, hide costs)
  const dashboard = {
    nome: cliente.nome,
    activeProcessos: cliente.processos.length,
    totalInvestido: cliente.financeiro
      .filter(f => f.tipo === 'receita' && f.status === 'pago')
      .reduce((acc, curr) => acc + curr.valor, 0),
    pendente: cliente.financeiro
      .filter(f => f.tipo === 'receita' && f.status === 'pendente')
      .reduce((acc, curr) => acc + curr.valor, 0),
    processos: cliente.processos.map(p => ({
      id: p.id,
      codigo: p.codigo_projeto,
      tipo: p.tipo_regularizacao,
      etapa: p.etapa_atual,
      status: p.status,
      imovel: p.imovel ? {
        endereco: p.imovel.endereco,
        bairro: p.imovel.bairro,
        cidade: p.imovel.cidade
      } : null,
      percentual: calculateProgress(p.etapa_atual),
      documentosPendentes: p.documentos.filter(d => d.status === 'pendente').length
    }))
  };

  return dashboard;
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
