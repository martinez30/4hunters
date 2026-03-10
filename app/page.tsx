import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

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
            Kit para Consultores de RH
          </div>
        </div>
        <div className="flex gap-3">
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
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-block bg-accent/10 border border-accent/30 text-xs tracking-widest uppercase px-4 py-1.5 rounded-full text-accent mb-8">
          Open Source · Grátis para sempre
        </div>
        <h1 className="font-serif text-5xl md:text-6xl text-cream leading-tight max-w-3xl mb-6">
          Pare de aceitar vagas<br />
          <em className="text-gold">impossíveis de preencher.</em>
        </h1>
        <p className="text-white/50 max-w-xl text-lg mb-12 leading-relaxed">
          Ferramentas com IA para consultores de RH analisarem viabilidade de vagas,
          benchmarking salarial e apresentarem dados concretos para clientes.
          Use sua própria API key — você controla seus custos.
        </p>
        <Link href="/signup" className="btn-primary text-base px-10 py-4 rounded">
          Começar agora — é grátis
        </Link>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {[
          { icon: '🎯', title: 'Análise de Viabilidade', desc: 'Score de 0–100 para qualquer vaga. Dados concretos para negociar com o cliente.' },
          { icon: '📊', title: 'Benchmarking Salarial', desc: 'Faixa de mercado por cargo, nível e setor. Nunca mais aceite budget impossível.' },
          { icon: '🔌', title: 'Sua API Key', desc: 'Use Claude ou Gemini. Você paga diretamente ao provedor — sem markup, sem surpresa.' },
        ].map(f => (
          <div key={f.title} className="px-10 py-10">
            <div className="text-3xl mb-4">{f.icon}</div>
            <div className="font-serif text-lg text-cream mb-2">{f.title}</div>
            <div className="text-white/40 text-sm leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </section>

      <footer className="border-t border-white/10 px-10 py-5 flex justify-between items-center">
        <span className="text-white/25 text-xs">4hunters · Open Source · MIT License</span>
        <a href="https://github.com/martinez30/4hunters" target="_blank"
           className="text-white/30 hover:text-white/60 text-xs transition-colors">
          GitHub →
        </a>
      </footer>
    </main>
  )
}
