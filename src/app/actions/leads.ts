'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sendPushNotification } from '@/app/actions/push'

export async function createLead(prevState: any, formData: FormData) {
  const user = await getUserSession()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const lastStudyLevel = formData.get('lastStudyLevel') as string
  const preferredStudyLevel = formData.get('preferredStudyLevel') as string
  const preferredCountry = formData.get('preferredCountry') as string
  const preferredCourse = formData.get('preferredCourse') as string
  const preferredIntakeMonth = formData.get('preferredIntakeMonth') as string
  const preferredIntakeYear = formData.get('preferredIntakeYear') as string
  const preferredIntake = [preferredIntakeMonth, preferredIntakeYear].filter(Boolean).join(' ')
  
  const englishTestStatus = formData.get('englishTestStatus') as string
  const englishTestType = formData.get('englishTestType') as string
  const englishTestScore = formData.get('englishTestScore') as string
  
  const initialNote = formData.get('initialNote') as string
  const stage = formData.get('stage') as string || 'New'
  const rating = formData.get('rating') as string || 'Unrated'

  const sscGroup = formData.get('sscGroup') as string
  const sscYear = formData.get('sscYear') as string
  const sscResult = formData.get('sscResult') as string
  
  const hscGroup = formData.get('hscGroup') as string
  const hscYear = formData.get('hscYear') as string
  const hscResult = formData.get('hscResult') as string
  
  const bachelorsMajor = formData.get('bachelorsMajor') as string
  const bachelorsYear = formData.get('bachelorsYear') as string
  const bachelorsCgpa = formData.get('bachelorsCgpa') as string
  
  const mastersMajor = formData.get('mastersMajor') as string
  const mastersYear = formData.get('mastersYear') as string
  const mastersCgpa = formData.get('mastersCgpa') as string

  const workExperience = formData.get('workExperience') as string
  const sourceType = formData.get('sourceType') as string
  const customSource = formData.get('customSource') as string
  const source = sourceType === 'Other' && customSource ? customSource : sourceType
  const budget = formData.get('budget') as string
  
  let assignedCounselorId = formData.get('assignedCounselorId') as string
  
  if (user.role === 'Counselor') {
    assignedCounselorId = user.id
  }

  if (!fullName) {
    return { error: 'Full name is required' }
  }

  const supabase = await createClient()

  // Ensure assigned counselor is in the same company
  if (assignedCounselorId) {
    const { data: counselor } = await supabase
      .from('User')
      .select('id')
      .eq('id', assignedCounselorId)
      .eq('companyId', user.companyId)
      .maybeSingle()

    if (!counselor) return { error: 'Counselor not found in your company' }
  }

  const { data: newLead, error: createError } = await supabase
    .from('Lead')
    .insert({
      companyId: user.companyId, // Ensure it's scoped to company
      fullName,
      email: email || null,
      phone: phone || null,
      lastStudyLevel: lastStudyLevel || null,
      preferredStudyLevel: preferredStudyLevel || null,
      preferredCountry: preferredCountry || null,
      preferredCourse: preferredCourse || null,
      preferredIntake: preferredIntake || null,
      
      englishTestStatus: englishTestStatus || null,
      englishTestType: englishTestType || null,
      englishTestScore: englishTestScore || null,
      
      initialNote: initialNote || null,
      stage,
      rating,
      createdById: user.id,
      assignedCounselorId: assignedCounselorId || null,
      assignedAt: assignedCounselorId ? new Date().toISOString() : null,
      
      sscGroup: sscGroup || null,
      sscYear: sscYear || null,
      sscResult: sscResult || null,
      
      hscGroup: hscGroup || null,
      hscYear: hscYear || null,
      hscResult: hscResult || null,
      
      bachelorsMajor: bachelorsMajor || null,
      bachelorsYear: bachelorsYear || null,
      bachelorsCgpa: bachelorsCgpa || null,
      
      mastersMajor: mastersMajor || null,
      mastersYear: mastersYear || null,
      mastersCgpa: mastersCgpa || null,
      
      workExperience: workExperience || null,
      source: source || null,
      budget: budget || null
    })
    .select()
    .single()

  if (createError || !newLead) {
    return { error: 'Failed to create lead: ' + createError?.message }
  }

  const nowStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const creatorName = user.fullName || user.email || 'System User'

  await supabase.from('Interaction').insert({
    leadId: newLead.id,
    counselorId: user.id,
    type: 'Note',
    content: `📌 Student lead added to system by ${creatorName} on ${nowStr}.`,
  })

  await supabase.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'lead.created',
    entityType: 'Lead',
    entityId: newLead.id,
    metadata: { fullName: newLead.fullName, stage, assignedCounselorId }
  })

  if (assignedCounselorId && assignedCounselorId !== user.id) {
    await sendPushNotification(assignedCounselorId, {
      title: '🎓 New Lead Assigned',
      body: `You have been assigned student ${fullName}.`,
      url: `/dashboard/leads/${newLead.id}`,
    })
  }

  revalidatePath('/dashboard/leads')
  redirect(`/dashboard/leads/${newLead.id}`)
}

