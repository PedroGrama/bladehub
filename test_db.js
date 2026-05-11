require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 5 });
  console.log("Users in DB:");
  users.forEach(u => {
     console.log(`- ${u.email} (role: ${u.role}, active: ${u.isActive}, hasPassword: ${!!u.passwordHash})`);
  });

  if (users.length > 0) {
    console.log("Testing password '123456' or 'admin123' on first user...");
    const ok1 = await bcrypt.compare('123456', users[0].passwordHash);
    const ok2 = await bcrypt.compare('admin123', users[0].passwordHash);
    console.log(`Password 123456 match: ${ok1}`);
    console.log(`Password admin123 match: ${ok2}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
