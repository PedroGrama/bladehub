import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { WalkinForm } from "./WalkinForm";

export default async function NewWalkinPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");

  const { date } = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!tenant) return <div>Tenant não encontrado.</div>;

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id, isActive: true },
    select: {
      id: true,
      name: true,
      basePrice: true,
      durationMinutes: true,
    },
  });

  const barbers = await prisma.user.findMany({
    where: { tenantId: tenant.id, isBarber: true, isActive: true, deletedAt: null },
    select: { id: true, name: true },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Novo Agendamento</h1>
      <p className="text-sm text-zinc-500">Crie um agendamento manual para clientes que chegaram sem marcado ou ligaram.</p>

      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <WalkinForm 
          tenantId={tenant.id}
          services={services} 
          barbers={barbers} 
          currentUserId={user.id}
          isAdmin={user.role === "tenant_admin" || user.role === "admin_geral"}
          initialDate={date}
        />
      </div>
    </div>
  );
}
