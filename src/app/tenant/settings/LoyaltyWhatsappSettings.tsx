"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

type Props = {
  tenantId: string;
  loyaltySealsEnabled: boolean;
  loyaltySealGoal: number;
  loyaltyRewardDesc: string | null;
  solanaWalletPublicKey: string | null;
  evolutionInstanceName: string | null;
  evolutionConnected: boolean;
};

async function patchTenant(
  tenantId: string,
  body: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`/api/tenant/${tenantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error || "Falha ao salvar");
  }
}

export function LoyaltyWhatsappSettings({
  tenantId,
  loyaltySealsEnabled: initialEnabled,
  loyaltySealGoal: initialGoal,
  loyaltyRewardDesc: initialReward,
  solanaWalletPublicKey: initialPk,
  evolutionInstanceName: initialEvName,
  evolutionConnected: initialEvConn,
}: Props) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [goal, setGoal] = useState(initialGoal && initialGoal >= 2 && initialGoal <= 30 ? initialGoal : 10);
  const [reward, setReward] = useState(initialReward ?? "Corte grátis");
  const [solPk, setSolPk] = useState(initialPk);
  const [evName, setEvName] = useState(initialEvName ?? "");
  const [evConnected, setEvConnected] = useState(initialEvConn);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const savePatch = async (body: Record<string, unknown>, successMessage = "Salvo.") => {
    setLoading(true);
    setMsg(null);
    try {
      await patchTenant(tenantId, body);
      setMsg(successMessage);
      toast(successMessage, "success");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro";
      setMsg(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const generateSol = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/tenant/solana-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha");
      setSolPk(j.publicKey as string);
      const successMessage = "Carteira gerada com sucesso.";
      setMsg(successMessage);
      toast(successMessage, "success");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro";
      setMsg(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadQr = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/tenant/evolution-qr");
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falha ao buscar QR");
      const b64 =
        (typeof j?.qrcode?.base64 === "string" && j.qrcode.base64) ||
        (typeof j?.base64 === "string" && j.base64) ||
        null;
      setQrBase64(b64);
      if (!b64) {
        const message = "Resposta da Evolution sem base64 de QR; verifique a versão da API.";
        setMsg(message);
        toast(message, "error");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro";
      setMsg(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Programa de fidelidade Web3</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Selos registrados na Solana (Memo) após serviço concluído. Cliente precisa aceitar os termos no
          agendamento público.
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Fidelidade ativa</span>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const v = !enabled;
              setEnabled(v);
              void savePatch({ loyaltySealsEnabled: v });
            }}
            className={`relative h-8 w-14 rounded-full transition ${enabled ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
          >
            <span
              className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition ${enabled ? "translate-x-6" : ""}`}
            />
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500">Meta de selos (2–30)</label>
            <input
              type="number"
              min={2}
              max={30}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (goal < 2 || goal > 30) {
                  toast("A meta de selos deve estar entre 2 e 30.", "error");
                  return;
                }
                void savePatch({ loyaltySealGoal: goal }, "Meta salva com sucesso.");
              }}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              Salvar meta
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500">Descrição da recompensa</label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => savePatch({ loyaltyRewardDesc: reward })}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              Salvar recompensa
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Carteira Solana (paga taxas do selo)</h3>
          <button
            type="button"
            disabled={loading || !!solPk}
            onClick={generateSol}
            className="mt-3 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {solPk ? "Carteira já gerada" : "Gerar carteira Solana"}
          </button>
          {solPk && (
            <div className="mt-3 space-y-2">
              <input readOnly value={solPk} className="w-full rounded-xl border bg-zinc-50 px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950" />
              <a
                href={`https://solscan.io/address/${solPk}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Ver no Solscan (devnet) →
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">WhatsApp (Evolution)</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Configure <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">EVOLUTION_API_URL</code> e{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">EVOLUTION_API_KEY</code> no servidor.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${evConnected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}
          >
            {evConnected ? "Marcado como conectado" : "Aguardando conexão"}
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const v = !evConnected;
              setEvConnected(v);
              void savePatch({ evolutionConnected: v });
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Alternar status manual
          </button>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase text-zinc-500">Nome da instância Evolution</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={evName}
              onChange={(e) => setEvName(e.target.value)}
              placeholder="minha-instancia"
              className="flex-1 rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => savePatch({ evolutionInstanceName: evName || null })}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Salvar
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            disabled={loading || !evName}
            onClick={loadQr}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Carregar QR de conexão
          </button>
          {qrBase64 && (
            <div className="mt-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${qrBase64}`}
                alt="QR WhatsApp"
                width={220}
                height={220}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700"
              />
            </div>
          )}
        </div>
      </section>

      {msg && <p className="text-sm text-zinc-600 dark:text-zinc-400">{msg}</p>}
    </div>
  );
}
