/**
 * Mensagens de Erro Padronizadas
 * Todos os erros mostrados aos usuários devem usar essas constantes
 * para garantir consistência e fácil tradução
 */

export const ERROR_MESSAGES = {
  AUTH: {
    MISSING_CREDENTIALS: "Email e senha são obrigatórios",
    INVALID_CREDENTIALS: "Email ou senha incorretos",
    UNAUTHORIZED: "Não autorizado",
    NOT_AUTHENTICATED: "Sessão expirada. Por favor, faça login novamente",
    EMAIL_NOT_VERIFIED: "Confirme seu e-mail antes de fazer login",
    ACCOUNT_PENDING_APPROVAL: "Sua conta está aguardando aprovação do administrador",
  },
  GOOGLE_AUTH: {
    NOT_CONFIGURED: "Google não está configurado corretamente. Contate o suporte",
    FAILED_TO_INITIALIZE: "Falha ao iniciar autenticação com Google. Tente novamente",
    NO_AUTHORIZATION_CODE: "Código de autorização não recebido. Tente novamente",
    SERVER_NOT_CONFIGURED: "Servidor não configurado corretamente. Contate o suporte",
    FAILED_TO_EXCHANGE_CODE: "Falha ao processar autorização. Tente novamente",
  },
  VALIDATION: {
    TENANT_ID_REQUIRED: "ID do estabelecimento é obrigatório",
    TENANT_NOT_FOUND: "Estabelecimento não encontrado",
    PAYMENT_NOT_FOUND: "Pagamento não encontrado",
    NOT_FOUND: "Recurso não encontrado",
    INVALID_ACTION: "Ação inválida",
  },
  WEBHOOK: {
    INVALID_SIGNATURE: "Assinatura do webhook inválida. Verifique a configuração",
    NOT_CONFIGURED: "Webhook do Mercado Pago não configurado. Contate o suporte",
    INVALID_PAYLOAD: "Dados da requisição inválidos",
  },
  TENANT: {
    EMAIL_ALREADY_IN_USE: "Este e-mail já está em uso",
    ACCESS_DENIED: "Acesso não autorizado ao estabelecimento",
  },
  SYSTEM: {
    INTERNAL_ERROR: "Erro ao processar sua solicitação. Tente novamente",
    FAILED_TO_UPDATE_CONFIG: "Falha ao atualizar configurações",
  },
} as const;

/**
 * Retorna mensagem de erro apropriada
 * Se não conseguir encontrar, retorna uma mensagem genérica
 */
export function getErrorMessage(
  category: keyof typeof ERROR_MESSAGES,
  key: string
): string {
  const categoryMessages = ERROR_MESSAGES[category] as any;
  return categoryMessages?.[key] || ERROR_MESSAGES.SYSTEM.INTERNAL_ERROR;
}
