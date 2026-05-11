"use client";

import { useState } from "react";
import { updateTenantSubscription } from "./actions";
import { deleteTenant } from "../../actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";
import { DollarSign, Percent, CheckCircle2, Loader2, Trash2 } from "lucide-react";

interface TenantData {
  id: string;
  name: string;
  licencaTipo: string;
  mensalidadeValor: number | null;
  taxaServicoPct: number | null;
  saldoDevedor: number;
}

export function TenantDetailsClient({ tenant }: { tenant: TenantData }) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    licencaTipo: tenant.licencaTipo,
    mensalidadeValor: tenant.mensalidadeValor || 200,
    taxaServicoPct: tenant.taxaServicoPct || 3.0,
  });

  const handleSave = async () => {
    const confirmed = await confirm({
      title: "Atualizar Assinatura",
      message: `Atualizar modalidade para ${formData.licencaTipo}?`,
      confirmText: "Atualizar",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await updateTenantSubscription(tenant.id, formData);
      toast("Assinatura atualizada com sucesso!", "success");
      setEditMode(false);
    } catch (err: any) {
      toast("Erro ao atualizar: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentLicense = formData.licencaTipo === tenant.licencaTipo;

  return (
    <div className="space-y-6">
      {/* License Options */}
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4">Modalidade de Assinatura</h3>
        
        <div className="space-y-3">
          {/* Teste Grátis */}
          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            formData.licencaTipo === "TESTE_GRATIS"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}>
            <input
              type="radio"
              name="license"
              value="TESTE_GRATIS"
              checked={formData.licencaTipo === "TESTE_GRATIS"}
              onChange={(e) => setFormData({ ...formData, licencaTipo: e.target.value })}
              disabled={isCurrentLicense}
              className="w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <p className="font-bold text-zinc-900 dark:text-white">Teste Grátis</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">14 dias de teste sem custos</p>
            </div>
            {isCurrentLicense && formData.licencaTipo === "TESTE_GRATIS" && (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
          </label>

          {/* Mensalista */}
          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            formData.licencaTipo === "MENSALISTA"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}>
            <input
              type="radio"
              name="license"
              value="MENSALISTA"
              checked={formData.licencaTipo === "MENSALISTA"}
              onChange={(e) => setFormData({ ...formData, licencaTipo: e.target.value })}
              disabled={isCurrentLicense}
              className="w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <p className="font-bold text-zinc-900 dark:text-white">Mensalista</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Plano mensal com valor fixo</p>
            </div>
            {isCurrentLicense && formData.licencaTipo === "MENSALISTA" && (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
          </label>

          {/* Taxa por Serviço */}
          <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            formData.licencaTipo === "TAXA_POR_SERVICO"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}>
            <input
              type="radio"
              name="license"
              value="TAXA_POR_SERVICO"
              checked={formData.licencaTipo === "TAXA_POR_SERVICO"}
              onChange={(e) => setFormData({ ...formData, licencaTipo: e.target.value })}
              disabled={isCurrentLicense}
              className="w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <p className="font-bold text-zinc-900 dark:text-white">Taxa por Serviço</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Cobra por percentual de cada serviço</p>
            </div>
            {isCurrentLicense && formData.licencaTipo === "TAXA_POR_SERVICO" && (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
          </label>
        </div>
      </div>

      {/* Pricing Config (only if not TESTE_GRATIS) */}
      {formData.licencaTipo !== "TESTE_GRATIS" && (
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white">Valores de Cobrança</h3>

          {formData.licencaTipo === "MENSALISTA" && (
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                <DollarSign className="w-4 h-4" />
                Valor Mensal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.mensalidadeValor}
                onChange={(e) => setFormData({ ...formData, mensalidadeValor: Number(e.target.value) })}
                disabled={!editMode}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Padrão: R$ 200,00</p>
            </div>
          )}

          {formData.licencaTipo === "TAXA_POR_SERVICO" && (
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                <Percent className="w-4 h-4" />
                Percentual de Taxa (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.taxaServicoPct}
                onChange={(e) => setFormData({ ...formData, taxaServicoPct: Number(e.target.value) })}
                disabled={!editMode}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Padrão: 3%</p>
            </div>
          )}
        </div>
      )}

      {/* Saldo */}
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mb-2">Saldo de Conta</p>
        <p className={`text-2xl font-black ${tenant.saldoDevedor > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {tenant.saldoDevedor > 0 ? '+' : '-'} R$ {Math.abs(tenant.saldoDevedor).toFixed(2)}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {tenant.saldoDevedor > 0 ? 'A receber do cliente' : 'Cliente em dia'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition"
          >
            Editar Configurações
          </button>
        ) : (
          <>
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || isCurrentLicense}
              className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </>
        )}
      </div>

      <div className="pt-6 border-t dark:border-white/5">
        <button
          onClick={async () => {
            const confirmed = await confirm({
              title: "Excluir Estabelecimento",
              message: "Tem certeza? Esta ação é IRREVERSÍVEL e apagará todos os dados do tenant.",
              confirmText: "Excluir Permanentemente",
              isDangerous: true,
            });
            if (confirmed) {
              setLoading(true);
              const res = await deleteTenant(tenant.id);
              if (res.success) {
                toast("Estabelecimento excluído.", "success");
                router.push("/admin");
              } else {
                toast(res.error || "Erro ao excluir", "error");
                setLoading(false);
              }
            }
          }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Excluir Estabelecimento
        </button>
      </div>
    </div>
  );
}
