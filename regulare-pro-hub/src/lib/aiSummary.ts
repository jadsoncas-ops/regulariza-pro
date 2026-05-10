/**
 * AI Summary Generator
 * Translates technical process data into human-readable executive summaries.
 */

interface ProcessData {
  tipo: string;
  etapa: string | null;
  status: string;
  documentosPendentes: number;
  codigo: string;
}

const ETAPA_TRANSLATIONS: Record<string, any> = {
  'Levantamento Cadastral': {
    simple: 'medição e coleta de dados do seu imóvel',
    description: 'Nossa equipe técnica realizou a medição completa do terreno e das construções existentes para garantir que o projeto reflita a realidade exata.',
    next: 'a elaboração do projeto arquitetônico detalhado.'
  },
  'Projeto Arquitetônico': {
    simple: 'elaboração das plantas e desenhos técnicos',
    description: 'Estamos desenhando as plantas que serão apresentadas aos órgãos competentes. Este é o "coração" técnico do seu processo.',
    next: 'a redação do memorial descritivo.'
  },
  'Memorial Descritivo': {
    simple: 'redação técnica detalhada do imóvel',
    description: 'Estamos descrevendo detalhadamente todos os materiais, áreas e especificações técnicas conforme exigido por lei.',
    next: 'a emissão das guias de responsabilidade técnica (ART).'
  },
  'ART': {
    simple: 'registro de responsabilidade técnica',
    description: 'Estamos oficializando a responsabilidade técnica junto ao conselho profissional (CREA), garantindo a segurança jurídica da obra.',
    next: 'o protocolo oficial na Prefeitura.'
  },
  'Protocolo Prefeitura': {
    simple: 'análise oficial pela Prefeitura',
    description: 'Seu processo já foi entregue à prefeitura e agora está sendo analisado pelos arquitetos e engenheiros municipais.',
    next: 'a emissão do certificado Habite-se.'
  },
  'Habite-se': {
    simple: 'liberação do certificado de habitação',
    description: 'Estamos na fase final de aprovação municipal para certificar que o imóvel está pronto e seguro para uso oficial.',
    next: 'o registro final no Cartório de Imóveis.'
  },
  'Certidão de Área Construída': {
    simple: 'emissão da certidão oficial de área',
    description: 'Estamos obtendo o documento que comprova exatamente quanto de área construída o seu imóvel possui oficialmente.',
    next: 'a averbação no Cartório.'
  },
  'Cartório': {
    simple: 'registro final na matrícula do imóvel',
    description: 'Esta é a última etapa! Estamos registrando todas as atualizações diretamente na matrícula (escritura) do seu imóvel no Cartório de Registro de Imóveis.',
    next: 'a entrega da sua documentação totalmente regularizada.'
  }
};

export function generateAISummary(data: ProcessData) {
  const { etapa, status, documentosPendentes } = data;
  
  if (!etapa) {
    return {
      title: 'Iniciando seu Processo',
      content: `Seu processo de ${data.tipo} foi cadastrado com sucesso. Nossa equipe técnica está preparando os primeiros passos para a regularização do seu imóvel.`,
      status: 'success'
    };
  }

  const info = ETAPA_TRANSLATIONS[etapa] || {
    simple: 'análise técnica',
    description: 'Seu processo está avançando conforme o cronograma técnico estabelecido.',
    next: 'a próxima etapa de validação.'
  };

  let intro = '';
  if (status === 'atrasado') {
    intro = 'Seu processo requer um pouco mais de atenção no momento. ';
  } else if (status === 'concluido') {
    intro = 'Excelente notícia! Seu processo foi finalizado com sucesso. ';
  } else {
    intro = 'Seu processo está progredindo normalmente. ';
  }

  const content = `
    ${intro} No momento, estamos na fase de **${info.simple}**.
    
    ${info.description} 
    
    ${documentosPendentes > 0 ? `Notamos que faltam ${documentosPendentes} documento(s) da sua parte para agilizarmos o trâmite.` : 'Toda a documentação necessária já está em nossas mãos.'}
    
    O próximo passo será **${info.next}**
  `.trim();

  return {
    title: `Resumo: ${etapa}`,
    content,
    status: status === 'atrasado' ? 'warning' : 'success'
  };
}
