# 4hunters — Padrões e Convenções

## Design System

### CSS Variables (globals.css)
```css
--ink:    #1c1712   /* texto principal, dark backgrounds */
--cream:  #f7f3ec   /* fundos claros de destaque */
--paper:  #faf8f4   /* background padrão da página */
--accent: #c8402a   /* vermelho-tijolo — CTAs principais */
--gold:   #c9913a   /* dourado — brand, destaques */
--muted:  #8a7f74   /* texto secundário, labels */
--border: #e0dbd2   /* bordas, divisores */
```

### Tipografia
- **Corpo**: `DM Sans` (300, 400, 500, 600) — `font-sans` no Tailwind
- **Títulos/Serifa**: `DM Serif Display` — `font-serif` no Tailwind

### Classes utilitárias globais
```css
.tool-card          /* container branco com borda, sombra sutil — use em seções de formulário */
.field-label        /* label uppercase tracking wide muted */
.field-input        /* input/select padrão com focus ink */
.btn-primary        /* botão vermelho-tijolo (--accent) */
.btn-secondary      /* botão branco com borda */
.ai-content         /* wrapper para HTML gerado pela IA — estiliza h3, p, ul, .alert-box, .ok-box */
```

### Uso no JSX
Prefira `className` do Tailwind para layout/spacing e CSS variables com `style={}` para cores do tema:
```tsx
// ✅ correto
<h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>
<p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
<div className="tool-card">

// ✅ também válido para cores mapeadas no tailwind.config.js
<span className="text-gold">
<div className="bg-cream">
```

---

## Padrões de Código

### Server Components (páginas do dashboard)
Sempre verificam autenticação e buscam dados antes de passar props:
```tsx
export default async function AlgumPage() {
  const { userId } = auth()
  if (!userId) redirect('/login')

  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  return <MeuClientComponent
    hasApiKey={settings?.has_api_key ?? false}
    provider={settings?.provider ?? 'anthropic'}
  />
}
```

### API Routes
Padrão de autenticação + resposta:
```ts
export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // ... lógica
  return NextResponse.json({ ok: true })
  // ou em caso de erro:
  return NextResponse.json({ error: 'mensagem' }, { status: 400 | 500 })
}
```

### Client Components — chamadas à API
```ts
const res = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, maxTokens: 8192 }),
})
const data = await res.json()
if (!res.ok) throw new Error(data.error)
```

### Formato de resposta da IA nas ferramentas
A IA deve retornar **Markdown com `###` para seções**. O componente usa `parseAIContent()` (em `ViabilidadeVaga.tsx`) que converte para HTML seguro para ser injetado com `dangerouslySetInnerHTML` dentro de `<div className="ai-content">`.

Convenções de marcadores no texto da IA:
- `⚠️ texto` → `.alert-box` (borda vermelha, fundo rosado)
- `✅ texto` → `.ok-box` (borda verde, fundo esverdeado)

---

## Padrões de Segurança

### Regras invioláveis
1. `supabaseAdmin` (service role) **nunca** pode ser importado em Client Components ou em código que vá para o browser.
2. A descriptografia de API keys (`decrypt()`) **só acontece em Route Handlers (`/api/`)**.
3. A API key decriptografada **nunca retorna ao frontend** — é usada e descartada no servidor.
4. `SUPABASE_SERVICE_ROLE_KEY` e `ENCRYPTION_KEY` **nunca** têm prefixo `NEXT_PUBLIC_`.

### Validação de API keys em /api/settings
```ts
if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) → erro 400
if (provider === 'gemini' && apiKey.length < 20) → erro 400
```
