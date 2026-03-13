import { createClient } from '@supabase/supabase-js'

// Cliente admin — use APENAS em Server Actions/API routes (nunca no frontend)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
