import { prisma } from '../src/server/db.ts';

async function main() {
  try {
    const tenant = await prisma.tenant.findFirst({ where: { name: 'Rose' } });
    if (!tenant) return console.log("Tenant not found");
    
    console.log("Updating tenant ID from", tenant.id, "to seed-tenant-99");
    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { id: 'seed-tenant-99' }
    });
    console.log("Success:", updated.id);
    
    // revert
    await prisma.tenant.update({
      where: { id: 'seed-tenant-99' },
      data: { id: tenant.id }
    });
    console.log("Reverted");
  } catch(e) {
    console.error("Failed to update ID:", e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
