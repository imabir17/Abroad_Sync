'use server'

import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

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

  // Auto-provision Super Admin if missing from the User table
  if (authData?.user) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: 'Failed to authenticate admin client: SUPABASE_SERVICE_ROLE_KEY is not defined.' }
    }

    // Validate that the key provided is indeed the service_role key to prevent RLS failures
    try {
      const parts = process.env.SUPABASE_SERVICE_ROLE_KEY.split('.')
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        if (payload.role !== 'service_role') {
          return { error: `Invalid SUPABASE_SERVICE_ROLE_KEY: The key provided has the role '${payload.role}' instead of 'service_role'. Please check your Vercel environment variables.` }
        }
      }
    } catch (e) {
      return { error: 'Failed to validate SUPABASE_SERVICE_ROLE_KEY format. Please ensure it is copy-pasted correctly.' }
    }

    // Initialize Admin Client to bypass RLS during existence checks and provisioning
    const supabaseAdmin = createSupabaseAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check existence using admin client to prevent RLS from hiding the row
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (checkError) {
      return { error: 'Failed to verify user profile: ' + checkError.message }
    }

    if (!existingUser) {
      const { data: company, error: companyError } = await supabaseAdmin
        .from('Company')
        .insert({ name: 'My Company' })
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
          fullName: authData.user.user_metadata?.full_name || 'Admin User',
          role: 'Super Admin',
          password: 'set-by-supabase-auth',
          companyId: company.id
        })

      if (userError) {
        return { error: 'Failed to create user profile: ' + userError.message }
      }

      // Update auth user's app_metadata for lightning-fast O(1) RLS checks
      await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { app_metadata: { companyId: company.id, role: 'Super Admin' } }
      )
    }
  }

  redirect('/dashboard')
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
  
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.email) {
    const supabaseAdmin = createSupabaseAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await supabaseAdmin
      .from('User')
      .update({ password: password })
      .eq('email', user.email)
  }

  // Force re-login with new credentials for clean session
  await supabase.auth.signOut()
  redirect('/login?message=Password updated. Please log in.')
}
