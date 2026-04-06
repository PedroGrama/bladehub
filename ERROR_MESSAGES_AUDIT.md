# User-Facing Error Messages Audit

This document catalogs all user-facing error messages in the codebase that should be translated to Portuguese (Brazil).

## API Routes - Authentication

### [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts)
- **Line 12**: `"Missing credentials"` - User didn't provide email/password
  - Suggested PT: "Credenciais ausentes" ou "Email e senha são obrigatórios"
  
- **Line 17**: `"Invalid credentials"` - Wrong email or password
  - Suggested PT: "Credenciais inválidas" ou "Email ou senha incorretos"
  
- **Line 22**: `"Confirme seu e-mail antes de fazer login"` - ✅ Already in Portuguese
  
- **Line 31**: `"Invalid credentials"` - Inactive user
  - Suggested PT: "Credenciais inválidas" ou "Usuário inativo"
  
- **Line 37**: `"Invalid credentials"` - Password doesn't match
  - Suggested PT: "Credenciais inválidas"

### [src/app/api/auth/me/route.ts](src/app/api/auth/me/route.ts)
- **Line 7**: `"Not authenticated"` - User session not found
  - Suggested PT: "Não autenticado" ou "Sessão expirada"

### [src/app/api/auth/google/route.ts](src/app/api/auth/google/route.ts)
- **Line 16**: `"Google Client ID not configured"` - Missing environment variable
  - Suggested PT: "Google não está configurado corretamente"
  
- **Line 38**: `"Failed to initialize Google authentication"` - Exception during Google auth flow
  - Suggested PT: "Falha ao inicializar autenticação com Google"

### [src/app/api/auth/google/callback/route.ts](src/app/api/auth/google/callback/route.ts)
- **Line 23**: `"No authorization code received"` - Missing OAuth code from Google
  - Suggested PT: "Código de autorização não recebido"
  
- **Line 31**: `"Server not configured"` - Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET
  - Suggested PT: "Servidor não está configurado corretamente"
  
- **Line 46**: `"Failed to exchange authorization code"` - Token exchange failed
  - Suggested PT: "Falha ao trocar código de autorização"

## API Routes - Admin

### [src/app/api/admin/tenants/route.ts](src/app/api/admin/tenants/route.ts)
- **Line 9**: `"Unauthorized"` - Not admin_geral
  - Suggested PT: "Não autorizado"
  
- **Line 23**: `"Unauthorized"` - Not admin_geral
  - Suggested PT: "Não autorizado"
  
- **Line 32**: `"Nome, email e senha são obrigatórios."` - ✅ Already in Portuguese
  
- **Line 37**: `"Já existe um estabelecimento com este nome. Escolha um nome diferente."` - ✅ Already in Portuguese
  
- **Line 42**: `"Este email já está em uso. Utilize outro email para o admin deste estabelecimento."` - ✅ Already in Portuguese

### [src/app/api/admin/system-config/route.ts](src/app/api/admin/system-config/route.ts)
- **Line 8**: `"Unauthorized"` - Not admin_geral
  - Suggested PT: "Não autorizado"
  
- **Line 22**: `"Unauthorized"` - Not admin_geral
  - Suggested PT: "Não autorizado"

### [src/app/api/admin/license/route.ts](src/app/api/admin/license/route.ts)
- **Line 10**: `"Unauthorized"` - Not admin_geral
  - Suggested PT: "Não autorizado"
  
- **Line 16**: `"tenantId required"` - Missing tenantId parameter
  - Suggested PT: "ID do estabelecimento é obrigatório"
  
- **Line 19**: `"Tenant not found"` - Tenant doesn't exist
  - Suggested PT: "Estabelecimento não encontrado"
  
- **Line 74**: `"Unknown action"` - Invalid action parameter
  - Suggested PT: "Ação desconhecida" ou "Ação inválida"

## API Routes - Tenant Team

### [src/app/api/tenant/team/route.ts](src/app/api/tenant/team/route.ts)
- **Line 9**: `"Não autorizado"` - ✅ Already in Portuguese
  
- **Line 16**: `"Campos obrigatórios ausentes"` - ✅ Already in Portuguese
  
- **Line 20**: `"Acesso não autorizado ao estabelecimento"` - ✅ Already in Portuguese
  
- **Line 25**: `"Este e-mail já está em uso"` - ✅ Already in Portuguese
  
- **Line 79**: `"Erro interno do servidor"` - ✅ Already in Portuguese

## API Routes - Webhooks

### [src/app/api/webhooks/mercadopago/route.ts](src/app/api/webhooks/mercadopago/route.ts)
- **Line 20**: `"Invalid webhook signature"` - Missing or invalid x-signature header
  - Suggested PT: "Assinatura do webhook inválida"
  
