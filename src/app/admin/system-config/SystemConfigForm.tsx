"use client";

import React, { useState } from "react";
import { Settings, Save, AlertCircle, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { updateSystemConfig } from "./actions";

interface SystemConfigFormProps {
  config: {
    contactEmail: string;
    contactPhone: string;
    platformPixKey: string;
    defaultTaxPct: number;
    defaultMonthlyFee: number;
  };
}

export function SystemConfigForm({ config }: SystemConfigFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [contactEmail, setContactEmail] = useState(config.contactEmail);
  const [contactPhone, setContactPhone] = useState(config.contactPhone);
  const [platformPixKey, setPlatformPixKey] = useState(config.platformPixKey);
  const [defaultTaxPct, setDefaultTaxPct] = useState(config.defaultTaxPct);
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState(config.defaultMonthlyFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateSystemConfig({
        contactEmail,
        contactPhone,
        platformPixKey,
        defaultTaxPct: Number(defaultTaxPct),
        defaultMonthlyFee: Number(defaultMonthlyFee),
      });
      toast("Configurações salvas com sucesso!", "success");
    } catch (error: any) {
      toast(error.message || "Erro ao salvar configurações", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information Section */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          Informações de Contato
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">E-mail de Suporte</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black font-medium text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all"
              placeholder="suporte@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Telefone de Suporte</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black font-medium text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Chave PIX da Plataforma</label>
            <input
              type="text"
              value={platformPixKey}
              onChange={(e) => setPlatformPixKey(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black font-medium text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all"
              placeholder="CPF, CNPJ, Email ou EVP"
            />
            <p className="text-[10px] text-zinc-500 font-medium">Usado para receber pagamentos dos estabelecimentos</p>
          </div>
        </div>
      </div>

      {/* Pricing Configuration Section */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Configuração de Preços
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Taxa Padrão de Serviço (%)</label>
            <div className="relative group">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={defaultTaxPct}
                onChange={(e) => setDefaultTaxPct(parseFloat(e.target.value))}
                className="w-full h-12 px-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">Cobrada por agendamento (padrão: 3%)</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mensalidade Padrão (R$)</label>
            <div className="relative group">
              <input
                type="number"
                step="0.01"
                min="0"
                value={defaultMonthlyFee}
                onChange={(e) => setDefaultMonthlyFee(parseFloat(e.target.value))}
                className="w-full h-12 px-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">R$</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">Valor cobrado mensalmente (padrão: R$ 99,00)</p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 space-y-2">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-400 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Resumo de Preços
          </p>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Taxa por serviço: <span className="font-bold">{defaultTaxPct}%</span> (do valor do agendamento)</p>
            <p>• Mensalidade: <span className="font-bold">R$ {defaultMonthlyFee.toFixed(2)}</span></p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          disabled={loading}
          type="submit"
          className="flex items-center gap-2 px-8 h-12 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          SALVAR CONFIGURAÇÕES
        </button>
      </div>
    </form>
  );
}
