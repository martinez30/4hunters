# 4hunters — Visão Geral do Projeto

## O que é
SaaS de ferramentas com IA para **consultores de RH brasileiros**. Cada usuário configura sua própria API key (Anthropic Claude ou Google Gemini) — o app nunca paga pelos tokens, o consultor controla seus custos.

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 — App Router, TypeScript |
| Auth | Clerk (`@clerk/nextjs` v5) |
| Banco | Supabase (PostgreSQL) |
| IA | Anthropic Claude Sonnet / Google Gemini Flash |
| Estilo | Tailwind CSS + CSS variables globais |

## Variáveis de ambiente necessárias
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # acesso admin ao banco (server-only)
ENCRYPTION_KEY                 # string 32 chars — AES-256-GCM para criptografar API keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

## Rotas da aplicação
```
/                         Landing page pública
/login                    SignIn (Clerk)
/login/sso-callback       Callback OAuth do Clerk (AuthenticateWithRedirectCallback)
/signup                   SignUp (Clerk)
/dashboard                Ferramenta ativa: Análise de Viabilidade de Vaga
/dashboard/settings       Configurar provider e API key
/api/ai         POST      Executa chamada de IA (busca e descriptografa key no servidor)
/api/settings   POST      Salva/atualiza API key criptografada
/api/settings   DELETE    Remove API key do usuário
```

## Banco de dados
Uma tabela: `user_settings`
```sql
clerk_user_id     TEXT UNIQUE   -- chave de negócio
provider          TEXT          -- 'anthropic' | 'gemini'
api_key_encrypted TEXT          -- AES-256-GCM (IV + ciphertext em base64)
has_api_key       BOOLEAN
created_at / updated_at
```
- RLS habilitado, sem políticas públicas — acesso exclusivamente via `supabaseAdmin` no servidor
- Schema completo em `supabase/schema.sql`

## Ferramentas existentes e planejadas
| Status | ID | Nome | Rota |
|--------|----|------|------|
| ✅ Ativa | `viabilidade` | Análise de Viabilidade de Vaga | `/dashboard` |
| 🔜 Planejada | `email` | Gerador de E-mail para candidatos passivos | `/dashboard/email` |
| 🔜 Planejada | `benchmarking` | Benchmarking Salarial | `/dashboard/benchmarking` |
| 🔜 Planejada | `perfil` | Análise de Perfil (fit candidato/vaga) | `/dashboard/perfil` |
| 🔜 Planejada | `linkedin` | Boolean Search para LinkedIn | `/dashboard/linkedin` |

As ferramentas planejadas já estão comentadas no array `TOOLS` em `app/dashboard/layout.tsx`.
