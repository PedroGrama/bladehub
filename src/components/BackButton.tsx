"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
  variant?: "link" | "button";
}

export function BackButton({ 
  fallback = "/", 
  label = "Voltar", 
  className,
  variant = "link"
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition ${className || ""}`}
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition ${className || ""}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
