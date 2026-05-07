"use client";

import { useState, useEffect, useRef } from "react";
import { createPublicAppointment } from "./actions";
import { useRouter } from "next/navigation";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
// import for Portuguese locale
import { Portuguese } from "flatpickr/dist/l10n/pt.js";

type BookingWizardProps = {
  tenant: { id: string, name: string, slug: string, logoUrl: string | null, allowChooseBarber: boolean };
  services: { id: string, name: string, basePrice: number, durationMinutes: number }[];
  barbers: { id: string, name: string }[];
};

export function BookingWizard({ tenant, services, barbers }: BookingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Workflow State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [barberId, setBarberId] = useState(""); // empty means 'qualquer um' (round-robin)
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const router = useRouter();

  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let fpDate: any;
    let fpTime: any;
    
    // Get today's date and current time (LOCAL)
    const now = new Date();
    const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format (local)
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    if (dateRef.current) {
      fpDate = flatpickr(dateRef.current, {
        locale: Portuguese,
        dateFormat: "d/m/Y",
        minDate: "today",
        defaultDate: now, // Pass Date object for precision
        allowInput: true,
        disableMobile: false,
        onChange: (selectedDates, dateStr) => {
          // Converter de DD/MM/YYYY para YYYY-MM-DD para armazenar
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
            setDate(formatted);
            
            // Update time picker minTime if today is selected
            if (timeRef.current && fpTime) {
              if (formatted === today) {
                // Today: set minTime to current time
                fpTime.set('minTime', currentTime);
              } else {
                // Future date: allow any time
                fpTime.set('minTime', "00:00");
              }
            }
          }
        }
      });
      // Set initial date value
      setDate(today);
    }

    if (timeRef.current) {
      fpTime = flatpickr(timeRef.current, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        defaultDate: now, // Pass Date object
        allowInput: true,
        disableMobile: false,
        minTime: currentTime, // Initially set to current time
        onChange: (selectedDates, dateStr) => setTime(dateStr)
      });
      // Set initial time value
      setTime(currentTime);
    }

    return () => {
      fpDate?.destroy();
      fpTime?.destroy();
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length === 11) val = val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (val.length >= 10) val = val.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    else if (val.length > 2) val = val.replace(/(\d{2})(\d+)/, '($1) $2');
    setClientPhone(val);
  };

  const toggleService = (id: string) => {
    const newSet = new Set(selectedServices);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedServices(newSet);
  };

  const totalValue = Array.from(selectedServices).reduce((acc, id) => {
    return acc + (services.find(s => s.id === id)?.basePrice || 0);
  }, 0);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !clientName || !clientPhone) {
      setError("Preencha todos os campos obrigatórios corretamente.");
      return;
    }
    
    // Validar telefone - deve ter 10 ou 11 dígitos
    const phoneDigits = clientPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError("Telefone inválido. Use um telefone com DDD (ex: 11 99999-9999)");
      return;
    }
    
    setError("");
    setStep(2);
  };

  const handleFinish = async () => {
    if (selectedServices.size === 0) {
      setError("Selecione pelo menos um serviço.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const result = await createPublicAppointment({
        tenantId: tenant.id,
        clientName,
        clientPhone,
        dateStr: date, // "YYYY-MM-DD"
        timeStr: time, // "HH:MM"
        barberId: barberId || null,
        serviceIds: Array.from(selectedServices)
      });

      if ("error" in result) {
        const message = result.error || "Erro desconhecido";
        setError(message);
        return;
      }

      router.push(`/book/${tenant.slug}/${result.appointmentId}`);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao criar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    const displayDate = date.split('-').reverse().join('/');
    return (
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold mb-2">Reserva Confirmada!</h2>
        <p className="text-zinc-500 mb-6">
          Te aguardamos no dia {displayDate} às {time}.
        </p>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 p-4 rounded-2xl text-sm text-left">
          <strong>Aviso Importante:</strong> Você precisa fazer o check-in online na plataforma acessando o atalho que receberá, restrito entre 30 a 10 minutos antes do início do seu horário. Caso contrário o horário poderá ser repassado a um encaixe presencial.
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
      
      {/* Container que desliza */}
      <div className="flex transition-transform duration-500 ease-in-out w-[200%]" style={{ transform: `translateX(${step === 1 ? '0%' : '-50%'})` }}>
        
        {/* Step 1: Info e Hora */}
        <div className="w-1/2 flex-shrink-0 pe-4 flex flex-col min-h-[400px]">
          <form onSubmit={handleNextStep1} className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium mb-1">Seu Nome</label>
              <input required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="João Silva" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seu Telefone/WhatsApp</label>
              <input required value={clientPhone} onChange={handlePhoneChange} placeholder="(11) 99999-9999" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
            </div>
            
            {tenant.allowChooseBarber && (
              <div>
                <label className="block text-sm font-medium mb-1">Profissional de Preferência</label>
                <select value={barberId} onChange={e => setBarberId(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800 bg-transparent">
                  <option value="">Qualquer um disponível</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input 
                  type="text"
                  ref={dateRef}
                  required
                  placeholder="Selecione..."
                  className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horário</label>
                <input 
                  type="text"
                  ref={timeRef}
                  required
                  placeholder="HH:MM"
                  className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950" 
                />
              </div>
            </div>
            
            <button type="submit" className="w-full mt-4 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Avançar para Serviços →
            </button>
          </form>
        </div>

        {/* Step 2: Serviços */}
        <div className="w-1/2 flex-shrink-0 ps-4 space-y-4 flex flex-col min-h-[400px]">
           <div>
             <h3 className="font-semibold mb-2">Quais serviços deseja realizar?</h3>
             <div className="space-y-2 h-[250px] overflow-y-auto pr-2">
               {services.map(s => (
                 <label key={s.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${selectedServices.has(s.id) ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800 shadow-sm' : 'border-zinc-200 dark:border-zinc-800'}`}>
                   <div className="flex items-center gap-3">
                     <input type="checkbox" checked={selectedServices.has(s.id)} onChange={() => toggleService(s.id)} className="w-4 h-4 rounded border-zinc-300 text-zinc-900" />
                     <span className="font-medium">{s.name}</span>
                   </div>
                   <span className="text-zinc-600 dark:text-zinc-400 font-medium">R$ {s.basePrice.toFixed(2)}</span>
                 </label>
               ))}
             </div>
           </div>

           <div className="flex justify-between items-center text-lg font-bold border-t dark:border-zinc-800 pt-4">
             <span>Total Previsão:</span>
             <span>R$ {totalValue.toFixed(2)}</span>
           </div>

           <div className="flex gap-3 pt-2">
             <button onClick={() => setStep(1)} className="w-1/3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
               Voltar
             </button>
             <button onClick={handleFinish} disabled={loading} className="w-2/3 rounded-xl bg-zinc-900 font-medium text-white text-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50">
               {loading ? 'Confirmando...' : 'Finalizar Agendamento'}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
