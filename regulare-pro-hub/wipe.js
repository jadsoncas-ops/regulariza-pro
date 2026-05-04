const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.checklist.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.tarefa.deleteMany();
  await prisma.financeiro.deleteMany();
  await prisma.processo.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.empresaConfig.deleteMany();
  await prisma.user.deleteMany();
  console.log('Banco de dados zerado com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
