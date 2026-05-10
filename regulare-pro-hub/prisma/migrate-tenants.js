const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Migração Multi-Tenant...");

  // 1. Criar a Empresa Principal
  const empresa = await prisma.empresa.upsert({
    where: { id: 'default-tenant' },
    update: {},
    create: {
      id: 'default-tenant',
      nomeFantasia: "HBS Engenharia",
      razaoSocial: "HBS Soluções em Engenharia LTDA",
      cnpj: "00.000.000/0001-00",
      email: "contato@hbsengenharia.com.br",
    }
  });

  console.log(`✅ Empresa Principal criada: ${empresa.nomeFantasia}`);

  const empresaId = empresa.id;

  // 2. Vincular todos os registros existentes à Empresa Principal
  console.log("🔗 Vinculando registros...");

  const updatePayload = { data: { empresaId } };

  await Promise.all([
    prisma.user.updateMany(updatePayload),
    prisma.cliente.updateMany(updatePayload),
    prisma.imovel.updateMany(updatePayload),
    prisma.processo.updateMany(updatePayload),
    prisma.financeiro.updateMany(updatePayload),
    prisma.tarefa.updateMany(updatePayload),
    prisma.documento.updateMany(updatePayload),
    prisma.log.updateMany(updatePayload),
    prisma.alerta.updateMany(updatePayload),
  ]);

  console.log("✨ Migração concluída com sucesso!");
}

main()
  .catch(e => {
    console.error("❌ Erro na migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
