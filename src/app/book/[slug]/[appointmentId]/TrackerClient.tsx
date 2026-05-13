"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doCheckIn } from "./actions";
import { getStatusLabel, statusColors } from "@/lib/labels";
import { useToast } from "@/components/ToastProvider";

export function TrackerClient({ appointment, slug }: { appointment: any, slug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(appointment.checkedIn);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000); // update every 10s
    return () => clearInterval(t);
  }, []);

  const scheduledStart = new Date(appointment.scheduledStart);
  const diffMinutes = (scheduledStart.getTime() - now.getTime()) / 60000;

  const canCheckIn = diffMinutes <= 30 && diffMinutes > 0 && !checkedIn && appointment.status !== "cancelled";
  const isWarning = diffMinutes <= 10 && diffMinutes > 0 && !checkedIn && appointment.status !== "cancelled";

  async function handleCheckIn() {
    setLoading(true);
    try {
      await doCheckIn(appointment.id);
      setCheckedIn(true);
      toast("Check-in realizado com sucesso! Aguarde ser chamado.", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl text-center">
      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
        📅
      </div>
      <h1 className="text-2xl font-bold mb-1">Agendamento em {appointment.tenantName}</h1>
      <p className="text-zinc-500 mb-2 font-medium">Cliente: {appointment.clientName}</p>
      <p className="text-zinc-500 mb-6 text-sm">Telefone: {appointment.clientPhone}</p>
      <p className="text-zinc-500 mb-6 font-medium">Com: {appointment.barberName}</p>

      <div className="bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-2xl p-4 mb-6 text-left">
        <div className="flex justify-between items-center py-2 border-b dark:border-zinc-800">
          <span className="text-zinc-500">Data e Hora</span>
          <span className="font-semibold">{scheduledStart.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b dark:border-zinc-800">
          <span className="text-zinc-500">Valor Previsto</span>
          <span className="font-semibold">R$ {appointment.totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-zinc-500">Status</span>
          <span className={`font-semibold uppercase text-xs px-2 py-1 rounded ${statusColors[appointment.status] || "bg-zinc-200 dark:bg-zinc-800"}`}>
            {getStatusLabel(appointment.status, 'appointment')}
          </span>
        </div>
      </div>

      {appointment.status === "cancelled" ? (
         <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">
           Este agendamento foi cancelado.
         </div>
      ) : checkedIn ? (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="font-bold text-lg mb-1">✓ Check-in Realizado</div>
          <p className="text-sm">Seu profissional já foi notificado que você está a caminho ou aguardando.</p>
        </div>
      ) : (
        <>
          {isWarning && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-4 text-sm font-bold animate-pulse">
              Atenção: Falta menos de 10 minutos para seu horário! Faça o check-in imediatamente ou seu horário poderá ser cancelado/repassado.
            </div>
          )}

          {canCheckIn ? (
            <button 
              onClick={handleCheckIn} 
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? "Processando..." : "Fazer Check-in Agora"}
            </button>
          ) : (
             <div className="text-sm text-zinc-500 mt-4 p-4 border border-dashed rounded-xl dark:border-zinc-800">
               O botão de Check-in só será liberado 30 minutos antes do seu horário marcado. Salve este link.
             </div>
          )}
        </>
      )}

      <div className="mt-6">
        <button 
          onClick={() => {
            if (window.history.length > 2) router.back();
            else router.push(`/book/${slug}`);
          }}
          className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Voltar a página principal
        </button>
      </div>

      <div className="mt-4 pt-4 border-t dark:border-zinc-800">
        <button 
          onClick={() => {
            const text = `Meu agendamento no ${appointment.tenantName}:\n📍 Serviço: ${appointment.services}\n👤 Profissional: ${appointment.barberName}\n📅 Data: ${new Date(appointment.scheduledStart).toLocaleString()}\n💰 Valor: R$ ${appointment.totalPrice.toFixed(2)}\n\nAcompanhe aqui: ${window.location.href}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            
            if (navigator.share) {
              navigator.share({
                title: 'Meu Agendamento BladeHub',
                text: text,
                url: window.location.href,
              }).catch(() => window.open(whatsappUrl, '_blank'));
            } else {
              window.open(whatsappUrl, '_blank');
            }
          }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition shadow-lg shadow-emerald-500/20"
        >
          <span>Compartilhar Agendamento</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
