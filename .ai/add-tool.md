# 4hunters — Como Adicionar uma Nova Ferramenta

Checklist completo para implementar uma nova ferramenta no dashboard.
Referência real: `components/tools/ViabilidadeVaga.tsx` + `app/dashboard/page.tsx`.

---

## Passo 1 — Criar o componente da ferramenta

Copie `components/tools/_template.tsx` → `components/tools/NomeDaFerramenta.tsx`

O componente **sempre recebe estas props**:
```tsx
interface Props {
  hasApiKey: boolean   // se false, mostra tela de "configure sua key primeiro"
  provider: string     // 'anthropic' | 'gemini' — para exibir ao usuário
}
```

### Guard de API key (obrigatório — copiar de ViabilidadeVaga)
```tsx
if (!hasApiKey) {
  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="text-5xl mb-5">🔑</div>
      <h2 className="font-serif text-2xl mb-3" style={{ color: 'var(--ink)' }}>Configure sua API key primeiro</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>...</p>
      <Link href="/dashboard/settings" className="btn-primary inline-block px-8 py-3">
        Ir para Configurações →
      </Link>
    </div>
  )
}
```

### Chamada à IA
```ts
const res = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: '...',           // obrigatório
    systemPrompt: '...',     // opcional
    maxTokens: 8192,         // opcional, default 8192
  }),
})
const data = await res.json()
if (!res.ok) throw new Error(data.error)
const texto: string = data.result
```

### Estrutura do prompt recomendada
```
Você é uma consultora de RH especialista em [área].

## DADOS
- Campo: ${valor}
...

Produza uma análise com estas seções (use ### para títulos):

### Seção 1
...

### Seção 2
...
```

### Renderizar resposta da IA
```tsx
<div
  className="ai-content"
  dangerouslySetInnerHTML={{ __html: parseAIContent(texto) }}
/>
```
A função `parseAIContent` está em `ViabilidadeVaga.tsx` — mova para `lib/utils.ts` se for reutilizada.

---

## Passo 2 — Criar a página no dashboard

Crie `app/dashboard/nome-da-ferramenta/page.tsx`:

```tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import NomeDaFerramenta from '@/components/tools/NomeDaFerramenta'

export default async function NomeDaFerramentaPage() {
  const { userId } = auth()
  if (!userId) redirect('/login')

  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  return (
    <NomeDaFerramenta
      hasApiKey={settings?.has_api_key ?? false}
      provider={settings?.provider ?? 'anthropic'}
    />
  )
}
```

---

## Passo 3 — Registrar na sidebar

Em `app/dashboard/layout.tsx`, descomente ou adicione ao array `TOOLS`:

```ts
export const TOOLS = [
  // ... ferramentas existentes
  {
    id: 'nome-id',
    label: 'Nome Visível',
    icon: '🔎',
    href: '/dashboard/nome-da-ferramenta',
    description: 'Descrição curta exibida na sidebar',
    status: 'active' as const,
  },
]
```

---

## Resumo rápido
```
1. components/tools/NomeDaFerramenta.tsx   ← Client Component com formulário + prompt + render
2. app/dashboard/nome/page.tsx             ← Server Component que busca settings e passa props
3. TOOLS em app/dashboard/layout.tsx       ← Adicionar entrada para aparecer na sidebar
```

Não é necessário criar nenhuma nova API route — `/api/ai` já serve todas as ferramentas.
