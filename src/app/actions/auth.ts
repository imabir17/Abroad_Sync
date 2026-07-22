'use server'

import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createServerClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (authData?.user) {
    let supabaseAdmin
    try {
      supabaseAdmin = createAdminClient()
    } catch (e: any) {
      return { error: e.message || 'Failed to initialize admin client' }
    }

    // Verify profile existence & status safely
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('User')
      .select('id, status, companyId')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (checkError) {
      return { error: 'Failed to verify user profile: ' + checkError.message }
    }

    if (existingUser && existingUser.status === 'Deactivated') {
      await supabase.auth.signOut()
      return { error: 'Your account has been deactivated. Please contact your company administrator.' }
    }

    if (!existingUser) {
      // Check user_metadata for company name or fallback
      const companyName = authData.user.user_metadata?.pendingCompanyName || authData.user.user_metadata?.companyName || 'My Coaching Center'
      
      const { data: company, error: companyError } = await supabaseAdmin
        .from('Company')
        .insert({ name: companyName })
        .select()
        .single()

      if (companyError || !company) {
        return { error: 'Failed to create company profile: ' + (companyError?.message || 'Unknown error') }
      }

      const { error: userError } = await supabaseAdmin
        .from('User')
        .insert({
          id: authData.user.id,
          email,
          fullName: authData.user.user_metadata?.fullName || authData.user.user_metadata?.full_name || 'Admin User',
          role: 'Super Admin',
          status: 'Active',
          companyId: company.id
        })

      if (userError) {
        return { error: 'Failed to create user profile: ' + userError.message }
      }

      await supabaseAdmin.from('ActivityLog').insert({
        companyId: company.id,
        actorId: authData.user.id,
        action: 'company.created',
        entityType: 'Company',
        entityId: company.id,
      })

      // Store tenant context in JWT app_metadata
      await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { app_metadata: { companyId: company.id, role: 'Super Admin' } }
      )
    }
  }

  redirect('/dashboard')
}

export async function provisionCompany() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  // Guard against double-provisioning if this route is hit twice
  const { data: existing } = await admin.from('User').select('id, companyId, status').eq('id', user.id).maybeSingle()
  if (existing) {
    if (existing.status === 'Deactivated') {
      await supabase.auth.signOut()
      throw new Error('Your account is deactivated.')
    }
    return { alreadyProvisioned: true, companyId: existing.companyId }
  }

  // Intercept invited users: If user email has a pending invite, attach to existing company
  if (user.email) {
    const { data: pendingInvite } = await admin
      .from('Invite')
      .select('*')
      .ilike('email', user.email.trim())
      .eq('status', 'Pending')
      .maybeSingle()

    if (pendingInvite) {
      const fullName = user.user_metadata?.fullName || user.user_metadata?.full_name || user.email.split('@')[0]
      const { error: userErr } = await admin.from('User').insert({
        id: user.id,
        email: user.email.toLowerCase(),
        fullName,
        role: pendingInvite.role,
        status: 'Active',
        companyId: pendingInvite.companyId,
      })

      if (!userErr) {
        await admin.from('Invite').update({ status: 'Accepted' }).eq('id', pendingInvite.id)
        await admin.auth.admin.updateUserById(user.id, {
          app_metadata: { companyId: pendingInvite.companyId, role: pendingInvite.role }
        })

        await admin.from('ActivityLog').insert({
          companyId: pendingInvite.companyId,
          actorId: user.id,
          action: 'invite.accepted',
          entityType: 'User',
          entityId: user.id,
        })

        return { alreadyProvisioned: true, companyId: pendingInvite.companyId }
      }
    }
  }

  const companyName = user.user_metadata?.pendingCompanyName || user.user_metadata?.companyName || 'My Coaching Center'

  const { data: company, error: companyErr } = await admin
    .from('Company')
    .insert({ name: companyName })
    .select()
    .single()
  if (companyErr) throw companyErr

  const { error: userErr } = await admin.from('User').insert({
    id: user.id,
    email: user.email!,
    fullName: user.user_metadata?.fullName || user.user_metadata?.full_name || 'Admin User',
    role: 'Super Admin',
    status: 'Active',
    companyId: company.id,
  })
  if (userErr) throw userErr

  await admin.from('ActivityLog').insert({
    companyId: company.id,
    actorId: user.id,
    action: 'company.created',
    entityType: 'Company',
    entityId: company.id,
  })

  // Provision default Branch & Free Subscription
  const { data: branch } = await admin
    .from('Branch')
    .insert({ companyId: company.id, name: 'Main Branch', isDefault: true })
    .select()
    .single()

  const { data: freePlan } = await admin.from('Plan').select('id').eq('name', 'Free').maybeSingle()

  if (branch && freePlan) {
    await admin.from('Subscription').insert({
      branchId: branch.id,
      companyId: company.id,
      planId: freePlan.id,
      status: 'active',
      currentPeriodEnd: null,
    })
  }

  await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { companyId: company.id, role: 'Super Admin' },
  })

  return { companyId: company.id }
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createServerClient()
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? 'http://localhost:3000'
  siteUrl = siteUrl.includes('http') ? siteUrl : `https://${siteUrl}`
  siteUrl = siteUrl.replace(/\/$/, '')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password reset link sent to your email.' }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Both fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }
  
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = await createServerClient()
  
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }


  // Clear active session to enforce a clean re-login with the new password
  await supabase.auth.signOut()
  redirect('/login?message=Password updated. Please log in.')
}
