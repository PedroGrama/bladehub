import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import { AppointmentWorkflow } from "./AppointmentWorkflow";
import { getStatusLabel } from "@/lib/labels";
import { BackButton } from "@/components/BackButton";

// Helper function to serialize Decimal values
function serializeAppointmentData(data: any) {
  return {
    ...data,
    scheduledStart: data.scheduledStart.toISOString(),
    scheduledEnd: data.scheduledEnd.toISOString(),
    pricingOriginal: data.pricingOriginal.toString(),
    discountApplied: data.discountApplied.toString(),
    pricingFinal: data.pricingFinal.toString(),
    items: data.items.map((item: any) => ({
      ...item,
      unitPriceSnapshot: item.unitPriceSnapshot.toString(),
    })),
  };
}

function serializeService(service: any) {
  return {
    ...service,
    basePrice: service.basePrice.toString(),
  };
}

function serializePixKey(pixKey: any) {
  if (!pixKey) return null;
  return pixKey;
}

export default async function AppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");

  const appointment = await prisma.appointment.findUnique({
    where: { id: resolvedParams.id, tenantId: user.tenantId },
    include: {
      client: true,
      barber: true,
      items: {
        include: { service: true }
      }
    }
  });

  if (!appointment) return notFound();

  // Load tenant services for the Review Screen
  const services = await prisma.service.findMany({
    where: { tenantId: user.tenantId, isActive: true }
  });

  // Load Pix Key
  const pixKey = await prisma.pixKey.findFirst({
    where: { tenantId: user.tenantId, isActive: true }
  });

  const barbers = await prisma.user.findMany({
    where: { tenantId: user.tenantId, isBarber: true, isActive: true, deletedAt: null },
    select: { id: true, name: true }
  });

  // Serialize data for client component
  const serializedAppointment = serializeAppointmentData(appointment);
  const serializedServices = services.map(serializeService);
  const serializedPixKey = serializePixKey(pixKey);

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
                <span className="font-medium">{appointment.client.name}</span>
                <span className="block text-xs text-zinc-400">{appointment.client.phone}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Data e Hora</span>
                <span className="font-medium">
                  {appointment.scheduledStart.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', hour12: false })}
                </span>
              </div>
              <div>
                <span className="block text-zinc-500">Barbeiro</span>
                <span className="font-medium">{appointment.barber.name}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Status</span>
                <span className="font-bold uppercase tracking-wider">{getStatusLabel(appointment.status, 'appointment')}</span>
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
             />
          </div>
        </div>
      </div>
    </div>
  );
}
