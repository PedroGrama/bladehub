-- CreateEnum
CREATE TYPE "LicencaTipo" AS ENUM ('TESTE_GRATIS', 'MENSALISTA', 'TAXA_POR_SERVICO');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('TRIAL', 'ATIVO', 'SUSPENSO', 'INADIMPLENTE', 'PAST_DUE');

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "desconto_ativo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "desconto_percentual" DECIMAL(5,2),
ADD COLUMN     "desconto_valor" DECIMAL(10,2),
ADD COLUMN     "licenca_tipo" "LicencaTipo" NOT NULL DEFAULT 'TESTE_GRATIS',
ADD COLUMN     "limite_cancelamento_mensal" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "mensalidade_valor" DECIMAL(10,2),
ADD COLUMN     "mp_payment_id" TEXT,
ADD COLUMN     "mp_subscription_id" TEXT,
ADD COLUMN     "saldo_devedor" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "taxa_servico_pct" DECIMAL(5,2) DEFAULT 3.0,
ADD COLUMN     "teste_expira_em" TIMESTAMP(3),
ADD COLUMN     "trial_ends_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "contactEmail" TEXT NOT NULL DEFAULT 'suporte@studioflow.com',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "platformPixKey" TEXT NOT NULL DEFAULT '',
    "defaultTaxPct" DECIMAL(5,2) NOT NULL DEFAULT 3.0,
    "defaultMonthlyFee" DECIMAL(10,2) NOT NULL DEFAULT 99.00,
    "mercado_pago_access_token" TEXT,
    "mercado_pago_public_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes_taxa" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_taxa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancelamento_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "barber_id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "reason" TEXT,
    "peso_multa" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cancelamento_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_licencas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "licenca_anterior" "LicencaTipo",
    "licenca_nova" "LicencaTipo" NOT NULL,
    "modified_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_licencas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mercado_pago_payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "mp_payment_id" TEXT NOT NULL,
    "mp_payment_status" TEXT NOT NULL,
    "plan_type" "LicencaTipo" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "qr_code" TEXT,
    "qr_code_url" TEXT,
    "transaction_id" TEXT,
    "external_reference" TEXT,
    "payer_email" TEXT,
    "payment_method" TEXT NOT NULL DEFAULT 'pix',
    "approved_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercado_pago_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transacoes_taxa_tenant_id_idx" ON "transacoes_taxa"("tenant_id");

-- CreateIndex
CREATE INDEX "cancelamento_logs_tenant_id_barber_id_idx" ON "cancelamento_logs"("tenant_id", "barber_id");

-- CreateIndex
CREATE INDEX "cancelamento_logs_created_at_idx" ON "cancelamento_logs"("created_at");

-- CreateIndex
CREATE INDEX "historico_licencas_tenant_id_idx" ON "historico_licencas"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "mercado_pago_payments_mp_payment_id_key" ON "mercado_pago_payments"("mp_payment_id");

-- CreateIndex
CREATE INDEX "mercado_pago_payments_tenant_id_idx" ON "mercado_pago_payments"("tenant_id");

-- CreateIndex
CREATE INDEX "mercado_pago_payments_mp_payment_id_idx" ON "mercado_pago_payments"("mp_payment_id");

-- CreateIndex
CREATE INDEX "mercado_pago_payments_mp_payment_status_idx" ON "mercado_pago_payments"("mp_payment_status");

-- CreateIndex
CREATE INDEX "mercado_pago_payments_created_at_idx" ON "mercado_pago_payments"("created_at");

-- AddForeignKey
ALTER TABLE "transacoes_taxa" ADD CONSTRAINT "transacoes_taxa_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes_taxa" ADD CONSTRAINT "transacoes_taxa_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancelamento_logs" ADD CONSTRAINT "cancelamento_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancelamento_logs" ADD CONSTRAINT "cancelamento_logs_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_licencas" ADD CONSTRAINT "historico_licencas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mercado_pago_payments" ADD CONSTRAINT "mercado_pago_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
