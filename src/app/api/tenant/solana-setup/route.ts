import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { generateTenantSolanaKeypair } from "@/lib/solana/custodialWallet";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user?.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tenantId = body.tenantId as string | undefined;
  if (!tenantId || tenantId !== user.tenantId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { publicKey, privateKey } = generateTenantSolanaKeypair();

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      solanaWalletPublicKey: publicKey,
      solanaWalletPrivateKey: privateKey,
    },
  });

  return NextResponse.json({ publicKey });
}
