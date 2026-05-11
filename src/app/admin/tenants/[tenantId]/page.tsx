import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Building2, Calendar, DollarSign, Percent, User, ShieldAlert, Trash2, Eye } from "lucide-react";
import { TenantDetailsClient } from "./TenantDetailsClient";
import { TenantUserActions } from "./TenantUserActions";
import { TenantImpersonationButton } from "./TenantImpersonationButton";
import { BackButton } from "@/components/BackButton";

export default async function TenantDetailsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") redirect("/login");

  const resolvedParams = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id: resolvedParams.tenantId },
    include: {
      users: true,
      appointments: { take: 5, orderBy: { createdAt: "desc" } },
      payments: { take: 5, orderBy: { createdAt: "desc" } },
    },
  });

  if (!tenant) notFound();

  const serialized = {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    cnpj: tenant.cnpj,
    ownerName: tenant.ownerName,
    slug: tenant.slug,
    logoUrl: tenant.logoUrl,
    licencaTipo: tenant.licencaTipo,
    status: tenant.status,
    isActive: tenant.isActive,
    testeExpiraEm: tenant.testeExpiraEm?.toISOString(),
    mensalidadeValor: tenant.mensalidadeValor ? Number(tenant.mensalidadeValor) : null,
    taxaServicoPct: tenant.taxaServicoPct ? Number(tenant.taxaServicoPct) : null,
    saldoDevedor: Number(tenant.saldoDevedor),
    createdAt: tenant.createdAt.toISOString(),
    userCount: tenant.users.length,
    appointmentCount: tenant.appointments.length,
    totalPayments: tenant.payments.reduce((sum: number, p: { amount: number | string }) => sum + Number(p.amount), 0),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <BackButton fallback="/admin" label="Voltar ao Admin" />
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-zinc-900 dark:text-white">{tenant.name}</h1>
            <TenantImpersonationButton tenantId={tenant.id} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-28 space-y-8">
        <div className="rounded-2xl border border-blue-300/30 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-500/30 p-4 text-blue-800 dark:text-blue-200">
          <p className="text-sm font-bold">
            Você está visualizando como <span className="uppercase">Admin Geral</span> — <span className="font-black">{tenant.name}</span>
          </p>
        </div>
        
        {/* Status Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Status</span>
              <Building2 className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white capitalize">{tenant.status || "ATIVO"}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{tenant.isActive ? "Ativo" : "Inativo"}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Modalidade</span>
              <DollarSign className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">{tenant.licencaTipo}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Plano atual</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Profissionais</span>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">{serialized.userCount}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Membros cadastrados</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Saldo</span>
              <Percent className="w-4 h-4 text-zinc-400" />
            </div>
            <p className={`text-2xl font-black ${serialized.saldoDevedor > 0 ? 'text-red-600' : 'text-green-600'}`}>R$ {Math.abs(serialized.saldoDevedor).toFixed(2)}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{serialized.saldoDevedor > 0 ? 'A receber' : 'Pago'}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Basic Info */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8 mb-8">
              <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Informações Cadastrais</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome Oficial</label>
                  <p className="text-sm font-semibold">{tenant.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CNPJ</label>
                  <p className="text-sm font-semibold">{tenant.cnpj || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">E-mail de Contato</label>
                  <p className="text-sm font-semibold">{tenant.email || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Proprietário</label>
                  <p className="text-sm font-semibold">{tenant.ownerName || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Telefone</label>
                  <p className="text-sm font-semibold">{tenant.phone || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Endereço</label>
                  <p className="text-sm font-semibold">{tenant.address || "Não informado"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">Usuários do Estabelecimento</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-white/5">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">E-mail</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-white/5">
                    {tenant.users.map((u: { id: string; name: string; email: string; role: string; isActive: boolean }) => (
                      <tr key={u.id}>
                        <td className="py-4 text-sm font-semibold">{u.name}</td>
                        <td className="py-4 text-sm text-zinc-500">{u.email}</td>
                        <td className="py-4 text-right">
                          <TenantUserActions
                            userId={u.id}
                            userEmail={u.email}
                            userName={u.name}
                            userRole={u.role}
                            userIsActive={u.isActive}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Subscription & Pricing */}
          <div className="lg:col-span-1">
            <TenantDetailsClient tenant={serialized} />
          </div>
        </div>
      </main>
    </div>
  );
}
