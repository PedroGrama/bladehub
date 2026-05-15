import { prisma } from "@/server/db";

export async function getNextTenantId(): Promise<string> {
  const tenants = await prisma.tenant.findMany({
    select: { id: true }
  });
  
  let maxSeq = 0;
  for (const t of tenants) {
    if (t.id.startsWith('seed-tenant-')) {
      const numStr = t.id.replace('seed-tenant-', '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  
  return `seed-tenant-${maxSeq + 1}`;
}
