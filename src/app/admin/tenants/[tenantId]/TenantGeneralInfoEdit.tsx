"use client";

import { useState } from "react";
import { updateTenantGeneralInfo } from "./actions";
import { useToast } from "@/components/ToastProvider";
import { Loader2, Save, X, Edit2 } from "lucide-react";

export function TenantGeneralInfoEdit({ tenant }: { tenant: any }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant.name,
    email: tenant.email || "",
    phone: tenant.phone || "",
    cnpj: tenant.cnpj || "",
    ownerName: tenant.ownerName || "",
    address: tenant.address || "",
    isActive: tenant.isActive
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTenantGeneralInfo(tenant.id, formData);
      toast("Informações atualizadas!", "success");
      setEditMode(false);
    } catch (err: any) {
      toast("Erro ao salvar: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!editMode) {
    return (
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8 mb-8 relative group">
        <button 
          onClick={() => setEditMode(true)}
          className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Informações Cadastrais</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome Oficial</label>
            <p className="text-sm font-semibold">{tenant.name}</p>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CNPJ</label>
            <p className="text-sm font-semibold">{formData.cnpj || "Não informado"}</p>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">E-mail de Contato</label>
            <p className="text-sm font-semibold">{formData.email || "Não informado"}</p>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Proprietário</label>
            <p className="text-sm font-semibold">{formData.ownerName || "Não informado"}</p>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Telefone</label>
            <p className="text-sm font-semibold">{formData.phone || "Não informado"}</p>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Endereço</label>
            <p className="text-sm font-semibold">{formData.address || "Não informado"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-blue-500/30 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white">Editar Informações</h2>
        <div className="flex gap-2">
          <button onClick={() => setEditMode(false)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome do Estabelecimento</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">CNPJ</label>
          <input 
            type="text" 
            value={formData.cnpj} 
            onChange={e => setFormData({...formData, cnpj: e.target.value})}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">E-mail</label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Telefone</label>
          <input 
            type="text" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Representante/Dono</label>
          <input 
            type="text" 
            value={formData.ownerName} 
            onChange={e => setFormData({...formData, ownerName: e.target.value})}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Endereço</label>
          <input 
            type="text" 
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t dark:border-white/5 flex items-center justify-between">
         <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.isActive} 
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
              className="w-5 h-5 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 checked:bg-blue-600 transition-all"
            />
            <span className="text-sm font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Estabelecimento Ativo</span>
         </label>

         <button 
           disabled={loading}
           onClick={handleSave}
           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
         >
           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           Salvar Alterações
         </button>
      </div>
    </div>
  );
}
