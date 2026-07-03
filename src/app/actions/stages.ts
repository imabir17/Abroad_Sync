'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type PipelineStage = {
  id: string
  companyId: string
  name: string
  orderIndex: number
  createdAt: string
}

const DEFAULT_STAGES = ['New', 'Contacted', 'Applied', 'Offer', 'Visa']

/**
 * Fetches stages for the company, dynamically seeding them if they do not exist.
 */
export async function getStagesAction(): Promise<PipelineStage[]> {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()

  // Query custom stages ordered by index
  const { data: stages, error } = await supabase
    .from('PipelineStage')
    .select('*')
    .eq('companyId', user.companyId)
    .order('orderIndex', { ascending: true })

  if (error) {
    console.error('Error fetching PipelineStage:', error)
    return []
  }

  // If empty, auto-seed default stages in database
  if (!stages || stages.length === 0) {
    const seedData = DEFAULT_STAGES.map((name, index) => ({
      companyId: user.companyId,
      name,
      orderIndex: index
    }))

    const { data: seededStages, error: seedError } = await supabase
      .from('PipelineStage')
      .insert(seedData)
      .select('*')

    if (seedError) {
      console.error('Error seeding default stages:', seedError)
      // Return memory fallback if database insert fails temporarily (e.g. table not created yet)
      return seedData.map((d, index) => ({
        id: `temp-${index}`,
        companyId: d.companyId,
        name: d.name,
        orderIndex: d.orderIndex,
        createdAt: new Date().toISOString()
      }))
    }

    // Sort seeded stages by index
    return (seededStages || []).sort((a, b) => a.orderIndex - b.orderIndex)
  }

  return stages
}

/**
 * Creates a new pipeline stage.
 */
export async function createStageAction(name: string) {
  const user = await getUserSession()
  if (!user || user.role === 'Counselor') throw new Error('Unauthorized')

  const cleanName = name.trim()
  if (!cleanName) return { error: 'Stage name cannot be empty' }

  const supabase = await createClient()

  // Get current max orderIndex
  const { data: stages } = await supabase
    .from('PipelineStage')
    .select('orderIndex')
    .eq('companyId', user.companyId)
    .order('orderIndex', { ascending: false })
    .limit(1)

  const nextIndex = stages && stages.length > 0 ? stages[0].orderIndex + 1 : 0

  const { error } = await supabase
    .from('PipelineStage')
    .insert({
      companyId: user.companyId,
      name: cleanName,
      orderIndex: nextIndex
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/leads')
  return { success: true }
}

/**
 * Updates a stage name and migrates matching leads.
 */
export async function updateStageAction(id: string, newName: string) {
  const user = await getUserSession()
  if (!user || user.role === 'Counselor') throw new Error('Unauthorized')

  const cleanName = newName.trim()
  if (!cleanName) return { error: 'Stage name cannot be empty' }

  const supabase = await createClient()

  // 1. Fetch current stage to find the old name
  const { data: currentStage } = await supabase
    .from('PipelineStage')
    .select('name')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!currentStage) return { error: 'Stage not found' }

  const oldName = currentStage.name

  // 2. Update stage name
  const { error: updateError } = await supabase
    .from('PipelineStage')
    .update({ name: cleanName })
    .eq('id', id)

  if (updateError) {
    return { error: updateError.message }
  }

  // 3. Update all Leads matching the old name
  const { error: leadsError } = await supabase
    .from('Lead')
    .update({ stage: cleanName })
    .eq('stage', oldName)
    .eq('companyId', user.companyId)

  if (leadsError) {
    console.error('Error updating leads on stage rename:', leadsError)
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/leads')
  return { success: true }
}

/**
 * Deletes a stage, migrating any active leads in that stage to a target stage.
 */
export async function deleteStageAction(id: string, migrateToStageName: string) {
  const user = await getUserSession()
  if (!user || user.role === 'Counselor') throw new Error('Unauthorized')

  const supabase = await createClient()

  // 1. Fetch target stage to ensure it exists
  const { data: targetStage } = await supabase
    .from('PipelineStage')
    .select('name')
    .eq('name', migrateToStageName)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!targetStage) return { error: 'Target migration stage not found' }

  // 2. Fetch stage to delete
  const { data: stageToDelete } = await supabase
    .from('PipelineStage')
    .select('name')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!stageToDelete) return { error: 'Stage to delete not found' }

  // 3. Migrate matching leads to target stage
  const { error: leadsError } = await supabase
    .from('Lead')
    .update({ stage: migrateToStageName })
    .eq('stage', stageToDelete.name)
    .eq('companyId', user.companyId)

  if (leadsError) {
    return { error: 'Failed to migrate leads: ' + leadsError.message }
  }

  // 4. Delete the stage
  const { error: deleteError } = await supabase
    .from('PipelineStage')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/leads')
  return { success: true }
}

/**
 * Reorders stages.
 */
export async function reorderStagesAction(orderedStages: { id: string; orderIndex: number }[]) {
  const user = await getUserSession()
  if (!user || user.role === 'Counselor') throw new Error('Unauthorized')

  const supabase = await createClient()

  // Perform updates in parallel
  const promises = orderedStages.map(s => 
    supabase
      .from('PipelineStage')
      .update({ orderIndex: s.orderIndex })
      .eq('id', s.id)
      .eq('companyId', user.companyId)
  )

  const results = await Promise.all(promises)
  const failed = results.find(r => r.error)

  if (failed) {
    return { error: failed.error?.message || 'Failed to reorder' }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/leads')
  return { success: true }
}
