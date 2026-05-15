"use server";

import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  tenantName?: string;
  isAdmin?: boolean;
}) {
  try {
    // Validate inputs
    if (!data.name || !data.email || !data.password || !data.tenantName) {
      return { error: "Todos os campos são obrigatórios" };
    }

    if (data.password.length < 6) {
      return { error: "Senha deve ter pelo menos 6 caracteres" };
    }

    const emailLower = data.email.toLowerCase();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      console.warn("registerUser: tentativa de cadastro com email existente", { email: emailLower });
      return { error: "Este email já está cadastrado." };
    }

    // Cleanup registros duplicados (manter mais recente) - somente por segurança
    const duplicateUsers = await prisma.user.findMany({
      where: { email: emailLower },
      orderBy: { createdAt: 'desc' },
    });
    if (duplicateUsers.length > 1) {
      const toDelete = duplicateUsers.slice(1).map(u => u.id);
      await prisma.user.deleteMany({ where: { id: { in: toDelete } } });
      console.info("registerUser: removendo users duplicados", { email: emailLower, removed: toDelete.length });
    }

    // Verificar Tenant duplicado (nome + email do dono)
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        name: data.tenantName!,
        email: emailLower,
      },
    });

    if (existingTenant) {
      console.warn("registerUser: tentativa de cadastro com tenant existente", { tenantName: data.tenantName, email: emailLower });
      return { error: "Já existe um estabelecimento com este nome e email." };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Criar tudo em transação para atomicidade

    const [tenant, user] = await prisma.$transaction(async (tx) => {
      const createdTenant = await tx.tenant.create({
        data: {
          name: data.tenantName!,
          email: emailLower,
          status: "ATIVO",
          isActive: true,
        },
      });

      const createdUser = await tx.user.create({
        data: {
          name: data.name,
          email: emailLower,
          passwordHash,
          role: "tenant_admin",
          tenantId: createdTenant.id,
          isActive: true,
          emailVerifiedAt: new Date(),
          isBarber: false,
        },
      });

      return [createdTenant, createdUser];
    });

    console.log("registerUser: cadastro transacional concluído", { tenantId: tenant.id, userId: user.id });

    return {
      success: true,
      message: "Cadastro criado com sucesso.",
      redirectUrl: "/login?success=created",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "Erro ao registrar usuário. Tente novamente." };
  }
}
