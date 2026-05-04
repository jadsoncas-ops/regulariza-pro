// Mock data centralizado para o MVP visual EngArqGestão.

export type ProcessStage =
  | "Entrada"
  | "Levantamento"
  | "Projeto Técnico"
  | "Prefeitura"
  | "Cartório"
  | "Finalização";

export const stages: ProcessStage[] = [
  "Entrada",
  "Levantamento",
  "Projeto Técnico",
  "Prefeitura",
  "Cartório",
  "Finalização",
];

export interface Cliente {
  id: string;
  nome: string;
  doc: string;
  tipo: "PF" | "PJ";
  email: string;
  telefone: string;
  cidade: string;
  pipeline: "Lead" | "Contato" | "Proposta" | "Contrato" | "Execução" | "Finalizado";
  processosAtivos: number;
}

export const clientes: Cliente[] = [
  { id: "CLI-001", nome: "Antônio Ribeiro da Silva", doc: "043.221.882-10", tipo: "PF", email: "antonio.ribeiro@email.com", telefone: "(11) 98221-4408", cidade: "São Paulo / SP", pipeline: "Execução", processosAtivos: 2 },
  { id: "CLI-002", nome: "Comercial Machado & Cia", doc: "21.882.404/0001-22", tipo: "PJ", email: "obras@machado.com.br", telefone: "(11) 4002-1188", cidade: "Guarulhos / SP", pipeline: "Contrato", processosAtivos: 1 },
  { id: "CLI-003", nome: "Espólio de Mendonça", doc: "182.044.882-00", tipo: "PF", email: "advogado@mendonca.adv.br", telefone: "(11) 99412-7782", cidade: "Osasco / SP", pipeline: "Execução", processosAtivos: 1 },
  { id: "CLI-004", nome: "Fábrica Têxtil Aurora", doc: "08.882.104/0001-44", tipo: "PJ", email: "engenharia@aurora.ind.br", telefone: "(11) 3344-9912", cidade: "São Bernardo / SP", pipeline: "Execução", processosAtivos: 3 },
  { id: "CLI-005", nome: "Cond. Jardins do Vale", doc: "33.221.448/0001-90", tipo: "PJ", email: "sindico@jardinsdovale.com", telefone: "(11) 5512-8821", cidade: "Santo André / SP", pipeline: "Proposta", processosAtivos: 0 },
  { id: "CLI-006", nome: "Helena Cavalcanti", doc: "302.114.882-44", tipo: "PF", email: "helena.cv@email.com", telefone: "(11) 98140-7710", cidade: "São Paulo / SP", pipeline: "Lead", processosAtivos: 0 },
  { id: "CLI-007", nome: "Agropecuária Santa Clara", doc: "11.882.331/0001-08", tipo: "PJ", email: "fiscal@santaclara.agr", telefone: "(15) 3221-0098", cidade: "Sorocaba / SP", pipeline: "Execução", processosAtivos: 1 },
  { id: "CLI-008", nome: "Irmãos Cavalcanti Holding", doc: "44.118.882/0001-77", tipo: "PJ", email: "juridico@ich.com.br", telefone: "(11) 3300-4488", cidade: "São Paulo / SP", pipeline: "Contato", processosAtivos: 0 },
];

export interface Imovel {
  id: string;
  matricula: string;
  endereco: string;
  cidade: string;
  clienteId: string;
  areaTerreno: number;
  areaConstruida: number;
  tipo: "Residencial" | "Comercial" | "Industrial" | "Rural" | "Misto";
  status: "Regularizado" | "Em análise" | "Documento pendente" | "Iniciar";
}

