import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { SystemConfigForm } from "./SystemConfigForm";

export default async function SystemConfigPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin_geral") redirect("/tenant");

  let config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
  if (!config) {
    config = await prisma.systemConfig.create({ data: { id: "global" } });
  }

  const serialized = {
    contactEmail: config.contactEmail,
    contactPhone: config.contactPhone,
    platformPixKey: config.platformPixKey,
    defaultTaxPct: Number(config.defaultTaxPct),
    defaultMonthlyFee: Number(config.defaultMonthlyFee),
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 min-h-screen font-sans">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
          <Settings className="w-4 h-4" />
          Configurações da Plataforma
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Admin Config</h1>
          <span className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-500 shadow-sm">
            Sistema
          </span>
        </div>
        <p className="text-sm text-zinc-500 font-medium">
          Configure valores padrão de mensalidade, taxas de serviço e informações de contato para os estabelecimentos.
        </p>
      </header>

      <SystemConfigForm config={serialized} />
    </div>
  );
}
