'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

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

  // Auto-provision Super Admin if missing from Prisma
  if (authData?.user) {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (!existingUser) {
      // User doesn't exist in Prisma, so they were added via Supabase Dashboard. Create Company and User.
      const company = await prisma.company.create({
        data: {
          name: 'My Company',
        }
      })

      await prisma.user.create({
        data: {
          id: authData.user.id,
          email,
          fullName: authData.user.user_metadata?.full_name || 'Admin User',
          role: 'Super Admin',
          password: 'set-by-supabase-auth',
          companyId: company.id
        }
      })
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
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm?next=/update-password`,
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
  
  // Update in Prisma as well just for fallback if needed, but not strictly required
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.email) {
    await prisma.user.update({
      where: { email: user.email },
      data: { password: password }
    })
  }

  // Force re-login with new credentials for clean session
  await supabase.auth.signOut()
  redirect('/login?message=Password updated. Please log in.')
}
