import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import BenchmarkingSalarial from '@/components/tools/BenchmarkingSalarial'

export default async function BenchmarkingSalarialPage() {
  const { userId } = auth()
  if (!userId) redirect('/login')

  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  return (
    <BenchmarkingSalarial
      hasApiKey={settings?.has_api_key ?? false}
      provider={settings?.provider ?? 'anthropic'}
    />
  )
}
