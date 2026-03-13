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

  const { cargo, nivel, setor, localizacao, porte } = await req.json()
  if (!cargo?.trim() || !nivel?.trim()) {
    return NextResponse.json({ error: 'Cargo e nível são obrigatórios' }, { status: 400 })
  }
  if (
    (cargo && cargo.length > 200) ||
    (nivel && nivel.length > 200) ||
    (setor && setor.length > 200) ||
    (localizacao && localizacao.length > 200) ||
    (porte && porte.length > 200)
  ) {
    return NextResponse.json({ error: 'Campo muito longo (máximo 200 caracteres)' }, { status: 400 })
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

  const prompt = `Você é um especialista em remuneração e mercado de trabalho brasileiro, com acesso a dados de mercado de 2024-2025.

TAREFA: Gere um benchmarking salarial completo para o cargo abaixo.

CARGO: ${cargo}
NÍVEL: ${nivel}
${setor ? `SETOR: ${setor}` : ''}
${localizacao ? `LOCALIZAÇÃO: ${localizacao}` : 'LOCALIZAÇÃO: Brasil (mercado geral)'}
${porte ? `PORTE DA EMPRESA: ${porte}` : ''}

IMPORTANTE: Use dados reais e atuais do mercado brasileiro. Valores em Reais (R$) mensais.

Retorne APENAS JSON puro, sem markdown, no seguinte formato EXATO:
{
  "cargo": "título do cargo formatado",
  "nivel": "nível formatado",
  "faixaCLT": { "minimo": 0000, "mediano": 0000, "maximo": 0000 },
  "faixaPJ": { "minimo": 0000, "mediano": 0000, "maximo": 0000 },
  "beneficiosComuns": ["benefício 1", "benefício 2", "benefício 3"],
  "variaveisComuns": ["variável 1", "variável 2"],
  "contexto": "Parágrafo com contexto do mercado para este cargo/nível/setor.",
  "dicaNegociacao": "Dica prática para o consultor usar na negociação salarial com candidato ou empresa.",
  "alertas": ["alerta ou observação relevante 1", "alerta 2"]
}`

  const systemPrompt = 'Você responde EXCLUSIVAMENTE com JSON puro e válido. Nenhum texto, explicação ou markdown antes ou depois do JSON. Apenas o objeto JSON solicitado.'

  try {
    const raw = await callAI({ provider: settings.provider, apiKey, prompt, systemPrompt })
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('A IA retornou um formato inesperado. Tente novamente.')
    const data = JSON.parse(match[0])
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[api/benchmarking]', err)
    const message = err instanceof Error ? err.message : 'Erro ao processar a solicitação'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
