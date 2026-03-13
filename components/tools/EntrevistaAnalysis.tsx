'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProvider } from '@/components/providers/ProviderContext'

interface Props {
  hasApiKey: boolean
  provider: string
}

type AvaliacaoNivel = 'Forte' | 'Adequado' | 'Fraco' | 'Não avaliado'

interface HabilidadeAvaliada {
  habilidade: string
  evidencia: string
  avaliacao: AvaliacaoNivel
}

interface Result {
  scoreGeral: number
  scoreHardSkills: number
  scoreSoftSkills: number
  resumo: string
  hardSkillsAvaliados: HabilidadeAvaliada[]
  softSkillsAvaliados: HabilidadeAvaliada[]
  pontosFortesDestacados: string[]
  alertas: string[]
  recomendacao: 'Avançar para próxima etapa' | 'Avaliar com ressalvas' | 'Não avançar'
  justificativa: string
  proximosPassos: string
}

const REC_STYLE = {
  'Avançar para próxima etapa': { bg: '#f0faf5', border: '#86efac', color: '#166534', icon: '✅' },
  'Avaliar com ressalvas':      { bg: '#fffbeb', border: '#fde68a', color: '#92400e', icon: '⚠️' },
  'Não avançar':                { bg: '#fff5f3', border: '#fca5a5', color: '#991b1b', icon: '❌' },
}

const AVAL_STYLE: Record<AvaliacaoNivel, { bg: string; border: string; color: string; label: string }> = {
  'Forte':         { bg: '#f0faf5', border: '#86efac', color: '#166534', label: 'Forte' },
  'Adequado':      { bg: '#fffbeb', border: '#fde68a', color: '#92400e', label: 'Adequado' },
  'Fraco':         { bg: '#fff5f3', border: '#fca5a5', color: '#991b1b', label: 'Fraco' },
  'Não avaliado':  { bg: '#f3f4f6', border: '#d1d5db', color: '#6b7280', label: 'N/A' },
}

function scoreColor(score: number) {
  if (score >= 70) return { border: '#4ade80', color: '#166534', trackColor: '#dcfce7' }
  if (score >= 45) return { border: '#fbbf24', color: '#92400e', trackColor: '#fef9c3' }
  return { border: 'var(--accent)', color: '#991b1b', trackColor: '#fff5f3' }
}

function ScoreRing({ score, label, size = 'md' }: { score: number; label: string; size?: 'lg' | 'md' }) {
  const sc = scoreColor(score)
  const isLg = size === 'lg'
  const dim = isLg ? 'w-24 h-24' : 'w-16 h-16'
  const textSize = isLg ? 'text-3xl' : 'text-xl'
  const border = isLg ? 'border-4' : 'border-[3px]'
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`${dim} ${border} rounded-full flex items-center justify-center font-serif ${textSize} shrink-0`}
        style={{ borderColor: sc.border, color: sc.color, background: sc.trackColor }}>
        {score}
      </div>
      <span className="text-xs text-center" style={{ color: 'var(--muted)' }}>{label}</span>
    </div>
  )
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const sc = scoreColor(score)
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: sc.color }}>{score}/100</span>
      </div>
      <div className="h-2.5 rounded-full" style={{ background: 'var(--border)' }}>
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: sc.border }}
        />
      </div>
    </div>
  )
}

function HabilidadeCard({ item }: { item: HabilidadeAvaliada }) {
  const [expanded, setExpanded] = useState(false)
  const s = AVAL_STYLE[item.avaliacao] ?? AVAL_STYLE['Não avaliado']
  return (
    <div
      className="rounded-lg border p-3 cursor-pointer select-none transition-colors"
      style={{ borderColor: s.border, background: expanded ? s.bg : 'white' }}
      onClick={() => setExpanded(v => !v)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{item.habilidade}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{ background: s.bg, borderColor: s.border, color: s.color }}>
            {s.label}
          </span>
          <svg
            width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            className="transition-transform"
            style={{ color: 'var(--muted)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      {expanded && (
        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>Evidência: </span>
          {item.evidencia}
        </p>
      )}
    </div>
  )
}

