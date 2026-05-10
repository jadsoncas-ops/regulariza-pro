const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const empresaId = 'default-tenant'; // HBS Engenharia

  const templates = [
    { etapa: 'Prefeitura', titulo: 'Conferir documentação técnica', descricao: 'Validar plantas, memoriais e ARTs antes do protocolo.' },
    { etapa: 'Prefeitura', titulo: 'Protocolar pedido de análise', descricao: 'Gerar protocolo no sistema municipal.' },
    { etapa: 'Prefeitura', titulo: 'Acompanhar análise técnica', descricao: 'Verificar comunique-se semanalmente.' },
    
    { etapa: 'Cartório', titulo: 'Conferir matrícula atualizada', descricao: 'Verificar proprietário e ônus reais.' },
    { etapa: 'Cartório', titulo: 'Solicitar certidão de ônus', descricao: 'Certidão necessária para o registro.' },
    { etapa: 'Cartório', titulo: 'Protocolar registro de imóvel', descricao: 'Entrega física ou digital no RI.' },
    
    { etapa: 'Levantamento', titulo: 'Agendar visita técnica', descricao: 'Alinhar horário com o proprietário.' },
    { etapa: 'Levantamento', titulo: 'Coleta de dados planialtimétricos', descricao: 'Medição completa do perímetro e áreas.' },
  ];

  console.log("🛠️ Semeando Templates de Tarefas...");

  for (const t of templates) {
    await prisma.taskTemplate.create({
      data: {
        ...t,
        empresaId,
        prioridade: 'normal'
      }
    });
  }

  console.log("✅ Templates semeados com sucesso!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
