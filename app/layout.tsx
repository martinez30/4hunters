import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://4hunters.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '4hunters — Ferramentas de IA para Consultores de RH',
    template: '%s | 4hunters',
  },
  description:
    'Kit de ferramentas open-source com IA para consultores de RH: análise de viabilidade de vagas, benchmarking salarial, análise de entrevistas, busca booleana e muito mais.',
  keywords: [
    'recrutamento', 'seleção', 'RH', 'consultoria', 'headhunter', 'IA', 'inteligência artificial',
    'benchmarking salarial', 'análise de currículo', 'entrevista', 'busca booleana', 'LinkedIn Recruiter',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: '4hunters',
    title: '4hunters — Ferramentas de IA para Consultores de RH',
    description:
      'Kit open-source de ferramentas com IA para agilizar o trabalho de consultores e headhunters no Brasil.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '4hunters' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '4hunters — Ferramentas de IA para Consultores de RH',
    description:
      'Kit open-source de ferramentas com IA para agilizar o trabalho de consultores e headhunters no Brasil.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body>
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