export const imoveis: Imovel[] = [
  { id: "IMV-001", matricula: "88.402", endereco: "Av. das Américas, 3301", cidade: "São Paulo", clienteId: "CLI-003", areaTerreno: 1240, areaConstruida: 880, tipo: "Residencial", status: "Em análise" },
  { id: "IMV-002", matricula: "44.119", endereco: "Rua Aurora, 102", cidade: "Guarulhos", clienteId: "CLI-002", areaTerreno: 480, areaConstruida: 320, tipo: "Comercial", status: "Documento pendente" },
  { id: "IMV-003", matricula: "92.001", endereco: "Cond. Vale Verde, Q3 — Lote 12", cidade: "São Paulo", clienteId: "CLI-005", areaTerreno: 360, areaConstruida: 280, tipo: "Residencial", status: "Em análise" },
  { id: "IMV-004", matricula: "12.840", endereco: "Galpão Logístico — Av. Industrial, 4400", cidade: "São Bernardo", clienteId: "CLI-004", areaTerreno: 5200, areaConstruida: 3400, tipo: "Industrial", status: "Em análise" },
  { id: "IMV-005", matricula: "77.214", endereco: "Estrada do Mendanha, Lote 5", cidade: "Osasco", clienteId: "CLI-001", areaTerreno: 720, areaConstruida: 410, tipo: "Residencial", status: "Regularizado" },
  { id: "IMV-006", matricula: "33.881", endereco: "Fazenda Santa Clara — Gleba A", cidade: "Sorocaba", clienteId: "CLI-007", areaTerreno: 84000, areaConstruida: 1200, tipo: "Rural", status: "Em análise" },
  { id: "IMV-007", matricula: "55.140", endereco: "Rua das Indústrias, 442", cidade: "Guarulhos", clienteId: "CLI-002", areaTerreno: 1800, areaConstruida: 1500, tipo: "Industrial", status: "Iniciar" },
];

export interface Processo {
  id: string;
  ref: string;
  imovelId: string;
  tipo: "Habite-se" | "Desmembramento" | "Unificação" | "Averbação" | "Usucapião" | "Alvará" | "Retificação";
  responsavel: string;
  abertura: string;
  prazo: string;
  stage: ProcessStage;
  highlight?: boolean;
  alert?: string;
}

export const processos: Processo[] = [
  { id: "PRC-001", ref: "REQ-8842", imovelId: "IMV-001", tipo: "Desmembramento", responsavel: "Helena Torres", abertura: "12/09", prazo: "30/11", stage: "Levantamento" },
  { id: "PRC-002", ref: "REQ-8849", imovelId: "IMV-002", tipo: "Unificação", responsavel: "Marcos Barros", abertura: "20/09", prazo: "05/12", stage: "Entrada" },
  { id: "PRC-003", ref: "PRC-9105", imovelId: "IMV-003", tipo: "Habite-se", responsavel: "Helena Torres", abertura: "01/08", prazo: "15/11", stage: "Prefeitura", highlight: true, alert: "Exigência: laudo bombeiros" },
  { id: "PRC-004", ref: "PRC-9201", imovelId: "IMV-004", tipo: "Alvará", responsavel: "Marcos Barros", abertura: "10/09", prazo: "20/11", stage: "Prefeitura" },
  { id: "PRC-005", ref: "REG-7721", imovelId: "IMV-005", tipo: "Averbação", responsavel: "Helena Torres", abertura: "02/08", prazo: "22/11", stage: "Cartório" },
  { id: "PRC-006", ref: "DES-4092", imovelId: "IMV-006", tipo: "Retificação", responsavel: "Marcos Barros", abertura: "14/10", prazo: "12/12", stage: "Projeto Técnico" },
  { id: "PRC-007", ref: "USC-3884", imovelId: "IMV-005", tipo: "Usucapião", responsavel: "Helena Torres", abertura: "05/07", prazo: "30/11", stage: "Finalização" },
  { id: "PRC-008", ref: "ALV-8801", imovelId: "IMV-007", tipo: "Alvará", responsavel: "Marcos Barros", abertura: "18/10", prazo: "10/12", stage: "Entrada" },
  { id: "PRC-009", ref: "HAB-7710", imovelId: "IMV-002", tipo: "Habite-se", responsavel: "Helena Torres", abertura: "22/10", prazo: "18/12", stage: "Levantamento" },
];

export interface Documento {
  id: string;
  nome: string;
  tipo: "Matrícula" | "IPTU" | "Escritura" | "Planta" | "Memorial" | "ART" | "Habite-se";
  processoRef: string;
  versao: string;
  tamanho: string;
  atualizado: string;
  status: "OK" | "Pendente" | "Revisar";
}

