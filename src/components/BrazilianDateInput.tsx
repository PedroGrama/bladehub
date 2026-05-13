"use client";

import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";

interface BrazilianDateInputProps {
  value: string; // YYYY-MM-DD format (internal)
  onChange: (value: string) => void;
  min?: string; // YYYY-MM-DD format
  max?: string; // YYYY-MM-DD format
  required?: boolean;
  className?: string;
}

export function BrazilianDateInput({
  value,
  onChange,
  min,
  max,
  required,
  className = "",
}: BrazilianDateInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const flatpickrRef = useRef<any>(null);
  const todayValue = new Date().toLocaleDateString("pt-BR");
  const [displayValue, setDisplayValue] = useState(
    value ? new Date(value + "T00:00:00").toLocaleDateString("pt-BR") : todayValue
  );

  useEffect(() => {
    setDisplayValue(value ? new Date(value + "T00:00:00").toLocaleDateString("pt-BR") : todayValue);

    if (flatpickrRef.current) {
      if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        flatpickrRef.current.setDate(value, false, "Y-m-d");
      } else {
        flatpickrRef.current.setDate(new Date(), false);
      }
    }
  }, [value, todayValue]);

  useEffect(() => {
    if (!inputRef.current) return;

    flatpickrRef.current = flatpickr(inputRef.current as any, {
      dateFormat: "d/m/Y",
      defaultDate: value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : new Date(),
      locale: Portuguese,
      minDate: min || "today",
      maxDate: max || undefined,
      onChange(dates) {
        if (dates.length > 0) {
          const iso = dates[0].toISOString().split("T")[0];
          onChange(iso);
        }
      },
      onClose() {
        if (inputRef.current) {
          const raw = inputRef.current.value;
          setDisplayValue(raw);

          const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (match) {
            const [_full, day, month, year] = match;
            const isoCandidate = `${year}-${month}-${day}`;
            const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
            if (
              parsed instanceof Date &&
              !Number.isNaN(parsed.getTime()) &&
              parsed.getFullYear() === Number(year) &&
              parsed.getMonth() + 1 === Number(month) &&
              parsed.getDate() === Number(day)
            ) {
              onChange(isoCandidate);
            }
          }
        }
      },
      allowInput: true,
      altInput: false,
    });

    return () => {
      flatpickrRef.current?.destroy();
      flatpickrRef.current = null;
    };
  }, [min, max, onChange, value]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="DD/MM/YYYY"
      value={displayValue}
      onChange={(e) => {
        setDisplayValue(e.target.value);
      }}
      required={required}
      className={className}
    />
  );
}
