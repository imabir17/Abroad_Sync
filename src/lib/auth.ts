import { createClient } from '@/utils/supabase/server'

export async function getUserSession() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user || !user.email) {
    return null
  }
  
  // Link the Supabase user to our User table via email, including company details
  const { data: dbUser, error: dbError } = await supabase
    .from('User')
    .select('*, company:Company(*)')
    .eq('email', user.email)
    .single()
  
  if (dbError) {
    console.error('getUserSession Database Error:', dbError)
  }
  
  if (dbError || !dbUser) {
    return null
  }
  
  return dbUser
}
