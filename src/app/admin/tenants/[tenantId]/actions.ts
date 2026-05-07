"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";

export async function updateTenantSubscription(
  tenantId: string,
  data: {
    licencaTipo: string;
    mensalidadeValor: number;
    taxaServicoPct: number;
  }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin_geral") {
      throw new Error("Não autorizado");
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        licencaTipo: data.licencaTipo as any,
        mensalidadeValor: data.licencaTipo === "MENSALISTA" ? data.mensalidadeValor : null,
        taxaServicoPct: data.licencaTipo === "TAXA_POR_SERVICO" ? data.taxaServicoPct : null,
      },
    });

    return { success: true, tenant: updated };
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

export async function updateTenantGeneralInfo(tenantId: string, data: any) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin_geral") throw new Error("Não autorizado");

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cnpj: data.cnpj,
        ownerName: data.ownerName,
        address: data.address,
        isActive: data.isActive
      }
    });

    return { success: true };
  } catch (error: any) {
    throw error;
  }
}

export async function updateTenantUser(userId: string, data: any) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin_geral") throw new Error("Não autorizado");

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive
      }
    });

    return { success: true };
  } catch (error: any) {
    throw error;
  }
}
