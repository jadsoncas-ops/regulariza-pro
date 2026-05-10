/**
 * docMapper.ts
 * Centralizes the variable extraction logic for document generation.
 */

export function mapDocumentData(processo: any, empresa: any) {
  const now = new Date();
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dataExtenso = `${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;

  return {
    // Client Data
    client_name: processo.cliente?.nome || 'Não Informado',
    client_document: processo.cliente?.cpf_cnpj || 'Não Informado',
    client_email: processo.cliente?.email || '—',
    
    // Property Data
    property_address: `${processo.imovel?.endereco || 'Não Informado'}, ${processo.imovel?.numero || 'S/N'}`,
    property_neighborhood: processo.imovel?.bairro || '—',
    property_city: `${processo.imovel?.cidade || '—'}/${processo.imovel?.estado || '—'}`,
    property_area_land: processo.imovel?.area_terreno?.toString() || '0.00',
    property_area_built: processo.imovel?.area_construida?.toString() || '0.00',
    property_registration: processo.imovel?.num_matricula || 'Não Informado',
    
    // Process Data
    process_code: processo.codigo_projeto || 'REG-XXX',
    process_type: processo.tipo_regularizacao || 'Regularização Técnica',
    process_category: processo.categoria || 'Engenharia Civil',
    
    // Technical Data
    engineer_name: processo.responsavel || empresa?.nomeFantasia || 'Responsável Técnico',
    engineer_crea: empresa?.crea || '—',
    
    // System Data
    current_date: now.toLocaleDateString('pt-BR'),
    current_date_long: dataExtenso,
    company_name: empresa?.razaoSocial || empresa?.nomeFantasia || 'Regulare Pro Engine'
  };
}
