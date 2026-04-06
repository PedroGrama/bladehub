"use client";

import { useState } from "react";
import { masks, validators, errorMessages, validateField } from "@/lib/validators";

interface ValidatedInputProps {
  label: string;
  type: keyof typeof validators | "text";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  maxLength?: number;
  className?: string;
}

/**
 * Componente de input com máscara e validação automática
 * Suporta: email, phone, cpf, cnpj, date, cep
 */
export function ValidatedInput({
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error: externalError,
  hint,
  maxLength,
  className = "",
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const maskFn = masks[type as keyof typeof masks];
  const validatorFn = validators[type as keyof typeof validators];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Aplicar máscara se existir
    if (maskFn && (type !== "email" && type !== "password" && type !== "text")) {
      newValue = maskFn(newValue);
    }

    // Validar se foi tocado
    if (touched && validatorFn && newValue) {
      const isValid = validatorFn(newValue);
      if (!isValid) {
        setInternalError(errorMessages[type] || "Campo inválido");
      } else {
        setInternalError(null);
      }
    }

    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);

    // Validar no blur
    if (validatorFn && value && !validatorFn(value)) {
      setInternalError(errorMessages[type] || "Campo inválido");
    } else if (!value && required) {
      setInternalError("Campo obrigatório");
    } else {
      setInternalError(null);
    }

    onBlur?.();
  };

  const displayError = externalError || (touched ? internalError : null);
  const inputType = type === "password" ? "password" : type === "email" ? "email" : "text";

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={inputType}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-3 py-2 rounded-lg border transition
          ${
            displayError
              ? "border-red-400 bg-red-50 dark:bg-red-950/20 dark:border-red-800 focus:ring-red-500/20"
              : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500/20"
          }
          dark:bg-zinc-900 dark:text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2
        `}
      />

      {displayError && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
          ✕ {displayError}
        </p>
      )}

      {hint && !displayError && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Hook para gerenciar campo com validação
 */
export function useValidatedField(initialValue = "", type: keyof typeof validators | "text" = "text") {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const err = validateField("field", value, type);
    setError(err);
    return !err;
  };

  const markTouched = () => {
    setTouched(true);
    validate();
  };

  const reset = () => {
    setValue(initialValue);
    setTouched(false);
    setError(null);
  };

  return {
    value,
    setValue,
    touched,
    setTouched: markTouched,
    error,
    validate,
    reset,
    isValid: !error && value !== "",
  };
}
