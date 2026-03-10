import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import SettingsForm from '@/components/ui/SettingsForm'

export default async function SettingsPage() {
  const { userId } = auth()
  if (!userId) redirect('/login')

  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('provider, has_api_key')
    .eq('clerk_user_id', userId)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>Configurações</h1>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>
          Configure sua chave de API para usar as ferramentas com IA.
        </p>
      </div>
      <SettingsForm
        currentProvider={settings?.provider ?? 'anthropic'}
        hasApiKey={settings?.has_api_key ?? false}
      />
    </div>
  )
}
