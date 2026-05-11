"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { safeRunLoyaltySealForAppointment } from "@/server/loyalty/processLoyaltySeal";

export async function updateAppointmentStatus(id: string, status: any) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  await prisma.appointment.update({
    where: { id, tenantId: user.tenantId },
    data: { status }
  });
  
  revalidatePath(`/tenant`);
  revalidatePath(`/tenant/appointments/${id}`);
}

export async function finalizeReview(appointmentId: string, items: any[], finalTotal: number) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  // Remove os items antigos e insere os novos da revisão
  await prisma.$transaction(async (tx) => {
    await tx.appointmentItem.deleteMany({
      where: { appointmentId }
    });

    const newItems = items.map(i => ({
      appointmentId,
      tenantId: user.tenantId as string,
      serviceId: i.serviceId,
      nameSnapshot: i.nameSnapshot,
      durationMinutesSnapshot: i.durationMinutesSnapshot,
      unitPriceSnapshot: i.unitPriceSnapshot,
      quantity: 1,
      addedByUserId: user.id
    }));

    if (newItems.length > 0) {
      await tx.appointmentItem.createMany({ data: newItems });
    }

    await tx.appointment.update({
      where: { id: appointmentId, tenantId: user.tenantId as string },
      data: {
        status: "awaiting_payment",
        pricingFinal: finalTotal
      }
    });
  });

  revalidatePath(`/tenant/appointments/${appointmentId}`);
}

export async function registerPayment(appointmentId: string, methodStr: string, amount: number, pixKeyId?: string) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  // Prisma enums: PIX_DIRECT, CASH, MERCADO_PAGO_PIX, MERCADO_PAGO_CARD
  // AppointmentStatus: done

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        tenantId: user.tenantId as string,
        appointmentId,
        method: methodStr as any,
        status: "PAID",
        amount,
        pixKeyId: pixKeyId || null,
        paidAt: new Date(),
        createdByUserId: user.id
      }
    });

    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "done" }
    });
  });

  await safeRunLoyaltySealForAppointment(appointmentId);

  revalidatePath(`/tenant/appointments/${appointmentId}`);
  revalidatePath(`/tenant`);
}

export async function repassAppointment(appointmentId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.tenantId !== user.tenantId) throw new Error("Não encontrado");

  const otherBarbers = await prisma.user.findMany({
    where: { tenantId: user.tenantId, isBarber: true, isActive: true, id: { not: appt.barberId } }
  });

  let selectedBarberId = null;
  for (const barber of otherBarbers) {
    const conflict = await prisma.appointment.findFirst({
      where: {
        tenantId: user.tenantId,
        barberId: barber.id,
        status: { not: "cancelled" },
        OR: [
          { scheduledStart: { lt: appt.scheduledEnd }, scheduledEnd: { gt: appt.scheduledStart } }
        ]
      }
    });
    
    // Simplification: We assume if there's no appointment conflict, we can repass.
    // In a fully strict system, we would also verify if the other barber's BusinessHours are open.
    if (!conflict) {
      selectedBarberId = barber.id;
      break;
    }
  }

  if (selectedBarberId) {
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { barberId: selectedBarberId }
    });
    revalidatePath(`/tenant`);
    revalidatePath(`/tenant/appointments/${appointmentId}`);
    return { repassed: true };
  } else {
    // Cancel it
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: "cancelled" }
    });
    revalidatePath(`/tenant`);
    revalidatePath(`/tenant/appointments/${appointmentId}`);
    return { repassed: false };
  }
}

export async function updateAppointmentBarber(id: string, barberId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  await prisma.appointment.update({
    where: { id, tenantId: user.tenantId },
    data: { barberId }
  });
  
  revalidatePath(`/tenant`);
  revalidatePath(`/tenant/appointments/${id}`);
}

export async function validateAndAddService(appointmentId: string, serviceId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  const appt = await prisma.appointment.findUnique({ 
    where: { id: appointmentId },
    include: { items: true } 
  });

  if (!service || !appt || appt.tenantId !== user.tenantId) throw new Error("Dados inválidos.");

  const newItems = [...appt.items, {
    serviceId: service.id,
    nameSnapshot: service.name,
    unitPriceSnapshot: service.basePrice,
    durationMinutesSnapshot: service.durationMinutes,
  }];

  const totalExtraMinutes = service.durationMinutes;
  const newScheduledEnd = new Date(appt.scheduledEnd.getTime() + totalExtraMinutes * 60000);

  // 1. Validar conflito com próximo agendamento do barbeiro
  const conflict = await prisma.appointment.findFirst({
    where: {
      tenantId: user.tenantId,
      barberId: appt.barberId,
      id: { not: appointmentId },
      status: { in: ["confirmed", "in_progress", "awaiting_payment"] },
      scheduledStart: { lt: newScheduledEnd },
      scheduledEnd: { gt: appt.scheduledStart }
    }
  });

  if (conflict) {
    throw new Error(`Conflito com o próximo agendamento às ${conflict.scheduledStart.toLocaleTimeString()}.`);
  }

  // 2. Validar horário de funcionamento do estabelecimento
  const weekday = appt.scheduledStart.getDay();
  const businessHour = await prisma.tenantBusinessHour.findFirst({
    where: { tenantId: user.tenantId, weekday, isClosed: false }
  });

  if (businessHour) {
    const [endH, endM] = businessHour.endTime.split(":").map(Number);
    const limitDate = new Date(appt.scheduledStart);
    limitDate.setHours(endH, endM, 0, 0);

    if (newScheduledEnd > limitDate) {
      throw new Error(`O serviço excede o horário de funcionamento (${businessHour.endTime}).`);
    }
  }

  // 3. Validar horário do profissional
  const barberHour = await prisma.barberBusinessHour.findFirst({
    where: { tenantId: user.tenantId, barberId: appt.barberId, weekday, isClosed: false }
  });

  if (barberHour) {
    const [endH, endM] = barberHour.endTime.split(":").map(Number);
    const limitDate = new Date(appt.scheduledStart);
    limitDate.setHours(endH, endM, 0, 0);

    if (newScheduledEnd > limitDate) {
      throw new Error(`O serviço excede o expediente do profissional (${barberHour.endTime}).`);
    }
  }

  // Se tudo ok, atualizar
  await prisma.$transaction([
    prisma.appointmentItem.create({
      data: {
        appointmentId,
        tenantId: user.tenantId,
        serviceId: service.id,
        nameSnapshot: service.name,
        durationMinutesSnapshot: service.durationMinutes,
        unitPriceSnapshot: service.basePrice,
        addedByUserId: user.id
      }
    }),
    prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledEnd: newScheduledEnd,
        pricingOriginal: { increment: service.basePrice },
        pricingFinal: { increment: service.basePrice }
      }
    })
  ]);

  revalidatePath(`/tenant/appointments/${appointmentId}`);
}
