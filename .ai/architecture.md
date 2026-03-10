# 4hunters — Arquitetura Técnica

## Árvore de arquivos
```
app/
  layout.tsx              Root layout — ClerkProvider wrapping tudo
  page.tsx                Landing page pública
  globals.css             CSS variables + utilitários globais (.tool-card, .field-*, .btn-*, .ai-content)
  (auth)/
    login/
      page.tsx            <SignIn /> do Clerk
      sso-callback/
        page.tsx          <AuthenticateWithRedirectCallback /> — obrigatório para OAuth/SSO
    signup/
      page.tsx            <SignUp /> do Clerk
  dashboard/
    layout.tsx            Sidebar com array TOOLS + <UserButton> do Clerk (Client Component)
    page.tsx              Server Component — busca settings no Supabase, renderiza ViabilidadeVaga
    settings/
      page.tsx            Server Component — busca settings, renderiza SettingsForm
  api/
    ai/route.ts           POST — auth Clerk → busca settings → decrypt key → callAI()
    settings/route.ts     POST/DELETE — auth Clerk → encrypt/save ou remove key

components/
  tools/
    _template.tsx         Template comentado para novas ferramentas
    ViabilidadeVaga.tsx   Client Component — formulário + prompt + parser markdown
  ui/
    SettingsForm.tsx      Client Component — seletor de provider + input de API key

lib/
  ai.ts                   Abstração callAI() — suporta 'anthropic' e 'gemini'
  crypto.ts               encrypt() / decrypt() — AES-256-GCM via Web Crypto API
  supabase.ts             supabase (público) e supabaseAdmin (service role, server-only)

supabase/
  schema.sql              DDL completo — tabela user_settings + índices + RLS
middleware.ts             Clerk — protege tudo exceto /, /login(.*), /signup(.*)
```

## Fluxo de API key (segurança)
```
[Usuário digita key]
  → POST /api/settings
    → encrypt(key)  [AES-256-GCM, server-side]
    → upsert user_settings { api_key_encrypted, has_api_key: true }

[Usuário usa ferramenta]
  → POST /api/ai  { prompt, maxTokens }
    → auth().protect()  [Clerk verifica sessão]
    → SELECT api_key_encrypted FROM user_settings WHERE clerk_user_id = userId
    → decrypt(api_key_encrypted)  [server-side — nunca vai ao frontend]
    → callAI({ provider, apiKey, prompt })
    → return { result: string }
```

## lib/ai.ts — callAI()
Usa `fetch` direto (não os SDKs do package.json, que estão instalados mas não utilizados).

```ts
callAI({ provider, apiKey, prompt, systemPrompt?, maxTokens? }): Promise<string>
```
- **anthropic**: `POST https://api.anthropic.com/v1/messages` — modelo `claude-sonnet-4-20250514`
- **gemini**: `POST https://generativelanguage.googleapis.com/...` — modelo `gemini-1.5-flash`

## lib/crypto.ts
- Web Crypto API — compatível com Edge Runtime da Vercel
- `ENCRYPTION_KEY` truncada/padded para 32 bytes
- Formato armazenado: `base64(IV[12 bytes] + ciphertext)`

## Dashboard layout — array TOOLS
Em `app/dashboard/layout.tsx`, o array `TOOLS` controla a sidebar.
Cada item: `{ id, label, icon, href, description, status: 'active' }`.
Ferramentas planejadas já estão comentadas — basta descomentar ao implementar.

## Middleware
```ts
// Público: /, /login(.*), /signup(.*)
// Privado: tudo o mais (incluindo /api/*)
```
O `clerkMiddleware` protege as rotas privadas automaticamente chamando `auth().protect()`.

## Server vs Client Components
| Arquivo | Tipo | Motivo |
|---------|------|--------|
| `app/dashboard/page.tsx` | Server | Acessa Supabase, passa props para Client |
| `app/dashboard/settings/page.tsx` | Server | Idem |
| `app/dashboard/layout.tsx` | Client | Usa `usePathname`, `useState` |
| `components/tools/ViabilidadeVaga.tsx` | Client | Estado do formulário, fetch ao /api/ai |
| `components/ui/SettingsForm.tsx` | Client | Estado do formulário, fetch ao /api/settings |
| `app/api/*/route.ts` | Route Handler | Server-only — acesso a crypto e supabaseAdmin |
