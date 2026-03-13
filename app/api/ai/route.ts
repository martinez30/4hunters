import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto'
import { callAI } from '@/lib/ai'
import { checkRateLimit } from '@/lib/rateLimit'

// POST /api/ai
// Recebe { prompt, systemPrompt } do frontend.
// Busca a API key criptografada do usuário no banco, descriptografa no servidor,
// e faz a chamada à IA. A key NUNCA vai para o frontend.
export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })
  }

  const { prompt, systemPrompt, maxTokens } = await req.json()

  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Prompt inválido' }, { status: 400 })
  }
  if (prompt.length > 50_000) {
    return NextResponse.json({ error: 'Prompt muito longo (máximo 50.000 caracteres)' }, { status: 400 })
  }
  if (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.length > 10_000) {
    return NextResponse.json({ error: 'System prompt muito longo (máximo 10.000 caracteres)' }, { status: 400 })
  }

  // Busca as configurações do usuário
  const { data: settings, error: dbError } = await supabaseAdmin
    .from('user_settings')
    .select('provider, api_key_encrypted, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  if (dbError || !settings?.has_api_key || !settings?.api_key_encrypted) {
    return NextResponse.json(
      { error: 'API key não configurada. Vá em Configurações e adicione sua chave.' },
      { status: 400 }
    )
  }

  // Descriptografa a key (operação server-side only)
  const apiKey = await decrypt(settings.api_key_encrypted)

  try {
    const result = await callAI({
      provider: settings.provider,
      apiKey,
      prompt,
      systemPrompt,
      maxTokens: maxTokens ?? 8192,
    })
    return NextResponse.json({ result })
  } catch (err: unknown) {
    console.error('[api/ai]', err)
    const message = err instanceof Error ? err.message : 'Erro ao processar a solicitação'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
