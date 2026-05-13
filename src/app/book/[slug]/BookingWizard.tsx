"use client";

import { useState, useEffect, useCallback } from "react";
import { createPublicAppointment } from "./actions";
import { useRouter } from "next/navigation";
import { BookingSlotPicker } from "@/components/BookingSlotPicker";
import { TermsModal } from "@/components/booking/TermsModal";

type BookingWizardProps = {
  tenant: { id: string; name: string; slug: string; logoUrl: string | null; allowChooseBarber: boolean };
  services: { id: string; name: string; basePrice: number; durationMinutes: number }[];
  barbers: { id: string; name: string }[];
};

export function BookingWizard({ tenant, services, barbers }: BookingWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [barberId, setBarberId] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const router = useRouter();

  const totalDurationMinutes = Array.from(selectedServices).reduce((acc, id) => {
    return acc + (services.find((s) => s.id === id)?.durationMinutes ?? 0);
  }, 0);

  useEffect(() => {
    if (step !== 2) return;
    if (!date) {
      const n = new Date();
      const ds = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
      setDate(ds);
    }
  }, [step, date]);

  const handleSlotChange = useCallback((dateStr: string, timeStr: string) => {
    setDate(dateStr);
    setTime(timeStr);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length === 11) val = val.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (val.length >= 10) val = val.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    else if (val.length > 2) val = val.replace(/(\d{2})(\d+)/, "($1) $2");
    setClientPhone(val);
  };

  const toggleService = (id: string) => {
    const newSet = new Set(selectedServices);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedServices(newSet);
  };

  const totalValue = Array.from(selectedServices).reduce((acc, id) => {
    return acc + (services.find((s) => s.id === id)?.basePrice || 0);
  }, 0);

  const handleNextToSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      setError("Preencha nome e telefone.");
      return;
    }
    const phoneDigits = clientPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError("Telefone inválido. Use um telefone com DDD (ex: 11 99999-9999)");
      return;
    }
    if (selectedServices.size === 0) {
      setError("Selecione pelo menos um serviço para calcularmos a duração e os horários livres.");
      return;
    }
    if (!consentAccepted) {
      setError("É necessário aceitar os termos e a política de privacidade para continuar.");
      return;
    }
    setError("");
    setTime("");
    {
      const n = new Date();
      const ds = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
      if (!date) setDate(ds);
    }
    setStep(2);
  };

  const handleFinish = async () => {
    if (!date || !time) {
      setError("Escolha data e horário.");
      return;
    }
    if (selectedServices.size === 0) {
      setError("Selecione pelo menos um serviço.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const result = await createPublicAppointment({
        tenantId: tenant.id,
        clientName,
        clientPhone,
        dateStr: date,
        timeStr: time,
        barberId: barberId || null,
        serviceIds: Array.from(selectedServices),
        consentAccepted: true,
        consentAcceptedAt: new Date().toISOString(),
      });

      if ("error" in result) {
        setError(result.error || "Erro desconhecido");
        return;
      }

      router.push(`/book/${tenant.slug}/${result.appointmentId}`);
    } catch (err) {
      console.error(err);
      setError("Erro ao criar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => {
          setConsentAccepted(true);
          setTermsModalOpen(false);
        }}
      />
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

      <div
        className="flex w-[200%] transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(${step === 1 ? "0%" : "-50%"})` }}
      >
        {/* Step 1: dados + serviços */}
        <div className="flex min-h-[420px] w-1/2 shrink-0 flex-col pe-4">
          <form onSubmit={handleNextToSchedule} className="flex flex-1 flex-col space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Seu Nome</label>
              <input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="João Silva"
                className="w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Seu Telefone/WhatsApp</label>
              <input
                required
                value={clientPhone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            {tenant.allowChooseBarber && (
              <div>
                <label className="mb-1 block text-sm font-medium">Profissional de preferência</label>
                <select
                  value={barberId}
                  onChange={(e) => setBarberId(e.target.value)}
                  className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="">Qualquer um disponível</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  Usamos os horários desse profissional; em &quot;Qualquer um&quot;, mostramos horários em que pelo menos
                  um pode te atender.
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">Serviços</label>
              <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                {services.map((s) => (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                      selectedServices.has(s.id)
                        ? "border-zinc-900 bg-zinc-50 shadow-sm dark:border-zinc-100 dark:bg-zinc-800"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedServices.has(s.id)}
                        onChange={() => toggleService(s.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                      />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">R$ {s.basePrice.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
              <input
                type="checkbox"
                id="consent"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300"
              />
              <label htmlFor="consent" className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Ao agendar, concordo com a{" "}
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="font-medium text-zinc-900 underline dark:text-zinc-100"
                >
                  política de privacidade e termos de uso
                </button>
                , incluindo o recebimento de notificações via WhatsApp e participação no programa de fidelidade.
              </label>
            </div>

            <button
              type="submit"
              disabled={!consentAccepted}
              className="mt-auto w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Escolher data e horário →
            </button>
          </form>
        </div>

        {/* Step 2: data / hora inteligente */}
        <div className="flex min-h-[420px] w-1/2 shrink-0 flex-col ps-4">
          <h3 className="mb-1 text-lg font-semibold">Quando quer ser atendido?</h3>
          <div className="flex-1 overflow-y-auto pr-1">
            <BookingSlotPicker
              tenantId={tenant.id}
              durationMinutes={totalDurationMinutes}
              barberId={barberId}
              valueDate={date}
              valueTime={time}
              onChange={handleSlotChange}
              showDurationInfo={false}
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-lg font-bold dark:border-zinc-800">
            <span>Total</span>
            <span>R$ {totalValue.toFixed(2)}</span>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
              }}
              className="w-1/3 rounded-xl border border-zinc-200 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading || !time || !date}
              className="w-2/3 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Confirmando…" : "Confirmar agendamento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
