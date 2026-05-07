"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { setSessionCookie } from "@/server/auth";

export async function updateProfile(data: { name?: string, email?: string, logoUrl?: string | null, image?: string | null }) {
  const user = await getSessionUser();
  if (!user) throw new Error("Não autorizado");

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.image !== undefined) updateData.image = data.image;

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: updateData as any
    });

    // Atualizar o cookie da sessão com os novos dados
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (updatedUser) {
      await setSessionCookie({
        id: updatedUser.id,
        role: updatedUser.role as any,
        tenantId: updatedUser.tenantId,
        name: updatedUser.name,
        email: updatedUser.email,
        isBarber: updatedUser.isBarber,
      });
    }
  }

  // Se for admin e tiver logoUrl, atualiza o tenant
  if ((user.role === "tenant_admin" || user.role === "admin_geral") && data.logoUrl !== undefined && user.tenantId) {
    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { logoUrl: data.logoUrl }
    });
  }

  revalidatePath("/");
  revalidatePath("/tenant/profile");
  return { success: true };
}

export async function toggleBarberStatus() {
  const user = await getSessionUser();
  if (!user || user.role !== "tenant_admin") throw new Error("Apenas administradores podem gerenciar seu status de atendimento.");

  const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!currentUser) throw new Error("Usuário não encontrado.");

  const newStatus = !currentUser.isBarber;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isBarber: newStatus }
  });

  // Atualizar o cookie da sessão
  await setSessionCookie({
    id: updatedUser.id,
    role: updatedUser.role as any,
    tenantId: updatedUser.tenantId,
    name: updatedUser.name,
    email: updatedUser.email,
    isBarber: updatedUser.isBarber,
  });

  revalidatePath("/tenant/profile");
  revalidatePath("/tenant/settings");
  revalidatePath("/");

  return { success: true, isBarber: updatedUser.isBarber };
}

export async function updatePassword(currentPassword?: string, newPassword?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!currentUser || !currentUser.passwordHash) throw new Error("Usuário não encontrado");

  // Verificar senha atual
  if (currentPassword) {
    const isValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
    if (!isValid) throw new Error("Senha atual incorreta");
  } else {
    throw new Error("Senha atual obrigatória");
  }

  if (newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
  } else {
    throw new Error("Nova senha obrigatória");
  }

  return { success: true };
}