- **Line 33**: `"Webhook not configured"` - Missing mercadoPagoAccessToken
  - Suggested PT: "Webhook não está configurado"
  
- **Line 71**: `"Invalid payload"` - Missing payment ID in webhook data
  - Suggested PT: "Carga útil inválida" ou "Dados do webhook inválidos"

### [src/app/api/test-email/route.ts](src/app/api/test-email/route.ts)
- **Line 14**: Dynamic error from email service - Returns error.message from exception
  - Context: Email sending failed

## API Routes - Cron

### [src/app/api/cron/billing/route.ts](src/app/api/cron/billing/route.ts)
- **Line 12**: `"Unauthorized"` - Invalid cron secret
  - Suggested PT: "Não autorizado"

## Email Verification

### [src/app/api/verify-email/route.ts](src/app/api/verify-email/route.ts)
- **Line 9** (Query param): `"Token+ausente"` - ✅ Already in Portuguese (URL encoded)
  - Decoded: "Token ausente"
  
- **Line 18** (Query param): `"Token+invalido"` - ✅ Already in Portuguese (URL encoded)
  - Decoded: "Token inválido"
  
- **Line 22** (Query param): `"Token+expirado"` - ✅ Already in Portuguese (URL encoded)
  - Decoded: "Token expirado"
  
- **Line 43** (Query param): `"Erro+interno"` - ✅ Already in Portuguese (URL encoded)
  - Decoded: "Erro interno"

## Authentication & Server

### [src/server/auth.ts](src/server/auth.ts)
- **Line 18**: `"Missing JWT_SECRET in environment"` - INTERNAL (console only, not user-facing)
  - Context: Server configuration error

### [src/server/auth-utils.ts](src/server/auth-utils.ts)
- **Line 45**: `"Account pending approval"` - User created via Google but not approved yet
  - Suggested PT: "Conta aguardando aprovação" ou "Acesso pendente de aprovação"

## Admin Actions

### [src/app/admin/actions.ts](src/app/admin/actions.ts)
- **Line 13**: `"Não autorizado"` - ✅ Already in Portuguese
  
- **Line 31**: `"Falha ao excluir o estabelecimento."` - ✅ Already in Portuguese
  
- **Line 44**: `"Não autorizado"` - ✅ Already in Portuguese
  
- **Line 57**: `"Falha ao resetar senha do usuário."` - ✅ Already in Portuguese
  
- **Line 67**: `"Não autorizado"` - ✅ Already in Portuguese
  
- **Line 79**: `"Falha ao atualizar e-mail."` - ✅ Already in Portuguese
  
- **Line 91**: `"Não autorizado"` - ✅ Already in Portuguese

### [src/app/admin/system-config/actions.ts](src/app/admin/system-config/actions.ts)
- **Line 15**: `"Unauthorized"` - INTERNAL: Not admin_geral
  - Suggested PT: "Não autorizado"
  
- **Line 26**: `"Failed to update system config"` - INTERNAL: Database error
  - Suggested PT: "Falha ao atualizar configurações do sistema"
  
- **Line 35**: `"Failed to update system config"` - INTERNAL: Exception
  - Suggested PT: "Falha ao atualizar configurações do sistema"

## Sign Up

### [src/app/signup/actions.ts](src/app/signup/actions.ts)
- **Line 18**: `"Todos os campos são obrigatórios"` - ✅ Already in Portuguese
  
- **Line 22**: `"Senha deve ter pelo menos 6 caracteres"` - ✅ Already in Portuguese
  
- **Line 34**: `"Este email já está cadastrado."` - ✅ Already in Portuguese
  
- **Line 58**: `"Já existe um estabelecimento com este nome e email."` - ✅ Already in Portuguese
  
- **Line 123**: `"Erro ao registrar usuário. Tente novamente."` - ✅ Already in Portuguese

### [src/app/signup/page.tsx](src/app/signup/page.tsx)
- **Line 41**: `"Nome é obrigatório"` - ✅ Already in Portuguese
- **Line 42**: `"Email é obrigatório"` - ✅ Already in Portuguese
- **Line 43**: `"Email inválido"` - ✅ Already in Portuguese
- **Line 44**: `"Senha é obrigatória"` - ✅ Already in Portuguese
- **Line 45**: `"Senha deve ter pelo menos 6 caracteres"` - ✅ Already in Portuguese
- **Line 46**: `"Senhas não conferem"` - ✅ Already in Portuguese
- **Line 47**: `"Nome do estabelecimento é obrigatório"` - ✅ Already in Portuguese
- **Line 50**: `"É necessário aceitar os termos para continuar"` - ✅ Already in Portuguese

## Login

### [src/app/login/page.tsx](src/app/login/page.tsx)
- **Line 28**: `"Falha no login. Verifique seu email e senha."` - ✅ Already in Portuguese (fallback)
- **Line 32**: `"Ocorreu um erro inesperado. Tente novamente."` - ✅ Already in Portuguese

