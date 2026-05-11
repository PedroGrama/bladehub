import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { prisma } from "@/server/db";
import { normalizePhoneDigits } from "@/lib/phoneDigits";

const DEVNET_URL = "https://api.devnet.solana.com";

function rpcUrl(): string {
  const n = process.env.SOLANA_NETWORK || "devnet";
  if (n === "mainnet-beta" || n === "mainnet") {
    return "https://api.mainnet-beta.solana.com";
  }
  return DEVNET_URL;
}

export const connection = new Connection(rpcUrl(), "confirmed");

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export async function getOrCreateClientWallet(tenantId: string, clientPhone: string) {
  const normalized = normalizePhoneDigits(clientPhone);
  const existing = await prisma.clientWallet.findUnique({
    where: { tenantId_clientPhone: { tenantId, clientPhone: normalized } },
  });
  if (existing) return existing;

  const kp = Keypair.generate();
  return prisma.clientWallet.create({
    data: {
      tenantId,
      clientPhone: normalized,
      publicKey: kp.publicKey.toBase58(),
      privateKey: bs58.encode(kp.secretKey),
    },
  });
}

export async function requestAirdropIfNeeded(publicKeyStr: string): Promise<void> {
  if ((process.env.SOLANA_NETWORK || "devnet") !== "devnet") return;

  const pk = new PublicKey(publicKeyStr);
  const bal = await connection.getBalance(pk);
  const minLamports = Math.floor(0.05 * 1e9);
  if (bal >= minLamports) return;

  try {
    const sig = await connection.requestAirdrop(pk, 1 * 1e9);
    await connection.confirmTransaction(sig, "confirmed");
  } catch (e) {
    console.warn("[requestAirdropIfNeeded] airdrop failed", e);
  }
  await new Promise((r) => setTimeout(r, 2000));
}

export async function recordLoyaltySeal(params: {
  tenantPrivateKey: string;
  tenantPublicKey: string;
  bookingId: string;
  sealNumber: number;
  tenantSlug: string;
}): Promise<string> {
  const { tenantPrivateKey, tenantPublicKey, bookingId, sealNumber, tenantSlug } = params;

  await requestAirdropIfNeeded(tenantPublicKey);

  const tenantKeypair = Keypair.fromSecretKey(bs58.decode(tenantPrivateKey));
  const memo = JSON.stringify({
    app: "bladehub",
    tenant: tenantSlug,
    seal: sealNumber,
    bid: bookingId,
    ts: Date.now(),
  });

  const ix = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, "utf-8"),
  });

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction().add(ix);
  tx.feePayer = tenantKeypair.publicKey;
  tx.recentBlockhash = blockhash;

  return sendAndConfirmTransaction(connection, tx, [tenantKeypair], {
    commitment: "confirmed",
  });
}

export function generateTenantSolanaKeypair(): { publicKey: string; privateKey: string } {
  const kp = Keypair.generate();
  return {
    publicKey: kp.publicKey.toBase58(),
    privateKey: bs58.encode(kp.secretKey),
  };
}
