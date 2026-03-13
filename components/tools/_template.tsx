'use client'
/**
 * ================================================================
 * TEMPLATE PARA NOVAS FERRAMENTAS — 4hunters
 * ================================================================
 *
 * COMO ADICIONAR UMA NOVA FERRAMENTA:
 *
 * 1. Copie este arquivo para components/tools/NomeDaFerramenta.tsx
 * 2. Implemente o formulário e a lógica de prompt
 * 3. Crie a rota em app/dashboard/nome-da-ferramenta/page.tsx
 * 4. Registre na sidebar em app/dashboard/layout.tsx (array TOOLS)
 *
 * A API de IA já está pronta — só mude o prompt!
 * ================================================================
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProvider } from '@/components/providers/ProviderContext'

interface Props {
  hasApiKey: boolean
  provider: string
}

export default function MinhaFerramenta({ hasApiKey, provider }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { setProvider } = useProvider()
  useEffect(() => { setProvider(provider as 'anthropic' | 'gemini' | 'openai') }, [provider, setProvider])

  async function handleSubmit() {
    if (!input.trim()) return
    setLoading(true)
    setResult(null)

    // ---------------------------------------------------------------
    // CUSTOMIZE AQUI: Monte o prompt da sua ferramenta
    // ---------------------------------------------------------------
    const prompt = `
      Você é uma consultora de RH especialista.
      
      Tarefa: [descreva o que a ferramenta deve fazer]
      
      Input do usuário: ${input}
      
      Responda em Markdown estruturado com seções ### para títulos.
    `

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 8192 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : 'Tente novamente.'))
    }

    setLoading(false)
  }

  if (!hasApiKey) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-5">🔑</div>
        <h2 className="font-serif text-2xl mb-3">Configure sua API key primeiro</h2>
        <Link href="/dashboard/settings" className="btn-primary inline-block px-8 py-3">
          Ir para Configurações →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-7">
        {/* CUSTOMIZE: Nome e descrição da ferramenta */}
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>
          Nome da Ferramenta
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Descrição do que esta ferramenta faz.
        </p>
      </div>

      {/* CUSTOMIZE: Formulário */}
      <div className="tool-card mb-5">
        <label className="field-label">Campo de entrada</label>
        <textarea
          className="field-input"
          rows={4}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Descreva o que o usuário deve inserir aqui..."
        />
      </div>

      <button onClick={handleSubmit} disabled={loading || !input.trim()} className="btn-primary w-full py-4">
        {loading ? 'Gerando...' : 'Gerar resultado'}
      </button>

      {result && (
        <div className="mt-8 tool-card">
          <div className="ai-content"
            dangerouslySetInnerHTML={{ __html: `<p>${result
              .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
              .replace(/\n\n/g, '</p><p>').replace(/### (.+)/g, '<h3>$1</h3>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>` }}
          />
        </div>
      )}
    </div>
  )
}
