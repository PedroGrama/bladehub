"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  appointment?: {
    client: {
      name: string;
    };
  };
  pixKey?: {
    keyType: string;
    keyValue: string;
  };
  appointmentId: string;
}

export function PaymentsClient({ payments }: { payments: Payment[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ordenar do mais recente para o mais antigo
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [payments]);

  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = sortedPayments.slice(startIndex, startIndex + itemsPerPage);

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-300", label: "Pendente" },
    PAID: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", label: "Pago" },
    CANCELLED: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300", label: "Cancelado" },
    FAILED: { bg: "bg-gray-100 dark:bg-gray-900/20", text: "text-gray-700 dark:text-gray-300", label: "Falhou" },
    REFUNDED: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", label: "Reembolsado" },
  };

  const methodLabels: Record<string, string> = {
    PIX_DIRECT: "PIX Direto",
    CASH: "Dinheiro",
    MERCADO_PAGO_PIX: "Mercado Pago (PIX)",
    MERCADO_PAGO_CARD: "Mercado Pago (Cartão)",
  };

  const total = sortedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-1">
                Total de Pagamentos
              </p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">
                R$ {total.toFixed(2)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Últimos 7 dias</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-1">
                Pagamentos Recebidos
              </p>
              <p className="text-2xl font-black text-green-600 dark:text-green-400">
                {sortedPayments.filter(p => p.status === "PAID").length}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Status: Confirmado</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-1">
                Pendentes
              </p>
              <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                {sortedPayments.filter(p => p.status === "PENDING").length}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Aguardando recebimento</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest border-b dark:border-zinc-800">
              <tr>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Data</th>
                <th className="py-4 px-6">Valor</th>
                <th className="py-4 px-6">Método</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((p) => {
                  const colors = statusColors[p.status] || statusColors.PENDING;
                  const methodLabel = methodLabels[p.method as keyof typeof methodLabels] || p.method;
                  const date = new Date(p.createdAt);
                  const formattedDate = date.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {p.appointment?.client?.name || "Cliente"}
                          </p>
                          {p.pixKey && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              {p.pixKey.keyType}: {p.pixKey.keyValue.substring(0, 20)}...
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                          <Calendar className="w-4 h-4" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                        R$ {p.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">
                        {methodLabel}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                          {colors.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          href={`/tenant/appointments/${p.appointmentId}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs uppercase"
                        >
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                    Nenhum pagamento registrado nos últimos 7 dias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Página <span className="font-semibold text-zinc-900 dark:text-white">{currentPage}</span> de{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Icons imports
function Check(props: any) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function Clock(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
