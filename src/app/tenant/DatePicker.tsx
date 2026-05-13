"use client";

import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";
import { BrazilianDateInput } from "@/components/BrazilianDateInput";

export function DatePicker({ initialDate }: { initialDate: string }) {
  const router = useRouter();
  
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      <CalendarIcon className="w-4 h-4 text-zinc-400" />
      <BrazilianDateInput
        value={initialDate}
        onChange={(value) => {
          if (value) {
            router.replace(`/tenant?date=${encodeURIComponent(value)}`);
          }
        }}
        className="bg-transparent border-none text-sm font-bold focus:outline-none w-24 dark:text-white"
        min="2020-01-01" 
      />
    </div>
  );
}
