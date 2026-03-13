import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { encrypt } from '@/lib/crypto'
import type { AIProvider } from '@/lib/ai'
import { checkRateLimit } from '@/lib/rateLimit'

const VALID_PROVIDERS: AIProvider[] = ['anthropic', 'gemini']

// POST /api/settings — salva ou atualiza a API key do usuário
export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!checkRateLimit(userId, 10, 60_000)) {
    return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })
  }

  const { apiKey, provider }: { apiKey: string; provider: AIProvider } = await req.json()

  if (!apiKey || !provider) {
    return NextResponse.json({ error: 'apiKey e provider são obrigatórios' }, { status: 400 })
  }
  if (!VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Provider inválido' }, { status: 400 })
  }
  if (typeof apiKey !== 'string' || apiKey.length > 500) {
    return NextResponse.json({ error: 'API key inválida' }, { status: 400 })
  }

  // Valida o formato mínimo da key antes de salvar
  if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
    return NextResponse.json({ error: 'Chave Anthropic inválida. Deve começar com sk-ant-' }, { status: 400 })
  }
  if (provider === 'gemini' && apiKey.length < 20) {
    return NextResponse.json({ error: 'Chave Gemini inválida.' }, { status: 400 })
  }

  const encrypted = await encrypt(apiKey)

  const { error } = await supabaseAdmin
    .from('user_settings')
    .upsert({
      clerk_user_id: userId,
      provider,
      api_key_encrypted: encrypted,
      has_api_key: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'clerk_user_id' })

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// DELETE /api/settings — remove a API key do usuário
export async function DELETE() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await supabaseAdmin
    .from('user_settings')
    .update({ api_key_encrypted: null, has_api_key: false })
    .eq('clerk_user_id', userId)

  return NextResponse.json({ ok: true })
}
