import { prisma } from "@/server/db";
import { normalizePhoneDigits } from "@/lib/phoneDigits";
import { getOrCreateClientWallet, recordLoyaltySeal } from "@/lib/solana/custodialWallet";
import { buildSealMessage, sendWhatsAppMessage } from "@/lib/whatsapp/evolutionApi";

export type LoyaltySealResult =
  | { ok: true; sealNumber: number; txSignature: string; total: number; skipped?: false }
  | { ok: false; reason: string };

/**
 * Cria selo on-chain + registro local e envia WhatsApp (se configurado).
 * Deve ser chamado após status do agendamento = done. Falhas são logadas, não propagadas.
 */
export async function runLoyaltySealForAppointment(appointmentId: string): Promise<LoyaltySealResult> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      tenant: true,
      client: true,
      loyaltySeal: true,
    },
  });

  if (!appointment) return { ok: false, reason: "not_found" };
  if (appointment.status !== "done") return { ok: false, reason: "not_done" };
  if (!appointment.tenant.loyaltySealsEnabled) return { ok: false, reason: "loyalty_disabled" };
  if (!appointment.consentAccepted) return { ok: false, reason: "no_consent" };

  if (appointment.loyaltySeal) {
    return {
      ok: true,
      sealNumber: appointment.loyaltySeal.sealNumber,
      txSignature: appointment.loyaltySeal.txSignature,
      total: appointment.loyaltySeal.sealNumber,
    };
  }

  const tenant = appointment.tenant;
  if (!tenant.solanaWalletPublicKey || !tenant.solanaWalletPrivateKey) {
    return { ok: false, reason: "tenant_wallet_missing" };
  }

  const clientPhone = normalizePhoneDigits(appointment.client.phone);
  await getOrCreateClientWallet(tenant.id, clientPhone);

  const sealCount = await prisma.loyaltySeal.count({
    where: { tenantId: tenant.id, clientPhone },
  });
  const sealNumber = sealCount + 1;
  const tenantSlug = tenant.slug || tenant.id.slice(0, 8);

  const txSignature = await recordLoyaltySeal({
    tenantPrivateKey: tenant.solanaWalletPrivateKey,
    tenantPublicKey: tenant.solanaWalletPublicKey,
    bookingId: appointment.id,
    sealNumber,
    tenantSlug,
  });

  const network = process.env.SOLANA_NETWORK === "mainnet-beta" ? "mainnet-beta" : "devnet";

  await prisma.$transaction([
    prisma.loyaltySeal.create({
      data: {
        tenantId: tenant.id,
        clientPhone,
        appointmentId: appointment.id,
        sealNumber,
        txSignature,
        network,
      },
    }),
    prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        loyaltyTxSignature: txSignature,
        loyaltySealNumber: sealNumber,
      },
    }),
  ]);

  if (tenant.evolutionInstanceName && tenant.evolutionConnected) {
    try {
      await sendWhatsAppMessage(
        tenant.evolutionInstanceName,
        appointment.client.phone,
        buildSealMessage({
          clientName: appointment.client.name,
          sealNumber,
          goal: tenant.loyaltySealGoal,
          rewardDesc: tenant.loyaltyRewardDesc ?? "Corte grátis",
          txSignature,
        })
      );
    } catch (e) {
      console.error("[runLoyaltySealForAppointment] WhatsApp failed", e);
    }
  }

  return { ok: true, sealNumber, txSignature, total: sealNumber };
}

export async function safeRunLoyaltySealForAppointment(appointmentId: string): Promise<void> {
  try {
    const res = await runLoyaltySealForAppointment(appointmentId);
    if (!res.ok) {
      console.info("[safeRunLoyaltySealForAppointment] skipped", appointmentId, res.reason);
    }
  } catch (e) {
    console.error("[safeRunLoyaltySealForAppointment] error", appointmentId, e);
  }
}
