import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: '4hunters — Kit de Ferramentas para Consultores de RH',
  description: 'Ferramentas com IA para consultores de RH: análise de viabilidade de vagas, benchmarking salarial e muito mais.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
