export const PROCESS_TEMPLATES: Record<string, any> = {
  regularizacao: {
    id: 'regularizacao',
    label: 'Regularização Imobiliária',
    icon: 'Building2',
    description: 'Fluxo completo de legalização desde o levantamento até o cartório.',
    basePrice: 15000,
    stages: [
      { titulo: 'Levantamento Cadastral', tipo: 'tarefa' },
      { titulo: 'Projeto Arquitetônico', tipo: 'tarefa' },
      { titulo: 'Memorial Descritivo', tipo: 'tarefa' },
      { titulo: 'ART', tipo: 'tarefa' },
      { titulo: 'Protocolo Prefeitura', tipo: 'protocolo', orgao: 'PREFEITURA MUNICIPAL' },
      { titulo: 'Habite-se', tipo: 'protocolo', orgao: 'PREFEITURA MUNICIPAL' },
      { titulo: 'Certidão de Área Construída', tipo: 'tarefa' },
      { titulo: 'Cartório', tipo: 'protocolo', orgao: 'CARTÓRIO DE REGISTRO' }
    ],
    documents: [
      { nome: 'Documento Pessoal (RG/CPF)', categoria: 'Pessoal' },
      { nome: 'Comprovante de Residência', categoria: 'Pessoal' },
      { nome: 'Matrícula Atualizada', categoria: 'Imóvel' },
      { nome: 'Carnê de IPTU', categoria: 'Imóvel' }
    ]
  },
  obra: {
    id: 'obra',
    label: 'Administração de Obra',
    icon: 'Settings2',
    description: 'Gestão e acompanhamento técnico da execução de obras.',
    basePrice: 20000,
    stages: [
      { titulo: 'Cronoanálise e Orçamento', tipo: 'tarefa' },
      { titulo: 'Cotação de Fornecedores', tipo: 'tarefa' },
      { titulo: 'Instalação do Canteiro', tipo: 'tarefa' },
      { titulo: 'Acompanhamento Estrutural', tipo: 'tarefa' },
      { titulo: 'Acompanhamento de Acabamentos', tipo: 'tarefa' },
      { titulo: 'Entrega Final', tipo: 'tarefa' }
    ],
    documents: [
      { nome: 'Projetos Executivos', categoria: 'Projeto' },
      { croqui: 'Planilha Orçamentária', categoria: 'Financeiro' },
      { nome: 'Contratos de Fornecedores', categoria: 'Contrato' }
    ]
  },
  projeto: {
    id: 'projeto',
    label: 'Projeto Arquitetônico',
    icon: 'Layers',
    description: 'Criação e detalhamento técnico para construção.',
    basePrice: 8000,
    stages: [
      { titulo: 'Briefing com Cliente', tipo: 'tarefa' },
      { titulo: 'Estudo Preliminar', tipo: 'tarefa' },
      { titulo: 'Anteprojeto', tipo: 'tarefa' },
      { titulo: 'Projeto Legal', tipo: 'tarefa' },
      { titulo: 'Aprovação Prefeitura', tipo: 'protocolo', orgao: 'PREFEITURA MUNICIPAL' },
      { titulo: 'Projeto Executivo', tipo: 'tarefa' }
    ],
    documents: [
      { nome: 'Levantamento Topográfico', categoria: 'Imóvel' },
      { nome: 'Diretrizes Municipais', categoria: 'Prefeitura' }
    ]
  },
  averbacao: {
    id: 'averbacao',
    label: 'Averbação de Imóvel',
    icon: 'ClipboardList',
    description: 'Atualização de dados e construção na matrícula.',
    basePrice: 5000,
    stages: [
      { titulo: 'Reunião de Documentos', tipo: 'tarefa' },
      { titulo: 'Análise Cartorária', tipo: 'tarefa' },
      { titulo: 'Protocolo no Cartório', tipo: 'protocolo', orgao: 'CARTÓRIO DE REGISTRO' },
      { titulo: 'Retirada da Matrícula Atualizada', tipo: 'tarefa' }
    ],
    documents: [
      { nome: 'Matrícula Original', categoria: 'Imóvel' },
      { nome: 'Certidão Negativa de Débitos (CND)', categoria: 'Prefeitura' },
      { nome: 'Habite-se', categoria: 'Prefeitura' }
    ]
  }
}

export const getTemplateList = () => Object.values(PROCESS_TEMPLATES)
