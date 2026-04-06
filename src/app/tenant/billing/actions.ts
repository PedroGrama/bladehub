"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import { revalidatePath } from "next/cache";

export async function migratePlan(plan: "MENSALISTA" | "TAXA_POR_SERVICO") {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  await prisma.tenant.update({
    where: { id: user.tenantId },
    data: { 
      licencaTipo: plan,
      // Reset special conditions if any
      taxaServicoPct: plan === "TAXA_POR_SERVICO" ? undefined : null,
      mensalidadeValor: plan === "MENSALISTA" ? undefined : null,
    }
  });

  revalidatePath("/tenant/billing");
}
