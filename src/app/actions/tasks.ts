'use server'

import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')
  if (user.role === 'Counselor') throw new Error('Unauthorized')

  const description = formData.get('description') as string
  const dueDate = formData.get('dueDate') as string
  const counselorId = formData.get('counselorId') as string
  const leadId = formData.get('leadId') as string | null

  if (!description || !dueDate || !counselorId) {
    return { error: 'Missing required fields' }
  }

  // Ensure assigned counselor is in same company
  const assignedCounselor = await prisma.user.findFirst({
    where: { id: counselorId, companyId: user.companyId }
  })
  if (!assignedCounselor) throw new Error('Counselor not found in your company')

  await prisma.task.create({
    data: {
      leadId: leadId || null,
      counselorId,
      description,
      dueDate: new Date(dueDate),
      status: 'Pending'
    }
  })

  revalidatePath('/dashboard/tasks')
  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')

  const task = await prisma.task.findUnique({ 
    where: { id: taskId },
    include: { counselor: true }
  })
  if (!task || task.counselor.companyId !== user.companyId) throw new Error('Task not found')

  if (user.role === 'Counselor' && task.counselorId !== user.id) {
    throw new Error('Unauthorized')
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status }
  })

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

  const task = await prisma.task.findUnique({ 
    where: { id: taskId },
    include: { counselor: true } 
  })
  if (!task || task.counselor.companyId !== user.companyId) return { success: true }

  await prisma.task.delete({
    where: { id: taskId }
  })

  revalidatePath('/dashboard/tasks')
  if (task.leadId) {
    revalidatePath(`/dashboard/leads/${task.leadId}`)
  }
  return { success: true }
}
