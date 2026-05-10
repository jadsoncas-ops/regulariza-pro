const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@regulapro.com.br";
  
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: "admin123_change_me", // In real production, use bcrypt
        role: "admin"
      }
    });
    console.log("✅ Admin padrão criado: admin@regulapro.com.br / admin123_change_me");
  } else {
    console.log("ℹ️ Admin já existe.");
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
