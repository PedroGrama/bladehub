"use server";

import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function saveMyHours(tenantId: string, hours: any[]) {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) {
    return { error: "Não autorizado" };
  }

  const barberId = user.id;

  // Buscar horários do estabelecimento para validação
  const tenantHours = await (prisma as any).tenantBusinessHour.findMany({
    where: { tenantId }
  });

  // Validar cada dia
  for (const h of hours) {
    const tenantHour = tenantHours.find(th => th.weekday === h.weekday);
    if (!tenantHour) continue;

    // Se estabelecimento fechado, profissional também deve estar
    if (tenantHour.isClosed) {
      if (!h.isClosed) {
        return { error: `${["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][h.weekday]}: O estabelecimento está fechado neste dia.` };
      }
      continue;
    }

    // Se não fechado, validar limites
    if (!h.isClosed) {
      const [hStart, hStartMin] = h.startTime.split(":").map(Number);
      const [hEnd, hEndMin] = h.endTime.split(":").map(Number);
      const [tStart, tStartMin] = tenantHour.startTime.split(":").map(Number);
      const [tEnd, tEndMin] = tenantHour.endTime.split(":").map(Number);

      const hStartMins = hStart * 60 + hStartMin;
      const hEndMins = hEnd * 60 + hEndMin;
      const tStartMins = tStart * 60 + tStartMin;
      const tEndMins = tEnd * 60 + tEndMin;

      if (hStartMins < tStartMins || hEndMins > tEndMins) {
        return { error: `${["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][h.weekday]}: O horário do profissional não pode ser anterior à abertura ou posterior ao fechamento do estabelecimento.` };
      }
    }
  }

  try {
    await prisma.barberBusinessHour.deleteMany({ where: { barberId } });
    await prisma.barberBusinessHour.createMany({
      data: hours.map(h => ({
        tenantId,
        barberId,
        weekday: h.weekday,
        startTime: h.startTime || "09:00",
        endTime: h.endTime || "18:00",
        breakStart: h.breakStart || null,
        breakEnd: h.breakEnd || null,
        isClosed: h.isClosed,
      }))
    });
    
    revalidatePath("/tenant/my-hours");
    return { success: true };
  } catch (e: any) {
    return { error: "Erro ao salvar horários" };
  }
}
