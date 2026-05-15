import { prisma } from '../src/server/db.ts';

async function main() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  let currentSeq = 2; // seed-tenant-1 is 1
  for (const tenant of tenants) {
    if (!tenant.id.startsWith('seed-tenant-')) {
      const newId = `seed-tenant-${currentSeq++}`;
      console.log(`Updating ${tenant.id} (${tenant.name}) to ${newId}`);
      try {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { id: newId }
        });
        console.log(`Successfully updated ${tenant.name}`);
      } catch (e) {
        console.error(`Failed to update ${tenant.name}:`, e);
      }
    } else {
        // If it starts with seed-tenant-x, update maxSeq to not overlap
        const numStr = tenant.id.replace('seed-tenant-', '');
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num >= currentSeq) {
            currentSeq = num + 1;
        }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
