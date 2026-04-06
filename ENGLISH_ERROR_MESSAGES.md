# English Error Messages - Translation Required

This is a quick reference of all English error messages that need to be translated to Portuguese (Brazil).

## Authorization & Authentication (14 messages)

| File | Line | English Message | Suggested Portuguese Translation |
|------|------|---|---|
| src/app/api/admin/tenants/route.ts | 9 | `"Unauthorized"` | `"Não autorizado"` |
| src/app/api/admin/tenants/route.ts | 23 | `"Unauthorized"` | `"Não autorizado"` |
| src/app/api/admin/system-config/route.ts | 8 | `"Unauthorized"` | `"Não autorizado"` |
| src/app/api/admin/system-config/route.ts | 22 | `"Unauthorized"` | `"Não autorizado"` |
| src/app/api/admin/license/route.ts | 10 | `"Unauthorized"` | `"Não autorizado"` |
| src/app/api/auth/login/route.ts | 12 | `"Missing credentials"` | `"Email e senha são obrigatórios"` |
| src/app/api/auth/login/route.ts | 17 | `"Invalid credentials"` | `"Email ou senha incorretos"` |
| src/app/api/auth/login/route.ts | 31 | `"Invalid credentials"` | `"Email ou senha incorretos"` |
| src/app/api/auth/login/route.ts | 37 | `"Invalid credentials"` | `"Email ou senha incorretos"` |
| src/app/api/auth/me/route.ts | 7 | `"Not authenticated"` | `"Sessão expirada"` |
| src/app/api/cron/billing/route.ts | 12 | `"Unauthorized"` | `"Não autorizado"` |
| src/server/auth-utils.ts | 45 | `"Account pending approval"` | `"Conta aguardando aprovação do administrador"` |
| src/app/admin/system-config/actions.ts | 15 | `"Unauthorized"` | `"Não autorizado"` |
| src/app/tenant/services/actions.ts | 9 | `"Unauthorized"` | `"Não autorizado"` |

## Google OAuth Errors (5 messages)

| File | Line | English Message | Suggested Portuguese Translation |
|------|------|---|---|
| src/app/api/auth/google/route.ts | 16 | `"Google Client ID not configured"` | `"Google não está configurado corretamente. Contate o suporte."` |
| src/app/api/auth/google/route.ts | 38 | `"Failed to initialize Google authentication"` | `"Falha ao iniciar autenticação com Google. Tente novamente."` |
| src/app/api/auth/google/callback/route.ts | 23 | `"No authorization code received"` | `"Código de autorização não recebido. Tente novamente."` |
| src/app/api/auth/google/callback/route.ts | 31 | `"Server not configured"` | `"Servidor não configurado corretamente. Contate o suporte."` |
| src/app/api/auth/google/callback/route.ts | 46 | `"Failed to exchange authorization code"` | `"Falha ao processar autorização. Tente novamente."` |

## Data Validation & Not Found Errors (6 messages)

| File | Line | English Message | Suggested Portuguese Translation |
|------|------|---|---|
| src/app/api/admin/license/route.ts | 16 | `"tenantId required"` | `"ID do estabelecimento é obrigatório"` |
| src/app/api/admin/license/route.ts | 19 | `"Tenant not found"` | `"Estabelecimento não encontrado"` |
| src/app/api/admin/license/route.ts | 74 | `"Unknown action"` | `"Ação inválida"` |
| src/app/tenant/appointments/[id]/actions.ts | 93 | `"Not found"` | `"Não encontrado"` |
| src/app/admin/tenants/[tenantId]/mercadopago.ts | 139 | `"Payment not found"` | `"Pagamento não encontrado"` |

## Webhook & API Payload Errors (3 messages)

| File | Line | English Message | Suggested Portuguese Translation |
|------|------|---|---|
| src/app/api/webhooks/mercadopago/route.ts | 20 | `"Invalid webhook signature"` | `"Assinatura do webhook inválida. Verifique a configuração."` |
| src/app/api/webhooks/mercadopago/route.ts | 33 | `"Webhook not configured"` | `"Webhook do Mercado Pago não configurado. Contate o suporte."` |
| src/app/api/webhooks/mercadopago/route.ts | 71 | `"Invalid payload"` | `"Dados da requisição inválidos"` |

## Internal Error Messages (NOT user-facing - should not be shown to users)

| File | Line | Message | Classification |
|------|------|---|---|
| src/server/auth.ts | 18 | `"Missing JWT_SECRET in environment"` | Internal config error |
| src/components/ToastProvider.tsx | 78 | `"useToast must be used within ToastProvider"` | React hook error |
| src/components/ConfirmDialog.tsx | 123 | `"useConfirm must be used within ConfirmProvider"` | React hook error |
| src/app/admin/system-config/actions.ts | 26 | `"Failed to update system config"` | Internal error |
| src/app/admin/system-config/actions.ts | 35 | `"Failed to update system config"` | Internal error |
| src/app/tenant/settings/actions.ts | 10 | `"Unauthorized"` | Internal error |
| src/app/admin/tenants/[tenantId]/mercadopago.ts | 27 | `"Unauthorized"` | Internal error |
| src/app/admin/tenants/[tenantId]/mercadopago.ts | 131 | `"Unauthorized"` | Internal error |

---

## Translation Notes

### Priority 1 - Most Visible to Users
- Google OAuth errors
- Login authentication errors
- Public booking errors

### Priority 2 - Admin/Tenant Dashboard
- Authorization errors in API routes
- Admin tenant management errors
- Billing and payment errors

### Priority 3 - Less Frequently Seen
- Webhook configuration errors
- System administration errors

### Suggested Approach
1. Create `src/lib/errorMessages.ts` with constants for all error messages
2. Use a translation/i18n solution (next-intl or similar)
3. Ensure all error responses use these constants
4. Test error messages in UI before and after translation

### Example Constants File Structure:
```typescript
// src/lib/errorMessages.ts
export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: "Não autorizado",
    NOT_AUTHENTICATED: "Sessão expirada",
    MISSING_CREDENTIALS: "Email e senha são obrigatórios",
    INVALID_CREDENTIALS: "Email ou senha incorretos",
    ACCOUNT_PENDING_APPROVAL: "Conta aguardando aprovação do administrador",
  },
  GOOGLE_AUTH: {
    CLIENT_NOT_CONFIGURED: "Google não está configurado corretamente",
    FAILED_TO_INITIALIZE: "Falha ao iniciar autenticação com Google",
    NO_AUTH_CODE: "Código de autorização não recebido",
    SERVER_NOT_CONFIGURED: "Servidor não configurado corretamente",
    FAILED_TOKEN_EXCHANGE: "Falha ao processar autorização",
  },
  DATA: {
    TENANT_NOT_FOUND: "Estabelecimento não encontrado",
    PAYMENT_NOT_FOUND: "Pagamento não encontrado",
    NOT_FOUND: "Não encontrado",
  },
  // ... more categories
};
```
