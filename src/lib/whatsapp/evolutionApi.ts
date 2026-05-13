export async function sendWhatsAppMessage(instanceName: string, phone: string, message: string): Promise<void> {
  const base = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  if (!base || !key) {
    console.warn("[sendWhatsAppMessage] EVOLUTION_API_URL ou EVOLUTION_API_KEY não configurados");
    return;
  }

  const digits = phone.replace(/\D/g, "");
  const number = `55${digits}`;

  const res = await fetch(`${base.replace(/\/$/, "")}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ number, text: message }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Evolution API error ${res.status}: ${t}`);
  }
}

export function buildSealMessage(params: {
  clientName: string;
  sealNumber: number;
  goal: number;
  rewardDesc: string;
  txSignature: string;
}): string {
  const { clientName, sealNumber, goal, rewardDesc, txSignature } = params;
  const g = Math.max(1, goal);
  const currentCycle = sealNumber === 0 ? 0 : sealNumber % g === 0 ? g : sealNumber % g;
  const filled = "🟫".repeat(Math.min(currentCycle, g));
  const empty = "⬜".repeat(Math.max(0, g - currentCycle));
  const nextCycleProgress = sealNumber > g ? sealNumber % g : 0;

  const rewardBlock =
    sealNumber >= g
      ? `🎉 Parabéns! Você ganhou: ${rewardDesc}! Mostre essa mensagem na próxima visita.${nextCycleProgress > 0 ? `\nSeu próximo ciclo de selos começou: ${nextCycleProgress}/${g}` : ""}`
      : `Faltam apenas ${g - currentCycle} corte(s) para ganhar ${rewardDesc}!`;

  return `Olá, ${clientName}! ✂️

Serviço concluído com sucesso.

Seus selos de fidelidade: ${currentCycle}/${g}
${filled}${empty}

${rewardBlock}

Registro na blockchain:
https://solscan.io/tx/${txSignature}?cluster=devnet`;
}
