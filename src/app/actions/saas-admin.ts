'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getUserSession, PLATFORM_ADMIN_EMAILS } from '@/lib/auth'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Helper: Ensure user is a platform owner
export async function verifyPlatformAdmin() {
  const user = await getUserSession()
  if (!user || !user.email || !PLATFORM_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    throw new Error('Unauthorized: Platform owner privileges required.')
  }
  return user
}

// Audit Logger
export async function logSaasAdminAction(
  action: string,
  targetType: string,
  targetId?: string | null,
  changes?: any
) {
  try {
    const adminUser = await verifyPlatformAdmin()
    const admin = createAdminClient()
    await admin.from('SaasAdminAuditLog').insert({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action,
      targetType,
      targetId: targetId || null,
      changes: changes || null,
    })
  } catch (err) {
    console.error('Failed to write SaasAdminAuditLog:', err)
  }
}

// --- IMPERSONATION MODE ---

export async function startImpersonation(companyId: string) {
  try {
    const adminUser = await verifyPlatformAdmin()
    const cookieStore = await cookies()

    cookieStore.set('abroadsync_impersonate_company_id', companyId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    await logSaasAdminAction('impersonation.started', 'Company', companyId)
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to start impersonation.' }
  }
}

export async function stopImpersonation() {
  try {
    const adminUser = await verifyPlatformAdmin()
    const cookieStore = await cookies()

    const currentImpId = cookieStore.get('abroadsync_impersonate_company_id')?.value
    cookieStore.delete('abroadsync_impersonate_company_id')

    if (currentImpId) {
      await logSaasAdminAction('impersonation.ended', 'Company', currentImpId)
    }
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to stop impersonation.' }
  }
}

// --- TENANT DIRECTORY & NOTES ---

export async function getTenantFullDetails(companyId: string) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const [companyRes, subRes, usersRes, leadsRes, notesRes, paymentsRes] = await Promise.all([
    admin.from('Company').select('*').eq('id', companyId).single(),
    admin.from('Subscription').select('*, plan:Plan(*)').eq('companyId', companyId).maybeSingle(),
    admin.from('User').select('*').eq('companyId', companyId),
    admin.from('Lead').select('id, createdAt').eq('companyId', companyId),
    admin.from('TenantNote').select('*').eq('companyId', companyId).order('createdAt', { ascending: false }),
    admin.from('Payment').select('*, plan:Plan(*)').eq('companyId', companyId).order('createdAt', { ascending: false }),
  ])

  const users = usersRes.data || []
  const activeUsersCount = users.filter((u) => u.status === 'Active').length
  const leads = leadsRes.data || []
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyLeadsCount = leads.filter((l) => new Date(l.createdAt) >= firstOfMonth).length

  return {
    company: companyRes.data,
    subscription: subRes.data,
    users,
    activeUsersCount,
    totalLeadsCount: leads.length,
    monthlyLeadsCount,
    notes: notesRes.data || [],
    payments: paymentsRes.data || [],
  }
}

