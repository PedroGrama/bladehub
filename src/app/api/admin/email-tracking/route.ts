import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

/**
 * GET /api/admin/email-tracking
 * Retorna todos os emails registrados com informações de usuário e estabelecimento
 * Apenas admin geral pode acessar
 */
export async function GET() {
  const user = await getSessionUser();
  
  if (!user || user.role !== "admin_geral") {
    return NextResponse.json(
      { error: ERROR_MESSAGES.AUTH.UNAUTHORIZED },
      { status: 401 }
    );
  }

  try {
    // Buscar todos os usuários com suas informações de tenant
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        isActive: true,
        emailVerifiedAt: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" },
      ],
    });

    // Transformar para o formato esperado pela UI
    const emails = allUsers.map((user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string | null;
      isActive: boolean;
      emailVerifiedAt: Date | null;
      createdAt: Date;
      tenant?: { id: string; name: string } | null;
    }) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantName: user.tenant?.name,
      tenantId: user.tenantId,
      isActive: user.isActive,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("[Email Tracking] Error:", error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.SYSTEM.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
