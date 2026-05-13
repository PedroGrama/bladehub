import { prisma } from "@/server/db";
import { normalizePhoneDigits } from "@/lib/phoneDigits";

export type LoyaltyProgress = {
  loyaltySealsEnabled: boolean;
  goal: number;
  total: number;
  current: number;
  completed: number;
  remaining: number;
  rewardAvailable: boolean;
  rewardDesc: string | null;
  walletPublicKey: string | null;
  lastTxSignature: string | null;
  hasHistory: boolean;
};

export async function getLoyaltyProgress(tenantId: string, phone: string): Promise<LoyaltyProgress> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new Error("tenant não encontrado");
  }

  const goal = tenant.loyaltySealGoal;
  const clientPhone = normalizePhoneDigits(phone);

  if (!tenant.loyaltySealsEnabled) {
    return {
      loyaltySealsEnabled: false,
      goal,
      total: 0,
      current: 0,
      completed: 0,
      remaining: goal > 0 ? goal : 0,
      rewardAvailable: false,
      rewardDesc: tenant.loyaltyRewardDesc ?? "Corte grátis",
      walletPublicKey: null,
      lastTxSignature: null,
      hasHistory: false,
    };
  }

  const [total, clientWallet, lastSeal] = await Promise.all([
    prisma.loyaltySeal.count({ where: { tenantId, clientPhone, sealNumber: { gt: 0 } } }),
    prisma.clientWallet.findUnique({ where: { tenantId_clientPhone: { tenantId, clientPhone } } }),
    prisma.loyaltySeal.findFirst({
      where: { tenantId, clientPhone, sealNumber: { gt: 0 } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rewardAvailable = total > 0 && goal > 0 && total % goal === 0;
  const current = goal > 0
    ? total === 0
      ? 0
      : rewardAvailable
      ? goal
      : total % goal
    : total;
  const remaining = goal > 0 ? (current === goal ? 0 : goal - current) : 0;

  return {
    loyaltySealsEnabled: true,
    goal,
    total,
    current,
    completed: goal > 0 ? Math.floor(total / goal) : 0,
    remaining,
    rewardAvailable,
    rewardDesc: tenant.loyaltyRewardDesc ?? "Corte grátis",
    walletPublicKey: clientWallet?.publicKey ?? null,
    lastTxSignature: lastSeal?.txSignature ?? null,
    hasHistory: total > 0,
  };
}
