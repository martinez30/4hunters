import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import ViabilidadeVaga from '@/components/tools/ViabilidadeVaga'

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/login')

  // Verifica se o usuário configurou uma API key
  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  const hasKey = settings?.has_api_key ?? false
  const provider = settings?.provider ?? 'anthropic'

  return <ViabilidadeVaga hasApiKey={hasKey} provider={provider} />
}
