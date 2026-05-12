"use client";

import { useState } from "react";
import { toggleAllowChooseBarber } from "./actions";
import { useToast } from "@/components/ToastProvider";

export function TeamSettingsForm({ tenant }: { tenant: any }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [allowChoose, setAllowChoose] = useState(tenant?.allowChooseBarber ?? true);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleAllowChooseBarber(!allowChoose);
      setAllowChoose(!allowChoose);
      toast(
        !allowChoose 
          ? "Clientes agora podem escolher o profissional."
          : "Sistema distribuirá clientes automaticamente.",
        "success"
      );
    } catch (err: any) {
      toast(err.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={allowChoose}
              onChange={handleToggle}
              disabled={loading}
              className="w-5 h-5 rounded border-zinc-300 text-blue-600 cursor-pointer disabled:opacity-50"
            />
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Permitir que o cliente escolha o profissional
            </span>
          </label>
          <p className="text-xs text-zinc-500 mt-2 pl-8">
            {allowChoose 
              ? "Os clientes podem selecionar o profissional de sua preferência ao agendar."
              : "Se desmarcado, o sistema distribuirá automaticamente os clientes entre os profissionais disponíveis de forma justa."}
          </p>
        </div>
      </div>
    </div>
  );
}
