# 4hunters 🎯

**Ferramentas de IA para consultores e empresas de RH — Open Source, sem fins lucrativos.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/martinez30/4hunters/pulls)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

---

## O que é o 4hunters?

O 4hunters é um projeto **open source e sem fins lucrativos** que reúne, de forma organizada e prática, ferramentas com inteligência artificial para apoiar **consultores de RH, recrutadores e empresas** no processo de seleção de talentos.

O objetivo é simples: ajudar profissionais de RH a tomar decisões mais embasadas — na análise de uma vaga, na avaliação de um candidato, no benchmarking salarial — usando IA sem depender de plataformas caras ou fechadas.

Cada usuário usa sua **própria API key** (Anthropic Claude, Google Gemini ou OpenAI). Nenhum token é pago pelo projeto. Nenhum dado de candidato ou vaga é armazenado. Você tem controle total.

> Este projeto nasce da comunidade, para a comunidade. Contribuições são muito bem-vindas.

---

## Ferramentas disponíveis

| Ferramenta | Status | O que faz |
|---|---|---|
| 🎯 Análise de Viabilidade de Vaga | ✅ Disponível | Score 0–100 + relatório completo para apresentar ao cliente |
| � Benchmarking Salarial | ✅ Disponível | Faixas salariais por cargo, nível e setor no mercado brasileiro |
| 🎙️ Análise de Entrevista | ✅ Disponível | Avaliação de hard e soft skills com base na transcrição |
| 👤 Análise de Perfil | ✅ Disponível | Score de aderência candidato × descrição da vaga |

---

## Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Autenticação:** Clerk
- **Banco de dados:** Supabase (PostgreSQL)
- **IA:** Anthropic Claude · Google Gemini · OpenAI GPT-4o
- **Estilo:** Tailwind CSS
- **Deploy:** Vercel (recomendado)

---

## Setup para rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Clerk](https://clerk.com) (grátis)
- Conta no [Supabase](https://supabase.com) (grátis)

```bash
# 1. Clone o repositório
git clone https://github.com/martinez30/4hunters.git
cd 4hunters

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves (veja a seção abaixo)

# 4. Crie as tabelas no Supabase
# Acesse seu projeto no Supabase → SQL Editor → cole o conteúdo de supabase/schema.sql → Run

# 5. Inicie o servidor de desenvolvimento
npm run dev
# Acesse http://localhost:3000
```

### Variáveis de ambiente necessárias

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    # pk_test_... (Clerk → API Keys)
CLERK_SECRET_KEY                     # sk_test_... (Clerk → API Keys)
NEXT_PUBLIC_CLERK_SIGN_IN_URL        = /login
NEXT_PUBLIC_CLERK_SIGN_UP_URL        = /signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL  = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL  = /dashboard
NEXT_PUBLIC_SUPABASE_URL             # https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY        # eyJ... (Supabase → Settings → API → anon)
SUPABASE_SERVICE_ROLE_KEY            # eyJ... (Supabase → Settings → API → service_role)
ENCRYPTION_KEY                       # string aleatória de exatamente 32 caracteres
```

> **ENCRYPTION_KEY:** Use `openssl rand -base64 32 | head -c 32` ou qualquer gerador de senhas para criar uma string de 32 caracteres.

---

## Deploy com um clique (Vercel)

1. Faça fork deste repositório
2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → selecione seu fork
3. Adicione as variáveis de ambiente listadas acima
4. Clique em **Deploy**

Após o deploy, autorize o domínio gerado no **Clerk Dashboard → Domains**.

---

## Como contribuir

O 4hunters é um projeto vivo e toda contribuição conta — seja uma nova ferramenta, uma correção de bug, melhoria de UX ou tradução.

### Adicionando uma nova ferramenta de RH

A arquitetura foi pensada para facilitar ao máximo a adição de novas ferramentas:

**1. Crie o componente**

Copie `components/tools/_template.tsx` para `components/tools/NomeDaFerramenta.tsx`.
O template já tem toda a estrutura: formulário, chamada à API de IA, exibição do resultado.
Você só precisa customizar o formulário e o prompt.

**2. Crie a rota do dashboard**

Crie `app/dashboard/nome-da-ferramenta/page.tsx`. O padrão é:

```tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import NomeDaFerramenta from '@/components/tools/NomeDaFerramenta'

export default async function Page() {
  const { userId } = auth()
  if (!userId) redirect('/login')
  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, has_api_key')
    .eq('clerk_user_id', userId)
    .single()
  return <NomeDaFerramenta hasApiKey={settings?.has_api_key ?? false} provider={settings?.provider ?? 'anthropic'} />
}
```

**3. Crie a API route (se necessária)**

Se sua ferramenta retorna JSON estruturado (não texto livre), crie `app/api/nome/route.ts`.
Veja os arquivos existentes em `app/api/` como referência — o padrão é consistente.

**4. Registre na sidebar**

Adicione um item ao array `TOOLS` em `lib/tools.ts`.

**5. Abra um Pull Request**

Descreva o que a ferramenta faz e qual problema de RH ela resolve. Menos de 100 linhas de código já são suficientes para uma nova ferramenta funcional.

### Outras formas de contribuir

- 🐛 **Bug:** Abra uma [issue](https://github.com/martinez30/4hunters/issues) descrevendo o problema
- 💡 **Ideia de ferramenta:** Abra uma issue com a tag `enhancement`
- 📖 **Documentação:** Melhorias no README ou comentários no código são sempre bem-vindas
- 🌐 **Internacionalização:** O projeto é em português, mas pull requests para inglês/espanhol são aceitos

### Padrões do projeto

- TypeScript estrito — sem `any` desnecessário
- Nenhum dado sensível (prompt, resultado da IA, dados do candidato) é salvo no banco
- Toda chamada de IA passa pela API route `/api/ai` ou por uma route específica — nunca direto do cliente
- A API key do usuário é sempre descriptografada server-side e nunca exposta ao browser
- Componentes de ferramenta são independentes — cada um em seu próprio arquivo

---

## Segurança

- API keys dos usuários são criptografadas com AES-256-GCM antes de serem salvas
- O banco (Supabase) tem RLS habilitado; todo acesso é via `service_role` no servidor
- Nenhuma API key vai para o frontend em nenhum momento
- Rate limiting em todas as rotas de IA (20 req/min por usuário)
- Security headers configurados no `next.config.js`

---

## Licença

MIT — use, modifique e distribua livremente. Atribuição é apreciada, mas não obrigatória.

---

<div align="center">
  <sub>Feito com ❤️ para a comunidade de RH brasileira.</sub>
</div>


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
