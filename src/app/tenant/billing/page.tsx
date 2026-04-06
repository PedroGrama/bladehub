import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlanCards } from "./PlanCards";
import { BillingFooter } from "./BillingFooter";

export default async function TenantBillingPage() {
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");
  if (user.role !== "tenant_admin" && user.role !== "admin_geral") redirect("/tenant");

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  if (!tenant) redirect("/login");

  const config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
  const taxas = await prisma.transacaoTaxa.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const licencaLabels: Record<string, string> = {
    TESTE_GRATIS: "Teste Grátis (30 dias)",
    MENSALISTA: "Mensalidade Fixa",
    TAXA_POR_SERVICO: "Taxa por Serviço",
  };

  const statusLabels: Record<string, string> = {
    ATIVO: "Ativo",
    SUSPENSO: "Suspenso",
    INADIMPLENTE: "Inadimplente",
  };

  const statusColors: Record<string, string> = {
    ATIVO: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    SUSPENSO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    INADIMPLENTE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 selection:bg-blue-500/30">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-100 dark:border-white/5 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">Assinatura & Planos</h1>
          <p className="text-zinc-500 font-medium">Gerencie sua licença BladeHub e acompanhe seus débitos.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${statusColors[tenant.status]}`}>
            Conta {statusLabels[tenant.status]}
          </span>
        </div>
      </div>

      {/* Financial Health Banner */}
      {Number(tenant.saldoDevedor) > 0 && (
        <div className="rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-500/5">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400">Regularize sua situação</h2>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/60 max-w-md font-medium leading-relaxed">
              Você possui um saldo devedor de <span className="text-amber-900 dark:text-white font-black whitespace-nowrap">R$ {Number(tenant.saldoDevedor).toFixed(2)}</span>. 
              Mantenha os pagamentos em dia para evitar suspensão automática dos serviços.
            </p>
          </div>
          <button className="px-8 py-4 rounded-2xl bg-amber-600 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-amber-600/20 active:scale-95">
             Pagar agora via PIX
          </button>
        </div>
      )}

      {/* Plan Cards */}
      <PlanCards 
        currentPlan={tenant.licencaTipo}
        defaultMonthlyFee={Number(config?.defaultMonthlyFee || 99)}
        defaultTaxPct={Number(config?.defaultTaxPct || 1.5)}
        tenantTaxPct={tenant.taxaServicoPct ? Number(tenant.taxaServicoPct) : null}
      />

      {/* Transaction History Section */}
      <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 overflow-hidden">
        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
           <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase tracking-widest text-xs">Histórico de Planos</h2>
           <Link href="/tenant/reports" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">Ver relatórios completos →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50 dark:bg-white/2">
                <th className="py-5 px-8">Data</th>
                <th className="py-5 px-8">Descrição do Plano</th>
                <th className="py-5 px-8 text-right">Impacto no Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {taxas.length > 0 ? taxas.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-white/1 transition-colors">
                  <td className="py-5 px-8 text-zinc-500 dark:text-zinc-400 font-medium">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="py-5 px-8 font-semibold text-zinc-900 dark:text-white">{t.description}</td>
                  <td className="py-5 px-8 text-right font-black text-red-500">- R$ {Number(t.amount).toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-zinc-500 font-medium">Nenhuma movimentação financeira registrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Branding Footer */}
      <BillingFooter
        contactEmail={config?.contactEmail || "pedro.phfg11@gmail.com"}
        tenantPlan={tenant.licencaTipo || "TESTE_GRATIS"}
        defaultMonthlyFee={Number(config?.defaultMonthlyFee || 99)}
        defaultTaxPct={Number(config?.defaultTaxPct || 3)}
      />
    </div>
  );
}
