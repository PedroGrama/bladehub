"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (flatpickrRef.current) {
      if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        flatpickrRef.current.setDate(value, false, "Y-m-d");
      } else {
        flatpickrRef.current.setDate(new Date(), false);
      }
    }
  }, [value]);

  useEffect(() => {
    if (!inputRef.current) return;

    flatpickrRef.current = flatpickr(inputRef.current as any, {
      locale: Portuguese,
      dateFormat: "d/m/Y",
      defaultDate: value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : new Date(),
      minDate: min || "today",
      maxDate: max || undefined,
      onChange(dates) {
        if (dates.length > 0) {
          const iso = dates[0].toISOString().split("T")[0];
          onChange(iso);
        }
      },
      allowInput: false,
      disableMobile: false,
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
      required={required}
      readOnly
      className={className}
    />
  );
}
