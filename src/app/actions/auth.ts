'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Auto-provision Super Admin if missing from the User table
  if (authData?.user) {
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!existingUser) {
      // Create Company and User using the Supabase client
      const { data: company, error: companyError } = await supabase
        .from('Company')
        .insert({ name: 'My Company' })
        .select()
        .single()

      if (companyError || !company) {
        return { error: 'Failed to create company profile: ' + (companyError?.message || 'Unknown error') }
      }

      const { error: userError } = await supabase
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
    }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createClient()
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

  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.email) {
    await supabase
      .from('User')
      .update({ password: password })
      .eq('email', user.email)
  }

  // Force re-login with new credentials for clean session
  await supabase.auth.signOut()
  redirect('/login?message=Password updated. Please log in.')
}
