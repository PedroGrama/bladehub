const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      emailVerifiedAt: true,
    }
  });

  users.forEach(u => {
    console.log(`${u.email}: ${u.emailVerifiedAt ? 'VERIFIED' : 'NOT VERIFIED'}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
