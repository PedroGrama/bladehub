/**
 * Mapeamento de status para português brasileiro
 * Centraliza todas as traduções de status do sistema
 */

// Status de Agendamento
export const appointmentStatusLabels: Record<string, string> = {
  confirmed: "Confirmado",
  in_progress: "Em Atendimento",
  awaiting_payment: "Aguardando Pagamento",
  done: "Concluído",
  cancelled: "Cancelado",
  no_show: "Ausente",
};

// Status de Tenant
export const tenantStatusLabels: Record<string, string> = {
  ATIVO: "Ativo",
  SUSPENSO: "Suspenso",
  INADIMPLENTE: "Inadimplente",
  TRIAL: "Em Teste",
  PAST_DUE: "Atrasado",
};

// Status de Pagamento
export const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELLED: "Cancelado",
  FAILED: "Falha",
  REFUNDED: "Reembolsado",
};

// Tipo de Licença
export const licenseTypeLabels: Record<string, string> = {
  TESTE_GRATIS: "Teste Gratuito",
  MENSALISTA: "Mensalista",
  TAXA_POR_SERVICO: "Taxa por Serviço",
};

// Origem do Agendamento
export const appointmentOriginLabels: Record<string, string> = {
  app: "App Online",
  admin_panel: "Painel Admin",
  walk_in: "Chegada Direta",
};

// Tipo de Chave PIX
export const pixKeyTypeLabels: Record<string, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  EVP: "Chave Aleatória",
};

// Método de Pagamento
export const paymentMethodLabels: Record<string, string> = {
  PIX_DIRECT: "PIX Direto",
  CASH: "Dinheiro",
  MERCADO_PAGO_PIX: "Mercado Pago - PIX",
  MERCADO_PAGO_CARD: "Mercado Pago - Cartão",
};

// Função genérica para obter o label com fallback
export function getStatusLabel(
  status: string,
  type: 'appointment' | 'tenant' | 'payment' | 'license' | 'origin' | 'pixKey' | 'paymentMethod'
): string {
  const labelMaps = {
    appointment: appointmentStatusLabels,
    tenant: tenantStatusLabels,
    payment: paymentStatusLabels,
    license: licenseTypeLabels,
    origin: appointmentOriginLabels,
    pixKey: pixKeyTypeLabels,
    paymentMethod: paymentMethodLabels,
  };

  return labelMaps[type][status] || status;
}

// Cores para badges de status (Tailwind classes)
export const statusColors: Record<string, string> = {
  // Agendamento
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  in_progress: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
  awaiting_payment: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
  done: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
  no_show: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800",

  // Tenant
  ATIVO: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800",
  SUSPENSO: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
  INADIMPLENTE: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
  TRIAL: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
  PAST_DUE: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",

  // Pagamento
  PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
  PAID: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800",
  CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
  FAILED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
  REFUNDED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
};
