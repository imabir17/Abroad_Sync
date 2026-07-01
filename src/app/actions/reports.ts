'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'

export interface CounselorReport {
  counselorId: string;
  counselorName: string;
  leadsHanded: number;
  leadsContacted: number;
  filesOpened: number;
  leadsCreated: number;
  activePipeline: number;
  stageBreakdown: { stage: string; count: number }[];
}

export async function generateReports(startDate: Date, endDate: Date, counselorId?: string): Promise<CounselorReport[]> {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')
  
  // If user is a Counselor, they can only see their own report
  const isCounselor = user.role === 'Counselor'
  const targetCounselorId = isCounselor ? user.id : counselorId

  const supabase = await createClient()

  // Fetch counselors to report on, restricted to the user's company
  let counselorQuery = supabase
    .from('User')
    .select('id, fullName, role')
    .eq('companyId', user.companyId)
    .in('role', ['Counselor', 'Manager', 'Super Admin'])

  if (targetCounselorId) {
    counselorQuery = counselorQuery.eq('id', targetCounselorId)
  }

  const { data: counselors, error: counselorsError } = await counselorQuery
  if (counselorsError || !counselors) {
    throw new Error('Failed to fetch counselors: ' + (counselorsError?.message || 'Unknown error'))
  }

  // Fetch all leads in the company to compute stats in memory (optimizes network roundtrips)
  const { data: allLeads, error: leadsError } = await supabase
    .from('Lead')
    .select('id, stage, rating, isFileOpened, fileOpenedAt, contactedAt, assignedAt, createdAt, createdById, assignedCounselorId')
    .eq('companyId', user.companyId)

  if (leadsError || !allLeads) {
    throw new Error('Failed to fetch leads: ' + (leadsError?.message || 'Unknown error'))
  }

  const startMs = new Date(startDate).getTime()
  const endMs = new Date(endDate).getTime()

  const reports: CounselorReport[] = []

  for (const counselor of counselors) {
    // Filter leads related to this counselor
    const counselorHandedLeads = allLeads.filter(lead => {
      if (lead.assignedCounselorId !== counselor.id) return false
      const assignedTime = lead.assignedAt ? new Date(lead.assignedAt).getTime() : null
      const createdTime = new Date(lead.createdAt).getTime()
      
      return (assignedTime && assignedTime >= startMs && assignedTime <= endMs) ||
             (!assignedTime && createdTime >= startMs && createdTime <= endMs)
    })

    const counselorContactedLeads = allLeads.filter(lead => {
      if (lead.assignedCounselorId !== counselor.id) return false
      const contactedTime = lead.contactedAt ? new Date(lead.contactedAt).getTime() : null
      const createdTime = new Date(lead.createdAt).getTime()

      return (contactedTime && contactedTime >= startMs && contactedTime <= endMs) ||
             (!contactedTime && createdTime >= startMs && createdTime <= endMs && lead.stage !== 'New')
    })

    const counselorFilesOpened = allLeads.filter(lead => {
      if (lead.assignedCounselorId !== counselor.id) return false
      if (!lead.isFileOpened || !lead.fileOpenedAt) return false
      const openedTime = new Date(lead.fileOpenedAt).getTime()
      return openedTime >= startMs && openedTime <= endMs
    })

    const counselorLeadsCreated = allLeads.filter(lead => {
      if (lead.createdById !== counselor.id) return false
      const createdTime = new Date(lead.createdAt).getTime()
      return createdTime >= startMs && createdTime <= endMs
    })

    const counselorActivePipeline = allLeads.filter(lead => lead.assignedCounselorId === counselor.id)

    // Compute stage breakdown
    const stageCounts: Record<string, number> = {}
    counselorActivePipeline.forEach(lead => {
      const stage = lead.stage || 'New'
      stageCounts[stage] = (stageCounts[stage] || 0) + 1
    })

    const stageBreakdown = Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count
    }))

    const leadsHanded = counselorHandedLeads.length
    const leadsContacted = counselorContactedLeads.length
    const filesOpened = counselorFilesOpened.length
    const leadsCreated = counselorLeadsCreated.length
    const activePipeline = counselorActivePipeline.length

    // Only add to report if they actually had activity or if we are filtering for a specific counselor
    if (leadsHanded > 0 || activePipeline > 0 || leadsCreated > 0 || filesOpened > 0 || targetCounselorId) {
      reports.push({
        counselorId: counselor.id,
        counselorName: counselor.fullName,
        leadsHanded,
        leadsContacted,
        filesOpened,
        leadsCreated,
        activePipeline,
        stageBreakdown
      })
    }
  }

  // Sort by most leads handed
  return reports.sort((a, b) => b.leadsHanded - a.leadsHanded)
}

export async function getAllCounselors() {
  const user = await getUserSession()
  if (!user || user.role === 'Counselor') return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('User')
    .select('id, fullName')
    .eq('companyId', user.companyId)
    .in('role', ['Counselor', 'Manager', 'Super Admin'])
    .order('fullName', { ascending: true })

  if (error) return []
  return data
}
