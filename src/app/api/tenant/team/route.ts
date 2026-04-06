import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "tenant_admin" && user.role !== "admin_geral")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const { tenantId, name, email, password, role } = await req.json();

    if (!tenantId || !name || !email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    if (user.role === "tenant_admin" && user.tenantId !== tenantId) {
      return NextResponse.json({ error: "Acesso não autorizado ao estabelecimento" }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newBarber = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        tenantId,
        role: role || "barbeiro",
        isBarber: true,
        isActive: true,
        emailVerifiedAt: new Date(), // Membros criados pelo admin não precisam validar email
      },
    });

    // Herdar horários do estabelecimento
    const tenantHours = await (prisma as any).tenantBusinessHour.findMany({
      where: { tenantId }
    });

    if (tenantHours.length === 0) {
      // Se não tiver horário do estabelecimento, criar padrão: Seg-Sáb 09:00-19:00, Dom fechado
      const defaultHours = Array.from({ length: 7 }).map((_, i) => ({
        tenantId,
        barberId: newBarber.id,
        weekday: i,
        startTime: "09:00",
        endTime: "19:00",
        breakStart: null,
        breakEnd: null,
        isClosed: i === 0, // Domingo fechado
      }));
      await (prisma as any).barberBusinessHour.createMany({ data: defaultHours });
    } else {
      // Herdar horários do estabelecimento para o profissional
      const barberHours = tenantHours.map(th => ({
        tenantId,
        barberId: newBarber.id,
        weekday: th.weekday,
        startTime: th.startTime,
        endTime: th.endTime,
        breakStart: null, // Profissional não herda intervalo do estabelecimento
        breakEnd: null,
        isClosed: th.isClosed,
      }));
      await (prisma as any).barberBusinessHour.createMany({ data: barberHours });
    }

    return NextResponse.json({ success: true, id: newBarber.id });
  } catch (error: any) {
    console.error("Erro ao criar profissional:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
