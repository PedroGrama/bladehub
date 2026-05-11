import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { normalizePhoneDigits } from "@/lib/phoneDigits";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const tenantId = searchParams.get("tenantId");
  if (!phone || !tenantId) {
    return NextResponse.json({ error: "phone e tenantId são obrigatórios" }, { status: 400 });
  }

  const clientPhone = normalizePhoneDigits(phone);

  const [seals, clientWallet, tenant] = await Promise.all([
    prisma.loyaltySeal.findMany({
      where: { tenantId, clientPhone },
      orderBy: { createdAt: "asc" },
    }),
    prisma.clientWallet.findUnique({
      where: { tenantId_clientPhone: { tenantId, clientPhone } },
    }),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
  ]);

  if (!tenant) {
    return NextResponse.json({ error: "tenant não encontrado" }, { status: 404 });
  }

  const goal = tenant.loyaltySealGoal;
  const total = seals.length;
  const current = goal > 0 ? total % goal : 0;
  const completed = goal > 0 ? Math.floor(total / goal) : 0;
  const last = seals[seals.length - 1];

  return NextResponse.json({
    total,
    current,
    goal,
    completed,
    rewardDesc: tenant.loyaltyRewardDesc ?? "Corte grátis",
    lastTxSignature: last?.txSignature ?? null,
    walletPublicKey: clientWallet?.publicKey ?? null,
  });
}
