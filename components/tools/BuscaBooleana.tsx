'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProvider } from '@/components/providers/ProviderContext'

interface Props {
  hasApiKey: boolean
  provider: string
}

interface BoolItem { variacao: number; string: string; explicacao: string }
interface Filtros { localizacao: string; setor: string; tamanhoEmpresa: string }
interface Result {
  booleanas: BoolItem[]
  filtros: Filtros
  titulosAlternativos: string[]
}

export default function BuscaBooleana({ hasApiKey, provider }: Props) {
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState<number | null>(null)
  const { setProvider } = useProvider()
  useEffect(() => { setProvider(provider as 'anthropic' | 'gemini' | 'openai') }, [provider, setProvider])

  async function gerar() {
    if (!descricao.trim()) return alert('Descreva a vaga antes de continuar.')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/booleana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricaoVaga: descricao }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResult(json.data)
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : 'Tente novamente.'))
    }
    setLoading(false)
  }

  function copy(text: string, index: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(index)
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
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>Busca Booleana</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Descreva a vaga em linguagem natural e receba strings booleanas prontas para o LinkedIn Recruiter.
        </p>
      </div>

      <div className="space-y-5">
        <div className="tool-card">
          <label className="field-label">Descrição da Vaga</label>
          <textarea
            className="field-input"
            rows={6}
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Ex: Diretor Comercial para empresa de tecnologia B2B em São Paulo, com experiência em vendas enterprise e gestão de times. Inglês avançado desejável..."
          />
        </div>

        <button onClick={gerar} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70"/>
              </svg>
              Gerando strings de busca...
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Gerar Strings de Busca
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-5">
          {/* Strings booleanas */}
          <div className="tool-card">
            <h2 className="font-serif text-lg mb-4" style={{ color: 'var(--ink)' }}>
              Strings Booleanas para LinkedIn Recruiter
            </h2>
            <div className="space-y-3">
              {result.booleanas.map((b) => (
                <div key={b.variacao} className="rounded-md border p-4" style={{ borderColor: 'var(--border)', background: 'var(--paper)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                      style={{ background: 'var(--ink)', color: 'white' }}>
                      Variação {b.variacao}
                    </span>
                    <button
                      onClick={() => copy(b.string, b.variacao)}
                      className="text-xs px-3 py-1 rounded border transition-all"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      {copied === b.variacao ? '✓ Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <div className="font-mono text-sm rounded px-3 py-2.5 my-2 break-all leading-relaxed"
                    style={{ background: 'var(--cream)', color: 'var(--accent)', borderLeft: '3px solid var(--accent)' }}>
                    {b.string}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{b.explicacao}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="tool-card">
            <h2 className="font-serif text-lg mb-4" style={{ color: 'var(--ink)' }}>Filtros Complementares</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '📍 Localização', value: result.filtros.localizacao },
                { label: '🏢 Setor', value: result.filtros.setor },
                { label: '👥 Tamanho da Empresa', value: result.filtros.tamanhoEmpresa },
              ].map(f => (
                <div key={f.label} className="rounded p-3" style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}>
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>{f.label}</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Títulos alternativos */}
          <div className="tool-card">
            <h2 className="font-serif text-lg mb-4" style={{ color: 'var(--ink)' }}>Títulos Alternativos para Explorar</h2>
            <div className="flex flex-wrap gap-2">
              {result.titulosAlternativos.map((t) => (
                <span key={t} className="text-sm px-3 py-1.5 rounded-full"
                  style={{ background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <button onClick={() => setResult(null)} className="btn-secondary flex items-center gap-2">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.46"/>
            </svg>
            Nova busca
          </button>
        </div>
      )}
    </div>
  )
}
