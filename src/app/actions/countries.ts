'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getCountries() {
  const user = await getUserSession()
  if (!user) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Country')
    .select('*')
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching countries:', error)
    return []
  }

  return data
}

export async function getCountryById(id: string) {
  const user = await getUserSession()
  if (!user) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Country')
    .select('*')
    .eq('companyId', user.companyId)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching country:', error)
    return null
  }

  return data
}

export async function createCountry(prevState: any, formData: FormData) {
  const user = await getUserSession()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  if (user.role !== 'Super Admin' && user.role !== 'Manager') {
    return { error: 'Unauthorized. Only Admins and Managers can add countries.' }
  }

  const name = formData.get('name') as string
  if (!name) return { error: 'Name is required' }

  const supabase = await createClient()
  
  const payload: any = {
    companyId: user.companyId,
    name,
    continent: formData.get('continent') as string,
    capitals: formData.get('capitals') as string,
    majorCities: formData.get('majorCities') as string,
    countryCode: formData.get('countryCode') as string,
    currency: formData.get('currency') as string,
    academicRequirement: formData.get('academicRequirement') as string,
    studyGapAcceptance: formData.get('studyGapAcceptance') as string,
    ieltsRequirement: formData.get('ieltsRequirement') as string,
    pteRequirement: formData.get('pteRequirement') as string,
    toeflRequirement: formData.get('toeflRequirement') as string,
    duolingoRequirement: formData.get('duolingoRequirement') as string,
    intakes: formData.get('intakes') as string,
    applicationFee: formData.get('applicationFee') as string,
    tuitionFees: formData.get('tuitionFees') as string,
    tuitionType: formData.get('tuitionType') as string,
    scholarship: formData.get('scholarship') as string,
    courseDurationUg: formData.get('courseDurationUg') as string,
    courseDurationPg: formData.get('courseDurationPg') as string,
    sponsorBankStatement: formData.get('sponsorBankStatement') as string,
    policeClearance: formData.get('policeClearance') as string,
    insurance: formData.get('insurance') as string,
    medical: formData.get('medical') as string,
    embassyFees: formData.get('embassyFees') as string,
    biometricFee: formData.get('biometricFee') as string,
    visaInterview: formData.get('visaInterview') as string,
    embassyFace: formData.get('embassyFace') as string,
    residencePermit: formData.get('residencePermit') as string,
    livingCost: formData.get('livingCost') as string,
    workPermit: formData.get('workPermit') as string,
    jobOpportunity: formData.get('jobOpportunity') as string,
    spouseAndKids: formData.get('spouseAndKids') as string,
    accommodation: formData.get('accommodation') as string,
    processingDuration: formData.get('processingDuration') as string,
    serviceCharge: formData.get('serviceCharge') as string,
    totalCost: formData.get('totalCost') as string,
  }

  // Handle JSON fields
  try {
    const stepsString = formData.get('steps') as string
    if (stepsString) payload.steps = JSON.parse(stepsString)
  } catch (e) {}

  try {
    const visaChecklistString = formData.get('visaChecklist') as string
    if (visaChecklistString) payload.visaChecklist = JSON.parse(visaChecklistString)
  } catch (e) {}

  try {
    const keySellingPointsString = formData.get('keySellingPoints') as string
    if (keySellingPointsString) payload.keySellingPoints = JSON.parse(keySellingPointsString)
  } catch (e) {}

  try {
    const universityChecklistString = formData.get('universityChecklist') as string
    if (universityChecklistString) payload.universityChecklist = JSON.parse(universityChecklistString)
  } catch (e) {}

  try {
    const universitiesString = formData.get('universities') as string
    if (universitiesString) payload.universities = JSON.parse(universitiesString)
  } catch (e) {}

  const { error } = await supabase
    .from('Country')
    .insert(payload)

  if (error) {
    console.error('Error creating country:', error)
    return { error: 'Failed to create country' }
  }

  revalidatePath('/dashboard/countries')
  return { success: true }
}

