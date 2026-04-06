"use client";

import { motion } from "framer-motion";
import { AlertCircle, Clock, Zap } from "lucide-react";
import Link from "next/link";

interface TrialBannerProps {
  daysLeft: number;
  hoursLeft: number;
  isExpiring: boolean;
  isExpired: boolean;
  onDismiss?: () => void;
}

export function TrialBanner({
  daysLeft,
  hoursLeft,
  isExpiring,
  isExpired,
  onDismiss,
}: TrialBannerProps) {
  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-300 dark:border-red-800 rounded-xl p-4 mb-6 flex items-start gap-4"
      >
        <div className="flex-shrink-0 mt-1">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-red-900 dark:text-red-200 mb-1">
            Período de Teste Expirado
          </h3>
          <p className="text-sm text-red-800 dark:text-red-300 mb-3">
            Seu acesso foi suspenso. Assine agora para continuar usando a plataforma.
          </p>
          <Link
            href="/tenant/billing"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition text-sm"
          >
            Assinar Agora
          </Link>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-600 hover:text-red-700">
            ✕
          </button>
        )}
      </motion.div>
    );
  }

  if (isExpiring) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-500/10 to-orange-600/10 border border-yellow-300 dark:border-yellow-800 rounded-xl p-4 mb-6 flex items-start gap-4"
      >
        <div className="flex-shrink-0 mt-1">
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1">
            Seu Período de Teste Termina em {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
            {daysLeft === 0
              ? `Apenas ${hoursLeft} ${hoursLeft === 1 ? "hora" : "horas"} restantes!`
              : `Aproveite o tempo restante e assine seu plano para não perder acesso.`}
          </p>
          <Link
            href="/tenant/billing"
            className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-4 py-2 rounded-lg transition text-sm"
          >
            <Zap className="w-4 h-4" />
            Assinar Agora
          </Link>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-yellow-600 hover:text-yellow-700">
            ✕
          </button>
        )}
      </motion.div>
    );
  }

  return null;
}

/**
 * Hook para gerenciar o banner (pode ser customizado)
 */
export function useTrialBanner(daysLeft: number | null) {
  if (daysLeft === null) return null;

  return {
    daysLeft,
    hoursLeft: 0,
    isExpiring: daysLeft <= 3,
    isExpired: daysLeft <= 0,
  };
}
