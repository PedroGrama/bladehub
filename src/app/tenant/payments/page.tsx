import Link from "next/link";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { PaymentsClient } from "./PaymentsClient";

export default async function TenantPaymentsPage() {
  const user = await getSessionUser();
  if (!user || !user.tenantId) return null;

  // Get payments from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const payments = await prisma.payment.findMany({
    where: {
      tenantId: user.tenantId,
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: "desc" },
    include: { appointment: { include: { client: true } }, pixKey: true },
  });

  // Serialize for client component
  const serialized = payments.map((p: any) => ({
    id: p.id,
    amount: Number(p.amount),
    method: p.method,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    appointmentId: p.appointmentId,
    appointment: p.appointment ? {
      client: {
        name: p.appointment.client?.name || "Cliente",
      },
    } : undefined,
    pixKey: p.pixKey ? {
      keyType: p.pixKey.keyType,
      keyValue: p.pixKey.keyValue,
    } : undefined,
  }));

  const pendingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId: user.tenantId,
      status: "awaiting_payment",
      createdAt: { gte: sevenDaysAgo },
      payments: { none: {} }
    },
    orderBy: { createdAt: "desc" },
    include: { client: true }
  });

  const serializedPendingAppointments = pendingAppointments.map((a: any) => ({
    id: `app-pending-${a.id}`,
    amount: Number(a.pricingFinal),
    method: "-",
    status: "PENDING",
    createdAt: a.createdAt.toISOString(),
    appointmentId: a.id,
    appointment: {
      client: {
        name: a.client?.name || "Cliente",
      },
    },
    pixKey: undefined,
  }));

  const allPayments = [...serialized, ...serializedPendingAppointments];

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <section>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Pagamentos</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Histórico dos últimos 7 dias</p>
      </section>
      
      <PaymentsClient payments={allPayments} />
    </main>
  );
}