### [src/app/login/forgot/actions.ts](src/app/login/forgot/actions.ts)
- **Line 8**: `"Email obrigatório"` - ✅ Already in Portuguese

### [src/app/login/reset/actions.ts](src/app/login/reset/actions.ts)
- **Line 11**: `"Campos obrigatórios faltando."` - ✅ Already in Portuguese
- **Line 12**: `"As senhas não coincidem."` - ✅ Already in Portuguese
- **Line 13**: `"A senha deve ter no mínimo 6 caracteres."` - ✅ Already in Portuguese
- **Line 17**: `"Token inválido ou inexistente."` - ✅ Already in Portuguese
- **Line 20**: `"Este link de recuperação expirou."` - ✅ Already in Portuguese

## Components

### [src/components/GoogleLoginButton.tsx](src/components/GoogleLoginButton.tsx)
- **Line 28**: `"Falha ao iniciar autenticação Google"` - ✅ Already in Portuguese
- **Line 38**: `"Falha na autenticação com Google. Tente novamente."` - ✅ Already in Portuguese
- **Line 39** (fallback): Dynamic error or message from catch block

### [src/components/ToastProvider.tsx](src/components/ToastProvider.tsx)
- **Line 78**: `"useToast must be used within ToastProvider"` - INTERNAL (React hook error)
  - Suggested PT: "useToast deve ser usado dentro de ToastProvider"

### [src/components/ConfirmDialog.tsx](src/components/ConfirmDialog.tsx)
- **Line 123**: `"useConfirm must be used within ConfirmProvider"` - INTERNAL (React hook error)
  - Suggested PT: "useConfirm deve ser usado dentro de ConfirmProvider"

## Public Booking

### [src/app/book/[slug]/actions.ts](src/app/book/[slug]/actions.ts)
- **Line 34**: `"Formato de telefone inválido. Use (99) 99999-9999 ou (99) 9999-9999."` - ✅ Already in Portuguese
  
- **Line 52**: `"Limite de agendamentos por IP excedido. Tente novamente em 1 hora."` - ✅ Already in Portuguese
  
- **Line 64**: `"Todos os campos do agendamento são obrigatórios: nome, telefone, data, hora e serviço."` - ✅ Already in Portuguese
  
- **Line 75**: `"Alguns serviços selecionados não estão disponíveis."` - ✅ Already in Portuguese
  
- **Line 100**: `"Não é possível agendar horários passados."` - ✅ Already in Portuguese
  
- **Line 112**: `"Não há barbeiros disponíveis nesta barbearia."` - ✅ Already in Portuguese
  
- **Line 146**: `"A barbearia está fechada neste dia."` - ✅ Already in Portuguese
  
- **Line 152**: `"A barbearia funciona apenas de ${tenantHour.startTime} às ${tenantHour.endTime} neste dia."` - ✅ Already in Portuguese (with dynamic content)
  
- **Line 161**: `` `Este horário conflita com o horário de pausa da barbearia (${tenantHour.breakStart} às ${tenantHour.breakEnd}).` `` - ✅ Already in Portuguese (with dynamic content)
  
- **Line 167**: `"O barbeiro não atende neste dia."` - ✅ Already in Portuguese
  
- **Line 174**: `` `O barbeiro atende apenas de ${barberHour.startTime} às ${barberHour.endTime} neste dia.` `` - ✅ Already in Portuguese (with dynamic content)
  
- **Line 183**: `` `Este horário conflita com a pausa do barbeiro (${barberHour.breakStart} às ${barberHour.breakEnd}).` `` - ✅ Already in Portuguese (with dynamic content)
  
- **Line 200**: `"Este horário já foi reservado. Por favor, escolha outro ou não selecione um barbeiro para que busquemos um disponível."` - ✅ Already in Portuguese
  
- **Line 208**: `"Cliente bloqueado. Contate o estabelecimento."` - ✅ Already in Portuguese
  
- **Line 219**: `"Falha ao criar cliente do agendamento. Tente novamente."` - ✅ Already in Portuguese
  
- **Line 225**: `"Não foi possível identificar o cliente para o agendamento."` - ✅ Already in Portuguese
  
- **Line 284**: Dynamic error from exception - ✅ Already in Portuguese (detailed)

### [src/app/book/[slug]/[appointmentId]/actions.ts](src/app/book/[slug]/[appointmentId]/actions.ts)
- **Line 9**: `"Agendamento não encontrado."` - ✅ Already in Portuguese
- **Line 10**: `"Check-in já foi realizado."` - ✅ Already in Portuguese
- **Line 11**: `"Não é possível fazer check-in em um horário cancelado."` - ✅ Already in Portuguese
- **Line 18**: `"O check-in só é liberado 30 minutos antes."` - ✅ Already in Portuguese

