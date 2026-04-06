"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { impersonateTenant } from "../../actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export function TenantImpersonationButton({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleImpersonate = async () => {
    setLoading(true);
    try {
      const res = await impersonateTenant(tenantId);
      if (res.success) {
        toast("Iniciando redirecionamento...", "success");
        router.push("/tenant");
      }
    } catch (err) {
      toast("Erro ao tentar visualizar.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImpersonate}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-bold text-xs hover:bg-zinc-200 dark:hover:bg-white/10 transition disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
      Visão do Estabelecimento
    </button>
  );
}
