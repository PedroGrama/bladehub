"use server";

import { prisma } from "@/server/db";
import { headers } from "next/headers";
import { validarTelefone } from "@/lib/validations";
import {
  SLOT_STEP_MINUTES,
  collectSlotsInSegments,
  intersectSegments,
  subtractBreak,
  timeStrToMinutes,
  intervalsOverlap,
  weekdayFromDateStr,
  type TimeSegment,
} from "@/lib/booking-availability";

const rateLimitByIp = new Map<string, { count: number; firstRequest: number }>();

export async function getAvailableBookingSlots(input: {
  tenantId: string;
  dateStr: string; // YYYY-MM-DD
  durationMinutes: number;
  barberId: string | null; // null = qualquer profissional (união)
}): Promise<{ times: string[]; error: string | null }> {
  const { tenantId, dateStr, barberId } = input;
  const durationMinutes = Math.max(0, Math.floor(input.durationMinutes));

  if (!tenantId || !dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { times: [], error: "Data inválida." };
  }
  if (durationMinutes <= 0) {
    return { times: [], error: null };
  }

  try {
    const weekday = weekdayFromDateStr(dateStr);
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999`);

    const tenantHour = await prisma.tenantBusinessHour.findFirst({
      where: { tenantId, weekday },
    });
    if (!tenantHour || tenantHour.isClosed) {
      return { times: [], error: null };
    }

    const tStart = timeStrToMinutes(tenantHour.startTime);
    const tEnd = timeStrToMinutes(tenantHour.endTime);
    const tenantBreakStart = tenantHour.breakStart ? timeStrToMinutes(tenantHour.breakStart) : null;
    const tenantBreakEnd = tenantHour.breakEnd ? timeStrToMinutes(tenantHour.breakEnd) : null;

    const tenantSegs = subtractBreak(tStart, tEnd, tenantBreakStart, tenantBreakEnd);

    const barberRows = await prisma.user.findMany({
      where: {
        tenantId,
        isBarber: true,
        isActive: true,
        deletedAt: null,
        ...(barberId ? { id: barberId } : {}),
      },
      select: { id: true },
    });

    if (barberRows.length === 0) {
      return { times: [], error: "Não há profissionais disponíveis." };
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const isToday = dateStr === todayStr;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const filterFloor = isToday ? nowMins : undefined;

    const slotSet = new Set<string>();

    for (const { id: bid } of barberRows) {
      const barberHour = await prisma.barberBusinessHour.findFirst({
        where: { tenantId, barberId: bid, weekday },
      });
      if (barberHour?.isClosed) continue;

      const barberSegs =
        !barberHour
          ? tenantSegs
          : subtractBreak(
              timeStrToMinutes(barberHour.startTime),
              timeStrToMinutes(barberHour.endTime),
              barberHour.breakStart ? timeStrToMinutes(barberHour.breakStart) : null,
              barberHour.breakEnd ? timeStrToMinutes(barberHour.breakEnd) : null
            );

      const working: TimeSegment[] = [];
      for (const ts of tenantSegs) {
        for (const bs of barberSegs) {
          const x = intersectSegments(ts, bs);
          if (x) working.push(x);
        }
      }

      if (working.length === 0) continue;

      const appointments = await prisma.appointment.findMany({
        where: {
          tenantId,
          barberId: bid,
          status: { not: "cancelled" },
          scheduledStart: { gte: dayStart, lte: dayEnd },
        },
        select: { scheduledStart: true, scheduledEnd: true },
      });

      const apptIntervals = appointments.map((a) => ({
        start: a.scheduledStart.getHours() * 60 + a.scheduledStart.getMinutes(),
        end: a.scheduledEnd.getHours() * 60 + a.scheduledEnd.getMinutes(),
      }));

      const candidates = collectSlotsInSegments(
        working,
        durationMinutes,
        SLOT_STEP_MINUTES,
        filterFloor
      );

      for (const timeStr of candidates) {
        const t = timeStrToMinutes(timeStr);
        const newEnd = t + durationMinutes;
        let conflict = false;
        for (const ap of apptIntervals) {
          if (intervalsOverlap(t, newEnd, ap.start, ap.end)) {
            conflict = true;
            break;
          }
        }
        if (!conflict) slotSet.add(timeStr);
      }
    }

    const times = Array.from(slotSet).sort(
      (a, b) => timeStrToMinutes(a) - timeStrToMinutes(b)
    );
    return { times, error: null };
  } catch (e: unknown) {
    console.error("[getAvailableBookingSlots]", e);
    return { times: [], error: "Não foi possível carregar horários." };
  }
}

export async function createPublicAppointment(data: {
  tenantId: string,
  clientName: string,
  clientPhone: string,
  dateStr: string, // "YYYY-MM-DD"
  timeStr: string, // "HH:MM"
  barberId: string | null,
  serviceIds: string[],
  consentAccepted?: boolean,
  consentAcceptedAt?: string | null,
}) {
  try {
    const { tenantId, clientName, clientPhone, dateStr, timeStr, serviceIds } = data;
    const consentAccepted = Boolean(data.consentAccepted);
    const consentAcceptedAt =
      consentAccepted && data.consentAcceptedAt
        ? new Date(data.consentAcceptedAt)
        : consentAccepted
          ? new Date()
          : null;
    let barberId = data.barberId;

    console.log("[createPublicAppointment] Início do processo", {
      tenantId,
      clientName,
      clientPhone,
      dateStr,
      timeStr,
      barberId,
      serviceIds,
    });

    if (!validarTelefone(clientPhone)) {
      console.warn("[createPublicAppointment] Telefone inválido", { clientPhone });
      return { error: "Formato de telefone inválido. Use (99) 99999-9999 ou (99) 9999-9999." };
    }

    const hdr = await headers();
    const ip = (hdr.get("x-forwarded-for")?.split(",")[0].trim()) || hdr.get("x-real-ip") || "unknown";

    const windowMs = 60 * 60 * 1000;
    const maxRequests = 5;

    const current = Date.now();
    const existing = rateLimitByIp.get(ip) || { count: 0, firstRequest: current };
    if (current - existing.firstRequest > windowMs) {
      existing.count = 0;
      existing.firstRequest = current;
    }

    if (existing.count >= maxRequests) {
      console.warn("[createPublicAppointment] rate limit", { ip, existing });
      return { error: "Limite de agendamentos por IP excedido. Tente novamente em 1 hora." };
    }

    if (!tenantId || !clientName || !clientPhone || !dateStr || !timeStr || serviceIds.length === 0) {
      console.error("[createPublicAppointment] dados obrigatórios ausentes", {
        tenantId,
        clientName,
        clientPhone,
        dateStr,
        timeStr,
        serviceIds,
      });
      return { error: "Todos os campos do agendamento são obrigatórios: nome, telefone, data, hora e serviço." };
    }

    // 1. Get Services to calculate total time and price
    console.log("[createPublicAppointment] Buscando serviços", { serviceIds });
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, tenantId }
    });

    if (services.length !== serviceIds.length) {
      console.warn("[createPublicAppointment] Alguns serviços não foram encontrados", { found: services.length, requested: serviceIds.length });
      return { error: "Alguns serviços selecionados não estão disponíveis." };
    }

    const totalDurationMinutes = services.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalPrice = services.reduce((acc, s) => acc + Number(s.basePrice), 0).toFixed(2);

    // 1.1 Calculate Online Discount
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    let discountAppliedNum = 0;
    const totalPriceNum = Number(totalPrice);

    if (tenant?.appDiscountType === "fixed") {
      discountAppliedNum = Number(tenant.appDiscountValue || 0);
    } else if (tenant?.appDiscountType === "percentage") {
      const pct = Number(tenant.appDiscountValue || 0);
      discountAppliedNum = (totalPriceNum * pct) / 100;
    }

    const pricingFinal = Math.max(0, totalPriceNum - discountAppliedNum).toFixed(2);
    const discountApplied = discountAppliedNum.toFixed(2);

    // Parse Date / timezone
    const scheduledStart = new Date(`${dateStr}T${timeStr}:00`);
    const brasiliaDate = new Date(scheduledStart.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    if (brasiliaDate.getTime() < Date.now()) {
      return { error: "Não é possível agendar horários passados." };
    }

    const scheduledEnd = new Date(scheduledStart.getTime() + totalDurationMinutes * 60000);

    // 2. Round-Robin (Equitable Distribution) if barberId is null
    if (!barberId) {
      const barbers = await prisma.user.findMany({
        where: { tenantId, isBarber: true, isActive: true, deletedAt: null }
      });

      if (barbers.length === 0) {
        return { error: "Não há barbeiros disponíveis nesta barbearia." };
      }

      const startOfDay = new Date(`${dateStr}T00:00:00`);
      const endOfDay = new Date(`${dateStr}T23:59:59`);

      const appointmentCounts = await prisma.appointment.groupBy({
        by: ['barberId'],
        where: {
          tenantId,
          scheduledStart: { gte: startOfDay, lte: endOfDay },
          status: { not: "cancelled" }
        },
        _count: { _all: true }
      });

      const countMap = new Map(appointmentCounts.map(a => [a.barberId, a._count._all]));
      barbers.sort((a, b) => (countMap.get(a.id) || 0) - (countMap.get(b.id) || 0));
      barberId = barbers[0].id;
    }

    // 2.5 Validation: Business Hours
    const weekday = scheduledStart.getDay();
    const startTimeMins = scheduledStart.getHours() * 60 + scheduledStart.getMinutes();
    const endTimeMins = startTimeMins + totalDurationMinutes;

    const timeToMins = (t: string | null) => {
      if (!t) return null;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const tenantHour = await prisma.tenantBusinessHour.findFirst({ where: { tenantId, weekday } });
    if (!tenantHour || tenantHour.isClosed) {
      return { error: "A barbearia está fechada neste dia." };
    }

    const bShopStart = timeToMins(tenantHour.startTime)!;
    const bShopEnd = timeToMins(tenantHour.endTime)!;
    if (startTimeMins < bShopStart || endTimeMins > bShopEnd) {
      return { error: `A barbearia funciona apenas de ${tenantHour.startTime} às ${tenantHour.endTime} neste dia.` };
    }

    const tBreakStart = timeToMins(tenantHour.breakStart);
    const tBreakEnd = timeToMins(tenantHour.breakEnd);
    if (tBreakStart !== null && tBreakEnd !== null) {
      if ((startTimeMins >= tBreakStart && startTimeMins < tBreakEnd) ||
          (endTimeMins > tBreakStart && endTimeMins <= tBreakEnd) ||
          (startTimeMins <= tBreakStart && endTimeMins >= tBreakEnd)) {
        return { error: `Este horário conflita com o horário de pausa da barbearia (${tenantHour.breakStart} às ${tenantHour.breakEnd}).` };
      }
    }

    const barberHour = await prisma.barberBusinessHour.findFirst({ where: { tenantId, barberId, weekday } });
    if (barberHour?.isClosed) {
      return { error: "O barbeiro não atende neste dia." };
    }

    if (barberHour) {
      console.log("[createPublicAppointment] Verificando horário do barbeiro", { barberId, weekday, startTimeMins });
      const bBarbStart = timeToMins(barberHour.startTime)!;
      const bBarbEnd = timeToMins(barberHour.endTime)!;
      if (startTimeMins < bBarbStart || endTimeMins > bBarbEnd) {
        return { error: `O barbeiro atende apenas de ${barberHour.startTime} às ${barberHour.endTime} neste dia.` };
      }

      const bBreakStart = timeToMins(barberHour.breakStart);
      const bBreakEnd = timeToMins(barberHour.breakEnd);
      if (bBreakStart !== null && bBreakEnd !== null) {
        if ((startTimeMins >= bBreakStart && startTimeMins < bBreakEnd) ||
            (endTimeMins > bBreakStart && endTimeMins <= bBreakEnd) ||
            (startTimeMins <= bBreakStart && endTimeMins >= bBreakEnd)) {
          return { error: `Este horário conflita com a pausa do barbeiro (${barberHour.breakStart} às ${barberHour.breakEnd}).` };
        }
      }
    }

    console.log("[createPublicAppointment] Verificando conflitos de agendamento");

    const conflict = await prisma.appointment.findFirst({
      where: {
        tenantId,
        barberId,
        status: { not: "cancelled" },
        OR: [{ scheduledStart: { lt: scheduledEnd }, scheduledEnd: { gt: scheduledStart } }]
      }
    });

    if (conflict) {
      console.warn("[createPublicAppointment] Conflito detectado", { conflictId: conflict.id });
      return { error: "Este horário já foi reservado. Por favor, escolha outro ou não selecione um barbeiro para que busquemos um disponível." };
    }

    // 3. Find or Create Client
    let client = await prisma.client.findFirst({ where: { tenantId, phone: clientPhone } });
    console.log("[createPublicAppointment] cliente encontrado", { clientId: client?.id, blockedAt: client?.blockedAt });
    if (client && client.blockedAt) {
      console.warn("[createPublicAppointment] cliente bloqueado", { clientId: client.id });
      return { error: "Cliente bloqueado. Contate o estabelecimento." };
    }

    if (!client) {
      try {
        client = await prisma.client.create({
          data: { tenantId, name: clientName, phone: clientPhone }
        });
        console.log("[createPublicAppointment] cliente criado", { clientId: client.id });
      } catch (clientError: unknown) {
        const msg = clientError instanceof Error ? clientError.message : String(clientError);
        const stack = clientError instanceof Error ? clientError.stack : undefined;
        console.error("[createPublicAppointment] falha ao criar client", { error: msg, stack });
        return { error: "Falha ao criar cliente do agendamento. Tente novamente." };
      }
    }

    if (!client?.id) {
      console.error("[createPublicAppointment] clientId ausente após criação/busca", { client });
      return { error: "Não foi possível identificar o cliente para o agendamento." };
    }

    // 4. Create Appointment and Items
    console.log("[createPublicAppointment] preparando criar agendamento", {
      tenantId,
      clientId: client.id,
      barberId,
      scheduledStart,
      scheduledEnd,
      totalPrice,
      origin: "app",
      status: "confirmed"
    });

    const appointmentId = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.create({
        data: {
          tenantId,
          clientId: client.id,
          barberId: barberId as string,
          scheduledStart,
          scheduledEnd,
          origin: "app",
          status: "confirmed",
          pricingOriginal: totalPrice,
          discountApplied: discountApplied,
          pricingFinal: pricingFinal,
          consentAccepted,
          consentAcceptedAt,
        }
      });

      const itemsData = services.map(s => ({
        appointmentId: appt.id,
        tenantId,
        serviceId: s.id,
        nameSnapshot: s.name,
        durationMinutesSnapshot: s.durationMinutes,
        unitPriceSnapshot: Number(s.basePrice).toFixed(2),
        quantity: 1,
        addedByUserId: barberId as string
      }));

      await tx.appointmentItem.createMany({ data: itemsData });
      return appt.id;
    });

    existing.count += 1;
    rateLimitByIp.set(ip, existing);
    console.log("[createPublicAppointment] Agendamento criado com sucesso!", { appointmentId });
    return { appointmentId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : undefined;
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[createPublicAppointment] ERRO CRÍTICO:", {
      message,
      code,
      stack,
      input: data
    });

    const detailed = message ? `Erro ao criar agendamento: ${message}` : "Erro interno ao processar agendamento.";
    return { error: detailed };
  }
}

