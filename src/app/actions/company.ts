'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getCompanyProfile() {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: company, error } = await admin
    .from('Company')
    .select('id, name, logoUrl')
    .eq('id', user.companyId)
    .single()

  if (error) return { error: error.message }
  return { company }
}

export async function updateCompanyProfile(data: { name: string; logoUrl?: string | null }) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  if (user.role !== 'Super Admin' && user.role !== 'Manager') {
    return { error: 'Only Admins and Managers can update company settings.' }
  }

  if (!data.name || data.name.trim() === '') {
    return { error: 'Company name is required.' }
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('Company')
    .update({
      name: data.name.trim(),
      logoUrl: data.logoUrl ? data.logoUrl.trim() : null,
    })
    .eq('id', user.companyId)

  if (error) return { error: 'Failed to update company profile: ' + error.message }

  await admin.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'company.updated',
    entityType: 'Company',
    entityId: user.companyId,
    metadata: { name: data.name, hasLogo: !!data.logoUrl },
  })

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/forms')
  revalidatePath('/dashboard/reports')
  revalidatePath('/dashboard/leads')

  return { success: true }
}
