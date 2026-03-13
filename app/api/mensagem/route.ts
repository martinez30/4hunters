import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto'
import { callAI } from '@/lib/ai'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })
  }

  const { perfilCandidato, descricaoVaga, nivelCargo, confidencial } = await req.json()
  if (!perfilCandidato?.trim() || !descricaoVaga?.trim()) {
    return NextResponse.json({ error: 'Perfil do candidato e descrição da vaga são obrigatórios' }, { status: 400 })
  }
  if (perfilCandidato.length > 20_000 || descricaoVaga.length > 20_000) {
    return NextResponse.json({ error: 'Texto muito longo (máximo 20.000 caracteres por campo)' }, { status: 400 })
  }

  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, api_key_encrypted, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  if (!settings?.has_api_key || !settings?.api_key_encrypted) {
    return NextResponse.json({ error: 'API key não configurada. Vá em Configurações.' }, { status: 400 })
  }

  const apiKey = await decrypt(settings.api_key_encrypted)

  const prompt = `Você é uma consultora de recrutamento experiente no mercado brasileiro.

TAREFA: Gere duas versões de mensagem para primeiro contato via WhatsApp Business.

VAGA: ${descricaoVaga}
PERFIL: ${perfilCandidato}
NÍVEL: ${nivelCargo}
CONFIDENCIAL: ${confidencial ? 'SIM' : 'NAO'}

REGRAS:
- Mensagens curtas (máximo 4 linhas)
- Tom humano, não invasivo, que desperte curiosidade
- Mencione algo específico do perfil do candidato
- Tom consultivo para liderança
- Termine com pergunta aberta
- Retorne APENAS JSON puro, sem markdown

FORMATO:
{"versaoDireta":{"mensagem":"...","quando_usar":"..."},"versaoConsultiva":{"mensagem":"...","quando_usar":"..."}}`

  const systemPrompt = 'Você responde EXCLUSIVAMENTE com JSON puro e válido. Nenhum texto, explicação ou markdown antes ou depois do JSON. Apenas o objeto JSON solicitado.'

  try {
    const raw = await callAI({ provider: settings.provider, apiKey, prompt, systemPrompt })
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('A IA retornou um formato inesperado. Tente novamente.')
    const data = JSON.parse(match[0])
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[api/mensagem]', err)
    const message = err instanceof Error ? err.message : 'Erro ao processar a solicitação'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
