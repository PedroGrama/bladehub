"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";
import { ShieldAlert, Loader2, Key, Edit2, Check, X, Shield, UserCog } from "lucide-react";
import { recoverUserPassword } from "../../actions";
import { updateTenantUser } from "./actions";

export function TenantUserActions({ 
  userId, 
  userEmail, 
  userName,
  userRole,
  userIsActive 
}: { 
  userId: string; 
  userEmail: string; 
  userName: string;
  userRole: string;
  userIsActive: boolean;
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    role: userRole,
    isActive: userIsActive
  });

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

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTenantUser(userId, formData);
      toast("Usuário atualizado com sucesso!", "success");
      setIsEditing(false);
    } catch (err: any) {
      toast(err.message || "Erro ao atualizar usuário.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border dark:border-zinc-800 shadow-2xl w-full max-w-md">
          <h3 className="text-xl font-black mb-6">Editar Usuário</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Cargo/Papel</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-bold"
              >
                <option value="tenant_admin">Admin do Estabelecimento</option>
                <option value="barbeiro">Barbeiro / Atendente</option>
                <option value="client">Cliente</option>
              </select>
            </div>
            <label className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-300"
              />
              <span className="text-sm font-bold">Conta Ativa</span>
            </label>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition">
              Cancelar
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition shadow-xl shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Salvar Alterações"}
            </button>
          </div>
        </div>
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
