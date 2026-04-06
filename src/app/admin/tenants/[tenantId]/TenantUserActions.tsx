"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";
import { ShieldAlert, Loader2, Key, Edit2, Check, X } from "lucide-react";
import { recoverUserPassword, updateUserEmail } from "../../actions";

export function TenantUserActions({ userId, userEmail, userName }: { userId: string; userEmail: string; userName: string }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(userEmail);

  const handleRecover = async () => {
    const confirmed = await confirm({
      title: "Recuperar Conta",
      message: `Deseja resetar a senha de ${userEmail} para 'Blade123'?`,
      confirmText: "Resetar Senha",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await recoverUserPassword(userId);
      if (res.success) {
        toast(res.message || "Senha resetada com sucesso!", "success");
      } else {
        toast(res.error || "Erro ao resetar senha.", "error");
      }
    } catch (err: any) {
      toast("Erro de conexão.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (newEmail === userEmail) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      const res = await updateUserEmail(userId, newEmail);
      if (res.success) {
        toast("E-mail atualizado com sucesso!", "success");
        setIsEditing(false);
      } else {
        toast(res.error || "Erro ao atualizar e-mail.", "error");
      }
    } catch (err) {
      toast("Erro de conexão.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Novo e-mail"
        />
        <button onClick={handleUpdateEmail} disabled={loading} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setIsEditing(false)} disabled={loading} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 justify-end">
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition"
      >
        <Edit2 className="w-3 h-3" />
        Editar
      </button>
      <button
        onClick={handleRecover}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:opacity-80 transition disabled:opacity-50"
        title="Resetar senha para Blade123"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
        Recuperar
      </button>
    </div>
  );
}