export async function addTenantNote(companyId: string, content: string, isPinned = false) {
  const adminUser = await verifyPlatformAdmin()
  const admin = createAdminClient()

  if (!content.trim()) return { error: 'Note content cannot be empty.' }

  const { data: note, error } = await admin
    .from('TenantNote')
    .insert({
      companyId,
      authorId: adminUser.id,
      authorEmail: adminUser.email,
      content: content.trim(),
      isPinned,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await logSaasAdminAction('tenant_note.created', 'Company', companyId, { content, isPinned })
  revalidatePath('/saas-admin')
  return { success: true, note }
}

export async function deleteTenantNote(noteId: string) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('TenantNote').delete().eq('id', noteId)
  if (error) return { error: error.message }

  await logSaasAdminAction('tenant_note.deleted', 'TenantNote', noteId)
  revalidatePath('/saas-admin')
  return { success: true }
}

// --- PLAN CRUD ---

export async function createPlan(data: {
  name: string
  billingCycle: string
  priceUsd: number
  setupFeeUsd: number
  userLimit: number | null
  leadLimitPerMonth: number | null
  isPublic: boolean
  isActive: boolean
}) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  if (!data.name.trim()) return { error: 'Plan name is required.' }

  const { data: plan, error } = await admin
    .from('Plan')
    .insert({
      name: data.name.trim(),
      billingCycle: data.billingCycle,
      priceUsd: data.priceUsd,
      setupFeeUsd: data.setupFeeUsd,
      userLimit: data.userLimit,
      leadLimitPerMonth: data.leadLimitPerMonth,
      isPublic: data.isPublic,
      isActive: data.isActive,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await logSaasAdminAction('plan.created', 'Plan', plan.id, data)
  revalidatePath('/saas-admin')
  revalidatePath('/dashboard/billing')
  return { success: true, plan }
}

export async function updatePlan(
  planId: string,
  data: {
    name?: string
    billingCycle?: string
    priceUsd?: number
    setupFeeUsd?: number
    userLimit?: number | null
    leadLimitPerMonth?: number | null
    isPublic?: boolean
    isActive?: boolean
  }
) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('Plan').update(data).eq('id', planId)
  if (error) return { error: error.message }

  await logSaasAdminAction('plan.updated', 'Plan', planId, data)
  revalidatePath('/saas-admin')
  revalidatePath('/dashboard/billing')
  return { success: true }
}

export async function togglePlanActive(planId: string, isActive: boolean) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('Plan').update({ isActive }).eq('id', planId)
  if (error) return { error: error.message }

  await logSaasAdminAction('plan.status_toggled', 'Plan', planId, { isActive })
  revalidatePath('/saas-admin')
  revalidatePath('/dashboard/billing')
  return { success: true }
}

// --- BULK PAYMENT CONFIRMATION ---

export async function bulkConfirmPayments(paymentIds: string[]) {
  const adminUser = await verifyPlatformAdmin()
  const admin = createAdminClient()

  if (!paymentIds || paymentIds.length === 0) return { error: 'No payments selected.' }

  let confirmedCount = 0
  const errors: string[] = []

  for (const paymentId of paymentIds) {
    const { data: payment } = await admin.from('Payment').select('*, Plan(*)').eq('id', paymentId).single()
    if (!payment || payment.status !== 'pending') continue

    const isYearly = payment.Plan?.billingCycle === 'yearly'
    const now = new Date()
    const endDate = new Date(now)
    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    const { error: subErr } = await admin
      .from('Subscription')
      .update({
        planId: payment.planId,
        status: 'active',
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: endDate.toISOString(),
        graceEndsAt: null,
        setupFeePaid: payment.includesSetupFee ? true : undefined,
      })
      .eq('id', payment.subscriptionId)

    if (subErr) {
      errors.push(`Payment ${paymentId}: ${subErr.message}`)
      continue
    }

    await admin
      .from('Payment')
      .update({
        status: 'confirmed',
        reviewedById: adminUser.id,
        reviewedAt: now.toISOString(),
      })
      .eq('id', paymentId)

    confirmedCount++
  }

  await logSaasAdminAction('payments.bulk_confirmed', 'Payment', null, {
    totalRequested: paymentIds.length,
    confirmedCount,
    errors,
  })

  revalidatePath('/saas-admin')
  revalidatePath('/dashboard/billing')

  return { success: true, confirmedCount, errors }
}

// --- COUPON MANAGEMENT ---

export async function createCoupon(data: {
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  maxUses?: number | null
  validUntil?: string | null
}) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const cleanCode = data.code.trim().toUpperCase()
  if (!cleanCode) return { error: 'Coupon code is required.' }

  const { data: coupon, error } = await admin
    .from('Coupon')
    .insert({
      code: cleanCode,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses || null,
      validUntil: data.validUntil || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await logSaasAdminAction('coupon.created', 'Coupon', coupon.id, data)
  revalidatePath('/saas-admin')
  return { success: true, coupon }
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('Coupon').update({ isActive }).eq('id', couponId)
  if (error) return { error: error.message }

  await logSaasAdminAction('coupon.status_toggled', 'Coupon', couponId, { isActive })
  revalidatePath('/saas-admin')
  return { success: true }
}

export async function fetchSaasAdminLogs(limit = 100) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { data } = await admin
    .from('SaasAdminAuditLog')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(limit)

  return data || []
}

export async function fetchCronLogs(limit = 50) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { data } = await admin
    .from('CronLog')
    .select('*')
    .order('executedAt', { ascending: false })
    .limit(limit)

  return data || []
}
