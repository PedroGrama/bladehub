"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/server/auth";

export async function updateSystemConfig(data: {
  contactEmail?: string;
  contactPhone?: string;
  platformPixKey?: string;
  defaultTaxPct?: number;
  defaultMonthlyFee?: number;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    throw new Error("Unauthorized");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/admin/system-config`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update system config");
    }

    const result = await response.json();
    revalidatePath("/admin/system-config");
    revalidatePath("/tenant/billing");
    
    return { success: true, config: result.config };
  } catch (error: any) {
    throw new Error(error.message || "Failed to update system config");
  }
}
