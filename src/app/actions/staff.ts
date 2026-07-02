'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

export async function createStaff(formData: FormData) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string

  if (!fullName || !email || !role) {
    return { error: 'All fields are required' }
  }

  const supabase = await createServerClient()

  const { data: existingUser } = await supabase
    .from('User')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    return { error: 'User with this email already exists' }
  }

  // Create Auth user and send invitation email
  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? 'http://localhost:3000'
  siteUrl = siteUrl.includes('http') ? siteUrl : `https://${siteUrl}`
  siteUrl = siteUrl.replace(/\/$/, '')

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
    redirectTo: `${siteUrl}/update-password`
  })

  if (authError || !authData.user) {
    return { error: 'Failed to create user in Supabase: ' + (authError?.message || 'Unknown error') }
  }

  // Store companyId and role in app_metadata to enable high-performance RLS check paths
  await supabaseAdmin.auth.admin.updateUserById(
    authData.user.id,
    { app_metadata: { companyId: user.companyId, role } }
  )

  const { error: userError } = await supabase
    .from('User')
    .insert({
      id: authData.user.id,
      fullName,
      email,
      password: 'pending-invite', // Placeholder until user configures password
      role,
      companyId: user.companyId
    })

  if (userError) {
    return { error: 'Failed to create user profile in database: ' + userError.message }
  }

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function updateStaff(id: string, formData: FormData) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string

  if (!fullName || !email || !role) {
    return { error: 'Name, email, and role are required' }
  }

  const supabase = await createServerClient()

  // Verify company scope
  const { data: staff } = await supabase
    .from('User')
    .select('id')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!staff) throw new Error('Staff not found in your company')

  const { error: updateError } = await supabase
    .from('User')
    .update({ fullName, email, role })
    .eq('id', id)

  if (updateError) {
    return { error: 'Failed to update staff: ' + updateError.message }
  }

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function deleteStaff(id: string) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  // Prevent self-deletion
  if (user.id === id) {
    return { error: 'Cannot delete your own account' }
  }

  const supabase = await createServerClient()

  // Verify company scope
  const { data: staff } = await supabase
    .from('User')
    .select('id')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!staff) throw new Error('Staff not found in your company')

  const { error: deleteError } = await supabase
    .from('User')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { error: 'Failed to delete staff: ' + deleteError.message }
  }

  revalidatePath('/dashboard/staff')
  return { success: true }
}
