"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, ArrowRight } from "lucide-react";
import { migratePlan } from "./actions";
import { useToast } from "@/components/ToastProvider";

interface PlanCardsProps {
  currentPlan: string;
  defaultMonthlyFee: number;
  defaultTaxPct: number;
  tenantTaxPct: number | null;
}

export function PlanCards({ 
  currentPlan, 
  defaultMonthlyFee, 
  defaultTaxPct,
  tenantTaxPct 
}: PlanCardsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const plans = [
    {
      id: "MENSALISTA",
      name: "Plano Mensalista",
      subtitle: "Assinatura fixa sem surpresas",
      price: `R$ ${defaultMonthlyFee.toFixed(0)}`,
      unit: "/mês",
      features: [
        "Serviços ilimitados",
        "Profissionais ilimitados",
        "Suporte prioritário",
      ],
      rules: [
        "Cobrança recorrente mensal via PIX ou Cartão.",
        "Acesso total a todos os relatórios e dashboards.",
        "Sem taxas sobre os serviços realizados."
      ]
    },
    {
      id: "TAXA_POR_SERVICO",
      name: "Plano por Uso",
      subtitle: "Pague apenas o que realizar",
      price: `${defaultTaxPct}%`,
      unit: "por serviço",
      features: [
        "Sem mensalidade fixa",
        "Cobrança automática pós-serviço (Pago)",
        "Faturamento ilimitado",
      ],
      rules: [
        "A taxa é descontada ou acumulada a cada serviço concluído.",
        "Ideal para quem está começando ou tem fluxo variável.",
        "Acesso restrito a alguns relatórios avançados."
      ]
    }
  ];

  const handleMigrate = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      await migratePlan(selectedPlan.id);
      toast("Plano migrado com sucesso!", "success");
      setSelectedPlan(null);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] border dark:border-white/5 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Resumo da Migração</h3>
                <button onClick={() => setSelectedPlan(null)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-600 dark:text-blue-400">Você escolheu o {selectedPlan.name}</h4>
                    <p className="text-xs text-blue-600/60 dark:text-blue-400/60">A alteração entrará em vigor imediatamente.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Regras do Plano</h5>
                  <ul className="space-y-3">
                    {selectedPlan.rules.map((rule: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 flex flex-col gap-3">
                  <button 
                    disabled={loading}
                    onClick={handleMigrate}
                    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? "Migrando..." : (<>Confirmar Migração <ArrowRight className="w-4 h-4" /></>)}
                  </button>
                  <button 
                    disabled={loading}
                    onClick={() => setSelectedPlan(null)}
                    className="w-full py-4 rounded-2xl border border-zinc-200 dark:border-white/5 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition"
                  >
                    Voltar e Pensar Melhor
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Free Trial Card (read-only in this component version) */}
      <div className={`relative rounded-[2.5rem] p-8 border transition-all duration-300 flex flex-col ${currentPlan === 'TESTE_GRATIS' ? 'bg-white dark:bg-zinc-900 border-blue-500/50 shadow-2xl shadow-blue-500/10 translate-y-[-8px]' : 'bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 opacity-80'}`}>
        {currentPlan === 'TESTE_GRATIS' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Plano Atual</div>
        )}
        <div className="mb-6 space-y-1">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Teste Grátis</h3>
          <p className="text-xs text-zinc-500 font-medium">Experimente a plataforma</p>
        </div>
        <ul className="space-y-4 mb-10 flex-1">
          <li className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
             <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">✓</div>
             Até 3 serviços ativos
          </li>
          <li className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
             <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">✓</div>
             30 dias de trial
          </li>
          <li className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 opacity-50">
             <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-500">×</div>
             Profissionais e serviços limitados
          </li>
        </ul>
        <button disabled className="w-full py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest disabled:cursor-not-allowed">
           {currentPlan === 'TESTE_GRATIS' ? 'Ativo' : 'Indisponível'}
        </button>
      </div>

      {plans.map((p) => (
        <div key={p.id} className={`relative rounded-[2.5rem] p-8 border transition-all duration-300 flex flex-col ${currentPlan === p.id ? 'bg-white dark:bg-zinc-900 border-blue-500/50 shadow-2xl shadow-blue-500/10 translate-y-[-8px]' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 hover:border-blue-500/30'}`}>
          {currentPlan === p.id && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Plano Atual</div>
          )}
          <div className="mb-6 space-y-1">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">{p.name}</h3>
            <p className="text-xs text-zinc-500 font-medium">{p.subtitle}</p>
          </div>
          <div className="mb-8 flex items-baseline gap-1">
             <span className="text-4xl font-black text-zinc-900 dark:text-white">{p.price}</span>
             <span className="text-sm text-zinc-500 font-bold">{p.unit}</span>
          </div>
          <ul className="space-y-4 mb-10 flex-1">
            {p.features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">✓</div>
                {f}
              </li>
            ))}
          </ul>
          <button 
            disabled={currentPlan === p.id}
            onClick={() => setSelectedPlan(p)}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${currentPlan === p.id ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 disabled:cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'}`}
          >
             {currentPlan === p.id ? 'Plano Atual' : 'Migrar Plano'}
          </button>
        </div>
      ))}
    </div>
  );
}
