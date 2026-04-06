import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { setSessionCookie } from "@/server/auth";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  const password = body?.password as string | undefined;

  if (!email || !password) {
    return NextResponse.json({ error: ERROR_MESSAGES.AUTH.MISSING_CREDENTIALS }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS }, { status: 401 });
  }

  const u = user as any;
  if (u.emailVerifiedAt === null && u.role !== "admin_geral") {
    return NextResponse.json({ error: "Confirme seu e-mail antes de fazer login" }, { status: 403 });
  }

  if (!user.isActive) {
    // Permitir login de admin_geral / tenant_admin se foi desativado acidentalmente,
    // garantindo acesso de recuperação. Outros permanecem bloqueados.
    if (user.role === "admin_geral" || user.role === "tenant_admin") {
      await prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
    } else {
      return NextResponse.json({ error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS }, { status: 401 });
    }
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS }, { status: 401 });
  }

  await setSessionCookie({
    id: user.id,
    role: user.role,
    tenantId: user.tenantId ?? null,
    name: user.name,
    email: user.email,
    isBarber: user.isBarber,
  });

  return NextResponse.json({ ok: true });
}

