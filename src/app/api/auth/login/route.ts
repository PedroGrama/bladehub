import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { setSessionCookie } from "@/server/auth";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body?.email as string | undefined)?.trim().toLowerCase();
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json({ error: ERROR_MESSAGES.AUTH.MISSING_CREDENTIALS }, { status: 400 });
    }

    // findFirst é mais resiliente a metadados de índice do cliente Prisma local
    const user = await prisma.user.findFirst({ where: { email } });
    
    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS }, { status: 401 });
    }

    const u = user as any;
    if (u.emailVerifiedAt === null && u.role !== "admin_geral") {
      return NextResponse.json({ error: "Confirme seu e-mail antes de fazer login" }, { status: 403 });
    }

    if (!user.isActive) {
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
  } catch (error: any) {
    console.error("[Login API] Error:", error);
    
    // Erro específico de conexão com o banco
    if (error.code === 'P1001' || error.message?.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: "Erro de conexão com o banco de dados. Verifique se o banco está rodando." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno no servidor de autenticação." },
      { status: 500 }
    );
  }
}