export async function updateCountry(prevState: any, formData: FormData) {
  const user = await getUserSession()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  if (user.role !== 'Super Admin' && user.role !== 'Manager') {
    return { error: 'Unauthorized. Only Admins and Managers can edit countries.' }
  }

  const id = formData.get('id') as string
  if (!id) return { error: 'ID is required' }
  
  const name = formData.get('name') as string
  if (!name) return { error: 'Name is required' }

  const supabase = await createClient()
  
  const payload: any = {
    name,
    continent: formData.get('continent') as string,
    capitals: formData.get('capitals') as string,
    majorCities: formData.get('majorCities') as string,
    countryCode: formData.get('countryCode') as string,
    currency: formData.get('currency') as string,
    academicRequirement: formData.get('academicRequirement') as string,
    studyGapAcceptance: formData.get('studyGapAcceptance') as string,
    ieltsRequirement: formData.get('ieltsRequirement') as string,
    pteRequirement: formData.get('pteRequirement') as string,
    toeflRequirement: formData.get('toeflRequirement') as string,
    duolingoRequirement: formData.get('duolingoRequirement') as string,
    intakes: formData.get('intakes') as string,
    applicationFee: formData.get('applicationFee') as string,
    tuitionFees: formData.get('tuitionFees') as string,
    tuitionType: formData.get('tuitionType') as string,
    scholarship: formData.get('scholarship') as string,
    courseDurationUg: formData.get('courseDurationUg') as string,
    courseDurationPg: formData.get('courseDurationPg') as string,
    sponsorBankStatement: formData.get('sponsorBankStatement') as string,
    policeClearance: formData.get('policeClearance') as string,
    insurance: formData.get('insurance') as string,
    medical: formData.get('medical') as string,
    embassyFees: formData.get('embassyFees') as string,
    biometricFee: formData.get('biometricFee') as string,
    visaInterview: formData.get('visaInterview') as string,
    embassyFace: formData.get('embassyFace') as string,
    residencePermit: formData.get('residencePermit') as string,
    livingCost: formData.get('livingCost') as string,
    workPermit: formData.get('workPermit') as string,
    jobOpportunity: formData.get('jobOpportunity') as string,
    spouseAndKids: formData.get('spouseAndKids') as string,
    accommodation: formData.get('accommodation') as string,
    processingDuration: formData.get('processingDuration') as string,
    serviceCharge: formData.get('serviceCharge') as string,
    totalCost: formData.get('totalCost') as string,
  }

  try {
    const stepsString = formData.get('steps') as string
    if (stepsString) payload.steps = JSON.parse(stepsString)
  } catch (e) {}

  try {
    const visaChecklistString = formData.get('visaChecklist') as string
    if (visaChecklistString) payload.visaChecklist = JSON.parse(visaChecklistString)
  } catch (e) {}

  try {
    const keySellingPointsString = formData.get('keySellingPoints') as string
    if (keySellingPointsString) payload.keySellingPoints = JSON.parse(keySellingPointsString)
  } catch (e) {}

  try {
    const universityChecklistString = formData.get('universityChecklist') as string
    if (universityChecklistString) payload.universityChecklist = JSON.parse(universityChecklistString)
  } catch (e) {}

  try {
    const universitiesString = formData.get('universities') as string
    if (universitiesString) payload.universities = JSON.parse(universitiesString)
  } catch (e) {}

  const { error } = await supabase
    .from('Country')
    .update(payload)
    .eq('id', id)
    .eq('companyId', user.companyId)

  if (error) {
    console.error('Error updating country:', error)
    return { error: 'Failed to update country' }
  }

  revalidatePath('/dashboard/countries')
  return { success: true }
}

export async function deleteCountry(id: string) {
  const user = await getUserSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  if (user.role !== 'Super Admin' && user.role !== 'Manager') {
    throw new Error('Unauthorized. Only Admins and Managers can delete countries.')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('Country')
    .delete()
    .eq('id', id)
    .eq('companyId', user.companyId)

  if (error) {
    console.error('Error deleting country:', error)
    throw new Error('Failed to delete country')
  }

  revalidatePath('/dashboard/countries')
}
