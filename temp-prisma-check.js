require('dotenv').config({ path: 'c:\\Users\\X11386732699\\Documents\\Projetos\\barbersaas\\.env' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ['query', 'info', 'warn', 'error'] });

async function main() {
  const users = await prisma.user.findMany({
    where: { role: { in: ['admin_geral', 'tenant_admin'] } },
    select: { id: true, email: true, role: true, isActive: true, passwordHash: true, tenantId: true },
  });
  console.log('admin/tenant-admin users:', users);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('ERROR', err);
    prisma.$disconnect();
    process.exit(1);
  });
