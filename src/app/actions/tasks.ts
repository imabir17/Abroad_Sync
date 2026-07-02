'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const description = formData.get('description') as string
  const dueDate = formData.get('dueDate') as string
  let counselorId = formData.get('counselorId') as string
  const leadId = formData.get('leadId') as string | null

  // Restrict counselors to self-assignment
  if (user.role === 'Counselor') {
    counselorId = user.id
  }

  if (!description || !dueDate || !counselorId) {
    return { error: 'Missing required fields' }
  }

  const supabase = await createClient()

  // Verify counselor company tenancy
  const { data: assignedCounselor } = await supabase
    .from('User')
    .select('id')
    .eq('id', counselorId)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!assignedCounselor) throw new Error('Counselor not found in your company')

  const { error: insertError } = await supabase
    .from('Task')
    .insert({
      leadId: leadId || null,
      counselorId,
      description,
      dueDate: new Date(dueDate).toISOString(),
      status: 'Pending'
    })

  if (insertError) {
    return { error: 'Failed to create task: ' + insertError.message }
  }

  revalidatePath('/dashboard/tasks')
  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  
  // Verify tenancy scope of target task
  const { data: task, error: fetchError } = await supabase
    .from('Task')
    .select('id, counselorId, leadId, counselor:User(companyId)')
    .eq('id', taskId)
    .single()

  if (fetchError || !task || !task.counselor || (task.counselor as any).companyId !== user.companyId) {
    throw new Error('Task not found')
  }

  if (user.role === 'Counselor' && task.counselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  const { error: updateError } = await supabase
    .from('Task')
    .update({ status })
    .eq('id', taskId)

  if (updateError) throw new Error('Failed to update task status: ' + updateError.message)

  revalidatePath('/dashboard/tasks')
  if (task.leadId) {
    revalidatePath(`/dashboard/leads/${task.leadId}`)
  }
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')
  if (user.role === 'Counselor') throw new Error('Unauthorized')

  const supabase = await createClient()

  // Verify tenancy scope of target task
  const { data: task } = await supabase
    .from('Task')
    .select('id, counselorId, leadId, counselor:User(companyId)')
    .eq('id', taskId)
    .maybeSingle()

  if (!task || !task.counselor || (task.counselor as any).companyId !== user.companyId) {
    return { success: true }
  }

  const { error: deleteError } = await supabase
    .from('Task')
    .delete()
    .eq('id', taskId)

  if (deleteError) throw new Error('Failed to delete task: ' + deleteError.message)

  revalidatePath('/dashboard/tasks')
  if (task.leadId) {
    revalidatePath(`/dashboard/leads/${task.leadId}`)
  }
  return { success: true }
}
