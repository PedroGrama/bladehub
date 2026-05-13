"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { updateAppointmentStatus, finalizeReview, registerPayment, repassAppointment, updateAppointmentBarber, validateAndAddService, cancelAppointment, markNoShow, rescheduleAppointment } from "./actions";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";
import { 
  Scissors, 
  CheckCircle2, 
  QrCode, 
  Banknote, 
  ArrowRight, 
  RotateCcw, 
  Play, 
  Plus, 
  Minus,
  ShoppingBag,
  Clock
} from "lucide-react";

export function AppointmentWorkflow({ appointment, tenantServices, pixKey, currentUserId, tenantPlan, barbersList = [], upcomingAppointments = [], loyaltyProgress = null }: any) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(appointment?.status || "confirmed");
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>(appointment?.items || []);
  const [selectedBarberId, setSelectedBarberId] = useState(appointment?.barberId);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [abortReason, setAbortReason] = useState("");
  const [abortMode, setAbortMode] = useState<"cancel" | "no_show">("cancel");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(appointment?.scheduledStart.split("T")[0] ?? "");
  const [rescheduleTime, setRescheduleTime] = useState(appointment?.scheduledStart.split("T")[1]?.slice(0,5) ?? "");
  const [rescheduleError, setRescheduleError] = useState("");
  const [redeemReward, setRedeemReward] = useState(false);

  const toggleItem = (service: any) => {
    if (!service) return;
    const exists = selectedItems.find(i => i.serviceId === service.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.serviceId !== service.id));
    } else {
      setSelectedItems([...selectedItems, {
        serviceId: service.id,
        nameSnapshot: service.name,
        unitPriceSnapshot: Number(service.basePrice || 0),
        quantity: 1,
        durationMinutesSnapshot: Number(service.durationMinutes || 0)
      }]);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    await updateAppointmentStatus(appointment.id, "in_progress");
    setStatus("in_progress");
    setLoading(false);
  };

  const currentTotal = selectedItems.reduce((acc, item) => acc + (Number(item?.unitPriceSnapshot || 0) * (item?.quantity || 1)), 0);
  const hasRewardRedeemable = loyaltyProgress?.rewardAvailable;
  const finalTotal = redeemReward && hasRewardRedeemable ? 0 : currentTotal;
  const appointmentStart = new Date(appointment.scheduledStart);
  const diffMinutes = Math.floor((Date.now() - appointmentStart.getTime()) / 60000);
  const isLate = appointment.status === "confirmed" && diffMinutes >= 15;
  const hasActiveSubscription = tenantPlan && tenantPlan !== "TESTE_GRATIS";
  const canReschedule = currentUserId === appointment.barberId && hasActiveSubscription;

  const handleFinishReview = async () => {
    setLoading(true);
    try {
      await finalizeReview(appointment.id, selectedItems, currentTotal);
      setStatus("awaiting_payment");
      setIsReviewing(false);
    } catch(e: any) {
      toast(e.message, "error");
    }
    setLoading(false);
  };

  const handlePayment = async (method: string) => {
    setLoading(true);
    try {
      await registerPayment(appointment.id, method, finalTotal, pixKey?.id);
      toast("Pagamento registrado com sucesso!", "success");
      router.push("/tenant");
    } catch(e: any) {
       toast(e.message, "error");
    }
    setLoading(false);
  };

  const handleRepass = async () => {
    const confirmed = await confirm({
      title: "Repassar Agendamento",
      message: "Tem certeza que deseja repassar ou cancelar este agendamento?",
      confirmText: "Repassar",
      isDangerous: true,
    });
    if (!confirmed) return;
    
    setLoading(true);
    try {
      const res = await repassAppointment(appointment.id);
      if (res.repassed) {
        toast("Agendamento repassado para outro profissional disponível!", "success");
        router.push("/tenant");
      } else {
        toast("Nenhum profissional disponível. O agendamento foi cancelado.", "info");
        setStatus("cancelled");
      }
    } catch(e: any) {
      toast("Erro: " + e.message, "error");
    }
    setLoading(false);
  };

  const handleAbortSubmit = async () => {
    if (abortReason.trim().length < 7) {
      toast("A justificativa deve ter pelo menos 7 caracteres.", "error");
      return;
    }

    setLoading(true);
    try {
      if (abortMode === "no_show") {
        await markNoShow(appointment.id, abortReason);
        setStatus("no_show");
        toast("Falta registrada com sucesso.", "success");
      } else {
        await cancelAppointment(appointment.id, abortReason);
        setStatus("cancelled");
        toast("Atendimento cancelado com sucesso.", "success");
      }
      setShowAbortModal(false);
    } catch (e: any) {
      toast(e.message, "error");
    }
    setLoading(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Escolha data e horário.");
      return;
    }
    if (abortReason.trim().length < 7) {
      setRescheduleError("A justificativa deve ter pelo menos 7 caracteres.");
      return;
    }

    setLoading(true);
    setRescheduleError("");
    try {
      await rescheduleAppointment(appointment.id, rescheduleDate, rescheduleTime, abortReason);
      toast("Agendamento reagendado com sucesso.", "success");
      setShowRescheduleModal(false);
    } catch (e: any) {
      setRescheduleError(e.message);
    }
    setLoading(false);
  };

  const cardBase = "w-full max-w-xl bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden text-zinc-900 dark:text-white";
  const hasUpcoming = Array.isArray(upcomingAppointments) && upcomingAppointments.length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <AnimatePresence mode="wait">
        
        {/* COMPLETED STATE */}
        {status === "done" && (
          <motion.div 
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardBase} text-center`}
          >
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">Serviço Concluído!</h2>
            <p className="text-zinc-500 mb-6">O pagamento de <span className="text-white font-bold">R$ {finalTotal.toFixed(2)}</span> foi registrado com sucesso.</p>
            
            <div className="mb-8 p-4 rounded-2xl bg-zinc-900 border border-white/5 text-left">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Profissional Responsável</label>
              <select 
                value={selectedBarberId}
                onChange={async (e) => {
                  const newId = e.target.value;
                  setSelectedBarberId(newId);
                  try {
                    await updateAppointmentBarber(appointment.id, newId);
                    toast("Profissional atualizado!", "success");
                  } catch(err: any) {
                    toast(err.message, "error");
                  }
                }}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
              >
                {barbersList.map((b: any) => (
                  <option key={b.id} value={b.id} className="bg-zinc-900">{b.name}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => {
                if (window.history.length > 2) router.back();
                else router.push("/tenant");
              }}
              className="w-full rounded-2xl bg-zinc-100 py-4 text-sm font-bold text-zinc-900 hover:bg-white transition"
            >
              Voltar para Agenda
            </button>
          </motion.div>
        )}

        {/* PAYMENT STATE */}
        {status === "awaiting_payment" && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cardBase}
          >
            <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
              <QrCode className="w-6 h-6 text-blue-400" /> Recebimento
            </h2>
            
            <div className="bg-white dark:bg-zinc-900 border dark:border-white/5 border-zinc-200 p-6 rounded-3xl mb-8 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Total Confirmado</p>
                <p className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">R$ {currentTotal.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-white p-4 rounded-3xl flex justify-center shadow-lg shadow-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixKey?.keyValue || "PENDENTE")}`} 
                  alt="QR Code PIX" 
                  className="w-[180px] h-[180px]" 
                />
              </div>
              <div className="space-y-4">
                {hasRewardRedeemable && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={redeemReward}
                        onChange={(e) => setRedeemReward(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded accent-emerald-600"
                      />
                      <div className="text-sm">
                        <p className="font-bold text-emerald-900 dark:text-emerald-100">🎁 Resgatar Recompensa</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-200 mt-1">O cliente completou {loyaltyProgress?.completed} ciclos. Resgate a recompensa sem cobrar neste atendimento.</p>
                        {redeemReward && (
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300 mt-2">✓ Recompensa será aplicada - Cliente não será cobrado</p>
                        )}
                      </div>
                    </label>
                  </div>
                )}

                <div className="bg-zinc-900 dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-700">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total a Cobrar</p>
                  <p className="text-3xl font-extrabold text-white">R$ {finalTotal.toFixed(2)}</p>
                </div>
 
                 <button 
                   disabled={loading} 
                   onClick={() => handlePayment("PIX_DIRECT")} 
                   className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-sm font-bold text-white hover:bg-blue-500 transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                 >
                   Confirmar PIX <CheckCircle2 className="w-4 h-4" />
                 </button>
                 <button 
                   disabled={loading} 
                   onClick={() => handlePayment("CASH")} 
                   className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/90 py-4 text-sm font-bold text-white hover:bg-zinc-800 transition flex items-center justify-center gap-2"
                 >
                   Recebi em Dinheiro <Banknote className="w-4 h-4 text-white" />
                 </button>
                 <p className="text-[10px] text-zinc-600 text-center uppercase font-bold tracking-tighter">
                   Após confirmar, o status mudará para concluído
                 </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* REVIEW STATE */}
        {isReviewing && (
          <motion.div 
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cardBase}
          >
            <h2 className="text-2xl font-bold mb-2 text-white">Revisão Final</h2>
            <p className="text-sm text-zinc-500 mb-8">Confirme os serviços realizados antes de gerar a cobrança.</p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {tenantServices.map((s: any) => {
                const isSelected = !!selectedItems.find(i => i.serviceId === s.id);
                return (
                  <label 
                    key={s.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/5' 
                        : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-white/2 hover:bg-zinc-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-zinc-700'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-blue-600 dark:text-white' : 'text-zinc-900 dark:text-zinc-400'}`}>
                          {s.name}
                        </span>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-600'}`}>{s.durationMinutes} min</div>
                      </div>
                    </div>
                    <span className={`text-sm font-mono font-bold ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`}>
                      R$ {Number(s.basePrice).toFixed(2)}
                    </span>
                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleItem(s)} />
                  </label>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total dos Serviços</div>
              <div className="text-2xl font-black text-white">R$ {currentTotal.toFixed(2)}</div>
            </div>

            <button 
              disabled={loading || selectedItems.length === 0} 
              onClick={handleFinishReview} 
              className="w-full mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-bold text-white hover:opacity-90 transition shadow-xl shadow-blue-600/20 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {loading ? "Salvando..." : <>Ir para Recebimento <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button 
              onClick={() => setIsReviewing(false)}
              className="w-full mt-3 text-xs text-zinc-600 font-bold uppercase hover:text-zinc-400 transition"
            >
              Cancelar Revisão
            </button>
          </motion.div>
        )}

        {/* IN_PROGRESS STATE */}
        {status === "in_progress" && !isReviewing && (
          <motion.div 
            key="progress"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardBase}`}
          >
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white">Atendimento Ativo</h2>
              <p className="text-zinc-500 text-xs">O cronômetro está rodando.</p>
            </div>

            {hasUpcoming && (
              <div className="space-y-3 mb-8 rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Próximos clientes</span>
                  <span className="text-[10px] font-bold text-zinc-400">{upcomingAppointments.length} próximos</span>
                </div>
                <div className="space-y-2">
                  {upcomingAppointments.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/80 p-3">
                      <div>
                        <p className="text-sm font-bold text-white">{item.client?.name || "Cliente"}</p>
                        <p className="text-[11px] text-zinc-400">{new Date(item.scheduledStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.status === 'confirmed' ? 'Agendado' : item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4 mb-8">
               <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Serviços em Execução</h3>
                 <span className="text-[10px] font-bold text-blue-500 tracking-widest">{appointment.items.length} itens</span>
               </div>
               
               <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {appointment.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-white">{item.nameSnapshot}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-500">{item.durationMinutesSnapshot}m</span>
                    </div>
                  ))}
               </div>

               <div className="pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between gap-4 mb-3 px-2">
                   <div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Adicionar Serviços</h3>
                     <p className="text-xs text-zinc-400">Sugestão de serviço durante o atendimento.</p>
                   </div>
                   <button
                     type="button"
                     onClick={() => setShowServiceSuggestions((current) => !current)}
                     className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-[11px] font-bold text-white hover:bg-blue-500 transition"
                   >
                     <Plus className="w-4 h-4" /> Adicionar serviço
                   </button>
                 </div>

                 {showServiceSuggestions ? (
                   <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                     {tenantServices
                       .filter((s: any) => !appointment.items.some((i: any) => i.serviceId === s.id))
                       .map((s: any) => (
                         <button
                           key={s.id}
                           disabled={loading}
                           onClick={async () => {
                             setLoading(true);
                             try {
                               await validateAndAddService(appointment.id, s.id);
                               toast(`Serviço ${s.name} adicionado com sucesso!`, "success");
                             } catch(e: any) {
                               toast(e.message, "error");
                             }
                             setLoading(false);
                           }}
                           className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-white/5 hover:border-blue-500/30 transition-all text-left group"
                         >
                           <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">{s.name}</span>
                           <Plus className="w-4 h-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
                         </button>
                     ))}
                     {tenantServices.filter((s: any) => !appointment.items.some((i: any) => i.serviceId === s.id)).length === 0 && (
                       <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
                         Todos os serviços já estão incluídos no atendimento.
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="rounded-3xl border border-white/10 bg-blue-600/10 p-4 text-sm text-zinc-400">
                     Clique em "Adicionar serviço" para ver sugestões de serviços para este atendimento.
                   </div>
                 )}
               </div>
            </div>
            
            <button 
              onClick={() => {
                // Sincronizar selectedItems com o que está no banco antes de revisar
                setSelectedItems(appointment.items);
                setIsReviewing(true);
              }} 
              className="w-full rounded-2xl bg-white py-4 text-xs font-black text-zinc-950 hover:bg-zinc-200 transition shadow-xl shadow-white/5 tracking-widest uppercase"
            >
              FINALIZAR ATENDIMENTO
            </button>
          </motion.div>
        )}

        {/* START/CONFIRMED STATE */}
        {status === "confirmed" && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardBase} text-center`}
          >
            <div className="w-24 h-24 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner shadow-blue-500/5">
              <Scissors className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tighter">Novo Cliente?</h2>
            <p className="text-zinc-500 text-sm mb-10 max-w-[280px] mx-auto leading-relaxed">
              O agendamento está confirmado. Clique para iniciar o cronômetro de atendimento.
            </p>
            
            <button 
              disabled={loading} 
              onClick={handleStart} 
              className="w-full rounded-2xl bg-blue-600 py-5 text-base font-black text-white hover:bg-blue-500 transition shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? "Iniciando..." : <>INICIAR AGORA <Play className="w-5 h-5 fill-current" /></>}
            </button>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              {isLate && (
                <button
                  disabled={loading}
                  onClick={() => {
                    setAbortMode("no_show");
                    setShowAbortModal(true);
                  }}
                  className="w-full rounded-2xl border border-red-200 bg-red-50 text-red-600 py-3 font-bold hover:bg-red-100 transition"
                >
                  Marcar Falta
                </button>
              )}

              {canReschedule && (
                <button
                  disabled={loading}
                  onClick={() => {
                    setAbortMode("cancel");
                    setAbortReason("");
                    setShowRescheduleModal(true);
                  }}
                  className="w-full rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 py-3 font-bold hover:bg-blue-100 transition"
                >
                  Reagendar
                </button>
              )}

              <button 
                disabled={loading} 
                onClick={handleRepass} 
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-700 py-3 font-bold hover:bg-zinc-200 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3 h-3" /> Repassar ou Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {/* CANCELLED STATE */}
        {status === "cancelled" && (
          <motion.div key="cancelled" className={`${cardBase} text-center opacity-50 grayscale`}>
            <div className="text-zinc-500 text-4xl mb-4">✕</div>
            <h2 className="text-xl font-bold">Agendamento Cancelado</h2>
            <button 
              onClick={() => {
                if (window.history.length > 2) router.back();
                else router.push("/tenant");
              }} 
              className="mt-6 text-sm underline"
            >
              Voltar
            </button>
          </motion.div>
        )}

        {showAbortModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-black text-zinc-900">{abortMode === "no_show" ? "Marcar Falta" : "Cancelar Atendimento"}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Informe uma justificativa com pelo menos 7 caracteres para seguir.
                  </p>
                </div>
                <button onClick={() => setShowAbortModal(false)} className="text-zinc-400 hover:text-zinc-700">Fechar</button>
              </div>
              <textarea
                value={abortReason}
                onChange={(e) => setAbortReason(e.target.value)}
                placeholder="Descreva o motivo do cancelamento/ausência"
                className="min-h-[140px] w-full rounded-3xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAbortModal(false)}
                  className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={loading || abortReason.trim().length < 7}
                  onClick={handleAbortSubmit}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Processando..." : abortMode === "no_show" ? "Confirmar falta" : "Confirmar cancelamento"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showRescheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-black text-zinc-900">Reagendar Atendimento</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Escolha nova data e hora, e justifique a alteração no plano.
                  </p>
                </div>
                <button onClick={() => setShowRescheduleModal(false)} className="text-zinc-400 hover:text-zinc-700">Fechar</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Data</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full rounded-3xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700">Hora</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full rounded-3xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline:none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <textarea
                value={abortReason}
                onChange={(e) => setAbortReason(e.target.value)}
                placeholder="Justificativa do reagendamento (mínimo 7 caracteres)"
                className="mt-4 min-h-[120px] w-full rounded-3xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              {rescheduleError && <p className="mt-3 text-sm text-red-600">{rescheduleError}</p>}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={loading || abortReason.trim().length < 7}
                  onClick={handleReschedule}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Reagendando..." : "Confirmar reagendamento"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
