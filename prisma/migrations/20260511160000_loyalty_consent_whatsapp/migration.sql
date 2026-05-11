-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "consent_accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consent_accepted_at" TIMESTAMP(3),
ADD COLUMN     "loyalty_tx_signature" TEXT,
ADD COLUMN     "loyalty_seal_number" INTEGER;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "solana_wallet_public_key" TEXT,
ADD COLUMN     "solana_wallet_private_key" TEXT,
ADD COLUMN     "loyalty_seals_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loyalty_seal_goal" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "loyalty_reward_desc" TEXT DEFAULT 'Corte grátis',
ADD COLUMN     "evolution_instance_name" TEXT,
ADD COLUMN     "evolution_connected" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "client_wallets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "client_phone" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_seals" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "client_phone" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "seal_number" INTEGER NOT NULL,
    "tx_signature" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'devnet',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_seals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_wallets_tenant_id_client_phone_key" ON "client_wallets"("tenant_id", "client_phone");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_seals_appointment_id_key" ON "loyalty_seals"("appointment_id");

-- CreateIndex
CREATE INDEX "loyalty_seals_tenant_id_client_phone_idx" ON "loyalty_seals"("tenant_id", "client_phone");

-- AddForeignKey
ALTER TABLE "client_wallets" ADD CONSTRAINT "client_wallets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_seals" ADD CONSTRAINT "loyalty_seals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_seals" ADD CONSTRAINT "loyalty_seals_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_seals" ADD CONSTRAINT "loyalty_seals_tenant_id_client_phone_fkey" FOREIGN KEY ("tenant_id", "client_phone") REFERENCES "client_wallets"("tenant_id", "client_phone") ON DELETE RESTRICT ON UPDATE CASCADE;
