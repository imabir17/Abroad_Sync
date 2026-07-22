import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getUserSession() {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user || !user.email) {
    return null
  }
  
  try {
    const supabaseAdmin = createAdminClient()

    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('User')
      .select('*, company:Company(*)')
      .eq('id', user.id)
      .maybeSingle()
    
    if (dbError) {
      console.error('getUserSession Database Error:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      })
    }
    
    if (dbError || !dbUser || dbUser.status === 'Deactivated') {
      return null
    }
    
    return dbUser
  } catch (err) {
    console.error('getUserSession Admin Client Error:', err)
    return null
  }
}
