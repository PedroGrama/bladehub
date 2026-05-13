import { TenantSidebar } from "@/components/tenant-sidebar";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.tenantId && user.role !== "admin_geral") {
    redirect("/login");
  }

  let tenantName = "";
  let tenantPlan = "ATIVO";
  let tenantLogoUrl: string | null = null;
  let userAvatarUrl: string | null = null;
  if (user.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
    if (tenant) {
      tenantName = tenant.name;
      tenantPlan = tenant.licencaTipo;
      tenantLogoUrl = tenant.logoUrl ?? null;
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  });
  userAvatarUrl = dbUser?.image ?? null;

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <TenantSidebar 
        userRole={user.role} 
        userEmail={user.email} 
        userName={user.name}
        userAvatarUrl={userAvatarUrl}
        tenantName={tenantName} 
        tenantPlan={tenantPlan}
        tenantLogoUrl={tenantLogoUrl}
        canEditTenantLogo={user.role === "tenant_admin" || user.role === "admin_geral"}
      />
      <div className="flex-1 h-screen overflow-auto pt-[65px] md:pt-0">
        {children}
      </div>
    </div>
  );
}
