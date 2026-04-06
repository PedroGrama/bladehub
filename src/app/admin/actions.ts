"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import { revalidatePath } from "next/cache";

/**
 * Exclui um tenant e todos os dados relacionados (Cascade)
 */
export async function deleteTenant(tenantId: string) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    throw new Error("Não autorizado");
  }

  try {
    // 1. Manualmente deletar usuários do tenant (já que onDelete: SetNull no schema)
    await prisma.user.deleteMany({
      where: { tenantId },
    });

    // 2. Deletar o tenant (o resto deve ser Cascade)
    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteTenant] Erro:", error);
    return { error: error.message || "Falha ao excluir o estabelecimento." };
  }
}

/**
 * Recupera/Reseta a senha de um usuário para um padrão seguro (ou gera link no futuro)
 * Por enquanto, vamos setar para 'Blade123' para que o admin possa informar ao usuário.
 */
import bcrypt from "bcryptjs";

export async function recoverUserPassword(userId: string) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    throw new Error("Não autorizado");
  }

  try {
    const newHash = await bcrypt.hash("Blade123", 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true, message: "Senha resetada para 'Blade123'" };
  } catch (error: any) {
    console.error("[recoverUserPassword] Erro:", error);
    return { error: "Falha ao resetar senha do usuário." };
  }
}

/**
 * Atualiza o e-mail de um usuário (funcionário)
 */
export async function updateUserEmail(userId: string, newEmail: string) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    throw new Error("Não autorizado");
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });
    revalidatePath("/admin/tenants/[tenantId]");
    return { success: true };
  } catch (error: any) {
    console.error("[updateUserEmail] Erro:", error);
    return { error: "Falha ao atualizar e-mail." };
  }
}

/**
 * Inicia impersonação de um tenant pelo Admin Geral
 */
import { cookies } from "next/headers";

export async function impersonateTenant(tenantId: string) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    throw new Error("Não autorizado");
  }

  const cookieStore = await cookies();
  cookieStore.set("impersonated_tenant_id", tenantId, {
    path: "/",
    maxAge: 60 * 60, // 1 hora de visão
    httpOnly: true,
    sameSite: "lax",
  });

  return { success: true };
}

/**
 * Para impersonação
 */
export async function stopImpersonating() {
  const cookieStore = await cookies();
  cookieStore.delete("impersonated_tenant_id");
  return { success: true };
}
