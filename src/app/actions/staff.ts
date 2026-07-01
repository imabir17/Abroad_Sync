'use server'

import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

import { createClient } from '@supabase/supabase-js'

export async function createStaff(formData: FormData) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string

  if (!fullName || !email || !role) {
    return { error: 'All fields are required' }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: 'User with this email already exists' }
  }

  // 1. Create User in Supabase Auth and SEND INVITE EMAIL
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // inviteUserByEmail is the only way to officially trigger the Supabase "Invite" email from the backend.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm?next=/update-password`
  })

  if (authError || !authData.user) {
    return { error: 'Failed to create user in Supabase: ' + (authError?.message || 'Unknown error') }
  }

  await prisma.user.create({
    data: {
      id: authData.user.id,
      fullName,
      email,
      password: 'pending-invite', // Placeholder until they set it
      role,
      companyId: user.companyId
    }
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function updateStaff(id: string, formData: FormData) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string

  if (!fullName || !email || !role) {
    return { error: 'Name, email, and role are required' }
  }

  // Ensure the staff belongs to the same company
  const staff = await prisma.user.findFirst({ where: { id, companyId: user.companyId } })
  if (!staff) throw new Error('Staff not found in your company')

  const updateData: any = { fullName, email, role }

  await prisma.user.update({
    where: { id },
    data: updateData
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function deleteStaff(id: string) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  // Prevent deleting oneself
  if (user.id === id) {
    return { error: 'Cannot delete your own account' }
  }

  const staff = await prisma.user.findFirst({ where: { id, companyId: user.companyId } })
  if (!staff) throw new Error('Staff not found in your company')

  await prisma.user.delete({
    where: { id }
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}
