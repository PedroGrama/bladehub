import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateTenantForm } from "@/app/admin/CreateTenantForm";
import { DashboardClient } from "./DashboardClient";
import { AdminTenantTable } from "./AdminTenantTable";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Scissors, Settings, Mail } from "lucide-react";

export default async function AdminHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin_geral") redirect("/tenant");

  const tenants = await prisma.tenant.findMany({ 
    include: {
      users: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const serialized = tenants.map((t: any) => ({
    id: t.id,
    name: t.name,
    isActive: t.isActive,
    status: t.status ?? "ATIVO",
    licencaTipo: t.licencaTipo ?? "TESTE_GRATIS",
    saldoDevedor: Number(t.saldoDevedor ?? 0),
    testeExpiraEm: t.testeExpiraEm ? (t.testeExpiraEm as Date).toISOString() : null,
    mensalidadeValor: t.mensalidadeValor ? Number(t.mensalidadeValor) : null,
    taxaServicoPct: t.taxaServicoPct ? Number(t.taxaServicoPct) : null,
    cnpj: t.cnpj,
    users: t.users,
    createdAt: t.createdAt.toISOString(),
  }));

  // ── Real KPIs for production ───────────────────────────────────
  let dashboardData = undefined;
  if (process.env.NODE_ENV === "production") {
    const [ativos, inadimplentes, suspensos, agendamentosMes, ticketResult] =
      await Promise.all([
        prisma.tenant.count({ where: { status: "ATIVO", isActive: true } } as any),
        prisma.tenant.count({ where: { status: "INADIMPLENTE", isActive: true } } as any),
        prisma.tenant.count({ where: { OR: [{ status: "SUSPENSO" }, { isActive: false }] } } as any),
        prisma.appointment.count({
          where: {
            scheduledStart: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        }),
        prisma.payment.aggregate({
          _avg: { amount: true },
          where: { status: "PAID" },
        }),
      ]);

    dashboardData = {
      kpis: {
        tenantsAtivos: ativos,
        inadimplentes: inadimplentes,
        inativos: suspensos,
        ticketMedio: Number(ticketResult._avg.amount ?? 0),
        agendamentosMes,
      },
    };
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-blue-500/30">
      <header className="fixed top-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 z-50">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              BladeHub <span className="text-[10px] uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded ml-2 font-mono">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-500 md:inline">{user.email}</span>
            <Link href="/admin/email-tracking" className="rounded-lg bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emails</span>
            </Link>
            <Link href="/admin/system-config" className="rounded-lg bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Configurações</span>
            </Link>
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button className="rounded-full bg-zinc-100 dark:bg-gradient-to-r dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-white/10 px-4 py-2 text-xs font-semibold text-zinc-900 dark:text-white hover:opacity-90 transition">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-12 px-6 pb-20 pt-28">
        {/* Background Orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/5 dark:bg-blue-600/5 blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/5 dark:bg-indigo-600/5 blur-3xl opacity-50" />
        </div>

        <DashboardClient data={dashboardData} />
        
        <div className="grid lg:grid-cols-2 gap-10">
          <CreateTenantForm />
          <AdminTenantTable tenants={serialized} />
        </div>
      </main>
    </div>
  );
}
