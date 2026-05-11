import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";

/**
 * Proxy para obter dados de conexão / QR da Evolution API (formato depende da versão da API).
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user?.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const base = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  if (!base || !key) {
    return NextResponse.json({ error: "Evolution não configurada no servidor" }, { status: 503 });
  }

  const { prisma } = await import("@/server/db");
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { evolutionInstanceName: true },
  });

  const instance = tenant?.evolutionInstanceName;
  if (!instance) {
    return NextResponse.json({ error: "Defina o nome da instância nas configurações" }, { status: 400 });
  }

  const url = `${base.replace(/\/$/, "")}/instance/connect/${encodeURIComponent(instance)}`;
  const res = await fetch(url, {
    headers: { apikey: key },
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* raw */
  }

  if (!res.ok) {
    return NextResponse.json({ error: "Evolution retornou erro", status: res.status, body: text }, { status: 502 });
  }

  return NextResponse.json(json ?? { raw: text });
}
