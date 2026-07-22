'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createInvite(email: string, role: 'Manager' | 'Counselor') {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: me } = await admin.from('User').select('companyId, role, status').eq('id', user.id).maybeSingle()
  
  if (!me || me.status === 'Deactivated' || !['Super Admin', 'Manager'].includes(me.role)) {
    return { error: 'Not authorized' }
  }

  if ((role as string) === 'Super Admin') {
    return { error: 'Cannot invite a Super Admin via invite link.' }
  }

  // Check if email already belongs to an active user in any company
  const { data: existingUser } = await admin.from('User').select('id, companyId').eq('email', email).maybeSingle()
  if (existingUser) {
    if (existingUser.companyId === me.companyId) {
      return { error: 'User with this email is already a member of your team.' }
    } else {
      return { error: 'This email is already registered to a different company.' }
    }
  }

  // Insert invite into Invite table
  const { data: invite, error } = await admin
    .from('Invite')
    .insert({
      companyId: me.companyId,
      email,
      role,
      invitedById: user.id,
    })
    .select()
    .single()

  if (error) return { error: 'Failed to create invite: ' + error.message }

  await admin.from('ActivityLog').insert({
    companyId: me.companyId,
    actorId: user.id,
    action: 'user.invited',
    entityType: 'Invite',
    entityId: invite.id,
    metadata: { email, role },
  })

  revalidatePath('/dashboard/staff')
  return { success: true, invite }
}

export async function acceptInvite(token: string, password: string, fullName: string) {
  if (!token || !password || !fullName) {
    return { error: 'All fields are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  const admin = createAdminClient()

  const { data: invite } = await admin.from('Invite').select('*').eq('token', token).maybeSingle()
  if (!invite || invite.status !== 'Pending') {
    return { error: 'Invalid or already-used invite link.' }
  }

  if (new Date(invite.expiresAt) < new Date()) {
    return { error: 'This invite link has expired.' }
  }

  // Check if an Auth user already exists for this email
  const { data: userList } = await admin.auth.admin.listUsers()
  const found = userList?.users?.find((u) => u.email?.toLowerCase() === invite.email.toLowerCase())

  let userId: string

  if (found) {
    userId = found.id
  } else {
    const { data: created, error: createAuthErr } = await admin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: { fullName },
    })
    if (createAuthErr || !created.user) {
      return { error: 'Failed to create account: ' + (createAuthErr?.message || 'Unknown error') }
    }
    userId = created.user.id
  }

  // Check if this user row already exists in a DIFFERENT company
  const { data: existingUserRow } = await admin.from('User').select('companyId').eq('id', userId).maybeSingle()
  if (existingUserRow && existingUserRow.companyId !== invite.companyId) {
    return { error: 'This email already belongs to a different company.' }
  }

  if (!existingUserRow) {
    const { error: userErr } = await admin.from('User').insert({
      id: userId,
      email: invite.email,
      fullName,
      role: invite.role,
      status: 'Active',
      companyId: invite.companyId,
    })
    if (userErr) {
      return { error: 'Failed to create user profile: ' + userErr.message }
    }
  } else {
    await admin.from('User').update({ status: 'Active', role: invite.role, fullName }).eq('id', userId)
  }

  await admin.from('Invite').update({ status: 'Accepted' }).eq('id', invite.id)

  await admin.from('ActivityLog').insert({
    companyId: invite.companyId,
    actorId: userId,
    action: 'invite.accepted',
    entityType: 'User',
    entityId: userId,
  })

  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { companyId: invite.companyId, role: invite.role },
  })

  return { success: true }
}

export async function revokeInvite(inviteId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: me } = await admin.from('User').select('companyId, role, status').eq('id', user.id).maybeSingle()
  
  if (!me || me.status === 'Deactivated' || !['Super Admin', 'Manager'].includes(me.role)) {
    return { error: 'Not authorized' }
  }

  const { error } = await admin.from('Invite').update({ status: 'Revoked' }).eq('id', inviteId).eq('companyId', me.companyId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function deactivateStaff(targetUserId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: me } = await admin.from('User').select('companyId, role, status').eq('id', user.id).maybeSingle()
  
  if (!me || me.status === 'Deactivated' || !['Super Admin', 'Manager'].includes(me.role)) {
    return { error: 'Not authorized' }
  }

  const { data: targetUser } = await admin.from('User').select('id, role, companyId').eq('id', targetUserId).maybeSingle()
  if (!targetUser || targetUser.companyId !== me.companyId) {
    return { error: 'Staff member not found in your company.' }
  }

  if (targetUser.role === 'Super Admin') {
    const { count } = await admin
      .from('User')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', me.companyId)
      .eq('role', 'Super Admin')
      .eq('status', 'Active')
    
    if ((count ?? 0) <= 1) {
      return { error: 'Cannot deactivate the only active Super Admin in the company.' }
    }
  }

  const { error } = await admin.from('User').update({ status: 'Deactivated' }).eq('id', targetUserId)
  if (error) return { error: error.message }

  await admin.from('ActivityLog').insert({
    companyId: me.companyId,
    actorId: user.id,
    action: 'user.deactivated',
    entityType: 'User',
    entityId: targetUserId,
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function changeUserRole(targetUserId: string, newRole: 'Super Admin' | 'Manager' | 'Counselor') {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: me } = await admin.from('User').select('companyId, role, status').eq('id', user.id).maybeSingle()
  
  if (!me || me.status === 'Deactivated' || me.role !== 'Super Admin') {
    return { error: 'Only Super Admins can manage roles.' }
  }

  const { data: targetUser } = await admin.from('User').select('id, role, companyId').eq('id', targetUserId).maybeSingle()
  if (!targetUser || targetUser.companyId !== me.companyId) {
    return { error: 'Staff member not found in your company.' }
  }

  if (targetUser.role === 'Super Admin' && newRole !== 'Super Admin') {
    const { count } = await admin
      .from('User')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', me.companyId)
      .eq('role', 'Super Admin')
      .eq('status', 'Active')

    if ((count ?? 0) <= 1) {
      return { error: 'Cannot demote the only active Super Admin in the company.' }
    }
  }

  const { error } = await admin.from('User').update({ role: newRole }).eq('id', targetUserId)
  if (error) return { error: error.message }

  await admin.auth.admin.updateUserById(targetUserId, {
    app_metadata: { companyId: me.companyId, role: newRole },
  })

  await admin.from('ActivityLog').insert({
    companyId: me.companyId,
    actorId: user.id,
    action: 'user.role_changed',
    entityType: 'User',
    entityId: targetUserId,
    metadata: { oldRole: targetUser.role, newRole },
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}
