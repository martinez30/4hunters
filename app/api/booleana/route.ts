import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto'
import { callAI } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { descricaoVaga } = await req.json()
  if (!descricaoVaga?.trim()) {
    return NextResponse.json({ error: 'Descrição da vaga é obrigatória' }, { status: 400 })
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

  const prompt = `Você é um especialista em recrutamento e hunting de talentos no mercado brasileiro.

Descrição da vaga: ${descricaoVaga}

Gere:
1. Três variações de strings de busca booleana para LinkedIn Recruiter (use operadores AND, OR e aspas para termos exatos)
2. Sugestões de filtros (localização, setor, tamanho de empresa)
3. Lista de 3-5 títulos alternativos relacionados

IMPORTANTE - Regras obrigatórias para strings booleanas:
- Sempre envolva grupos de termos OR entre parênteses antes de combinar com AND
- Estrutura correta: ("Termo A" OR "Termo B") AND ("Termo C" OR "Termo D")
- NUNCA use asterisco (*) como curinga - LinkedIn não suporta
- Use APENAS aspas retas (""), nunca aspas curvas ("") ou ("")
- Seja conciso: máximo 200 caracteres por string
- Retorne APENAS JSON puro, sem markdown

Formato:
{"booleanas":[{"variacao":1,"string":"...","explicacao":"..."},{"variacao":2,"string":"...","explicacao":"..."},{"variacao":3,"string":"...","explicacao":"..."}],"filtros":{"localizacao":"...","setor":"...","tamanhoEmpresa":"..."},"titulosAlternativos":["...","...","..."]}`

  const systemPrompt = 'Você responde EXCLUSIVAMENTE com JSON puro e válido. Nenhum texto, explicação ou markdown antes ou depois do JSON. Apenas o objeto JSON solicitado.'

  try {
    const raw = await callAI({ provider: settings.provider, apiKey, prompt, systemPrompt })
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error(`Resposta inválida da IA. Retorno: ${clean.substring(0, 200)}`)
    const data = JSON.parse(match[0])

    // Sanitizar strings booleanas (remover curingas e aspas curvas)
    if (data.booleanas && Array.isArray(data.booleanas)) {
      data.booleanas.forEach((item: { string: string }) => {
        item.string = item.string
          .replace(/\*/g, '')
          .replace(/[""]/g, '"')
          .replace(/['']/g, "'")
      })
    }

    return NextResponse.json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
