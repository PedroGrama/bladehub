"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import { revalidatePath } from "next/cache";
import { safeRunLoyaltySealForAppointment } from "@/server/loyalty/processLoyaltySeal";

export async function updateAppointmentStatus(id: string, status: any) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  if (status === "in_progress") {
    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId: user.tenantId }
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado.");
    }

    const existingOpen = await prisma.appointment.findFirst({
      where: {
        tenantId: user.tenantId,
        barberId: appointment.barberId,
        status: "in_progress",
        id: { not: id }
      }
    });

    if (existingOpen) {
      throw new Error("Este profissional já possui um atendimento em andamento. Finalize o agendamento atual antes de iniciar outro.");
    }
  }

  await prisma.appointment.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath(`/tenant`);
  revalidatePath(`/tenant/appointments/${id}`);
}

export async function cancelAppointment(appointmentId: string, reason: string) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");
  if (!reason || reason.trim().length < 7) throw new Error("Informe pelo menos 7 caracteres para justificar o cancelamento.");

  const appt = await prisma.appointment.findFirst({ where: { id: appointmentId, tenantId: user.tenantId } });
  if (!appt) throw new Error("Agendamento não encontrado.");

  await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "cancelled",
        notes: reason.trim(),
      }
    });

  revalidatePath(`/tenant`);
  revalidatePath(`/tenant/appointments/${appointmentId}`);
}

export async function markNoShow(appointmentId: string, reason: string) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");
  if (!reason || reason.trim().length < 7) throw new Error("Informe pelo menos 7 caracteres para justificar a falta.");

  const appt = await prisma.appointment.findFirst({ where: { id: appointmentId, tenantId: user.tenantId } });
  if (!appt) throw new Error("Agendamento não encontrado.");

  await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "no_show",
        notes: reason.trim(),
      }
    });

  revalidatePath(`/tenant`);
  revalidatePath(`/tenant/appointments/${appointmentId}`);
}

export async function rescheduleAppointment(
  appointmentId: string,
  dateStr: string,
  timeStr: string,
  reason: string
) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");
  if (!reason || reason.trim().length < 7) throw new Error("Informe pelo menos 7 caracteres para justificar o reagendamento.");

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId: user.tenantId },
    include: { items: true }
  });

  if (!appt) throw new Error("Agendamento não encontrado.");
  if (appt.status === "cancelled" || appt.status === "done" || appt.status === "no_show") {
    throw new Error("Não é possível reagendar este agendamento.");
  }

  const totalMinutes = appt.items.reduce((sum, item) => sum + item.durationMinutesSnapshot, 0);
  const scheduledStart = new Date(`${dateStr}T${timeStr}:00`);
  const scheduledEnd = new Date(scheduledStart.getTime() + totalMinutes * 60000);

  if (!(scheduledStart instanceof Date) || isNaN(scheduledStart.getTime())) {
    throw new Error("Data/hora inválida.");
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      tenantId: user.tenantId,
      barberId: appt.barberId,
      id: { not: appointmentId },
      status: { not: "cancelled" },
      scheduledStart: { lt: scheduledEnd },
      scheduledEnd: { gt: scheduledStart }
    }
  });

  if (conflict) {
    throw new Error("Este horário conflita com outro agendamento.");
  }

  const weekday = scheduledStart.getDay();
  const businessHour = await prisma.tenantBusinessHour.findFirst({
    where: { tenantId: user.tenantId, weekday, isClosed: false }
  });

  if (businessHour) {
    const [endH, endM] = businessHour.endTime.split(":").map(Number);
    const limitDate = new Date(scheduledStart);
    limitDate.setHours(endH, endM, 0, 0);
    if (scheduledEnd > limitDate) {
      throw new Error(`O serviço excede o horário de funcionamento (${businessHour.endTime}).`);
    }
  }

  const barberHour = await prisma.barberBusinessHour.findFirst({
    where: { tenantId: user.tenantId, barberId: appt.barberId, weekday, isClosed: false }
  });

  if (barberHour) {
    const [endH, endM] = barberHour.endTime.split(":").map(Number);
    const limitDate = new Date(scheduledStart);
    limitDate.setHours(endH, endM, 0, 0);
    if (scheduledEnd > limitDate) {
      throw new Error(`O serviço excede o expediente do profissional (${barberHour.endTime}).`);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledStart,
        scheduledEnd,
        notes: reason.trim(),
      }
    });

    await tx.appointmentReschedule.create({
      data: {
        appointmentId,
        oldStart: appt.scheduledStart,
        oldEnd: appt.scheduledEnd,
        newStart: scheduledStart,
        newEnd: scheduledEnd,
        reason: reason.trim(),
        changedByUserId: user.id
      }
    });
  });

  revalidatePath(`/tenant`);
  revalidatePath(`/tenant/appointments/${appointmentId}`);
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
      where: { id: appointmentId },
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