export async function checkLeadDuplicate(email: string, phone: string) {
  const user = await getUserSession()
  if (!user) return { duplicate: false }

  const OR = []
  if (email) OR.push(`email.eq.${email}`)
  if (phone) OR.push(`phone.eq.${phone}`)

  if (OR.length === 0) return { duplicate: false }

  const supabase = await createClient()
  const { data: existingLead } = await supabase
    .from('Lead')
    .select('id, email, phone')
    .eq('companyId', user.companyId)
    .or(OR.join(','))
    .maybeSingle()

  if (existingLead) {
    let msg = 'A lead with this '
    if (existingLead.email === email && existingLead.phone === phone) msg += 'email and phone'
    else if (existingLead.email === email) msg += 'email'
    else msg += 'phone number'
    msg += ' already exists in the system.'
    return { duplicate: true, message: msg }
  }

  return { duplicate: false }
}

export async function updateLeadStatus(leadId: string, stage: string, rating: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('Lead')
    .select('stage, assignedCounselorId')
    .eq('id', leadId)
    .eq('companyId', user.companyId)
    .single()

  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  const updateData: any = { stage, rating }
  if (lead.stage === 'New' && stage !== 'New') {
    updateData.contactedAt = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('Lead')
    .update(updateData)
    .eq('id', leadId)

  if (updateError) throw new Error('Failed to update status: ' + updateError.message)

  revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function updateLeadDetails(leadId: string, data: any) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('Lead')
    .select('assignedCounselorId')
    .eq('id', leadId)
    .eq('companyId', user.companyId)
    .single()

  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  // Whitelist editable fields to prevent mass assignment vulnerability
  const ALLOWED_FIELDS = [
    'fullName',
    'phone',
    'email',
    'lastStudyLevel',
    'preferredStudyLevel',
    'preferredCountry',
    'preferredCourse',
    'preferredIntake',
    'englishTestStatus',
    'englishTestType',
    'englishTestScore',
    'sscGroup',
    'sscYear',
    'sscResult',
    'hscGroup',
    'hscYear',
    'hscResult',
    'bachelorsMajor',
    'bachelorsYear',
    'bachelorsCgpa',
    'mastersMajor',
    'mastersYear',
    'mastersCgpa',
    'workExperience',
    'source',
    'budget',
    'initialNote'
  ]

  const sanitizedData: Record<string, any> = {}
  for (const key of ALLOWED_FIELDS) {
    if (data && key in data) {
      sanitizedData[key] = data[key]
    }
  }

  const { error: updateError } = await supabase
    .from('Lead')
    .update(sanitizedData)
    .eq('id', leadId)

  if (updateError) throw new Error('Failed to update details: ' + updateError.message)

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function createApplication(leadId: string, country: string, university: string, courseName: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('Lead')
    .select('id')
    .eq('id', leadId)
    .eq('companyId', user.companyId)
    .single()

  if (!lead) throw new Error('Lead not found')

  const { error: insertError } = await supabase
    .from('Application')
    .insert({
      leadId,
      country,
      university,
      courseName,
      status: 'Pending'
    })

  if (insertError) throw new Error('Failed to create application: ' + insertError.message)

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function createInteraction(leadId: string, content: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('Lead')
    .select('id, fullName, assignedCounselorId')
    .eq('id', leadId)
    .eq('companyId', user.companyId)
    .single()

  if (!lead) throw new Error('Lead not found')

  const { error: insertError } = await supabase
    .from('Interaction')
    .insert({
      leadId,
      counselorId: user.id,
      type: 'Note',
      content
    })

  if (insertError) throw new Error('Failed to create interaction: ' + insertError.message)

  await supabase.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'interaction.created',
    entityType: 'Interaction',
    entityId: leadId,
    metadata: { contentSnippet: content.slice(0, 120) }
  })

  if (lead.assignedCounselorId && lead.assignedCounselorId !== user.id) {
    await sendPushNotification(lead.assignedCounselorId, {
      title: '📝 New Consultation Note',
      body: `${user.fullName || 'A team member'} added a note on student ${lead.fullName || ''}.`,
      url: `/dashboard/leads/${leadId}`,
    })
  }

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function transferLead(leadId: string, newCounselorId: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('Lead')
    .select('assignedCounselorId')
    .eq('id', leadId)
    .eq('companyId', user.companyId)
    .single()

  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized to transfer this lead')
  }

  const { data: counselor } = await supabase
    .from('User')
    .select('id')
    .eq('id', newCounselorId)
    .eq('companyId', user.companyId)
    .single()

  if (!counselor) throw new Error('Counselor not found in your company')

  const { error: updateError } = await supabase
    .from('Lead')
    .update({ 
      assignedCounselorId: newCounselorId,
      assignedAt: new Date().toISOString()
    })
    .eq('id', leadId)

  if (updateError) throw new Error('Failed to transfer lead: ' + updateError.message)

  if (newCounselorId && newCounselorId !== user.id) {
    await sendPushNotification(newCounselorId, {
      title: '🔄 Lead Transferred to You',
      body: `A student lead has been transferred to your account.`,
      url: `/dashboard/leads/${leadId}`,
    })
  }

  revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function bulkTransferLeads(leadIds: string[], newCounselorId: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')
  
  if (user.role === 'Counselor') {
    throw new Error('Only Manager or Super Admin can perform bulk transfers')
  }

  const supabase = await createClient()
  const { data: counselor } = await supabase
    .from('User')
    .select('id')
    .eq('id', newCounselorId)
    .eq('companyId', user.companyId)
    .single()

  if (!counselor) throw new Error('Counselor not found in your company')

  const { error: updateError } = await supabase
    .from('Lead')
    .update({ 
      assignedCounselorId: newCounselorId,
      assignedAt: new Date().toISOString()
    })
    .in('id', leadIds)
    .eq('companyId', user.companyId)

  if (updateError) throw new Error('Failed bulk transfer: ' + updateError.message)

  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function toggleFileOpened(leadId: string, isOpened: boolean) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('Lead')
    .select('assignedCounselorId')
    .eq('id', leadId)
    .eq('companyId', user.companyId)
    .single()

  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  const { error: updateError } = await supabase
    .from('Lead')
    .update({
      isFileOpened: isOpened,
      fileOpenedAt: isOpened ? new Date().toISOString() : null
    })
    .eq('id', leadId)

  if (updateError) throw new Error('Failed to toggle file opened state: ' + updateError.message)

  revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath('/dashboard/reports') // So reports recalculate immediately if needed
  return { success: true }
}

export async function updateLeadStageAction(leadId: string, stage: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data: lead } = await supabase
    .from('Lead')
    .select('stage, assignedCounselorId')
    .eq('id', leadId)
    .eq('companyId', user.companyId)
    .single()

  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  const updateData: any = { stage }
  if (lead.stage === 'New' && stage !== 'New') {
    updateData.contactedAt = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('Lead')
    .update(updateData)
    .eq('id', leadId)

  if (updateError) throw new Error('Failed to update stage: ' + updateError.message)

  revalidatePath('/dashboard/leads')
  revalidatePath('/dashboard')
  return { success: true }
}
