"use client";

type TermsModalProps = {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 dark:text-zinc-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label="Fechar"
        >
          ✕
        </button>
        <h2 id="terms-title" className="pr-10 text-lg font-bold text-zinc-900 dark:text-white">
          Política de Privacidade e Termos de Uso
        </h2>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Dados coletados</h3>
            <p>
              Nome completo e telefone fornecidos no agendamento são usados exclusivamente para confirmar o
              agendamento, enviar notificações e operar o programa de fidelidade. Nenhum dado é vendido ou
              compartilhado com terceiros.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Notificações via WhatsApp</h3>
            <p>
              Ao agendar, você autoriza o recebimento de mensagens automáticas sobre confirmação de agendamento,
              conclusão de serviço e progresso no programa de fidelidade. Você pode solicitar a remoção dos seus dados
              a qualquer momento pelo WhatsApp do estabelecimento.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Programa de fidelidade e blockchain</h3>
            <p>
              Cada serviço concluído gera um registro imutável na rede Solana (blockchain pública). Esse registro é
              vinculado a uma carteira digital criada automaticamente pelo sistema e associada ao seu telefone. Nenhum
              dado pessoal é gravado na blockchain — apenas um identificador anônimo. O histórico de selos fica
              disponível publicamente no Solscan (explorador da rede Solana).
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Base legal (LGPD)</h3>
            <p>
              O tratamento dos dados tem como base legal o consentimento expresso (Art. 7º, I da Lei 13.709/2020),
              fornecido no momento do agendamento.
            </p>
          </section>
        </div>

        <button
          type="button"
          onClick={onAccept}
          className="mt-8 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Entendi e aceito
        </button>
      </div>
    </div>
  );
}
