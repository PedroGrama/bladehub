import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { TrackerClient } from "./TrackerClient";

export default async function AppointmentTrackingPage({ params }: { params: Promise<{ slug: string, appointmentId: string }> }) {
  const { slug, appointmentId } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: true,
      barber: true,
    },
  });

  if (!appointment) return notFound();

  const tenant = await prisma.tenant.findUnique({
    where: { id: appointment.tenantId },
    select: { slug: true, name: true },
  });

  if (!tenant || tenant.slug !== slug) return notFound();

  const barber = await prisma.user.findUnique({
    where: { id: appointment.barberId },
    select: { name: true },
  });

  const items = await prisma.appointmentItem.findMany({
    where: { appointmentId: appointment.id },
    select: { nameSnapshot: true },
  });

  const apptData = {
    id: appointment.id,
    scheduledStart: appointment.scheduledStart.toISOString(),
    status: appointment.status,
    checkedIn: !!appointment.clientConfirmedAt,
    tenantName: tenant.name,
    barberName: barber?.name ?? "Profissional indisponível",
    clientName: appointment.client.name,
    clientPhone: appointment.client.phone,
    totalPrice: Number(appointment.pricingFinal),
    services: items.map((i) => i.nameSnapshot).join(", "),
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 p-4 md:p-8 flex items-center justify-center">
      <TrackerClient appointment={apptData} slug={slug} />
    </div>
  );
}
