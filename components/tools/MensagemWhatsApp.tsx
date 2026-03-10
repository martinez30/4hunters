'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Props {
  hasApiKey: boolean
  provider: string
}

interface MsgVersion { mensagem: string; quando_usar: string }
interface Result { versaoDireta: MsgVersion; versaoConsultiva: MsgVersion }

const NIVEIS = ['Coordenador', 'Gerente', 'HEAD', 'Diretor', 'VP / C-Level']

export default function MensagemWhatsApp({ hasApiKey, provider }: Props) {
  const [vaga, setVaga] = useState('')
  const [perfil, setPerfil] = useState('')
  const [nivel, setNivel] = useState('HEAD')
  const [confidencial, setConfidencial] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function gerar() {
    if (!vaga.trim() || !perfil.trim()) {
      return alert('Preencha a descrição da vaga e o perfil do candidato.')
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/mensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricaoVaga: vaga, perfilCandidato: perfil, nivelCargo: nivel, confidencial }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResult(json.data)
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : 'Tente novamente.'))
    }
    setLoading(false)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    })
  }

  if (!hasApiKey) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-5">🔑</div>
        <h2 className="font-serif text-2xl mb-3" style={{ color: 'var(--ink)' }}>Configure sua API key primeiro</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Para usar as ferramentas com IA, você precisa adicionar sua chave da Anthropic ou Gemini.
        </p>
        <Link href="/dashboard/settings" className="btn-primary inline-block px-8 py-3">
          Ir para Configurações →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-7">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>Mensagem WhatsApp</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Gere mensagens personalizadas para o primeiro contato — curtas, humanas e que despertam curiosidade.
          Usando: <strong>{provider === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'}</strong>
        </p>
      </div>

      <div className="space-y-5">
        <div className="tool-card">
          <label className="field-label">Descrição da Vaga</label>
          <textarea
            className="field-input"
            rows={4}
            value={vaga}
            onChange={e => setVaga(e.target.value)}
            placeholder="Descreva a vaga..."
          />
        </div>

        <div className="tool-card">
          <label className="field-label">Perfil do Candidato</label>
          <textarea
            className="field-input"
            rows={5}
            value={perfil}
            onChange={e => setPerfil(e.target.value)}
            placeholder="Cole o perfil do candidato — cargo atual, experiências, formação..."
          />
        </div>

        <div className="tool-card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Nível do Cargo</label>
              <select className="field-input" value={nivel} onChange={e => setNivel(e.target.value)}>
                {NIVEIS.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confidencial}
                  onChange={e => setConfidencial(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: 'var(--ink)' }}
                />
                <span className="text-sm" style={{ color: 'var(--ink)' }}>Vaga confidencial (não citar empresa)</span>
              </label>
            </div>
          </div>
        </div>

        <button onClick={gerar} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70"/>
              </svg>
              Gerando mensagens...
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Gerar Mensagens
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-5">
          {([
            { key: 'direta',      label: 'Versão Direta',      data: result.versaoDireta },
            { key: 'consultiva',  label: 'Versão Consultiva',  data: result.versaoConsultiva },
          ] as const).map(({ key, label, data }) => (
            <div key={key} className="tool-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                  {label}
                </span>
                <button
                  onClick={() => copy(data.mensagem, key)}
                  className="text-xs px-3 py-1 rounded border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                  {copied === key ? '✓ Copiado!' : '📋 Copiar'}
                </button>
              </div>
              <p className="text-xs italic mb-4" style={{ color: 'var(--muted)' }}>{data.quando_usar}</p>
              {/* Bolha estilo WhatsApp */}
              <div className="rounded-xl rounded-bl-sm p-4 text-sm leading-relaxed whitespace-pre-line"
                style={{ background: '#dcf8c6', color: '#111', border: '1px solid #c3e6a8' }}>
                {data.mensagem}
              </div>
            </div>
          ))}

          <button onClick={() => setResult(null)} className="btn-secondary flex items-center gap-2">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.46"/>
            </svg>
            Gerar novas mensagens
          </button>
        </div>
      )}
    </div>
  )
}
