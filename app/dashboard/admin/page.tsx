'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalAllTime: number
  total7d: number
  total30d: number
  byTool: Record<string, number>
  byProvider: Record<string, number>
  dailyTrend: { date: string; count: number }[]
  activeUsers30d: number
}

const TOOL_LABEL: Record<string, string> = {
  viabilidade:     '📋 Viabilidade',
  'analisar-perfil': '🔍 Analisar Perfil',
  benchmarking:    '💰 Benchmarking',
  booleana:        '🔎 Busca Booleana',
  entrevista:      '🎙️ Entrevista',
  mensagem:        '💬 WhatsApp',
}

const PROVIDER_LABEL: Record<string, { label: string; color: string }> = {
  anthropic: { label: 'Claude',  color: '#c084fc' },
  gemini:    { label: 'Gemini',  color: '#67e8f9' },
  openai:    { label: 'GPT-4o',  color: '#86efac' },
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="tool-card flex flex-col gap-1 min-w-0">
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-3xl font-bold font-serif" style={{ color: 'var(--ink)' }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}

function BarChart({ data, colorFn }: {
  data: { label: string; count: number }[]
  colorFn?: (key: string) => string
}) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="space-y-2.5">
      {data.map(({ label, count }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
            <span>{label}</span>
            <span className="font-semibold" style={{ color: 'var(--ink)' }}>{count}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${(count / max) * 100}%`,
                background: colorFn ? colorFn(label) : 'var(--accent)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function SparkLine({ trend }: { trend: Stats['dailyTrend'] }) {
  const max = Math.max(...trend.map(d => d.count), 1)
  const w = 400
  const h = 80
  const pad = 4

  const points = trend.map((d, i) => {
    const x = pad + (i / (trend.length - 1)) * (w - pad * 2)
    const y = h - pad - ((d.count / max) * (h - pad * 2))
    return `${x},${y}`
  }).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
        <polyline
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        {trend.map((d, i) => {
          const x = pad + (i / (trend.length - 1)) * (w - pad * 2)
          const y = h - pad - ((d.count / max) * (h - pad * 2))
          return d.count > 0 ? (
            <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />
          ) : null
        })}
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {trend[0]?.date.slice(5).replace('-', '/')}
        </span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {trend[trend.length - 1]?.date.slice(5).replace('-', '/')}
        </span>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setStats(data)
      })
      .catch(() => setError('Erro ao carregar estatísticas.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-64">
        <p style={{ color: 'var(--muted)' }}>Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="tool-card" style={{ borderColor: '#fca5a5', background: '#fff5f3' }}>
          <p className="font-semibold" style={{ color: '#991b1b' }}>Acesso negado</p>
          <p className="text-sm mt-1" style={{ color: '#991b1b' }}>{error}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            Adicione seu Clerk user ID à variável de ambiente <code>ADMIN_USER_IDS</code>.
          </p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const toolData = Object.entries(stats.byTool)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ label: TOOL_LABEL[key] ?? key, count }))

  const providerData = Object.entries(stats.byProvider)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ label: PROVIDER_LABEL[key]?.label ?? key, count, key }))

  const totalCalls30d = Object.values(stats.byTool).reduce((a, b) => a + b, 0)

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded"
            style={{ background: 'var(--cream)', color: 'var(--accent)' }}>
            Área Restrita
          </span>
        </div>
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>Painel de Uso</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Métricas de uso da plataforma — visível apenas para administradores.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 mb-7 sm:grid-cols-4">
        <StatCard label="Total (tudo)" value={stats.totalAllTime.toLocaleString('pt-BR')} />
        <StatCard label="Últimos 7 dias" value={stats.total7d.toLocaleString('pt-BR')} />
        <StatCard label="Últimos 30 dias" value={stats.total30d.toLocaleString('pt-BR')} />
        <StatCard label="Usuários ativos" value={stats.activeUsers30d} sub="últimos 30 dias" />
      </div>

      {/* Daily sparkline */}
      <div className="tool-card mb-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--ink)' }}>
          Atividade diária — últimos 14 dias
        </h2>
        {stats.dailyTrend.every(d => d.count === 0) ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Sem dados ainda.</p>
        ) : (
          <SparkLine trend={stats.dailyTrend} />
        )}
      </div>

      {/* Tool + provider charts */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="tool-card">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--ink)' }}>
            Uso por ferramenta <span className="font-normal" style={{ color: 'var(--muted)' }}>(30 dias)</span>
          </h2>
          {toolData.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Sem dados ainda.</p>
          ) : (
            <BarChart data={toolData} />
          )}
        </div>

        <div className="tool-card">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--ink)' }}>
            Uso por IA <span className="font-normal" style={{ color: 'var(--muted)' }}>(30 dias)</span>
          </h2>
          {providerData.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Sem dados ainda.</p>
          ) : (
            <BarChart
              data={providerData}
              colorFn={label => {
                const entry = Object.values(PROVIDER_LABEL).find(v => v.label === label)
                return entry?.color ?? 'var(--accent)'
              }}
            />
          )}
          {totalCalls30d > 0 && (
            <div className="mt-4 pt-4 flex flex-wrap gap-3" style={{ borderTop: '1px solid var(--border)' }}>
              {providerData.map(({ label, count, key }) => (
                <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: PROVIDER_LABEL[key]?.color ?? 'var(--accent)' }} />
                  {label} {Math.round((count / totalCalls30d) * 100)}%
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs" style={{ color: 'var(--muted)' }}>
        🔒 Esta página é acessível apenas a usuários cujo Clerk ID esteja na variável <code>ADMIN_USER_IDS</code> e{' '}
        <code>NEXT_PUBLIC_ADMIN_USER_IDS</code>.{' '}
        Dados de page views adicionais estão disponíveis no{' '}
        <a href="https://vercel.com/analytics" target="_blank" className="underline" style={{ color: 'var(--accent)' }}>
          Vercel Analytics Dashboard
        </a>.
      </p>
    </div>
  )
}
