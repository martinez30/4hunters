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

  const { perfilCandidato, descricaoVaga } = await req.json()
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

  const prompt = `Você é um consultor sênior de recrutamento e seleção especializado no mercado brasileiro.

TAREFA: Analise o perfil do candidato em relação à vaga e retorne avaliação.

VAGA: ${descricaoVaga}

PERFIL: ${perfilCandidato}

IMPORTANTE: Retorne APENAS JSON puro, sem markdown.

FORMATO:
{"score":85,"resumo":"...","pontosFortesParaVaga":["...","..."],"gaps":["..."],"recomendacao":"Abordar agora","justificativaRecomendacao":"...","dicaAbordagem":"..."}

NOTA: recomendacao deve ser exatamente um de: "Abordar agora", "Salvar para segunda rodada", "Descartar"`

  const systemPrompt = 'Você responde EXCLUSIVAMENTE com JSON puro e válido. Nenhum texto, explicação ou markdown antes ou depois do JSON. Apenas o objeto JSON solicitado.'

  try {
    const raw = await callAI({ provider: settings.provider, apiKey, prompt, systemPrompt })
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('A IA retornou um formato inesperado. Tente novamente.')
    const data = JSON.parse(match[0])
    // log de uso — fire-and-forget, não bloqueia a resposta
    supabaseAdmin.from('usage_logs').insert({ clerk_user_id: userId, tool: 'analisar-perfil', provider: settings.provider }).then()
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[api/analisar-perfil]', err)
    const message = err instanceof Error ? err.message : 'Erro ao processar a solicitação'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
