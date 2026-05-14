# BladeHub SaaS

BladeHub é uma plataforma SaaS voltada para barbearias, salões e profissionais autônomos, focada na automação inteligente de agendamentos, fidelização de clientes e integração Web3 via blockchain Solana.

---

# Visão Geral

O BladeHub nasceu para resolver problemas recorrentes no setor de atendimento agendado:

- Gargalos de atendimento
- Horários ociosos
- Má distribuição de profissionais
- Falta de previsibilidade operacional
- Fidelização limitada a métodos tradicionais

A plataforma centraliza toda a operação do estabelecimento em um único ecossistema digital.

---

# Objetivos da Plataforma

- Digitalizar completamente o fluxo operacional
- Otimizar o tempo de clientes e profissionais
- Automatizar gestão de agenda
- Reduzir períodos ociosos
- Melhorar retenção de clientes
- Introduzir fidelidade Web3 de baixo custo utilizando Solana

---

# Funcionalidades

## Agendamento Inteligente
- Agendamento online pelo cliente
- Controle automático de disponibilidade
- Distribuição dinâmica de profissionais
- Gestão de horários e pausas

## Gestão Operacional
- Painel administrativo por unidade
- Gestão de profissionais
- Controle de serviços e preços
- Dashboard financeiro integrado

## Controle SaaS Multi-Tenant
- Isolamento por estabelecimento
- Controle de planos e limites
- Trial automático
- Gestão centralizada de tenants

## Fidelização Web3
- Sistema de selos registrados em blockchain
- Registro público via Solana
- Histórico auditável via Solscan
- Baixíssimo custo operacional

---

# Stack BladeHub — Completa

# Frontend + Backend

| Tecnologia | Uso no Projeto |
|---|---|
| Next.js 14 | App Router, SSR, API Routes |
| React 18 | Componentização da interface |
| TypeScript | Tipagem forte e segurança |
| Tailwind CSS | Estilização responsiva |
| Shadcn/UI | Componentes e feedback visual |

---

# Banco de Dados + ORM

| Tecnologia | Uso no Projeto |
|---|---|
| PostgreSQL | Banco relacional principal |
| Prisma ORM | ORM tipado e migrations |
| Docker | Ambiente local de desenvolvimento |

---

# Autenticação + Integrações

| Tecnologia | Uso no Projeto |
|---|---|
| NextAuth.js | Sistema de autenticação 

---

# Web3 — Diferencial BladeHub

| Tecnologia | Uso no Projeto |
|---|---|
| Solana Web3.js | Integração blockchain |
| @solana/spl-memo | Registro de selos de fidelidade |
| Solscan | Auditoria pública das transações |
| BS58 | Decodificação segura de chaves |
| Solana Faucet | Airdrops para ambiente Devnet |

---

# DevOps + Qualidade

| Tecnologia | Uso no Projeto |
|---|---|
| GitHub | Versionamento |
| ESLint | Padronização de código |
| Vercel | Deploy e hospedagem |
| .env | Gerenciamento de secrets |

---

# Estrutura de Negócio

| Arquivo | Responsabilidade |
|---|---|
| booking-availability.ts | Cálculo inteligente de horários |
| processLoyaltySeal.ts | Registro de selos na Solana |
| getLoyaltyProgress.ts | Consulta de progresso de fidelidade |
| validators.ts | Regras de negócio |
| trial.ts | Controle de período trial |

---

# Fluxo Web3 de Fidelidade

1. Cliente realiza agendamento
2. Atendimento é concluído
3. Sistema processa selo de fidelidade
4. Registro é enviado para blockchain Solana
5. Transação pode ser auditada publicamente via Solscan
6. Cliente acumula progresso de fidelidade

---

# Modalidade Utilizada — Custódia Delegada

O BladeHub utiliza uma abordagem de custódia delegada para simplificar a experiência Web3 dos usuários finais.

Nessa modalidade:

- O estabelecimento mantém a carteira operacional
- O cliente não precisa entender blockchain
- O sistema registra os selos automaticamente
- A experiência permanece transparente e auditável

Isso reduz drasticamente a barreira de entrada para adoção de Web3 em pequenos negócios.

---

# Estrutura Multi-Tenant

Cada estabelecimento possui:

- Ambiente isolado
- Agenda independente
- Profissionais próprios
- Fidelidade segregada
- Controle individual de planos

---

# Rodando o Projeto

## Instalar dependências

```bash
npm install
```

## Subir ambiente de banco

```bash
docker-compose up -d
```

## Rodar migrations

```bash
npx prisma migrate dev
```

## Iniciar projeto

```bash
npm run dev
```

---

# Variáveis de Ambiente

```env
DATABASE_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SOLANA_RPC_URL=
FIDELITY_PAYER_PRIVATE_KEY=
```

---

# Pitch Técnico

BladeHub = Next.js 14 + PostgreSQL + Prisma + Solana + Tailwind + Vercel + WhatsApp API

---

# Diferenciais Técnicos

## Next.js
Frontend e backend no mesmo ecossistema, reduzindo complexidade operacional.

## PostgreSQL + Prisma
Consistência relacional para regras críticas de agenda e atendimento.

## Solana
Transações extremamente baratas e rápidas para fidelização Web3.

## Docker
Ambiente reproduzível para desenvolvimento e deploy.

---

# Status do Projeto

🚧 MVP em evolução contínua  
✅ Sistema multi-tenant funcional  
✅ Agendamento operacional  
✅ Fidelidade Web3 integrada  
✅ Integração Solana funcional  

---

# Autor

Pedro Henrique Ferreira Grama
