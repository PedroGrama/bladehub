import { NextResponse } from "next/server";
import { getLoyaltyProgress } from "@/server/loyalty/getLoyaltyProgress";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const tenantId = searchParams.get("tenantId");
  if (!phone || !tenantId) {
    return NextResponse.json({ error: "phone e tenantId são obrigatórios" }, { status: 400 });
  }

  try {
    const progress = await getLoyaltyProgress(tenantId, phone);
    return NextResponse.json(progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao obter progresso";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
