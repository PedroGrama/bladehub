"use client";

import React, { useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  id: string;
}

interface BillingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantPlan?: string;
  defaultMonthlyFee?: number;
  defaultTaxPct?: number;
}

export function BillingInfoModal({ 
  isOpen, 
  onClose, 
  tenantPlan = "TESTE_GRATIS",
  defaultMonthlyFee = 89,
  defaultTaxPct = 3
}: BillingInfoModalProps) {
  const plans = [
    {
      name: "Plano Mensalista",
      price: `R$ ${defaultMonthlyFee.toFixed(2)}`,
      period: "/mês",
      description: "cobrado todo 30º dia via PIX",
      id: "MENSALISTA"
    },
    {
      name: "Comissão por Serviço",
      price: `${defaultTaxPct}%`,
      period: "por agendamento",
      description: "cobrado mensalmente",
      id: "TAXA_POR_SERVICO"
    },
    {
      name: "Plano Gratuito",
      price: "Sem cobrança",
      period: "",
      description: "limitado a 100 agendamentos/mês",
      id: "TESTE_GRATIS"
    }
  ];

  const currentPlan = plans.find(p => p.id === tenantPlan) || plans[2];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - Drawer no mobile / Modal no desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Mobile: Bottom Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <ContentDrawer currentPlan={currentPlan} plans={plans} onClose={onClose} />
          </motion.div>

          {/* Desktop: Centered Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4"
          >
            <motion.div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <ContentModal currentPlan={currentPlan} plans={plans} onClose={onClose} />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ContentDrawer({ currentPlan, plans, onClose }: {
  currentPlan: Plan;
  plans: Plan[];
  onClose: () => void;
}) {
  return (
    <div className="p-6 pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Como funciona a cobrança</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
        >
          <X className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
        </button>
      </div>

      {/* Plans */}
      <div className="space-y-4 mb-8">
        {plans.map((plan: Plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlan.id}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
          Dúvidas?{" "}
          <a
            href="mailto:pedro.phfg11@gmail.com"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Contate o suporte
          </a>
        </p>
      </div>
    </div>
  );
}

function ContentModal({ currentPlan, plans, onClose }: {
  currentPlan: Plan;
  plans: Plan[];
  onClose: () => void;
}) {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Como funciona a cobrança do BladeHub
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Conheça nossos planos de cobrança
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
        >
          <X className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
        </button>
      </div>

      {/* Current Plan Highlight */}
      <div className="mb-8 p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Seu plano atual
          </span>
        </div>
        <p className="text-lg font-bold text-zinc-900 dark:text-white">
          {currentPlan.name}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {plans.map((plan: Plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlan.id}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
          Dúvidas? Entre em contato:{" "}
          <a
            href="mailto:pedro.phfg11@gmail.com"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            pedro.phfg11@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

function PlanCard({ plan, isCurrentPlan }: {
  plan: { name: string; price: string; period: string; description: string; id: string };
  isCurrentPlan: boolean;
}) {
  return (
    <div className={`p-4 md:p-6 rounded-2xl border-2 transition-all ${
      isCurrentPlan
        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
        : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            {plan.name}
            {isCurrentPlan && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600/10 text-[10px] font-black text-blue-600 dark:text-blue-400 border border-blue-500/30">
                <Check className="w-3 h-3" /> Ativo
              </span>
            )}
          </h3>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {plan.period}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-&00 dark:text-zinc-400">
          {plan.description}
        </p>
      </div>

      {plan.id === "TESTE_GRATIS" && (
        <div className="flex items-start gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Limitado a 100 agendamentos mensais. Atualize para planos pagos para mais agendamentos.
          </p>
        </div>
      )}
    </div>
  );
}
