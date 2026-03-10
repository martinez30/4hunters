import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import BuscaBooleana from '@/components/tools/BuscaBooleana'

export default async function BuscaBooleanaPage() {
  const { userId } = auth()
  if (!userId) redirect('/login')

  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  return (
    <BuscaBooleana
      hasApiKey={settings?.has_api_key ?? false}
      provider={settings?.provider ?? 'anthropic'}
    />
  )
}
