import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import AnalisarPerfil from '@/components/tools/AnalisarPerfil'

export default async function AnalisarPerfilPage() {
  const { userId } = auth()
  if (!userId) redirect('/login')

  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  return (
    <AnalisarPerfil
      hasApiKey={settings?.has_api_key ?? false}
      provider={settings?.provider ?? 'anthropic'}
    />
  )
}
