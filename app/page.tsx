import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

const TOOLS = [
  { icon: '🎯', label: 'Análise de Viabilidade', desc: 'Score 0–100 e relatório completo para apresentar ao cliente antes de aceitar a vaga.' },
  { icon: '👤', label: 'Análise de Perfil', desc: 'Compare candidatos com a descrição da vaga e receba um score de aderência com justificativa.' },
  { icon: '📊', label: 'Benchmarking Salarial', desc: 'Faixas de mercado por cargo, nível e setor. Dados para embasar negociações com clientes e candidatos.' },
  { icon: '🎙️', label: 'Análise de Entrevista', desc: 'Cole a transcrição da entrevista e receba avaliação de hard skills, soft skills e recomendação.' },
  { icon: '🔎', label: 'Busca Booleana', desc: 'Strings booleanas prontas para LinkedIn Recruiter geradas a partir da descrição da vaga.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--ink)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-white/10">
        <div>
          <div className="font-serif text-2xl text-cream">
            4<em className="text-gold">hunters</em>
          </div>
          <div className="text-xs tracking-widest uppercase text-white/30 mt-0.5">
            Ferramentas de IA para RH
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <a
            href="https://github.com/martinez30/4hunters"
            target="_blank"
            className="text-xs flex items-center gap-1.5 transition-colors hover:text-white/70"
            style={{ color: 'rgba(255,255,255,.35)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <SignedOut>
            <Link href="/login"
              className="btn-secondary text-sm px-5 py-2.5"
              style={{ background: 'transparent', color: 'rgba(255,255,255,.6)', borderColor: 'rgba(255,255,255,.15)' }}>
              Entrar
            </Link>
            <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">
              Criar conta grátis
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn-primary text-sm px-5 py-2.5">
              Ir para o Dashboard →
            </Link>
          </SignedIn>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-8"
          style={{ color: 'var(--gold)' }}>
          <span style={{ color: 'rgba(255,255,255,.4)' }}>⬡</span>
          Open Source · Sem fins lucrativos · MIT License
        </div>

        <h1 className="font-serif text-5xl md:text-6xl leading-tight max-w-3xl mb-6"
          style={{ color: 'var(--cream)' }}>
          Ferramentas de IA<br />
          <em style={{ color: 'var(--gold)' }}>para quem recruta melhor.</em>
        </h1>

        <p className="max-w-xl text-lg mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,.45)' }}>
          O 4hunters reúne, de forma organizada e gratuita, ferramentas de inteligência artificial
          para apoiar consultores de RH e empresas na escolha dos melhores candidatos.
        </p>
        <p className="max-w-lg text-sm mb-12 leading-relaxed" style={{ color: 'rgba(255,255,255,.3)' }}>
          Sem mensalidade. Sem markup de tokens. Você usa sua própria API key
          (Anthropic, Gemini ou OpenAI) e paga diretamente ao provedor.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <SignedOut>
            <Link href="/signup" className="btn-primary text-base px-10 py-4 rounded">
              Começar agora — é grátis
            </Link>
            <a href="https://github.com/martinez30/4hunters"
              target="_blank"
              className="text-sm px-8 py-4 rounded border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.5)' }}>
              Ver no GitHub →
            </a>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn-primary text-base px-10 py-4 rounded">
              Abrir o Dashboard →
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Tools grid */}
      <section className="border-t border-white/10 px-10 py-16">
        <p className="text-xs tracking-widest uppercase text-center mb-10" style={{ color: 'rgba(255,255,255,.25)' }}>
          Ferramentas disponíveis
        </p>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {TOOLS.map(t => (
            <div key={t.label} className="p-6 rounded-lg border border-white/8"
              style={{ background: 'rgba(255,255,255,.03)' }}>
              <div className="text-2xl mb-3">{t.icon}</div>
              <div className="font-serif text-base mb-2" style={{ color: 'var(--cream)' }}>{t.label}</div>
              <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.35)' }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Open Source CTA */}
      <section className="border-t border-white/10 px-10 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-3xl mb-4">🤝</div>
          <h2 className="font-serif text-2xl mb-3" style={{ color: 'var(--cream)' }}>
            Contribua com o projeto
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,.4)' }}>
            O 4hunters foi construído para crescer com a comunidade. Se você é desenvolvedor e
            quer adicionar uma nova ferramenta de RH, corrigir um bug ou melhorar a documentação,
            sua contribuição é muito bem-vinda. A arquitetura foi pensada para que cada ferramenta
            possa ser criada de forma independente com menos de 100 linhas de código.
          </p>
          <a href="https://github.com/martinez30/4hunters"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm px-8 py-3 rounded border transition-all"
            style={{ borderColor: 'rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Contribuir no GitHub
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 px-10 py-5 flex justify-between items-center">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,.2)' }}>
          4hunters · Open Source · MIT License · Sem fins lucrativos
        </span>
        <a href="https://github.com/martinez30/4hunters/issues" target="_blank"
          className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,.2)' }}>
          Reportar um problema →
        </a>
      </footer>
    </main>
  )
}
