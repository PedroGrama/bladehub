"use client";

import React, { useState } from "react";
import { BillingInfoModal } from "@/components/BillingInfoModal";

interface BillingFooterProps {
  contactEmail: string;
  tenantPlan: string;
  defaultMonthlyFee?: number;
  defaultTaxPct?: number;
}

export function BillingFooter({ 
  contactEmail = "Pedro.phfg11@gmail.com", 
  tenantPlan,
  defaultMonthlyFee = 89,
  defaultTaxPct = 3
}: BillingFooterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-zinc-100 dark:border-white/5 text-center md:text-left">
         <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Suporte BladeHub</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
               Dúvidas sobre pagamentos? <a href={`mailto:${contactEmail}`} className="text-blue-500 font-bold hover:underline">{contactEmail}</a>
            </p>
         </div>
         <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
            >
              Saber mais
            </button>
            <button className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">
              Falar com um consultor
            </button>
         </div>
      </div>
      
      <BillingInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenantPlan={tenantPlan}
        defaultMonthlyFee={defaultMonthlyFee}
        defaultTaxPct={defaultTaxPct}
      />
    </>
  );
}
