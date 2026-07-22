'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function bulkImportLeads(rawLeads: any[]) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
    return { error: 'No lead records found in uploaded file.' }
  }

  const admin = createAdminClient()

  // Verify subscription status
  const { data: sub } = await admin
    .from('Subscription')
    .select('status, overrideLeadLimit, Plan(leadLimitPerMonth)')
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (sub && sub.status === 'suspended') {
    return { error: 'Your subscription is currently suspended. Please renew to import leads.' }
  }

  // Calculate current monthly quota
  const effectiveLeadLimit = sub?.overrideLeadLimit !== null && sub?.overrideLeadLimit !== undefined
    ? sub.overrideLeadLimit
    : (sub?.Plan as any)?.leadLimitPerMonth

  if (effectiveLeadLimit !== null && effectiveLeadLimit !== undefined && effectiveLeadLimit !== -1) {
    const { count } = await admin
      .from('Lead')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', user.companyId)
      .gte('createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const currentLeads = count ?? 0
    const availableQuota = effectiveLeadLimit - currentLeads

    if (availableQuota <= 0) {
      return { error: `Monthly lead limit reached (${currentLeads}/${effectiveLeadLimit} leads used). Upgrade your plan to import more leads.` }
    }

    if (rawLeads.length > availableQuota) {
      return { error: `File contains ${rawLeads.length} leads, but only ${availableQuota} remaining leads allowed under your monthly quota (${currentLeads}/${effectiveLeadLimit} used).` }
    }
  }

  const validLeadsToInsert: any[] = []

  for (const raw of rawLeads) {
    // Flexible header mapping
    const fullName = raw['Full Name'] || raw['FullName'] || raw['Name'] || raw['Student Name'] || raw['fullName']
    if (!fullName || String(fullName).trim() === '') continue

    const phone = raw['Phone'] || raw['Mobile'] || raw['Phone Number'] || raw['Contact'] || raw['phone'] || null
    const email = raw['Email'] || raw['Email Address'] || raw['email'] || null

    const lastStudyLevel = raw['Last Study Level'] || raw['Education'] || raw['Degree'] || raw['lastStudyLevel'] || null
    const preferredStudyLevel = raw['Preferred Study Level'] || raw['Target Degree'] || raw['preferredStudyLevel'] || null
    const preferredCountry = raw['Preferred Country'] || raw['Country'] || raw['Target Country'] || raw['preferredCountry'] || null
    const preferredCourse = raw['Preferred Course'] || raw['Course'] || raw['Major'] || raw['preferredCourse'] || null
    const preferredIntake = raw['Preferred Intake'] || raw['Intake'] || raw['preferredIntake'] || null

    const englishTestType = raw['English Test Type'] || raw['IELTS/PTE'] || raw['englishTestType'] || null
    const englishTestScore = raw['English Test Score'] || raw['Test Score'] || raw['englishTestScore'] || null
    const source = raw['Source'] || raw['Lead Source'] || raw['source'] || 'Excel Bulk Import'
    const eventTag = raw['Event Tag'] || raw['Event'] || raw['Campaign'] || raw['eventTag'] || null
    const initialNote = raw['Notes'] || raw['Initial Note'] || raw['Remarks'] || raw['initialNote'] || null

    validLeadsToInsert.push({
      companyId: user.companyId,
      fullName: String(fullName).trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      lastStudyLevel: lastStudyLevel ? String(lastStudyLevel).trim() : null,
      preferredStudyLevel: preferredStudyLevel ? String(preferredStudyLevel).trim() : null,
      preferredCountry: preferredCountry ? String(preferredCountry).trim() : null,
      preferredCourse: preferredCourse ? String(preferredCourse).trim() : null,
      preferredIntake: preferredIntake ? String(preferredIntake).trim() : null,
      englishTestType: englishTestType ? String(englishTestType).trim() : null,
      englishTestScore: englishTestScore ? String(englishTestScore).trim() : null,
      source: String(source).trim(),
      eventTag: eventTag ? String(eventTag).trim() : null,
      initialNote: initialNote ? String(initialNote).trim() : null,
      stage: 'New',
      rating: 'Unrated',
      createdById: user.id,
      assignedCounselorId: user.role === 'Counselor' ? user.id : null,
    })
  }

  if (validLeadsToInsert.length === 0) {
    return { error: 'No valid leads with a "Full Name" column were found in the uploaded file.' }
  }

  // Insert in batches of 100
  const batchSize = 100
  let insertedCount = 0

  for (let i = 0; i < validLeadsToInsert.length; i += batchSize) {
    const batch = validLeadsToInsert.slice(i, i + batchSize)
    const { data: inserted, error: insertError } = await admin
      .from('Lead')
      .insert(batch)
      .select('id')

    if (insertError) {
      return { error: 'Error inserting batch leads: ' + insertError.message }
    }
    insertedCount += inserted?.length || 0
  }

  await admin.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'lead.bulk_imported',
    entityType: 'Lead',
    metadata: { count: insertedCount, totalRows: rawLeads.length },
  })

  revalidatePath('/dashboard/leads')
  return {
    success: true,
    insertedCount,
    totalRows: rawLeads.length,
    skippedRows: rawLeads.length - insertedCount,
  }
}
