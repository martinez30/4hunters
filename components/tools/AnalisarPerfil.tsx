'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProvider } from '@/components/providers/ProviderContext'

interface Props {
  hasApiKey: boolean
  provider: string
}

interface Result {
  score: number
  resumo: string
  pontosFortesParaVaga: string[]
  gaps: string[]
  recomendacao: 'Abordar agora' | 'Salvar para segunda rodada' | 'Descartar'
  justificativaRecomendacao: string
  dicaAbordagem: string
}

const REC_STYLE = {
  'Abordar agora':          { bg: '#f0faf5', border: '#86efac', color: '#166534' },
  'Salvar para segunda rodada': { bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
  'Descartar':              { bg: '#fff5f3', border: '#fca5a5', color: '#991b1b' },
}

function scoreColor(score: number) {
  if (score >= 70) return { border: '#4ade80', color: '#166534' }
  if (score >= 45) return { border: '#fbbf24', color: '#92400e' }
  return { border: 'var(--accent)', color: '#991b1b' }
}

export default function AnalisarPerfil({ hasApiKey, provider }: Props) {
  const [vaga, setVaga] = useState('')
  const [perfil, setPerfil] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const { setProvider } = useProvider()
  useEffect(() => { setProvider(provider as 'anthropic' | 'gemini' | 'openai') }, [provider, setProvider])

  async function analisar() {
    if (!vaga.trim() || !perfil.trim()) {
      return alert('Preencha a descrição da vaga e o perfil do candidato.')
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/analisar-perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricaoVaga: vaga, perfilCandidato: perfil }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResult(json.data)
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : 'Tente novamente.'))
    }
    setLoading(false)
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
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>Analisar Perfil</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Cole o perfil do candidato e a descrição da vaga para receber score de aderência, pontos fortes, gaps e dica de abordagem.
        </p>
      </div>

      <div className="space-y-5">
        <div className="tool-card">
          <label className="field-label">Descrição da Vaga</label>
          <textarea
            className="field-input"
            rows={5}
            value={vaga}
            onChange={e => setVaga(e.target.value)}
            placeholder="Descreva a vaga aqui — cargo, requisitos, nível, setor..."
          />
        </div>
        <div className="tool-card">
          <label className="field-label">Perfil do Candidato (cole o texto do LinkedIn)</label>
          <textarea
            className="field-input"
            rows={7}
            value={perfil}
            onChange={e => setPerfil(e.target.value)}
            placeholder="Cole aqui o texto copiado do perfil: cargo atual, experiências, formação, habilidades..."
          />
        </div>

        <button onClick={analisar} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70"/>
              </svg>
              Analisando candidato...
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Analisar Candidato
            </>
          )}
        </button>
      </div>

      {result && (() => {
        const sc = scoreColor(result.score)
        const rec = REC_STYLE[result.recomendacao] ?? REC_STYLE['Descartar']
        return (
          <div className="mt-8 space-y-5">
            {/* Score + Recomendação */}
            <div className="tool-card">
              <div className="flex items-center gap-6 mb-5">
                <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center font-serif text-3xl shrink-0"
                  style={{ borderColor: sc.border, color: sc.color, background: `${sc.border}18` }}>
                  {result.score}
                </div>
                <div>
                  <span className="inline-block text-sm font-semibold px-3 py-1 rounded-full border mb-2"
                    style={{ background: rec.bg, borderColor: rec.border, color: rec.color }}>
                    {result.recomendacao}
                  </span>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{result.justificativaRecomendacao}</p>
                </div>
              </div>
              <div className="rounded p-4 text-sm leading-relaxed" style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}>
                {result.resumo}
              </div>
            </div>

            {/* Pontos fortes + Gaps */}
            <div className="grid grid-cols-2 gap-5">
              <div className="tool-card">
                <h3 className="font-serif text-base mb-3" style={{ color: 'var(--ink)' }}>✅ Pontos Fortes</h3>
                <ul className="space-y-2">
                  {result.pontosFortesParaVaga.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-snug" style={{ color: 'var(--ink)' }}>
                      <span className="shrink-0 mt-0.5" style={{ color: '#166534' }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tool-card">
                <h3 className="font-serif text-base mb-3" style={{ color: 'var(--ink)' }}>⚠️ Gaps / Atenção</h3>
                <ul className="space-y-2">
                  {result.gaps.map((g, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-snug" style={{ color: 'var(--ink)' }}>
                      <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>!</span>{g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Dica de abordagem */}
            <div className="tool-card" style={{ borderColor: 'var(--gold)', background: '#fffdf7' }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
                💡 Dica de Abordagem
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{result.dicaAbordagem}</p>
            </div>

            <button onClick={() => setResult(null)} className="btn-secondary flex items-center gap-2">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.46"/>
              </svg>
              Nova análise
            </button>
          </div>
        )
      })()}
    </div>
  )
}
