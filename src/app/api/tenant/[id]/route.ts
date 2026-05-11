import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user?.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (id !== user.tenantId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  const data: Prisma.TenantUpdateInput = {};

  if (typeof body.loyaltySealsEnabled === "boolean") {
    data.loyaltySealsEnabled = body.loyaltySealsEnabled;
  }
  if (body.loyaltySealGoal !== undefined) {
    const g = Number(body.loyaltySealGoal);
    if (Number.isFinite(g) && g >= 3 && g <= 30) {
      data.loyaltySealGoal = Math.floor(g);
    }
  }
  if (body.loyaltyRewardDesc !== undefined && typeof body.loyaltyRewardDesc === "string") {
    data.loyaltyRewardDesc = body.loyaltyRewardDesc.slice(0, 200);
  }
  if (body.evolutionInstanceName !== undefined) {
    data.evolutionInstanceName =
      typeof body.evolutionInstanceName === "string" ? body.evolutionInstanceName.slice(0, 120) : null;
  }
  if (typeof body.evolutionConnected === "boolean") {
    data.evolutionConnected = body.evolutionConnected;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nenhum campo válido" }, { status: 400 });
  }

  const updated = await prisma.tenant.update({
    where: { id },
    data,
  });

  return NextResponse.json({ ok: true, id: updated.id });
}
