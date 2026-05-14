import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import { AppointmentWorkflow } from "./AppointmentWorkflow";
import { getAppointmentStatusLabel } from "@/lib/labels";
import { BackButton } from "@/components/BackButton";
import { getLoyaltyProgress } from "@/server/loyalty/getLoyaltyProgress";
import { normalizePhoneDigits } from "@/lib/phoneDigits";

function serializeValue(value: any): any {
  if (value === null || value === undefined) return value;

  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString();
    if (value.constructor?.name?.startsWith?.("Decimal")) return value.toString();
    if (Array.isArray(value)) return value.map(serializeValue);

    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, serializeValue(val)])
    );
  }

  return value;
}

function serializeAppointmentData(data: any) {
  return serializeValue(data);
}

function serializeService(service: any) {
  return serializeValue(service);
}

function serializePixKey(pixKey: any) {
  return serializeValue(pixKey);
}

export default async function AppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");

  const appointment = await prisma.appointment.findFirst({
    where: { id: resolvedParams.id, tenantId: user.tenantId },
    select: {
      id: true,
      tenantId: true,
      barberId: true,
      clientId: true,
      scheduledStart: true,
      status: true,
      clientConfirmedAt: true,
      pricingFinal: true,
      origin: true,
      discountApplied: true,
      consentAccepted: true,
      consentAcceptedAt: true,
      pricingOriginal: true,
      notes: true,
      createdAt: true,
      client: {
        select: { id: true, name: true, phone: true }
      },
      barber: {
        select: { id: true, name: true }
      },
      items: {
        select: {
          id: true,
          nameSnapshot: true,
          durationMinutesSnapshot: true,
          unitPriceSnapshot: true,
          quantity: true,
          serviceId: true,
        }
      }
    }
  });

  if (!appointment) return notFound();

  const services = await prisma.service.findMany({
    where: { tenantId: user.tenantId, isActive: true },
    select: {
      id: true,
      name: true,
      basePrice: true,
      durationMinutes: true,
    }
  });

  // Próximos agendamentos do mesmo barbeiro
  const upcomingAppointments = appointment.barberId
    ? await prisma.appointment.findMany({
        where: {
          tenantId: user.tenantId,
          barberId: appointment.barberId,
          status: { not: "cancelled" },
          scheduledStart: { gt: appointment.scheduledStart }
        },
        orderBy: { scheduledStart: "asc" },
        take: 2,
        select: {
          id: true,
          scheduledStart: true,
          status: true,
          clientConfirmedAt: true,
          client: { select: { id: true, name: true } }
        }
      })
    : [];

  // Load Pix Key
  const pixKey = await prisma.pixKey.findFirst({
    where: { tenantId: user.tenantId, isActive: true }
  });

  const barbers = await prisma.user.findMany({
    where: { tenantId: user.tenantId, isBarber: true, isActive: true, deletedAt: null },
    select: { id: true, name: true }
  });

  // Load loyalty progress
  const loyaltyProgress = appointment.client
    ? await getLoyaltyProgress(user.tenantId, appointment.client.phone)
    : null;


  // Serialize data for client component
  const serializedAppointment = serializeAppointmentData(appointment);
  const serializedServices = services.map(serializeService);
  const serializedPixKey = serializePixKey(pixKey);
  const serializedUpcomingAppointments = upcomingAppointments.map(serializeAppointmentData);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Detalhes do Agendamento</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
            <h2 className="text-sm text-zinc-500 uppercase font-semibold tracking-wider mb-4">Informações</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-zinc-500">Cliente</span>
                <span className="font-medium">{appointment.client?.name ?? "Cliente não disponível"}</span>
                <span className="block text-xs text-zinc-400">{appointment.client?.phone ?? "Telefone não disponível"}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Data e Hora</span>
                <span className="font-medium">
                  {appointment.scheduledStart.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', hour12: false })}
                </span>
              </div>
              <div>
                <span className="block text-zinc-500">Barbeiro</span>
                <span className="font-medium">{appointment.barber?.name ?? "Não definido"}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Status</span>
                <span className="font-bold uppercase tracking-wider">
                  {getAppointmentStatusLabel(appointment.status, Boolean(appointment.clientConfirmedAt), appointment.scheduledStart)}
                </span>
              </div>
            </div>
          </div>
          <BackButton fallback="/tenant" label="Voltar para Agenda" variant="button" className="w-full text-center" />
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-2xl shadow-sm min-h-[400px]">
             <AppointmentWorkflow 
               appointment={serializedAppointment} 
               tenantServices={serializedServices} 
               pixKey={serializedPixKey}
               currentUserId={user.id}
               barbersList={barbers}
               upcomingAppointments={serializedUpcomingAppointments}
               loyaltyProgress={loyaltyProgress}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
