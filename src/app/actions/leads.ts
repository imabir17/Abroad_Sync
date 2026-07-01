'use server'

import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

  // Ensure assigned counselor is in the same company
  if (assignedCounselorId) {
    const counselor = await prisma.user.findFirst({ where: { id: assignedCounselorId, companyId: user.companyId } })
    if (!counselor) return { error: 'Counselor not found in your company' }
  }

  const newLead = await prisma.lead.create({
    data: {
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
      assignedAt: assignedCounselorId ? new Date() : null,
      
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
    }
  })

  revalidatePath('/dashboard/leads')
  redirect(`/dashboard/leads/${newLead.id}`)
}

export async function checkLeadDuplicate(email: string, phone: string) {
  const user = await getUserSession()
  if (!user) return { duplicate: false }

  const OR = []
  if (email) OR.push({ email })
  if (phone) OR.push({ phone })

  if (OR.length === 0) return { duplicate: false }

  const existingLead = await prisma.lead.findFirst({
    where: { 
      companyId: user.companyId, // Search only within company
      OR 
    },
    select: { id: true, email: true, phone: true }
  })

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

  const lead = await prisma.lead.findFirst({ where: { id: leadId, companyId: user.companyId } })
  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  const updateData: any = { stage, rating }
  if (lead.stage === 'New' && stage !== 'New') {
    updateData.contactedAt = new Date()
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: updateData
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function updateLeadDetails(leadId: string, data: any) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const lead = await prisma.lead.findFirst({ where: { id: leadId, companyId: user.companyId } })
  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  await prisma.lead.update({
    where: { id: leadId },
    data
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function createApplication(leadId: string, country: string, university: string, courseName: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const lead = await prisma.lead.findFirst({ where: { id: leadId, companyId: user.companyId } })
  if (!lead) throw new Error('Lead not found')

  await prisma.application.create({
    data: {
      leadId,
      country,
      university,
      courseName,
      status: 'Pending'
    }
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function createInteraction(leadId: string, content: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const lead = await prisma.lead.findFirst({ where: { id: leadId, companyId: user.companyId } })
  if (!lead) throw new Error('Lead not found')

  await prisma.interaction.create({
    data: {
      leadId,
      counselorId: user.id,
      type: 'Note',
      content
    }
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function transferLead(leadId: string, newCounselorId: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const lead = await prisma.lead.findFirst({ where: { id: leadId, companyId: user.companyId } })
  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized to transfer this lead')
  }

  const counselor = await prisma.user.findFirst({ where: { id: newCounselorId, companyId: user.companyId } })
  if (!counselor) throw new Error('Counselor not found in your company')

  await prisma.lead.update({
    where: { id: leadId },
    data: { 
      assignedCounselorId: newCounselorId,
      assignedAt: new Date()
    }
  })

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

  const counselor = await prisma.user.findFirst({ where: { id: newCounselorId, companyId: user.companyId } })
  if (!counselor) throw new Error('Counselor not found in your company')

  await prisma.lead.updateMany({
    where: { 
      id: { in: leadIds },
      companyId: user.companyId
    },
    data: { 
      assignedCounselorId: newCounselorId,
      assignedAt: new Date()
    }
  })

  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function toggleFileOpened(leadId: string, isOpened: boolean) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const lead = await prisma.lead.findFirst({ where: { id: leadId, companyId: user.companyId } })
  if (!lead) throw new Error('Lead not found')

  if (user.role === 'Counselor' && lead.assignedCounselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      isFileOpened: isOpened,
      fileOpenedAt: isOpened ? new Date() : null
    }
  })

  revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath('/dashboard/reports') // So reports recalculate immediately if needed
  return { success: true }
}
