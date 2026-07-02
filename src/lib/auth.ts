import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

export async function getUserSession() {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user || !user.email) {
    return null
  }
  
  // Fetch profile via admin client to bypass RLS and avoid recursive policy check overhead
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('getUserSession: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.')
    return null
  }

  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: dbUser, error: dbError } = await supabaseAdmin
    .from('User')
    .select('*, company:Company(*)')
    .eq('email', user.email)
    .single()
  
  if (dbError) {
    console.error('getUserSession Database Error:', {
      message: dbError.message,
      details: dbError.details,
      hint: dbError.hint,
      code: dbError.code
    })
  }
  
  if (dbError || !dbUser) {
    return null
  }
  
  return dbUser
}
