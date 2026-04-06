import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await (prisma.user as any).updateMany({
    where: {
      emailVerifiedAt: null
    },
    data: {
      emailVerifiedAt: new Date()
    }
  });

  console.log(`Updated ${result.count} users to verified status.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
