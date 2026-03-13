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

  const { descricaoVaga, transcricao } = await req.json()
  if (!descricaoVaga?.trim() || !transcricao?.trim()) {
    return NextResponse.json({ error: 'Descrição da vaga e transcrição são obrigatórias' }, { status: 400 })
  }
  if (descricaoVaga.length > 20_000) {
    return NextResponse.json({ error: 'Descrição da vaga muito longa (máximo 20.000 caracteres)' }, { status: 400 })
  }
  if (transcricao.length > 100_000) {
    return NextResponse.json({ error: 'Transcrição muito longa (máximo 100.000 caracteres)' }, { status: 400 })
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

  const prompt = `Você é um especialista em recrutamento e seleção com profundo conhecimento em avaliação comportamental e técnica.

TAREFA: Analise a transcrição desta entrevista de emprego e avalie o candidato com base na descrição da vaga. O recrutador abordou tanto Hard Skills quanto Soft Skills durante a entrevista.

DESCRIÇÃO DA VAGA:
${descricaoVaga}

TRANSCRIÇÃO DA ENTREVISTA:
${transcricao}

INSTRUÇÕES:
- Identifique as Hard Skills mencionadas/avaliadas na entrevista e compare com os requisitos da vaga
- Identifique evidências de Soft Skills demonstradas nas respostas do candidato
- Atribua scores de 0 a 100 para Hard Skills, Soft Skills e um score geral ponderado
- Baseie TODAS as avaliações em evidências concretas da transcrição — não invente
- Para cada habilidade avaliada, cite a evidência da transcrição que embasou a avaliação
- O scoreGeral deve refletir o fit total: (scoreHardSkills * 0.55) + (scoreSoftSkills * 0.45)

IMPORTANTE: Retorne APENAS JSON puro, sem markdown.

FORMATO:
{
  "scoreGeral": 78,
  "scoreHardSkills": 82,
  "scoreSoftSkills": 72,
  "resumo": "Resumo executivo da entrevista em 2-3 frases...",
  "hardSkillsAvaliados": [
    { "habilidade": "Python", "evidencia": "Mencionou 3 anos de experiência e projeto X...", "avaliacao": "Forte" },
    { "habilidade": "SQL", "evidencia": "Demonstrou conhecimento básico mas sem experiência avançada...", "avaliacao": "Adequado" }
  ],
  "softSkillsAvaliados": [
    { "habilidade": "Comunicação", "evidencia": "Respondeu de forma clara e estruturada, usou STAR em diversas respostas...", "avaliacao": "Forte" },
    { "habilidade": "Gestão de conflitos", "evidencia": "Não há evidência suficiente na transcrição...", "avaliacao": "Não avaliado" }
  ],
  "pontosFortesDestacados": ["Ponto forte 1", "Ponto forte 2"],
  "alertas": ["Alerta 1", "Alerta 2"],
  "recomendacao": "Avançar para próxima etapa",
  "justificativa": "Justificativa da recomendação...",
  "proximosPassos": "Sugestão de próximos passos no processo..."
}

NOTA: avaliacao deve ser exatamente um de: "Forte", "Adequado", "Fraco", "Não avaliado"
NOTA: recomendacao deve ser exatamente um de: "Avançar para próxima etapa", "Avaliar com ressalvas", "Não avançar"`

  const systemPrompt = 'Você responde EXCLUSIVAMENTE com JSON puro e válido. Nenhum texto, explicação ou markdown antes ou depois do JSON. Apenas o objeto JSON solicitado.'

  try {
    const raw = await callAI({ provider: settings.provider, apiKey, prompt, systemPrompt, maxTokens: 4096 })
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('A IA retornou um formato inesperado. Tente novamente.')
    const data = JSON.parse(match[0])
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[api/entrevista]', err)
    const message = err instanceof Error ? err.message : 'Erro ao processar a solicitação'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
