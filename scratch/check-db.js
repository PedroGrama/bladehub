import { prisma } from '../src/server/db.ts';

async function main() {
  const barbers = await prisma.user.findMany({
    where: {
      id: { in: ['cmp15xk5m00013cwzy5yz20l3', 'cmp15xk5x00023cwznbg6srfq'] }
    },
    select: { id: true, name: true, tenantId: true }
  });
  console.log("Barbers from the seals:", barbers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
