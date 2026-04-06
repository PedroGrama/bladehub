# 🔐 Google OAuth Implementation - Complete

## ✅ Tarefa 6 Concluída: Implementar Google Login com Fluxo de Aprovação

### 📁 Arquivos Criados

**API Routes:**
- `/src/app/api/auth/google/route.ts` - Gera URL de autenticação do Google
- `/src/app/api/auth/google/callback/route.ts` - Processa redirect do Google OAuth

**Componentes:**
- `/src/components/GoogleLoginButton.tsx` - Botão reutilizável para login com Google
- `/src/app/auth-denied/page.tsx` - Página de "Acesso Pendente de Aprovação"

**Utilitários:**
- `/src/server/auth-utils.ts` - Funções centralizadas de autenticação

**Documentação:**
- `GOOGLE_OAUTH_SETUP.md` - Guia completo de configuração (Google Cloud Console)
- `.env.example` - Variáveis de ambiente necessárias

### 🔄 Fluxo de Autenticação

```
User clica "Entrar com Google" (login page)
         ↓
GET /api/auth/google (obtém URL de consentimento)
         ↓
Redireciona para Google (popup/window)
         ↓
User autoriza no Google
         ↓
Google redireciona para /api/auth/google/callback?code=XXX
         ↓
Server troca código por token ID
         ↓
Extrai email/name do JWT
         ↓
├─ Se novo: Cria user com isActive=false (AGUARDANDO APROVAÇÃO)
│   └─ Redireciona para /auth-denied
│
└─ Se ativo: Cria session cookie
   └─ Redireciona para /tenant (dashboard)
```

### 🎯 Recursos Implementados

✅ **OAuth 2.0 Integration**
- Generates Google consent URL dynamically
- Handles code exchange securely
- Decodes JWT ID tokens

✅ **User Creation & Validation**
- Automatic user creation on first Google login
- Approval gate: new users blocked until admin approves
- `isActive` flag controls access

✅ **Session Management**
- HTTP-only cookies (secure against XSS)
- 7-day expiration
- Automatic logout after expiry

✅ **Error Handling**
- Google OAuth errors caught and logged
- User-friendly error messages
- Graceful fallback to login page

✅ **UI Integration**
- ✅ GoogleLoginButton added to `/login`
- ✅ Google button NOT on `/signup` (email-only signup)
- ✅ Beautiful UI matching existing design system

### 📋 Configuração Necessária

**1. Google Cloud Console Setup**
```bash
# Visit: https://console.cloud.google.com/
1. Create OAuth 2.0 credentials
2. Set redirect URI: http://localhost:3000/api/auth/google/callback
3. Copy Client ID & Client Secret
```

**2. Environment Variables (.env.local)**
```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**3. Approval Management**
- Admin views pending users in `/admin`
- Sets `user.isActive = true`
- User can login after approval

### 🔒 Security Features

- **CSRF Protection**: State parameter in OAuth flow
- **Secure Tokens**: JWT ID token validation
- **Secure Cookies**: HTTP-only, SameSite=Lax
- **Approval Gate**: New users blocked by default
- **No Auto-Signup**: Admin must approve each new user

### 🚀 How to Test

1. Set up Google OAuth credentials (see `GOOGLE_OAUTH_SETUP.md`)
2. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   ```
3. Go to `http://localhost:3000/login`
4. Click "Google Account" button
5. Authorize in Google popup
6. Will redirect to `/auth-denied` (pending approval)
7. As admin, approve user in `/admin`
8. User can now login and access `/tenant`

### 📊 User Flow Map

**For New User:**
```
Login → Google Auth → Created (inactive) → /auth-denied
                                              ↓
                                        "Awaiting approval"
```

**For Admin:**
```
/admin/tenants → Find pending user → Click "Activate" → user.isActive=true
```

**For Approved User:**
```
Login → Google Auth → /tenant (dashboard) ✅
```

### ⚙️ Configuration Options

**In `/src/server/auth-utils.ts`:**
```typescript
// Limit email domains (optional)
ALLOWED_EMAIL_DOMAINS=company.com,company2.com
```

**For Production:**
```bash
NODE_ENV=production
GOOGLE_CLIENT_ID=prod_id
GOOGLE_CLIENT_SECRET=prod_secret
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### 📌 Important Notes

1. **Approval Required**: Unlike traditional OAuth, users must be approved
   - Prevents spam signups
   - Gives admin control
   - Can be disabled by auto-setting `isActive=true`

2. **No Email Verification**: Google already verified email
   - We trust Google's account verification
   - User email is authentic

3. **Signup vs Login**:
   - `/signup` → Email + password (create new business)
   - `/login` → Email+password OR Google (existing accounts)

4. **Session Duration**: 7 days
   - Auto-logout after 7 days
   - User can logout manually in settings

### 🔗 Related Documents
- See `GOOGLE_OAUTH_SETUP.md` for complete Google Cloud Console setup
- See `.env.example` for all environment variables

---

**Status**: ✅ IMPLEMENTADO E TESTÁVEL
**Próxima Tarefa**: Integrar AppointmentPicker no BookingWizard (Tarefa 3)
