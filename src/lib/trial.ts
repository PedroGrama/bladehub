import { prisma } from "@/server/db";
import { getNextTenantId } from "@/lib/tenantUtils";

/**
 * Verifica se o acesso ao tenant deve ser bloqueado por trial expirado
 * Retorna:
 * - null se acesso permite (trial ainda válido ou assinatura ativa)
 * - { blocked: true, daysLeft: number } se trial expirado
 * - { blocked: true, daysLeft: 0 } se suspenso/inadimplente/past_due
 */
export async function checkTenantAccess(tenantId: string) {
  const tenant = (await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { status: true, trialEndsAt: true, licencaTipo: true },
  })) as { status: string; trialEndsAt: Date | null; licencaTipo: string } | null;

  if (!tenant) return null;

  // Se não é trial, verificar status
  if (tenant.licencaTipo !== "TESTE_GRATIS") {
    if (
      tenant.status === "SUSPENSO" ||
      tenant.status === "INADIMPLENTE" ||
      tenant.status === "PAST_DUE"
    ) {
      return { blocked: true, daysLeft: 0, reason: "subscription_expired" };
    }
    return null; // Acesso permitido com assinatura ativa
  }

  // Mode TRIAL: verificar data de expiração
  if (!tenant.trialEndsAt) {
    // Sem trialEndsAt definido, permitir (será definido na criação)
    return null;
  }

  const now = new Date();
  const trialEnds = new Date(tenant.trialEndsAt);
  const daysLeft = Math.ceil(
    (trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) {
    // Trial expirou - atualizar status para SUSPENDED
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: "SUSPENSO" },
    });

    return { blocked: true, daysLeft: 0, reason: "trial_expired" };
  }

  // Trial ainda válido
  return null;
}

/**
 * Obter informações de trial para exibição no banner
 */
export async function getTrialInfo(tenantId: string) {
  const tenant = (await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { trialEndsAt: true, licencaTipo: true, status: true },
  })) as { status: string; trialEndsAt: Date | null; licencaTipo: string } | null;

  if (!tenant || tenant.licencaTipo !== "TESTE_GRATIS") {
    return null;
  }

  if (!tenant.trialEndsAt) {
    return null;
  }

  const now = new Date();
  const trialEnds = new Date(tenant.trialEndsAt);
  const daysLeft = Math.ceil(
    (trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const hoursLeft = Math.ceil(
    (trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  return {
    daysLeft: Math.max(0, daysLeft),
    hoursLeft: Math.max(0, hoursLeft),
    isExpiring: daysLeft <= 3,
    isExpired: daysLeft <= 0,
    expiresAt: trialEnds,
  };
}

/**
 * Cria um novo tenant com trial de 30 dias
 */
export async function createTenantWithTrial(tenantData: {
  name: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  ownerName?: string;
}) {
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias depois
  const newId = await getNextTenantId();

  return prisma.tenant.create({
    data: {
      id: newId,
      name: tenantData.name,
      email: tenantData.email,
      phone: tenantData.phone,
      cnpj: tenantData.cnpj,
      ownerName: tenantData.ownerName,
      licencaTipo: "TESTE_GRATIS",
      status: "TRIAL",
      trialEndsAt,
      slug: tenantData.name.toLowerCase().replace(/\s+/g, "-"),
    },
  });
}
