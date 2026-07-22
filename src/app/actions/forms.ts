'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getLeadForms() {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: forms, error } = await admin
    .from('LeadForm')
    .select('*, counselor:User(id, fullName)')
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })

  if (error) return { error: error.message }

  // Get active counselors for dropdown selection
  const { data: counselors } = await admin
    .from('User')
    .select('id, fullName')
    .eq('companyId', user.companyId)
    .eq('status', 'Active')

  return {
    forms: forms || [],
    counselors: counselors || [],
  }
}

export async function createLeadForm(data: {
  title: string
  description?: string
  eventTag?: string
  assignedCounselorId?: string
  fieldsConfig: any
}) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  if (!data.title) {
    return { error: 'Form title is required.' }
  }

  const admin = createAdminClient()

  const { data: form, error } = await admin
    .from('LeadForm')
    .insert({
      companyId: user.companyId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      eventTag: data.eventTag?.trim() || null,
      assignedCounselorId: data.assignedCounselorId || null,
      fieldsConfig: data.fieldsConfig || {},
      isActive: true,
      submissionsCount: 0,
    })
    .select()
    .single()

  if (error) return { error: 'Failed to create lead form: ' + error.message }

  await admin.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'leadform.created',
    entityType: 'LeadForm',
    entityId: form.id,
    metadata: { title: form.title, eventTag: form.eventTag },
  })

  revalidatePath('/dashboard/forms')
  return { success: true, form }
}

export async function updateLeadForm(
  formId: string,
  data: {
    title: string
    description?: string
    eventTag?: string
    assignedCounselorId?: string
    fieldsConfig: any
    isActive: boolean
  }
) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('LeadForm')
    .update({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      eventTag: data.eventTag?.trim() || null,
      assignedCounselorId: data.assignedCounselorId || null,
      fieldsConfig: data.fieldsConfig,
      isActive: data.isActive,
    })
    .eq('id', formId)
    .eq('companyId', user.companyId)

  if (error) return { error: 'Failed to update form: ' + error.message }

  revalidatePath('/dashboard/forms')
  return { success: true }
}

export async function deleteLeadForm(formId: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('LeadForm')
    .delete()
    .eq('id', formId)
    .eq('companyId', user.companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/forms')
  return { success: true }
}

// ----------------------------------------------------
// Public Form Actions (No Auth Required for Students)
// ----------------------------------------------------

export async function getPublicLeadForm(formId: string) {
  const admin = createAdminClient()

  const { data: form } = await admin
    .from('LeadForm')
    .select('*, company:Company(name)')
    .eq('id', formId)
    .maybeSingle()

  if (!form || !form.isActive) {
    return { error: 'This lead inquiry form is inactive or no longer available.' }
  }

  return { form }
}

export async function submitPublicLeadForm(formId: string, payload: any) {
  if (!formId || !payload?.fullName) {
    return { error: 'Full name is required.' }
  }

  const admin = createAdminClient()

  const { data: form } = await admin.from('LeadForm').select('*').eq('id', formId).maybeSingle()
  if (!form || !form.isActive) {
    return { error: 'This form is no longer accepting submissions.' }
  }

  // Check subscription status
  const { data: sub } = await admin
    .from('Subscription')
    .select('status, overrideLeadLimit, Plan(leadLimitPerMonth)')
    .eq('companyId', form.companyId)
    .maybeSingle()

  if (sub && sub.status === 'suspended') {
    return { error: 'This form is temporarily unavailable. Please contact the consultancy.' }
  }

  const { error: insertError } = await admin.from('Lead').insert({
    companyId: form.companyId,
    fullName: String(payload.fullName).trim(),
    email: payload.email ? String(payload.email).trim() : null,
    phone: payload.phone ? String(payload.phone).trim() : null,
    lastStudyLevel: payload.lastStudyLevel ? String(payload.lastStudyLevel).trim() : null,
    preferredStudyLevel: payload.preferredStudyLevel ? String(payload.preferredStudyLevel).trim() : null,
    preferredCountry: payload.preferredCountry ? String(payload.preferredCountry).trim() : null,
    preferredCourse: payload.preferredCourse ? String(payload.preferredCourse).trim() : null,
    preferredIntake: payload.preferredIntake ? String(payload.preferredIntake).trim() : null,
    englishTestStatus: payload.englishTestStatus ? String(payload.englishTestStatus).trim() : null,
    englishTestType: payload.englishTestType ? String(payload.englishTestType).trim() : null,
    englishTestScore: payload.englishTestScore ? String(payload.englishTestScore).trim() : null,
    initialNote: payload.initialNote ? String(payload.initialNote).trim() : null,
    source: `Form: ${form.title}`,
    eventTag: form.eventTag || null,
    assignedCounselorId: form.assignedCounselorId || null,
    stage: 'New',
    rating: 'Unrated',
  })

  if (insertError) {
    return { error: 'Failed to submit form: ' + insertError.message }
  }

  // Increment submission counter
  await admin
    .from('LeadForm')
    .update({ submissionsCount: (form.submissionsCount || 0) + 1 })
    .eq('id', formId)

  return { success: true }
}
