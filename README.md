# 4hunters 🎯

**Kit de ferramentas com IA para consultores de RH**

Analise viabilidade de vagas, faça benchmarking salarial e apresente dados concretos para clientes — tudo com sua própria API key, sem mensalidade.

> Open Source · MIT License · Deploy gratuito na Vercel

---

## O que é

4hunters é uma aplicação web que roda na nuvem (Vercel). Cada consultor cria sua conta, cadastra sua própria chave de API (Anthropic Claude ou Google Gemini) e usa as ferramentas. Você controla seus custos de IA diretamente.

## Ferramentas disponíveis

| Ferramenta | Status | Descrição |
|---|---|---|
| Análise de Viabilidade | ✅ Disponível | Score 0–100 + relatório completo para apresentar ao cliente |
| Benchmarking Salarial | 🔜 Em breve | Faixas por cargo, nível e setor |
| Gerador de E-mail | 🔜 Em breve | E-mails de abordagem para candidatos passivos |
| Boolean Search | 🔜 Em breve | Queries booleanas para LinkedIn |

---

## Setup completo (passo a passo)

### Pré-requisitos

- Node.js 18+ instalado → [nodejs.org](https://nodejs.org)
- Conta no GitHub → [github.com](https://github.com)
- Conta na Vercel → [vercel.com](https://vercel.com) (grátis)
- Conta no Clerk → [clerk.com](https://clerk.com) (grátis)
- Conta no Supabase → [supabase.com](https://supabase.com) (grátis)

---

### Passo 1 — Fazer fork do repositório

1. Acesse o repositório no GitHub
2. Clique em **Fork** (canto superior direito)
3. Confirme — agora você tem uma cópia na sua conta

---

### Passo 2 — Configurar o Clerk (autenticação)

1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com) e faça login
2. Clique em **Create Application**
3. Dê um nome (ex: `4hunters`) e escolha os métodos de login (recomendo Email + Google)
4. Na página do app, vá em **API Keys**
5. Copie:
   - `Publishable Key` (começa com `pk_test_...`)
   - `Secret Key` (começa com `sk_test_...`)

---

### Passo 3 — Configurar o Supabase (banco de dados)

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Aguarde a criação (1-2 minutos)
3. Vá em **SQL Editor** → **New Query**
4. Copie e cole o conteúdo do arquivo `supabase/schema.sql` deste repositório
5. Clique em **Run** para criar as tabelas
6. Vá em **Settings → API** e copie:
   - `Project URL` (ex: `https://abcxyz.supabase.co`)
   - `anon public` key (começa com `eyJ...`)
   - `service_role` key (começa com `eyJ...`) ⚠️ **nunca exponha esta key publicamente**

---

### Passo 4 — Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Add New → Project**
3. Selecione o repositório `4hunters` que você fez fork
4. Antes de clicar em Deploy, expanda **Environment Variables** e adicione:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    → pk_test_... (do Clerk)
CLERK_SECRET_KEY                     → sk_test_... (do Clerk)
NEXT_PUBLIC_CLERK_SIGN_IN_URL        → /login
NEXT_PUBLIC_CLERK_SIGN_UP_URL        → /signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL  → /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL  → /dashboard
NEXT_PUBLIC_SUPABASE_URL             → https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY        → eyJ... (anon key do Supabase)
SUPABASE_SERVICE_ROLE_KEY            → eyJ... (service_role do Supabase)
ENCRYPTION_KEY                       → (gere uma senha aleatória de 32 caracteres)
```

> **Como gerar o ENCRYPTION_KEY:** Use [este gerador](https://1password.com/password-generator/) e gere uma senha de 32 caracteres, sem espaços.

5. Clique em **Deploy** e aguarde ~2 minutos
6. Sua aplicação estará em `https://4hunters-xxx.vercel.app` 🎉

---

### Passo 5 — Configurar o domínio no Clerk

Após o deploy, você precisa autorizar seu domínio Vercel no Clerk:

1. No Clerk Dashboard, vá em **Domains**
2. Adicione o domínio que a Vercel gerou (ex: `4hunters-xxx.vercel.app`)

---

### Passo 6 — Primeiro acesso

1. Acesse sua URL da Vercel
2. Clique em **Criar conta grátis**
3. Após o cadastro, vá em **Configurações**
4. Escolha seu provedor de IA preferido e cole sua API key:
   - **Anthropic Claude:** obtenha em [console.anthropic.com](https://console.anthropic.com/settings/keys)
   - **Google Gemini:** obtenha em [aistudio.google.com](https://aistudio.google.com/app/apikey)
5. Pronto! Agora você pode usar todas as ferramentas.

---

## Desenvolvimento local

```bash
# 1. Clone seu fork
git clone https://github.com/martinez30/4hunters.git
cd 4hunters

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de variáveis
cp .env.example .env.local
# Edite .env.local com suas chaves

# 4. Rode em desenvolvimento
npm run dev
# Acesse http://localhost:3000
```

---

## Como adicionar uma nova ferramenta

1. Copie `components/tools/_template.tsx` para `components/tools/NomeDaFerramenta.tsx`
2. Customize o formulário e o prompt de IA dentro do arquivo
3. Crie a rota: `app/dashboard/nome-da-ferramenta/page.tsx`
4. Registre na sidebar: abra `app/dashboard/layout.tsx` e adicione um item no array `TOOLS`
5. Faça push para o GitHub — a Vercel faz o deploy automaticamente

---

## Segurança

- API keys são criptografadas com **AES-256-GCM** antes de serem salvas no banco
- A descriptografia acontece **apenas no servidor** (API Route da Vercel)
- O frontend **nunca** recebe ou exibe a API key
- Cada usuário só tem acesso às próprias configurações (Row Level Security no Supabase)

---

## Custos estimados

| Serviço | Plano gratuito |
|---|---|
| Vercel | 100GB bandwidth/mês, deploys ilimitados |
| Clerk | 10.000 usuários ativos/mês |
| Supabase | 500MB banco, 2GB storage |
| Anthropic | Pago por uso (~$0.003/análise no Sonnet) |
| Gemini Flash | Pago por uso (~$0.0001/análise — muito mais barato) |

Para uso pessoal ou de pequeno grupo, tudo fica dentro do free tier exceto a IA.

---

## Contribuindo

Pull requests são bem-vindos! Para sugestões de novas ferramentas, abra uma [issue no GitHub](https://github.com/martinez30/4hunters/issues).

---

## Licença

MIT — use, modifique e distribua livremente.
