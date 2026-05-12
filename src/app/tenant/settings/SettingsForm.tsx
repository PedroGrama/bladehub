"use client";

import { useState } from "react";
import { updateTenantSettings } from "./actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export function SettingsForm({ tenant }: { tenant: any }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(tenant.logoUrl || "");
  const [discountType, setDiscountType] = useState(tenant.appDiscountType || "none");
  const [discountValue, setDiscountValue] = useState(tenant.appDiscountValue || 0);
  const router = useRouter();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast("A imagem deve ter no máximo 2MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validar desconto
    if (discountType !== "none") {
      if (discountValue < 0) {
        toast("O valor do desconto não pode ser negativo", "error");
        return;
      }
      if (discountType === "percentage" && discountValue > 50) {
        toast("Desconto percentual não pode ultrapassar 50%", "error");
        return;
      }
      if (discountType === "fixed" && discountValue > 20) {
        toast("Desconto em valor fixo não pode ultrapassar R$ 20,00", "error");
        return;
      }
    }
    
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("appDiscountType", discountType);
      formData.set("appDiscountValue", String(discountValue));
      await updateTenantSettings(formData);
      toast("Configurações atualizadas com sucesso!", "success");
      router.refresh();
    } catch (err: any) {
      toast("Erro: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Estabelecimento</label>
          <input 
            type="text" 
            name="name" 
            defaultValue={tenant.name || ""} 
            required 
            className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL Pública (Slug)</label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-r-0 dark:border-zinc-700 rounded-l-xl text-sm text-zinc-500 font-bold">
              bladehub.app/book/
            </span>
            <input 
              type="text" 
              name="slug" 
              defaultValue={tenant.slug || ""} 
              required 
              className="flex-1 rounded-r-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">Este será o link final enviado para os seus clientes.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-widest text-[10px]">Identidade Visual (Logo)</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-3xl bg-zinc-50 dark:bg-white/2 border dark:border-white/5">
            <div className="relative group">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-xl" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 shadow-inner flex items-center justify-center text-zinc-400 font-black text-2xl">
                  {tenant.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3 w-full">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-[1px] file:border-zinc-200 dark:file:border-zinc-800 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-zinc-900 dark:file:bg-zinc-950 dark:file:text-white hover:file:bg-zinc-50 cursor-pointer transition-all"
              />
              {logoPreview && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                  Arquivo selecionado
                </div>
              )}
              <p className="text-[10px] text-zinc-500 font-medium">PNG ou JPG até 2MB. Recomendamos 400x400px.</p>
              
              {logoPreview && (
                <button 
                  type="button" 
                  onClick={() => setLogoPreview("")} 
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  Remover Foto
                </button>
              )}
            </div>
            <input type="hidden" name="logoUrl" value={logoPreview} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chave PIX (Para receber pagamentos)</label>
          <input 
            type="text" 
            name="pixKey" 
            defaultValue={tenant.pixKey || ""} 
            placeholder="CNPJ, CPF, Email ou Celular"
            className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
          />
          <p className="text-xs text-zinc-500 mt-1">Sua chave PIX que será mostrada no QRCode pós-atendimento.</p>
        </div>

        <div className="pt-6 border-t dark:border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-[10px]">Dados de Cadastro do Estabelecimento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest text-[10px] mb-1 ml-1">CNPJ (Opcional)</label>
              <input 
                type="text" 
                name="cnpj" 
                defaultValue={tenant.cnpj || ""} 
                placeholder="00.000.000/0000-00"
                className="w-full rounded-xl border px-3 py-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest text-[10px] mb-1 ml-1">Responsável / Proprietário</label>
              <input 
                type="text" 
                name="ownerName" 
                defaultValue={tenant.ownerName || ""} 
                placeholder="Nome do responsável"
                className="w-full rounded-xl border px-3 py-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest text-[10px] mb-1 ml-1">Telefone de Contato</label>
              <input 
                type="text" 
                name="phone" 
                defaultValue={tenant.phone || ""} 
                placeholder="(00) 00000-0000"
                className="w-full rounded-xl border px-3 py-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest text-[10px] mb-1 ml-1">E-mail de Contato</label>
              <input 
                type="email" 
                name="email" 
                defaultValue={tenant.email || ""} 
                placeholder="estabelecimento@email.com"
                className="w-full rounded-xl border px-3 py-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-800 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest text-[10px] mb-1 ml-1">Endereço Completo</label>
            <textarea 
              name="address" 
              defaultValue={tenant.address || ""} 
              placeholder="Rua, Número, Bairro, Cidade - UF"
              rows={2}
              className="w-full rounded-xl border px-3 py-2.5 text-sm dark:bg-zinc-950 dark:border-zinc-800 font-bold resize-none"
            />
          </div>
        </div>

        <div className="pt-6 border-t dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-widest text-[10px]">Desconto para Agendamentos Online</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 transition-all">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Desconto</label>
              <select 
                value={discountType}
                onChange={e => {
                  setDiscountType(e.target.value);
                  if (e.target.value === "none") setDiscountValue(0);
                }}
                className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              >
                <option value="none">Nenhum</option>
                <option value="fixed">Valor Fixo (R$)</option>
                <option value="percentage">Percentual (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor do Desconto</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max={discountType === "percentage" ? "50" : "20"}
                disabled={discountType === "none"}
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
                placeholder="0.00"
                className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500 mt-1">
                {discountType === "percentage" && "Máximo 50%"}
                {discountType === "fixed" && "Máximo R$ 20,00"}
              </p>
            </div>
            <p className="sm:col-span-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">
              Atenção: Este desconto será aplicado automaticamente em agendamentos feitos pelo link público.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t dark:border-zinc-800">
        <button disabled={loading} type="submit" className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50">
          {loading ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </form>
  );
}
