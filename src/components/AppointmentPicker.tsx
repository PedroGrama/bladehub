"use client";

import flatpickr from "flatpickr";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import "flatpickr/dist/flatpickr.min.css";

interface AvailableSlot {
  date: Date;
  time: string; // "HH:MM"
  barber?: {
    id: string;
    name: string;
  };
}

interface AppointmentPickerProps {
  availableSlots: AvailableSlot[];
  onSelectSlot: (slot: AvailableSlot) => void;
  onSelectBarber?: (barberId: string) => void;
  allowChooseBarber?: boolean;
  barbers?: Array<{ id: string; name: string }>;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Componente de seleção de slot com FlatPickr
 * Exibe calendário interativo para seleção de data/hora de agendamento
 */
export function AppointmentPicker({
  availableSlots,
  onSelectSlot,
  onSelectBarber,
  allowChooseBarber = false,
  barbers = [],
  minDate,
  maxDate,
}: AppointmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<AvailableSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  // Agrupar slots por data
  const slotsByDate = availableSlots.reduce(
    (acc, slot) => {
      const dateKey = slot.date.toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(slot);
      return acc;
    },
    {} as Record<string, AvailableSlot[]>
  );

  // Datas com slots disponíveis
  const availableDates = Object.keys(slotsByDate).map((d) => new Date(d));

  useEffect(() => {
    if (!inputRef.current) return;

    const fp = flatpickr(inputRef.current, {
      mode: "single",
      dateFormat: "d/m/Y",
      locale: "pt",
      minDate: minDate,
      maxDate: maxDate,
      disable: [
        // Desabilitar datas sem slots
        (date) => {
          const dateKey = date.toISOString().split("T")[0];
          return !slotsByDate[dateKey];
        },
      ],
      onChange: (selectedDates) => {
        if (selectedDates.length === 0) return;

        const dateKey = selectedDates[0].toISOString().split("T")[0];
        let slotsForDate = slotsByDate[dateKey] || [];

        // Filtrar por barbeiro se selecionado
        if (selectedBarber) {
          slotsForDate = slotsForDate.filter(
            (s) => !s.barber || s.barber.id === selectedBarber
          );
        }

        setSelectedDate(selectedDates[0]);
        setAvailableTimes(slotsForDate);
        setSelectedTime("");
      },
    });

    return () => fp.destroy();
  }, [slotsByDate, selectedBarber, minDate, maxDate]);

  const handleSelectSlot = () => {
    if (!selectedDate || !selectedTime || !selectedBarber) return;

    const slot = availableSlots.find(
      (s) =>
        s.date.toISOString().split("T")[0] ===
          selectedDate.toISOString().split("T")[0] &&
        s.time === selectedTime &&
        (!s.barber || s.barber.id === selectedBarber)
    );

    if (slot) {
      onSelectSlot(slot);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Profissional (se habilitado) */}
      {allowChooseBarber && barbers.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-3">
            Profissional de Preferência
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedBarber("")}
              className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                selectedBarber === ""
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              Qualquer um
            </button>
            {barbers.map((barber) => (
              <button
                key={barber.id}
                type="button"
                onClick={() => {
                  setSelectedBarber(barber.id);
                  onSelectBarber?.(barber.id);
                }}
                className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                  selectedBarber === barber.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {barber.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seleção de Data com FlatPickr */}
      <div>
        <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
          Data do Agendamento
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Selecione uma data"
            readOnly
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-white cursor-pointer"
          />
        </div>
      </div>

      {/* Seleção de Horários */}
      {selectedDate && availableTimes.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-3">
            Horários Disponíveis
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {availableTimes.map((slot, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedTime(slot.time)}
                className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                  selectedTime === slot.time
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && availableTimes.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-200">
          Nenhum horário disponível para esta data.
        </div>
      )}

      {/* Botão Confirmar */}
      <button
        onClick={handleSelectSlot}
        disabled={!selectedDate || !selectedTime}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirmar Agendamento
      </button>
    </div>
  );
}
