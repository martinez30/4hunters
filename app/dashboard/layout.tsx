'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { TOOLS } from '@/lib/tools'
import { ProviderContextProvider, useProvider } from '@/components/providers/ProviderContext'

const ADMIN_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',').map(s => s.trim()).filter(Boolean) ?? []

const PROVIDER_INFO: Record<string, { label: string; icon: string; color: string }> = {
  anthropic: { label: 'Claude',  icon: '🤖', color: '#c084fc' },
  gemini:    { label: 'Gemini',  icon: '✨', color: '#67e8f9' },
  openai:    { label: 'GPT-4o',  icon: '💬', color: '#86efac' },
}

function ActiveProviderBadge() {
  const { provider } = useProvider()
  if (!provider) return null
  const info = PROVIDER_INFO[provider]
  if (!info) return null
  return (
    <div
      className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full select-none"
      style={{
        background: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.12)',
      }}
      title={`IA ativa: ${info.label}`}
    >
      <span className="text-sm leading-none">{info.icon}</span>
      <span style={{ color: 'rgba(255,255,255,.4)', fontWeight: 400 }}>IA:</span>
      <span className="font-semibold tracking-wide" style={{ color: info.color }}>{info.label}</span>
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useUser()
  const isAdmin = !!user?.id && ADMIN_IDS.includes(user.id)

  return (
    <div className="min-h-screen flex flex-col">
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-50"
        style={{ background: 'var(--ink)', borderColor: 'rgba(255,255,255,.1)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-white/40 hover:text-white/80 transition-colors p-1 rounded"
            title="Toggle sidebar">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <Link href="/dashboard" className="font-serif text-lg" style={{ color: 'var(--cream)' }}>
            4<em style={{ color: 'var(--gold)' }}>hunters</em>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ActiveProviderBadge />
          <Link href="/dashboard/settings"
            className="text-xs flex items-center gap-1.5 transition-colors"
            style={{ color: pathname === '/dashboard/settings' ? 'var(--gold)' : 'rgba(255,255,255,.4)' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Configurações
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside
          className="border-r flex flex-col transition-all duration-200 shrink-0"
          style={{
            width: sidebarOpen ? '240px' : '0px',
            overflow: 'hidden',
            borderColor: 'var(--border)',
            background: 'white',
          }}>
          <div style={{ width: '240px' }}>
            <div className="px-4 pt-5 pb-2">
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
                Ferramentas
              </span>
            </div>
            <nav className="px-2 pb-4">
              {TOOLS.map(tool => {
                const isActive = pathname === tool.href
                return (
                  <Link key={tool.id} href={tool.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 transition-all"
                    style={{
                      background: isActive ? 'var(--cream)' : 'transparent',
                      color: isActive ? 'var(--ink)' : 'var(--muted)',
                      fontWeight: isActive ? '500' : '400',
                    }}>
                    <span className="text-base">{tool.icon}</span>
                    <span className="text-sm">{tool.label}</span>
                    {tool.status === 'soon' && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--cream)', color: 'var(--muted)', fontSize: '10px' }}>
                        Em breve
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="mx-3 p-3 rounded-md" style={{ background: 'var(--cream)', margin: '0 12px 16px' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--ink)' }}>💡 Quer sugerir uma ferramenta?</p>
              <a href="https://github.com/martinez30/4hunters/issues" target="_blank"
                className="text-xs" style={{ color: 'var(--accent)' }}>
                Abrir uma issue no GitHub →
              </a>
            </div>

            {isAdmin && (
              <div className="px-2 pb-3">
                <Link href="/dashboard/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 transition-all"
                  style={{
                    background: pathname === '/dashboard/admin' ? 'var(--cream)' : 'transparent',
                    color: pathname === '/dashboard/admin' ? 'var(--ink)' : 'var(--muted)',
                    fontWeight: pathname === '/dashboard/admin' ? '500' : '400',
                  }}>
                  <span className="text-base">📊</span>
                  <span className="text-sm">Painel Admin</span>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto" style={{ background: 'var(--paper)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderContextProvider>
      <DashboardShell>{children}</DashboardShell>
    </ProviderContextProvider>
  )
}
