import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export const PLATFORM_ADMIN_EMAILS = ['sheikhabirrahaman@gmail.com']

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
    
    // Check if user is a platform admin and currently impersonating a tenant
    const isPlatformAdmin = PLATFORM_ADMIN_EMAILS.includes(user.email.toLowerCase())
    if (isPlatformAdmin) {
      const cookieStore = await cookies()
      const impersonateId = cookieStore.get('abroadsync_impersonate_company_id')?.value

      if (impersonateId) {
        const { data: impCompany } = await supabaseAdmin
          .from('Company')
          .select('*')
          .eq('id', impersonateId)
          .maybeSingle()

        if (impCompany) {
          return {
            ...dbUser,
            companyId: impCompany.id,
            company: impCompany,
            isImpersonating: true,
            originalCompanyId: dbUser.companyId,
          }
        }
      }
    }

    return dbUser
  } catch (err) {
    console.error('getUserSession Admin Client Error:', err)
    return null
  }
}
