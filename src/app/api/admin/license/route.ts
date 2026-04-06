import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

// PATCH /api/admin/license
// Body: { tenantId, licencaTipo, mensalidadeValor, taxaServicoPct, extendDays, action }
export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    return NextResponse.json({ error: ERROR_MESSAGES.AUTH.UNAUTHORIZED }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { tenantId, action } = body;

  if (!tenantId) return NextResponse.json({ error: ERROR_MESSAGES.VALIDATION.TENANT_ID_REQUIRED }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return NextResponse.json({ error: ERROR_MESSAGES.VALIDATION.TENANT_NOT_FOUND }, { status: 404 });

  if (action === "suspend") {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: "SUSPENSO" } });
    return NextResponse.json({ ok: true, message: "Tenant suspenso." });
  }

  if (action === "reactivate") {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: "ATIVO" } });
    return NextResponse.json({ ok: true, message: "Tenant reativado." });
  }

  if (action === "mark_paid") {
    await prisma.tenant.update({ where: { id: tenantId }, data: { saldoDevedor: 0, status: "ATIVO" } });
    return NextResponse.json({ ok: true, message: "Dívida quitada e tenant reativado." });
  }

  if (action === "extend_trial") {
    const days = Number(body.extendDays) || 30;
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);
    await prisma.tenant.update({ where: { id: tenantId }, data: { testeExpiraEm: newExpiry, status: "ATIVO" } });
    return NextResponse.json({ ok: true, message: `Teste estendido por ${days} dias.` });
  }

  if (action === "change_license") {
    const { licencaTipo, mensalidadeValor, taxaServicoPct } = body;
    
    // Log the change
    await prisma.historicoLicenca.create({
      data: {
        tenantId,
        licencaAnterior: tenant.licencaTipo,
        licencaNova: licencaTipo,
        modifiedBy: user.email,
      }
    });

    const updateData: any = { licencaTipo };
    if (licencaTipo === "MENSALISTA" && mensalidadeValor) {
      updateData.mensalidadeValor = Number(mensalidadeValor);
    }
    if (licencaTipo === "TAXA_POR_SERVICO" && taxaServicoPct) {
      updateData.taxaServicoPct = Number(taxaServicoPct);
    }
    if (licencaTipo === "TESTE_GRATIS") {
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);
      updateData.testeExpiraEm = exp;
    }

    await prisma.tenant.update({ where: { id: tenantId }, data: updateData });
    return NextResponse.json({ ok: true, message: "Licença atualizada." });
  }

  return NextResponse.json({ error: ERROR_MESSAGES.VALIDATION.INVALID_ACTION }, { status: 400 });
}
