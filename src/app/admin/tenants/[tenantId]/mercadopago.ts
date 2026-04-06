"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import { redirect } from "next/navigation";

interface MercadoPagoCheckoutResult {
  success: boolean;
  mpPaymentId?: string;
  qrCode?: string;
  ticketUrl?: string;
  copyPaste?: string;
  error?: string;
}

/**
 * Server Action para criar um checkout de Mercado Pago
 * Gera um pagamento PIX e retorna QR code
 */
export async function createMercadoPagoCheckout(
  tenantId: string,
  planType: "MENSALISTA" | "TAXA_POR_SERVICO"
): Promise<MercadoPagoCheckoutResult> {
  const user = await getSessionUser();

  if (!user || user.tenantId !== tenantId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Buscar configuração do MP
    const config = await prisma.systemConfig.findUnique({
      where: { id: "global" },
    });

    if (!config?.mercadoPagoAccessToken) {
      return {
        success: false,
        error: "Mercado Pago não está configurado",
      };
    }

    // Determinar valor baseado no plano
    let amount = 99; // Valor padrão para mensalista
    if (planType === "TAXA_POR_SERVICO") {
      amount = 0; // Taxa por serviço pode ser 0 (cobrado na transação)
      // Ou você pode definir uma taxa inicial mínima aqui
    }

    // Dados para criar o pagamento
    const paymentData = {
      transaction_amount: amount,
      description: `Plano ${planType === "MENSALISTA" ? "Mensalista" : "Taxa por Serviço"} - BladeHub`,
      payment_method_id: "pix",
      payer: {
        email: user.email,
      },
      external_reference: `tenant_${tenantId}`,
      notification_url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/webhooks/mercadopago`,
    };

    // Fazer requisição para MP (usando fetch para simplicidade)
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.mercadoPagoAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const mpResponse = await response.json();

    if (!response.ok || !mpResponse.id) {
      console.error("[MP Checkout] Error from MP API:", mpResponse);
      return {
        success: false,
        error:
          mpResponse.message || "Erro ao criar pagamento no Mercado Pago",
      };
    }

    // Salvar registro do pagamento no banco
    await prisma.mercadoPagoPayment.create({
      data: {
        tenantId,
        mpPaymentId: mpResponse.id.toString(),
        mpPaymentStatus: mpResponse.status || "pending",
        planType,
        amount: amount,
        qrCode: mpResponse.point_of_interaction?.transaction_data?.qr_code,
        qrCodeUrl: mpResponse.point_of_interaction?.transaction_data?.qr_code_url,
        transactionId: mpResponse.transaction_id?.toString(),
        externalReference: mpResponse.external_reference,
        payerEmail: mpResponse.payer?.email,
        paymentMethod: "pix",
        expiresAt: mpResponse.point_of_interaction?.transaction_data?.expiration_date
          ? new Date(mpResponse.point_of_interaction.transaction_data.expiration_date)
          : null,
      },
    });

    return {
      success: true,
      mpPaymentId: mpResponse.id.toString(),
      qrCode: mpResponse.point_of_interaction?.transaction_data?.qr_code,
      copyPaste:
        mpResponse.point_of_interaction?.transaction_data?.qr_code ||
        mpResponse.id.toString(),
      ticketUrl: mpResponse.point_of_interaction?.transaction_data?.qr_code_url,
    };
  } catch (error) {
    console.error("[MP Checkout] Error:", error);
    return {
      success: false,
      error: "Erro ao processar pagamento",
    };
  }
}

/**
 * Obter status de um pagamento existente
 */
export async function getMercadoPagoStatus(
  tenantId: string,
  mpPaymentId: string
) {
  const user = await getSessionUser();

  if (!user || user.tenantId !== tenantId) {
    return { error: "Unauthorized" };
  }

  const payment = await prisma.mercadoPagoPayment.findUnique({
    where: { mpPaymentId },
  });

  if (!payment || payment.tenantId !== tenantId) {
    return { error: "Pagamento não encontrado" };
  }

  return {
    status: payment.mpPaymentStatus,
    planType: payment.planType,
    amount: payment.amount,
    approvedAt: payment.approvedAt,
  };
}
