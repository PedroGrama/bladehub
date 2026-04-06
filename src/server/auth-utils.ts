import { prisma } from "@/server/db";
import crypto from "crypto";

export interface GoogleAuthPayload {
  email: string;
  name: string;
  picture?: string;
  tenantId?: string;
}

/**
 * Processa autenticação Google
 * - Se usuário novo: cria com isActive = false (aguardando aprovação)
 * - Se usuário existente: verifica se está ativo
 * - Retorna erro se não está ativo
 */
export async function processGoogleAuth(payload: GoogleAuthPayload) {
  const { email, name, tenantId } = payload;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  // Novo usuário via Google
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email,
        passwordHash: crypto.randomBytes(32).toString("hex"),
        role: "tenant_admin",
        isActive: false, // Awaiting admin approval
        isBarber: false,
        emailVerifiedAt: new Date(), // Email já verificado via Google OAuth
        // Se tenantId fornecido (criar usuário em tenant existente)
        ...(tenantId && { tenantId }),
      },
    });
  }

  // Validar se está ativo
  if (!user?.isActive) {
    return {
      success: false,
      error: "Conta aguardando aprovação do administrador",
      status: "PENDING_APPROVAL" as const,
    };
  }

  // Sucesso - usuário ativo
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      role: user.role,
      isBarber: user.isBarber,
    },
  };
}

/**
 * Cria um session token JWT simples
 * Para produção, considerar usar bibliotecas especializadas
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Valida se o email pertence a um domínio permitido
 * (Configurável via variáveis de ambiente)
 */
export function isEmailAllowed(email: string): boolean {
  const allowedDomains = (
    process.env.ALLOWED_EMAIL_DOMAINS || ""
  ).split(",");

  if (allowedDomains.length === 0 || allowedDomains[0] === "") {
    return true; // Sem restrição
  }

  const domain = email.split("@")[1];
  return allowedDomains.includes(domain);
}

/**
 * Log de tentativas de auth para auditoria
 */
export async function logAuthAttempt(
  email: string,
  method: string,
  success: boolean,
  reason?: string
) {
  // TODO: Implementar tabela de auditoria quando necessário
  console.log(`[Auth Attempt] ${email} via ${method}: ${success} ${reason || ""}`);
}
