const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log("Iniciando limpeza de usuários duplicados...");
  
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const seenEmails = new Set();
  const duplicateIds = [];

  for (const user of allUsers) {
    if (seenEmails.has(user.email)) {
      duplicateIds.push(user.id);
    } else {
      seenEmails.add(user.email);
    }
  }

  if (duplicateIds.length > 0) {
    console.log(`Encontrados ${duplicateIds.length} usuários duplicados. Removendo...`);
    const result = await prisma.user.deleteMany({
      where: {
        id: { in: duplicateIds },
      },
    });
    console.log(`Removidos ${result.count} usuários.`);
  } else {
    console.log("Nenhum usuário duplicado encontrado.");
  }

  await prisma.$disconnect();
}

cleanupDuplicates().catch(err => {
  console.error(err);
  process.exit(1);
});
