// Camada de abstração para chamadas de IA.
// Suporta Anthropic Claude e Google Gemini.
// O provider é escolhido pelo usuário nas configurações.

export type AIProvider = 'anthropic' | 'gemini'

export interface AICallParams {
  provider: AIProvider
  apiKey: string
  prompt: string
  systemPrompt?: string
  maxTokens?: number
}

export async function callAI({ provider, apiKey, prompt, systemPrompt, maxTokens = 8192 }: AICallParams): Promise<string> {
  if (provider === 'anthropic') {
    return callAnthropic({ apiKey, prompt, systemPrompt, maxTokens })
  }
  return callGemini({ apiKey, prompt, systemPrompt, maxTokens })
}

async function callAnthropic({ apiKey, prompt, systemPrompt, maxTokens }: Omit<AICallParams, 'provider'>) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Erro na API Anthropic')
  }
  const data = await res.json()
  return data.content.map((b: { type: string; text?: string }) => b.text || '').join('')
}

async function callGemini({ apiKey, prompt, systemPrompt, maxTokens }: Omit<AICallParams, 'provider'>) {
  // Gemini Flash — melhor custo-benefício
  const model = 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { 
        temperature: 0.7,
        maxOutputTokens: maxTokens 
      },
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Erro na API Gemini')
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