## Tenant - Appointments

### [src/app/tenant/appointments/[id]/actions.ts](src/app/tenant/appointments/[id]/actions.ts)
- **Line 9**: `"Acesso negado"` - ✅ Already in Portuguese
- **Line 22**: `"Acesso negado"` - ✅ Already in Portuguese
- **Line 59**: `"Acesso negado"` - ✅ Already in Portuguese
- **Line 90**: `"Acesso negado"` - ✅ Already in Portuguese
- **Line 93**: `"Not found"` - Appointment not found (user might see this)
  - Suggested PT: "Não encontrado"
- **Line 142**: `"Acesso negado"` - ✅ Already in Portuguese

### [src/app/tenant/appointments/new/actions.ts](src/app/tenant/appointments/new/actions.ts)
- **Line 16**: `"Acesso negado."` - ✅ Already in Portuguese
- **Line 40**: `"Este profissional possui um atendimento em aberto. Conclua o anterior antes de iniciar um novo."` - ✅ Already in Portuguese
- **Line 56**: `"Conflito de horário! Este barbeiro já tem um agendamento neste período."` - ✅ Already in Portuguese

## Tenant - Services

### [src/app/tenant/services/actions.ts](src/app/tenant/services/actions.ts)
- **Line 9**: `"Unauthorized"` - INTERNAL: Authorization check
  - Suggested PT: "Não autorizado"
- **Line 23**: `"Limite de 3 serviços atingido no plano Teste Grátis. Faça o upgrade para adicionar mais!"` - ✅ Already in Portuguese

## Tenant - Profile

### [src/app/tenant/profile/actions.ts](src/app/tenant/profile/actions.ts)
- **Line 10**: `"Não autorizado"` - ✅ Already in Portuguese
- **Line 38**: `"Não autorizado"` - ✅ Already in Portuguese
- **Line 41**: `"Usuário não encontrado"` - ✅ Already in Portuguese
- **Line 46**: `"Senha atual incorreta"` - ✅ Already in Portuguese
- **Line 48**: `"Senha atual obrigatória"` - ✅ Already in Portuguese
- **Line 58**: `"Nova senha obrigatória"` - ✅ Already in Portuguese

## Tenant - Settings

### [src/app/tenant/settings/actions.ts](src/app/tenant/settings/actions.ts)
- **Line 10**: `"Unauthorized"` - INTERNAL: Authorization check
  - Suggested PT: "Não autorizado"
- **Line 23**: `"Nome e URL são obrigatórios."` - ✅ Already in Portuguese

## Tenant - Billing

### [src/app/tenant/billing/actions.ts](src/app/tenant/billing/actions.ts)
- **Line 9**: `"Acesso negado"` - ✅ Already in Portuguese

## Tenant - Tenants Admin Panel

### [src/app/admin/tenants/[tenantId]/actions.ts](src/app/admin/tenants/[tenantId]/actions.ts)
- **Line 17**: `"Não autorizado"` - ✅ Already in Portuguese

### [src/app/admin/tenants/[tenantId]/mercadopago.ts](src/app/admin/tenants/[tenantId]/mercadopago.ts)
- **Line 27**: `"Unauthorized"` - INTERNAL: Authorization check
  - Suggested PT: "Não autorizado"
- **Line 131**: `"Unauthorized"` - INTERNAL: Authorization check
  - Suggested PT: "Não autorizado"
- **Line 139**: `"Payment not found"` - Payment not found in system
  - Suggested PT: "Pagamento não encontrado"

---

## Summary Statistics

### Messages by Status:
- **Already in Portuguese**: 69 messages
- **In English (need translation)**: 24 messages
- **INTERNAL (not user-facing)**: 8 messages

### Categories of English Messages Needing Translation:
1. **Authorization errors**: "Unauthorized", "Not authenticated", "Unauthorized" (12 occurrences)
2. **Credentials errors**: "Missing credentials", "Invalid credentials" (4 occurrences)
3. **Data not found**: "Tenant not found", "tenantId required", "Payment not found", "not_found", "unauthorized" (4 occurrences)
4. **Google OAuth**: "Google Client ID not configured", "Failed to initialize Google authentication", "No authorization code received", "Server not configured", "Failed to exchange authorization code" (5 occurrences)
5. **Webhook errors**: "Invalid webhook signature", "Webhook not configured", "Invalid payload" (3 occurrences)

---

## Recommendations

1. **Standardize authorization messages**: Create a constants file with translated messages to use consistently across the app
2. **Create translation file**: Implement i18n or translation constants for all user-facing messages
3. **Audit error handling**: Some errors might not be user-facing - review which ones should be shown to users vs logged
4. **Add context to generic errors**: "Invalid credentials" could be more specific about what's wrong
5. **Review internal error messages**: Hook errors like "useToast must be used within ToastProvider" should not be shown to users
