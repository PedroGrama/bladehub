"use client";

import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthDeniedPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center"
      >
        {/* Ícone */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6"
        >
          <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </motion.div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Acesso Pendente
        </h1>

        {/* Descrição */}
        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Sua conta foi criada com sucesso! No entanto, ainda aguarda aprovação
          do administrador do sistema.
        </p>

        {/* Detalhes */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-6 text-sm">
          <p className="text-amber-800 dark:text-amber-200">
            ⏰ Você receberá um e-mail assim que sua conta for ativada. Pode levar
            até 24 horas.
          </p>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          {/* Botão Voltar */}
          <button
            onClick={() => {
              if (window.history.length > 2) router.back();
              else router.push("/login");
            }}
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Login
          </button>

          {/* Link Contato */}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dúvidas?{" "}
            <a
              href="mailto:pedro.phfg11@gmail.com"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contate o suporte
            </a>
          </p>
        </div>

        {/* Rodapé */}
        <p className="text-xs text-slate-500 dark:text-slate-600 mt-6">
          © 2025 Barber SaaS. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}
