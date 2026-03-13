import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getAdminIds(): string[] {
  return process.env.ADMIN_USER_IDS?.split(',').map(s => s.trim()).filter(Boolean) ?? []
}

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!getAdminIds().includes(userId)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const now = new Date()
  const d7  = new Date(now); d7.setDate(now.getDate() - 7)
  const d30 = new Date(now); d30.setDate(now.getDate() - 30)
  const d14 = new Date(now); d14.setDate(now.getDate() - 14)

  const [all, last7, last30, byTool30, byProvider30, daily14, users30] = await Promise.all([
    // total all-time
    supabaseAdmin.from('usage_logs').select('id', { count: 'exact', head: true }),

    // last 7 days
    supabaseAdmin.from('usage_logs').select('id', { count: 'exact', head: true })
      .gte('created_at', d7.toISOString()),

    // last 30 days
    supabaseAdmin.from('usage_logs').select('id', { count: 'exact', head: true })
      .gte('created_at', d30.toISOString()),

    // calls per tool — last 30 days
    supabaseAdmin.from('usage_logs').select('tool')
      .gte('created_at', d30.toISOString()),

    // calls per provider — last 30 days
    supabaseAdmin.from('usage_logs').select('provider')
      .gte('created_at', d30.toISOString()),

    // daily trend — last 14 days (raw rows, we'll group client-side)
    supabaseAdmin.from('usage_logs').select('created_at')
      .gte('created_at', d14.toISOString())
      .order('created_at', { ascending: true }),

    // distinct users — last 30 days
    supabaseAdmin.from('usage_logs').select('clerk_user_id')
      .gte('created_at', d30.toISOString()),
  ])

  // aggregate by tool
  const toolCounts: Record<string, number> = {}
  for (const row of byTool30.data ?? []) {
    toolCounts[row.tool] = (toolCounts[row.tool] ?? 0) + 1
  }

  // aggregate by provider
  const providerCounts: Record<string, number> = {}
  for (const row of byProvider30.data ?? []) {
    providerCounts[row.provider] = (providerCounts[row.provider] ?? 0) + 1
  }

  // daily trend: group by date string (YYYY-MM-DD) in UTC
  const dailyCounts: Record<string, number> = {}
  for (const row of daily14.data ?? []) {
    const day = row.created_at.slice(0, 10)
    dailyCounts[day] = (dailyCounts[day] ?? 0) + 1
  }
  // fill missing days with 0
  const dailyTrend: { date: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    dailyTrend.push({ date: key, count: dailyCounts[key] ?? 0 })
  }

  // distinct users
  const distinctUsers = new Set((users30.data ?? []).map(r => r.clerk_user_id)).size

  return NextResponse.json({
    totalAllTime: all.count ?? 0,
    total7d:      last7.count ?? 0,
    total30d:     last30.count ?? 0,
    byTool:       toolCounts,
    byProvider:   providerCounts,
    dailyTrend,
    activeUsers30d: distinctUsers,
  })
}
