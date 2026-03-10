'use client'
import { useState } from 'react'

type Provider = 'anthropic' | 'gemini'

interface Props {
  currentProvider: Provider
  hasApiKey: boolean
}

export default function SettingsForm({ currentProvider, hasApiKey }: Props) {
  const [provider, setProvider] = useState<Provider>(currentProvider)
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleSave() {
    if (!apiKey.trim()) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim(), provider }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage({ type: 'ok', text: 'Chave salva com sucesso!' })
      setApiKey('')
    } catch (e: unknown) {
      setMessage({ type: 'err', text: e instanceof Error ? e.message : 'Erro ao salvar' })
    }
    setSaving(false)
  }

  async function handleRemove() {
    if (!confirm('Remover sua API key? Você não conseguirá usar as ferramentas até adicionar uma nova.')) return
    setRemoving(true)
    await fetch('/api/settings', { method: 'DELETE' })
    setMessage({ type: 'ok', text: 'Chave removida.' })
    setRemoving(false)
  }

  const providerInfo = {
    anthropic: {
      name: 'Anthropic Claude',
      hint: 'Começa com sk-ant-api...',
      link: 'https://console.anthropic.com/settings/keys',
      linkLabel: 'Obter chave no Console Anthropic',
      note: 'Claude Sonnet — excelente qualidade de análise.',
    },
    gemini: {
      name: 'Google Gemini',
      hint: 'Chave do Google AI Studio',
      link: 'https://aistudio.google.com/app/apikey',
      linkLabel: 'Obter chave no Google AI Studio',
      note: 'Gemini Flash — ótimo custo-benefício, recomendado para alto volume.',
    },
  }

  const info = providerInfo[provider]

  return (
    <div className="space-y-6">
      {/* Provider selector */}
      <div className="tool-card">
        <h2 className="font-serif text-xl mb-1" style={{ color: 'var(--ink)' }}>Provedor de IA</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
          Escolha qual IA será usada nas ferramentas. Você pode trocar a qualquer momento.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {(['anthropic', 'gemini'] as Provider[]).map(p => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className="text-left p-4 rounded-md border-2 transition-all"
              style={{
                borderColor: provider === p ? 'var(--ink)' : 'var(--border)',
                background: provider === p ? 'var(--cream)' : 'white',
              }}>
              <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--ink)' }}>
                {p === 'anthropic' ? '🤖 Anthropic Claude' : '✨ Google Gemini'}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {providerInfo[p].note}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key */}
      <div className="tool-card">
        <h2 className="font-serif text-xl mb-1" style={{ color: 'var(--ink)' }}>
          Chave de API — {info.name}
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
          Sua chave é criptografada antes de ser salva e <strong>nunca</strong> é exposta no frontend.
        </p>

        {hasApiKey && (
          <div className="flex items-center gap-3 p-3 rounded-md mb-4"
            style={{ background: '#f0faf5', border: '1px solid #b8e0ca' }}>
            <span style={{ color: '#2d7a4f' }}>✓</span>
            <span className="text-sm" style={{ color: '#2d7a4f' }}>
              Você tem uma chave configurada para <strong>{currentProvider === 'anthropic' ? 'Anthropic' : 'Gemini'}</strong>.
              Cole uma nova abaixo para substituir.
            </span>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="ml-auto text-xs px-3 py-1.5 rounded transition-colors"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent)', background: 'transparent' }}>
              {removing ? 'Removendo...' : 'Remover'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="field-label">Sua chave de API</label>
            <input
              type="password"
              className="field-input"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={info.hint}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleSave} disabled={saving || !apiKey.trim()} className="btn-primary">
              {saving ? 'Salvando...' : 'Salvar chave'}
            </button>
            <a href={info.link} target="_blank" className="text-sm" style={{ color: 'var(--accent)' }}>
              {info.linkLabel} →
            </a>
          </div>

          {message && (
            <p className="text-sm" style={{ color: message.type === 'ok' ? '#2d7a4f' : 'var(--accent)' }}>
              {message.type === 'ok' ? '✓' : '✗'} {message.text}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-md" style={{ background: 'var(--cream)', border: '1px solid var(--border)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>Como funciona:</strong> Quando você usa uma ferramenta,
          seu browser envia o prompt para o servidor do 4hunters (nunca sua key). O servidor descriptografa
          sua chave em memória, chama a API da IA, e retorna apenas o resultado. Sua key nunca aparece em logs
          ou no frontend.
        </p>
      </div>
    </div>
  )
}
