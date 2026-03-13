'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProvider } from '@/components/providers/ProviderContext'

interface Props {
  hasApiKey: boolean
  provider: string
}

interface FaixaSalarial {
  minimo: number
  mediano: number
  maximo: number
}

interface Result {
  cargo: string
  nivel: string
  faixaCLT: FaixaSalarial
  faixaPJ: FaixaSalarial
  beneficiosComuns: string[]
  variaveisComuns: string[]
  contexto: string
  dicaNegociacao: string
  alertas: string[]
}

const NIVEIS = ['Júnior', 'Pleno', 'Sênior', 'Especialista', 'Coordenador', 'Gerente', 'Diretor', 'C-Level']
const PORTES = ['Startup', 'PME (até 500 funcionários)', 'Grande empresa (500+)', 'Multinacional']

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function SalaryBar({ faixa, label, color }: { faixa: FaixaSalarial; label: string; color: string }) {
  const range = faixa.maximo - faixa.minimo || 1
  const medianoPos = ((faixa.mediano - faixa.minimo) / range) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--muted)' }}>
          {label}
        </span>
        <span className="text-sm font-semibold" style={{ color }}>
          {formatBRL(faixa.mediano)} <span className="font-normal text-xs" style={{ color: 'var(--muted)' }}>mediana</span>
        </span>
      </div>
      <div className="relative h-8 rounded-lg overflow-hidden" style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}>
        <div
          className="absolute inset-y-0 rounded-lg"
          style={{ left: 0, right: 0, background: `${color}18` }}
        />
        {/* Mediana marker */}
        <div
          className="absolute inset-y-0 w-0.5"
          style={{ left: `${medianoPos}%`, background: color }}
        />
        {/* Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{formatBRL(faixa.minimo)}</span>
          <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{formatBRL(faixa.maximo)}</span>
        </div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>mínimo</span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>máximo</span>
      </div>
    </div>
  )
}

export default function BenchmarkingSalarial({ hasApiKey, provider }: Props) {
  const [cargo, setCargo] = useState('')
  const [nivel, setNivel] = useState('')
  const [setor, setSetor] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [porte, setPorte] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const { setProvider } = useProvider()
  useEffect(() => { setProvider(provider as 'anthropic' | 'gemini' | 'openai') }, [provider, setProvider])

  async function buscar() {
    if (!cargo.trim() || !nivel) return alert('Preencha o cargo e o nível.')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/benchmarking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargo, nivel, setor, localizacao, porte }),
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
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>Benchmarking Salarial</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Faixas salariais por cargo, nível e setor — dados do mercado brasileiro 2024-2025.
        </p>
      </div>

      <div className="space-y-5">
        <div className="tool-card grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="field-label">Cargo *</label>
            <input
              type="text"
              className="field-input"
              value={cargo}
              onChange={e => setCargo(e.target.value)}
              placeholder="Ex: Analista de RH, Engenheiro de Software..."
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="field-label">Nível *</label>
            <select className="field-input" value={nivel} onChange={e => setNivel(e.target.value)}>
              <option value="">Selecione o nível</option>
              {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="field-label">Setor / Indústria</label>
            <input
              type="text"
              className="field-input"
              value={setor}
              onChange={e => setSetor(e.target.value)}
              placeholder="Ex: Financeiro, Tecnologia, Saúde..."
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="field-label">Localização</label>
            <input
              type="text"
              className="field-input"
              value={localizacao}
              onChange={e => setLocalizacao(e.target.value)}
              placeholder="Ex: São Paulo, Rio de Janeiro, Remoto..."
            />
          </div>
          <div className="col-span-2">
            <label className="field-label">Porte da Empresa</label>
            <select className="field-input" value={porte} onChange={e => setPorte(e.target.value)}>
              <option value="">Todos os portes</option>
              {PORTES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <button onClick={buscar} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70"/>
              </svg>
              Consultando mercado...
            </>
          ) : (
            <>
              <span>📊</span>
              Consultar Benchmarking
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-5">
          {/* Header */}
          <div className="tool-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl" style={{ color: 'var(--ink)' }}>{result.cargo}</h2>
                <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--cream)', color: 'var(--ink)', border: '1px solid var(--border)' }}>
                  {result.nivel}
                </span>
              </div>
              <div className="text-3xl shrink-0">📊</div>
            </div>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{result.contexto}</p>
          </div>

          {/* Faixas Salariais */}
          <div className="tool-card space-y-6">
            <h3 className="font-semibold text-base" style={{ color: 'var(--ink)' }}>Faixas Salariais Mensais</h3>
            <SalaryBar faixa={result.faixaCLT} label="CLT" color="var(--accent)" />
            <SalaryBar faixa={result.faixaPJ} label="PJ / Hora" color="#2563eb" />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              * Valores brutos em reais. CLT inclui benefícios, PJ não inclui impostos do profissional.
            </p>
          </div>

          {/* Benefícios e Variáveis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="tool-card">
              <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Benefícios Comuns</h3>
              <ul className="space-y-1.5">
                {result.beneficiosComuns.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <span className="mt-0.5 shrink-0" style={{ color: '#4ade80' }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="tool-card">
              <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Variáveis / Bonificações</h3>
              <ul className="space-y-1.5">
                {result.variaveisComuns.map((v, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <span className="mt-0.5 shrink-0" style={{ color: 'var(--gold)' }}>◆</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dica de Negociação */}
          <div className="tool-card" style={{ border: '1px solid var(--gold)', background: '#fffdf5' }}>
            <div className="flex items-center gap-2 mb-2">
              <span>💡</span>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Dica de Negociação</h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{result.dicaNegociacao}</p>
          </div>

          {/* Alertas */}
          {result.alertas?.length > 0 && (
            <div className="tool-card space-y-2" style={{ background: '#fff8f5', border: '1px solid #fca5a5' }}>
              <h3 className="font-semibold text-sm mb-1" style={{ color: '#991b1b' }}>⚠️ Observações</h3>
              {result.alertas.map((a, i) => (
                <p key={i} className="text-sm" style={{ color: '#7f1d1d' }}>{a}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