export const documentos: Documento[] = [
  { id: "DOC-449", nome: "Planta_Baixa_Rev03.pdf", tipo: "Planta", processoRef: "PRC-9105", versao: "v3", tamanho: "2.4 MB", atualizado: "Hoje", status: "OK" },
  { id: "DOC-448", nome: "Matricula_88402.pdf", tipo: "Matrícula", processoRef: "REQ-8842", versao: "v1", tamanho: "880 KB", atualizado: "Ontem", status: "OK" },
  { id: "DOC-447", nome: "ART_Execucao.pdf", tipo: "ART", processoRef: "PRC-9105", versao: "v2", tamanho: "412 KB", atualizado: "14/10", status: "Revisar" },
  { id: "DOC-446", nome: "Memorial_Descritivo.docx", tipo: "Memorial", processoRef: "REG-7721", versao: "v1", tamanho: "184 KB", atualizado: "12/10", status: "OK" },
  { id: "DOC-445", nome: "IPTU_2026.pdf", tipo: "IPTU", processoRef: "PRC-9201", versao: "v1", tamanho: "120 KB", atualizado: "10/10", status: "Pendente" },
  { id: "DOC-444", nome: "Escritura_Mendonça.pdf", tipo: "Escritura", processoRef: "REQ-8842", versao: "v1", tamanho: "3.1 MB", atualizado: "08/10", status: "OK" },
  { id: "DOC-443", nome: "Habite-se_Aurora.pdf", tipo: "Habite-se", processoRef: "ALV-8801", versao: "v1", tamanho: "640 KB", atualizado: "01/10", status: "Pendente" },
];

export interface Lancamento {
  id: string;
  tipo: "Receita" | "Despesa";
  categoria: string;
  cliente?: string;
  valor: number;
  vencimento: string;
  status: "Pago" | "Em aberto" | "Atrasado";
}

export const financeiro: Lancamento[] = [
  { id: "FIN-001", tipo: "Receita", categoria: "Honorários — Habite-se", cliente: "Cond. Jardins do Vale", valor: 18500, vencimento: "20/11", status: "Em aberto" },
  { id: "FIN-002", tipo: "Receita", categoria: "Honorários — Desmembramento", cliente: "Espólio de Mendonça", valor: 22000, vencimento: "05/12", status: "Em aberto" },
  { id: "FIN-003", tipo: "Receita", categoria: "Projeto Técnico", cliente: "Fábrica Têxtil Aurora", valor: 14400, vencimento: "10/11", status: "Atrasado" },
  { id: "FIN-004", tipo: "Receita", categoria: "Averbação", cliente: "Antônio Ribeiro", valor: 6800, vencimento: "30/10", status: "Pago" },
  { id: "FIN-005", tipo: "Despesa", categoria: "Taxa Prefeitura — SMU", valor: 1240, vencimento: "18/11", status: "Em aberto" },
  { id: "FIN-006", tipo: "Despesa", categoria: "Cartório — Averbação", valor: 980, vencimento: "12/11", status: "Pago" },
  { id: "FIN-007", tipo: "Despesa", categoria: "Topografia terceirizada", valor: 3200, vencimento: "22/11", status: "Em aberto" },
  { id: "FIN-008", tipo: "Despesa", categoria: "Deslocamento — Sorocaba", valor: 480, vencimento: "08/11", status: "Pago" },
];

export interface Tarefa {
  id: string;
  titulo: string;
  tipo: "Visita" | "Levantamento" | "Protocolo" | "Entrega" | "Reunião";
  data: string;
  hora: string;
  responsavel: string;
  processoRef?: string;
}

export const agenda: Tarefa[] = [
  { id: "TSK-001", titulo: "Visita técnica — Cond. Vale Verde", tipo: "Visita", data: "14 NOV", hora: "09:00", responsavel: "Helena Torres", processoRef: "PRC-9105" },
  { id: "TSK-002", titulo: "Protocolo SMU — Alvará Aurora", tipo: "Protocolo", data: "14 NOV", hora: "14:30", responsavel: "Marcos Barros", processoRef: "ALV-8801" },
  { id: "TSK-003", titulo: "Levantamento arquitetônico — Galpão", tipo: "Levantamento", data: "15 NOV", hora: "08:00", responsavel: "Helena Torres", processoRef: "PRC-9201" },
  { id: "TSK-004", titulo: "Reunião com cliente — Mendonça", tipo: "Reunião", data: "15 NOV", hora: "16:00", responsavel: "Marcos Barros", processoRef: "REQ-8842" },
  { id: "TSK-005", titulo: "Entrega de documentos — Cartório", tipo: "Entrega", data: "16 NOV", hora: "10:00", responsavel: "Helena Torres", processoRef: "REG-7721" },
  { id: "TSK-006", titulo: "Visita — Fazenda Santa Clara", tipo: "Visita", data: "17 NOV", hora: "07:30", responsavel: "Marcos Barros", processoRef: "DES-4092" },
];
