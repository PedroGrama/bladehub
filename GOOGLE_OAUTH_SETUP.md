# Google OAuth Configuration Guide

## Visão Geral

Este guia permite configurar a autenticação via Google no Barber SaaS. Após o login bem-sucedido, usuários novos são criados com `isActive = false`, aguardando aprovação do administrador.

## Setup do Google Cloud Console

### 1. Criar um novo projeto
- Acesse [Google Cloud Console](https://console.cloud.google.com/)
- Criar novo projeto chamado "Barber SaaS"
- Aguardar a criação do projeto

### 2. Habilitar a Google+ API
- No menu lateral, procure por "APIs & Services"
- Clique em "Enable APIs and Services"
- Procure por "Google+ API" e ative

### 3. Criar credenciais OAuth 2.0
- Vá para "Credentials" no menu lateral
- Clique em "Create Credentials" → "OAuth client ID"
- Escolha "Web application"
- Adicione as seguintes URLs autorizadas de redirecionamento:
  - Local: `http://localhost:3000/api/auth/google/callback`
  - Produção: `https://your-domain.com/api/auth/google/callback`

### 4. Copiar Client ID e Secret
- Você receberá um Client ID e Client Secret
- Copie ambos valores

## Configuração no Projeto

### 1. Adicionar variáveis de ambiente
Crie ou atualize o arquivo `.env.local`:

```bash
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Verificar se o banco de dados tem as colunas necessárias
Certifique-se que a tabela `User` possui as colunas:
- `isActive` (Boolean, padrão: false)
- `avatar` (String, opcional)

Se não tiver, execute:
```bash
npx prisma migrate dev --name add_google_oauth_fields
```

## Fluxo de Autenticação

### Para o Usuário
1. Clica em "Entrar com Google" na página `/login`
2. Google abre popup de consentimento
3. Após autorizar, volta para o app
4. Se novo: conta criada com `isActive = false`
5. Se não aprovado: redireciona para `/auth-denied`

### Para o Administrador
1. Acessa `/admin/tenants`
2. Vê usuários pendentes de aprovação
3. Marca `isActive = true` para liberar acesso

## Componentes Implementados

### `GoogleLoginButton.tsx`
- Componente reutilizável para login Google
- Gerencia popup, callback, e redirecionamento
- Prop: `isLandingPage` (ajusta texto do botão)

### `/api/auth/google/route.ts`
- **GET**: Retorna URL de consentimento do Google
- **POST**: Recebe código de autorização, valida token, cria/atualiza usuário

### `/auth-denied/page.tsx`
- Página exibida quando usuário não está aprovado
- Informa que aguarda aprovação admin

### `src/server/auth-utils.ts`
- Utilitários para processamento de autenticação
- `processGoogleAuth()`: Cria/valida usuário
- `generateSessionToken()`: Gera token JWT
- `isEmailAllowed()`: Valida domínios permitidos (se configurado)
- `logAuthAttempt()`: Auditoria de tentativas (por implementar)

## Configurações Avançadas

### Limitar domínios de email
No `.env`:
```bash
ALLOWED_EMAIL_DOMAINS=company.com,company2.com
```

### Customizar mensagens
No arquivo `/auth-denied/page.tsx`, edite as strings de texto português.

### Integração com SignOut
Para implementar logout:
```typescript
<button onClick={() => signOut()}>
  Sair
</button>
```

## Troubleshooting

### "Invalid token payload"
- Verifique se o Client Secret está correto
- Verifique se a URL de callback é exata

### Usuário criado mas acesso negado
- Confirme que `isActive = false` no banco
- Admin precisa ir em `/admin` e ativar usuário

### Popup não abre
- Verifique se o navegador permite popups
- Verifique `NEXT_PUBLIC_API_URL` está correto

### Erro "Account pending approval"
- Status 403 esperado para usuários novos
- Admin deve ativar via painel admin

## Próximos Passos

1. **Configurar email de notificação**: Avisar admin quando novo usuário criar conta via Google
2. **Implementar logout**: Adicionar `signOut()` em menu de perfil
3. **Vincular tenant**: Permitir ingresso automático em tenant se tiver convite
4. **Auditoria**: Implementar tabela de `AuthLog` para rastrear tentativas

## Referências
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OpenID Connect](https://openid.net/connect/)
- [NextAuth.js (alternativa futura)](https://next-auth.js.org/)
