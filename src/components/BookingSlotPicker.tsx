"use client";

import flatpickr from "flatpickr";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import "flatpickr/dist/flatpickr.min.css";
import { Clock, Calendar, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAvailableBookingSlots } from "@/app/book/[slug]/actions";
import { SLOT_STEP_MINUTES } from "@/lib/booking-availability";

type BookingSlotPickerProps = {
  tenantId: string;
  durationMinutes: number;
  /** vazio = qualquer profissional */
  barberId: string;
  valueDate: string;
  valueTime: string;
  onChange: (dateStr: string, timeStr: string) => void;
};

function splitTimes(times: string[]) {
  const morning: string[] = [];
  const rest: string[] = [];
  for (const t of times) {
    const [h] = t.split(":").map(Number);
    if (h < 12) morning.push(t);
    else rest.push(t);
  }
  return { morning, rest };
}

export function BookingSlotPicker({
  tenantId,
  durationMinutes,
  barberId,
  valueDate,
  valueTime,
  onChange,
}: BookingSlotPickerProps) {
  const dateRef = useRef<HTMLInputElement>(null);
  const fpInstance = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueTimeRef = useRef(valueTime);
  valueTimeRef.current = valueTime;

  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!valueDate || durationMinutes <= 0) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    void (async () => {
      try {
        const res = await getAvailableBookingSlots({
          tenantId,
          dateStr: valueDate,
          durationMinutes,
          barberId: barberId || null,
        });
        if (cancelled) return;
        if (res.error) setFetchError(res.error);
        setSlots(res.times);
        const vt = valueTimeRef.current;
        if (vt && !res.times.includes(vt)) {
          onChangeRef.current(valueDate, "");
        }
      } catch {
        if (!cancelled) {
          setFetchError("Erro ao carregar horários.");
          setSlots([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantId, valueDate, durationMinutes, barberId]);

  useEffect(() => {
    if (!dateRef.current) return;

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);

    const fp = flatpickr(dateRef.current, {
      locale: Portuguese,
      dateFormat: "d/m/Y",
      minDate: "today",
      maxDate,
      allowInput: false,
      disableMobile: false,
      onChange: (_dates, dateStr) => {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
          onChangeRef.current(formatted, "");
        }
      },
    });
    fpInstance.current = Array.isArray(fp) ? fp[0] ?? null : fp;

    return () => {
      fp.destroy();
      fpInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const fp = fpInstance.current;
    if (!fp || !valueDate) return;
    const [y, m, d] = valueDate.split("-").map(Number);
    fp.setDate(new Date(y, m - 1, d), false);
  }, [valueDate]);

  const { morning, rest } = splitTimes(slots);
  const hasSlots = slots.length > 0;

  const selectTime = (t: string) => {
    onChange(valueDate, t);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-800/40">
        <Clock className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
        <span className="font-medium text-zinc-800 dark:text-zinc-200">
          Duração total do atendimento
        </span>
        <span className="rounded-full bg-zinc-900 px-3 py-0.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {durationMinutes} min
        </span>
        <span className="text-xs text-zinc-500">
          (grade de {SLOT_STEP_MINUTES} min)
        </span>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <Calendar className="h-4 w-4 text-zinc-400" />
          Data
        </label>
        <input
          ref={dateRef}
          type="text"
          readOnly
          placeholder="Escolha o dia"
          className="w-full cursor-pointer rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-white/10"
        />
      </div>

      <div className="relative min-h-[100px]">
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-10 dark:border-zinc-700">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            <span className="text-sm text-zinc-500">Carregando horários…</span>
          </div>
        )}

        {!loading && fetchError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && valueDate && !hasSlots && (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nenhum horário livre neste dia
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Tente outra data ou outro profissional. Se os profissionais ainda não tiverem grade própria cadastrada,
              usamos o mesmo horário da barbearia. Verifique também se o dia está aberto em{" "}
              <span className="font-medium">Configurações → Horários</span> e se a duração dos serviços não excede o
              expediente.
            </p>
          </div>
        )}

        {!loading && hasSlots && (
          <div className="space-y-6">
            {morning.length > 0 && (
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Manhã
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {morning.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => selectTime(t)}
                      className={`rounded-xl border-2 py-2.5 text-center text-sm font-semibold tabular-nums transition ${
                        valueTime === t
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-md dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Tarde & noite
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {rest.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => selectTime(t)}
                      className={`rounded-xl border-2 py-2.5 text-center text-sm font-semibold tabular-nums transition ${
                        valueTime === t
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-md dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {valueTime && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            Horário:{" "}
            <span className="tabular-nums font-bold">
              {valueDate.split("-").reverse().join("/")} às {valueTime}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
