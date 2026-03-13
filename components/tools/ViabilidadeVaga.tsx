'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProvider } from '@/components/providers/ProviderContext'

interface Props {
  hasApiKey: boolean
  provider: string
}

interface Tag { id: number; text: string }

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseAIContent(text: string): string {
  const escaped = escapeHtml(text)
  return escaped
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/## (.+)/g, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/⚠️([^\n]+)/g, '<div class="alert-box">⚠️ $1</div>')
    .replace(/✅([^\n]+)/g, '<div class="ok-box">✅ $1</div>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/<p>(<h3>)/g, '$1')
    .replace(/<\/h3>(<\/p>)?/g, '</h3>')
}

export default function ViabilidadeVaga({ hasApiKey, provider }: Props) {
  const { setProvider } = useProvider()
  useEffect(() => { setProvider(provider as 'anthropic' | 'gemini' | 'openai') }, [provider, setProvider])
  const [aba, setAba] = useState<'formulario' | 'texto'>('formulario')

  // Estado aba formulário
  const [tags, setTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tagId, setTagId] = useState(0)
  const [form, setForm] = useState({
    cargo: '', nivel: '', setor: '', local: '',
    salario: '', modelo: '', contrato: '', prazo: '', contexto: '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  // Estado aba texto livre
  const [textoLivre, setTextoLivre] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ html: string; score: string; scoreClass: string; titulo: string; meta: string } | null>(null)

  function addTag() {
    const t = tagInput.trim()
    if (!t) return
    setTags(prev => [...prev, { id: tagId, text: t }])
    setTagId(i => i + 1)
    setTagInput('')
  }

  async function analisar() {
    let prompt: string
    let tituloResult = 'Análise de Viabilidade'
    let metaResult = ''

    if (aba === 'texto') {
      if (!textoLivre.trim()) {
        alert('Cole a descrição da vaga no campo de texto.')
        return
      }
      prompt = `Você é uma consultora de RH experiente com profundo conhecimento do mercado de trabalho brasileiro. Analise a viabilidade da vaga descrita abaixo pelo cliente.

## DESCRIÇÃO DA VAGA (texto original do cliente)
${textoLivre.trim()}

Extraia todas as informações relevantes do texto acima (cargo, nível, setor, salário, requisitos, modelo de trabalho, etc.) e produza uma análise técnica completa.

Produza uma análise técnica com estas seções exatas (use ### para títulos):`
      tituloResult = 'Análise de Viabilidade'
      metaResult = 'Via texto livre'
    } else {
      if (!form.cargo || !form.nivel || !form.setor) {
        alert('Preencha pelo menos: Cargo, Nível e Setor.')
        return
      }
      prompt = `Você é uma consultora de RH experiente com profundo conhecimento do mercado de trabalho brasileiro. Analise a viabilidade da seguinte vaga:

## DADOS DA VAGA
- Cargo: ${form.cargo}
- Nível: ${form.nivel}
- Setor: ${form.setor}
- Localização: ${form.local || 'Não informado'}
- Salário Oferecido: ${form.salario ? 'R$ ' + form.salario : 'Não informado'}
- Modelo: ${form.modelo || 'Não informado'}
- Contrato: ${form.contrato || 'Não informado'}
- Prazo: ${form.prazo || 'Não informado'}
- Requisitos: ${tags.length > 0 ? tags.map(t => t.text).join(', ') : 'Não especificados'}
- Contexto: ${form.contexto || 'Nenhum'}

Produza uma análise técnica com estas seções exatas (use ### para títulos):`
      tituloResult = `${form.cargo} — ${form.nivel}`
      metaResult = [form.setor, form.local, form.modelo, form.contrato].filter(Boolean).join(' · ')
    }

    const promptFinal = prompt + `

### Score de Viabilidade
Nota de 0-100 e classificação ALTA (70-100), MÉDIA (40-69) ou BAIXA (0-39). Justifique em 2-3 linhas.

### Análise do Perfil de Mercado
Disponibilidade real desse perfil no Brasil. Raridade, onde encontrar, o que esse profissional valoriza.

### Análise Salarial e Benchmarking
Compare com faixas de mercado (Robert Half, PageGroup, Glassdoor). Compatível, abaixo ou muito abaixo.

### Análise dos Requisitos
Avalie cada requisito: razoável? raro? a combinação é realista? Identifique os gargalos.

### Alertas de Risco
Principais pontos de atenção. Use ⚠️ para cada alerta.

### Recomendações ao Cliente
Ajustes concretos e negociáveis. O que flexibilizar, como tornar a proposta mais atrativa.

### Estratégia de Hunting Sugerida
Melhores plataformas e canais para este perfil específico no Brasil.

### Conclusão Executiva
Parágrafo curto adequado para apresentar diretamente ao cliente.`

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptFinal, maxTokens: 8192, tool: 'viabilidade' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const text: string = data.result

      // Extrair score e classe
      let score = '—'
      let scoreClass = 'media'
      const scoreNum = text.match(/\b(\d{1,3})\b.*?(?:ALTA|MÉDIA|BAIXA)|(?:score|nota)[^0-9]*(\d{1,3})/i)
      if (scoreNum) score = scoreNum[1] || scoreNum[2]
      if (/\bALTA\b/i.test(text) && !/\bBAIXA\b/i.test(text)) { scoreClass = 'alta'; if (score === '—') score = '75' }
      else if (/\bBAIXA\b/i.test(text)) { scoreClass = 'baixa'; if (score === '—') score = '30' }
      else { scoreClass = 'media'; if (score === '—') score = '55' }

      setResult({
        html: parseAIContent(text),
        score,
        scoreClass,
        titulo: tituloResult,
        meta: metaResult,
      })
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : 'Tente novamente.'))
    }
    setLoading(false)
  }

  function copyResult() {
    if (!result) return
    const el = document.getElementById('result-text')
    navigator.clipboard.writeText(
      `ANÁLISE DE VIABILIDADE — ${result.titulo}\n\n${el?.innerText ?? ''}`
    ).then(() => alert('Copiado!'))
  }

  if (!hasApiKey) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-5">🔑</div>
        <h2 className="font-serif text-2xl mb-3" style={{ color: 'var(--ink)' }}>Configure sua API key primeiro</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Para usar as ferramentas com IA, você precisa adicionar sua chave da Anthropic ou Gemini.
          É rápido e gratuito para começar.
        </p>
        <Link href="/dashboard/settings" className="btn-primary inline-block px-8 py-3">
          Ir para Configurações →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Cabeçalho da ferramenta */}
      <div className="mb-7">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>
          Análise de Viabilidade
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Preencha os dados da vaga e receba um score + relatório pronto para apresentar ao cliente.
        </p>
      </div>

      {/* ABAS */}
      <div className="flex gap-1 p-1 rounded-lg mb-6" style={{ background: 'var(--cream)', border: '1px solid var(--border)' }}>
        {([
          { id: 'formulario', label: '📋 Formulário detalhado', desc: 'Campo a campo' },
          { id: 'texto', label: '📄 Texto livre', desc: 'Cole a descrição da vaga' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => { setAba(tab.id); setResult(null) }}
            className="flex-1 flex flex-col items-center py-2.5 px-4 rounded-md text-sm font-medium transition-all"
            style={{
              background: aba === tab.id ? 'white' : 'transparent',
              color: aba === tab.id ? 'var(--ink)' : 'var(--muted)',
              boxShadow: aba === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            <span>{tab.label}</span>
            <span className="text-xs font-normal mt-0.5" style={{ color: aba === tab.id ? 'var(--muted)' : 'var(--border)' }}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* ABA: TEXTO LIVRE */}
      {aba === 'texto' && (
        <div className="space-y-5">
          <div className="tool-card">
            <h2 className="font-serif text-lg mb-1" style={{ color: 'var(--ink)' }}>Descrição da Vaga</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Cole aqui o texto completo que seu cliente enviou — e-mail, PDF copiado, requisição interna.
              A IA extrai todas as informações automaticamente.
            </p>
            <textarea
              className="field-input"
              rows={14}
              value={textoLivre}
              onChange={e => setTextoLivre(e.target.value)}
              placeholder={`Ex:\n\nPrecisamos contratar um Gerente de Marketing Digital com experiência em e-commerce.\n\nRequisitos:\n- Mínimo 5 anos de experiência em marketing digital\n- Experiência com Google Ads, Meta Ads e SEO\n- Inglês intermediário\n- Salário: R$ 12.000 CLT\n- Modelo: Híbrido (2x na semana em SP)\n- Prazo: 30 dias`}
            />
          </div>

          <button onClick={analisar} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                Analisando mercado e perfil...
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Gerar Análise de Viabilidade
              </>
            )}
          </button>
        </div>
      )}

      {aba === 'formulario' && (
        <div className="space-y-5">
          {/* Dados básicos */}
          <div className="tool-card">
            <h2 className="font-serif text-lg mb-4" style={{ color: 'var(--ink)' }}>1. Dados da Vaga</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Cargo *</label>
                <input className="field-input" value={form.cargo} onChange={set('cargo')} placeholder="Ex: Gerente de Marketing Digital" />
              </div>
              <div>
                <label className="field-label">Nível Hierárquico *</label>
                <select className="field-input" value={form.nivel} onChange={set('nivel')}>
                  <option value="">Selecione...</option>
                  {['Júnior / Trainee', 'Pleno', 'Sênior', 'Especialista / Coordenador', 'Gerente / Gestor', 'Diretor', 'C-Level / VP'].map(n => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Setor / Indústria *</label>
                <input className="field-input" value={form.setor} onChange={set('setor')} placeholder="Ex: Tecnologia, Saúde, Varejo..." />
              </div>
              <div>
                <label className="field-label">Localização</label>
                <input className="field-input" value={form.local} onChange={set('local')} placeholder="Ex: São Paulo - SP / Remoto" />
              </div>
            </div>
          </div>

          {/* Remuneração */}
          <div className="tool-card">
            <h2 className="font-serif text-lg mb-4" style={{ color: 'var(--ink)' }}>2. Remuneração & Modelo</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="field-label">Salário (R$)</label>
                <input className="field-input" value={form.salario} onChange={set('salario')} placeholder="Ex: 8.000 ou 8k–10k" />
              </div>
              <div>
                <label className="field-label">Modelo de Trabalho</label>
                <select className="field-input" value={form.modelo} onChange={set('modelo')}>
                  <option value="">Selecione...</option>
                  {['Presencial', 'Híbrido', 'Remoto'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Tipo de Contrato</label>
                <select className="field-input" value={form.contrato} onChange={set('contrato')}>
                  <option value="">Selecione...</option>
                  {['CLT', 'PJ', 'Temporário', 'Estágio'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="field-label">Prazo para Preenchimento</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {[
                  { v: 'urgente (até 15 dias)', l: '⚡ Urgente — 15 dias' },
                  { v: 'normal (30 dias)', l: '📅 Normal — 30 dias' },
                  { v: 'confortável (45-60 dias)', l: '🗓 Confortável — 60 dias' },
                  { v: 'sem prazo definido', l: '∞ Sem prazo' },
                ].map(({ v, l }) => (
                  <button key={v} type="button"
                    onClick={() => setForm(f => ({ ...f, prazo: v }))}
                    className="text-xs px-3 py-2 rounded-md border transition-all"
                    style={{
                      borderColor: form.prazo === v ? 'var(--ink)' : 'var(--border)',
                      background: form.prazo === v ? 'var(--ink)' : 'white',
                      color: form.prazo === v ? 'white' : 'var(--muted)',
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requisitos */}
          <div className="tool-card">
            <h2 className="font-serif text-lg mb-4" style={{ color: 'var(--ink)' }}>3. Requisitos Exigidos</h2>
            <div className="flex gap-2 mb-3">
              <input
                className="field-input"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ex: Inglês fluente, 5 anos de exp., MBA... (Enter para adicionar)"
              />
              <button onClick={addTag} className="btn-primary px-4 text-lg font-light shrink-0">+</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t.id} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--cream)', border: '1px solid var(--border)' }}>
                    {t.text}
                    <button onClick={() => setTags(prev => prev.filter(x => x.id !== t.id))}
                      className="text-lg leading-none transition-colors"
                      style={{ color: 'var(--muted)' }}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4">
              <label className="field-label">Contexto Adicional</label>
              <textarea className="field-input" rows={3} value={form.contexto} onChange={set('contexto')}
                placeholder="Informações sobre cultura, motivo da abertura, dificuldades anteriores, diferenciais..." />
            </div>
          </div>

          <button onClick={analisar} disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                Analisando mercado e perfil...
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Gerar Análise de Viabilidade
              </>
            )}
          </button>
        </div>
      )}

      {/* RESULTADO */}
      {result && (
        <div className="mt-8 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {/* Header do resultado */}
          <div className="flex items-start justify-between gap-4 p-7"
            style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
            <div>
              <h2 className="font-serif text-2xl">{result.titulo}</h2>
              <p className="text-sm mt-1 text-white/50">{result.meta}</p>
            </div>
            <div className="text-center shrink-0">
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-serif text-3xl
                ${result.scoreClass === 'alta' ? 'border-green-400 text-green-400' :
                  result.scoreClass === 'baixa' ? 'border-red-400 text-red-400' :
                    'border-yellow-400 text-yellow-400'}`}>
                {result.score}
              </div>
              <p className="text-xs tracking-wider uppercase text-white/40 mt-1.5">Viabilidade</p>
            </div>
          </div>

          {/* Corpo da análise */}
          <div className="p-7 bg-white">
            <div id="result-text" className="ai-content"
              dangerouslySetInnerHTML={{ __html: `<p>${result.html}</p>` }} />

            <div className="flex gap-3 mt-7 pt-6 border-t flex-wrap no-print"
              style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Imprimir / PDF
              </button>
              <button onClick={copyResult} className="btn-secondary flex items-center gap-2">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copiar texto
              </button>
              <button onClick={() => setResult(null)} className="btn-secondary flex items-center gap-2">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.46" />
                </svg>
                Nova análise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
