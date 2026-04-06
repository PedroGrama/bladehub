"use client";

import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import "flatpickr/dist/flatpickr.min.css";

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
  const [displayValue, setDisplayValue] = useState(
    value ? new Date(value + "T00:00:00").toLocaleDateString("pt-BR") : ""
  );

  useEffect(() => {
    setDisplayValue(value ? new Date(value + "T00:00:00").toLocaleDateString("pt-BR") : "");
  }, [value]);

  useEffect(() => {
    if (!inputRef.current) return;

    const fp = flatpickr(inputRef.current, {
      dateFormat: "d/m/Y",
      defaultDate: value || undefined,
      locale: Portuguese,
      minDate: min || "today",
      maxDate: max || null,
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
        }
      },
      allowInput: true,
      altInput: false,
    });

    return () => fp.destroy();
  }, [value, min, max, onChange]);

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