export default function EntrevistaAnalysis({ hasApiKey, provider }: Props) {
  const [vaga, setVaga] = useState('')
  const [transcricao, setTranscricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const { setProvider } = useProvider()
  useEffect(() => { setProvider(provider as 'anthropic' | 'gemini' | 'openai') }, [provider, setProvider])

  async function analisar() {
    if (!vaga.trim() || !transcricao.trim()) {
      return alert('Preencha a descrição da vaga e a transcrição da entrevista.')
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/entrevista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricaoVaga: vaga, transcricao }),
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
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>Análise de Entrevista</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Cole a transcrição da entrevista e a descrição da vaga para receber um score detalhado de aderência,
          com avaliação separada de Hard Skills e Soft Skills, baseada em evidências reais da conversa.
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
            placeholder="Cole aqui o JD completo — cargo, requisitos técnicos, competências comportamentais esperadas, nível, setor..."
          />
        </div>

        <div className="tool-card">
          <label className="field-label">Transcrição da Entrevista</label>
          <div className="mb-2 text-xs rounded-md px-3 py-2 flex items-start gap-2"
            style={{ background: 'var(--paper)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            <span className="shrink-0 mt-0.5">💡</span>
            <span>
              Pode ser uma transcrição automática (Teams, Meet, Zoom) ou texto digitado. Inclua as perguntas
              do entrevistador e as respostas do candidato para melhor avaliação.
            </span>
          </div>
          <textarea
            className="field-input"
            rows={12}
            value={transcricao}
            onChange={e => setTranscricao(e.target.value)}
            placeholder={`Exemplo:\n\nEntrevistador: Me fala sobre sua experiência com gestão de times...\n\nCandidato: Nos últimos 3 anos liderei um time de 8 pessoas em uma startup de fintech...\n\nEntrevistador: Como você lidou com conflitos dentro da equipe?\n\nCandidato: Tivemos uma situação em que dois desenvolvedores...`}
          />
        </div>

        <button
          onClick={analisar}
          disabled={loading}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70"/>
              </svg>
              Analisando entrevista...
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Analisar Entrevista
            </>
          )}
        </button>
      </div>

      {result && (() => {
        const rec = REC_STYLE[result.recomendacao] ?? REC_STYLE['Não avançar']
        return (
          <div className="mt-8 space-y-5">

            {/* Scores */}
            <div className="tool-card">
              <h2 className="font-serif text-lg mb-5" style={{ color: 'var(--ink)' }}>Score de Aderência</h2>
              <div className="flex items-start gap-8 mb-6">
                <ScoreRing score={result.scoreGeral} label="Score Geral" size="lg" />
                <div className="flex-1 space-y-4">
                  <ScoreBar score={result.scoreHardSkills} label="Hard Skills" />
                  <ScoreBar score={result.scoreSoftSkills} label="Soft Skills" />
                </div>
              </div>
              <div className="rounded-md p-4 text-sm leading-relaxed"
                style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}>
                {result.resumo}
              </div>
            </div>

            {/* Recomendação */}
            <div
              className="tool-card flex items-start gap-4"
              style={{ borderColor: rec.border, background: rec.bg }}>
              <span className="text-2xl shrink-0 mt-0.5">{rec.icon}</span>
              <div>
                <div className="font-semibold text-base mb-1" style={{ color: rec.color }}>
                  {result.recomendacao}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{result.justificativa}</p>
              </div>
            </div>

            {/* Hard Skills */}
            <div className="tool-card">
              <h3 className="font-serif text-base mb-1" style={{ color: 'var(--ink)' }}>🛠 Hard Skills Avaliadas</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
                Clique em cada item para ver a evidência da transcrição que embasou a avaliação.
              </p>
              <div className="space-y-2">
                {result.hardSkillsAvaliados.length > 0
                  ? result.hardSkillsAvaliados.map((item, i) => (
                      <HabilidadeCard key={i} item={item} />
                    ))
                  : <p className="text-sm" style={{ color: 'var(--muted)' }}>Nenhuma hard skill identificada na transcrição.</p>
                }
              </div>
            </div>

            {/* Soft Skills */}
            <div className="tool-card">
              <h3 className="font-serif text-base mb-1" style={{ color: 'var(--ink)' }}>🧠 Soft Skills Avaliadas</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
                Clique em cada item para ver a evidência da transcrição que embasou a avaliação.
              </p>
              <div className="space-y-2">
                {result.softSkillsAvaliados.length > 0
                  ? result.softSkillsAvaliados.map((item, i) => (
                      <HabilidadeCard key={i} item={item} />
                    ))
                  : <p className="text-sm" style={{ color: 'var(--muted)' }}>Nenhuma soft skill identificada na transcrição.</p>
                }
              </div>
            </div>

            {/* Pontos fortes + Alertas */}
            <div className="grid grid-cols-2 gap-5">
              <div className="tool-card">
                <h3 className="font-serif text-base mb-3" style={{ color: 'var(--ink)' }}>✅ Destaques Positivos</h3>
                <ul className="space-y-2">
                  {result.pontosFortesDestacados.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-snug" style={{ color: 'var(--ink)' }}>
                      <span className="shrink-0 mt-0.5" style={{ color: '#166534' }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tool-card">
                <h3 className="font-serif text-base mb-3" style={{ color: 'var(--ink)' }}>⚠️ Alertas</h3>
                <ul className="space-y-2">
                  {result.alertas.map((a, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-snug" style={{ color: 'var(--ink)' }}>
                      <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>!</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Próximos Passos */}
            <div className="tool-card" style={{ borderColor: 'var(--gold)', background: '#fffdf7' }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
                🗺 Próximos Passos
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{result.proximosPassos}</p>
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
