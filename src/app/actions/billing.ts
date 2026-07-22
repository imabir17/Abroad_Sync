'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getSubscriptionDetails() {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Get current subscription & plan
  const { data: subscription } = await admin
    .from('Subscription')
    .select('*, plan:Plan(*), branch:Branch(*)')
    .eq('companyId', user.companyId)
    .maybeSingle()

  // Get public plans
  const { data: plans } = await admin
    .from('Plan')
    .select('*')
    .eq('isActive', true)
    .eq('isPublic', true)
    .order('priceUsd', { ascending: true })

  // Get payment method configs
  const { data: paymentMethods } = await admin
    .from('PaymentMethodConfig')
    .select('*')
    .eq('isActive', true)

  // Get payment history
  const { data: payments } = await admin
    .from('Payment')
    .select('*, plan:Plan(*)')
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })

  // Usage stats: Seats (Active Users + Pending Invites)
  const [usersCountRes, invitesCountRes, leadsCountRes] = await Promise.all([
    admin.from('User').select('*', { count: 'exact', head: true }).eq('companyId', user.companyId).eq('status', 'Active'),
    admin.from('Invite').select('*', { count: 'exact', head: true }).eq('companyId', user.companyId).eq('status', 'Pending'),
    admin
      .from('Lead')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', user.companyId)
      .gte('createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  const activeSeats = (usersCountRes.count ?? 0) + (invitesCountRes.count ?? 0)
  const monthlyLeads = leadsCountRes.count ?? 0

  return {
    subscription,
    plans: plans || [],
    paymentMethods: paymentMethods || [],
    payments: payments || [],
    usage: {
      activeSeats,
      monthlyLeads,
    },
    userRole: user.role,
  }
}

export async function submitPayment(planId: string, method: string, transactionNumber: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }
  if (user.role !== 'Super Admin') {
    return { error: 'Only Super Admins can manage billing & submit payments.' }
  }

  if (!planId || !method || !transactionNumber) {
    return { error: 'Please select a plan, payment method, and enter your transaction ID.' }
  }

  const admin = createAdminClient()

  // Get subscription
  const { data: sub } = await admin
    .from('Subscription')
    .select('id, companyId')
    .eq('companyId', user.companyId)
    .single()

  if (!sub) return { error: 'Subscription not found for your company.' }

  // Get target plan details
  const { data: plan } = await admin.from('Plan').select('*').eq('id', planId).single()
  if (!plan) return { error: 'Selected plan not found.' }

  // Monthly plans include setup fee if not previously paid; yearly waives setup fee
  const includesSetupFee = plan.billingCycle === 'monthly'
  const amountUsd = Number(plan.priceUsd) + (includesSetupFee ? Number(plan.setupFeeUsd) : 0)

  const { data: payment, error } = await admin
    .from('Payment')
    .insert({
      subscriptionId: sub.id,
      companyId: user.companyId,
      planId: plan.id,
      amountUsd,
      includesSetupFee,
      method,
      transactionNumber: transactionNumber.trim(),
      submittedById: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to submit payment: ' + error.message }
  }

  await admin.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'payment.submitted',
    entityType: 'Payment',
    entityId: payment.id,
    metadata: { planName: plan.name, amountUsd, method, transactionNumber },
  })

  revalidatePath('/dashboard/billing')
  return { success: true, payment }
}

// ----------------------------------------------------
// Platform Admin Actions
// ----------------------------------------------------

async function verifyPlatformAdmin() {
  const user = await getUserSession()
  if (!user) throw new Error('Not authenticated')
  // In production, restrict to allowed admin emails or Super Admin role
  return user
}

export async function confirmPayment(paymentId: string) {
  const adminUser = await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { data: payment } = await admin.from('Payment').select('*, Plan(*)').eq('id', paymentId).single()
  if (!payment) return { error: 'Payment record not found.' }

  const isYearly = payment.Plan.billingCycle === 'yearly'
  const now = new Date()
  const endDate = new Date(now)
  if (isYearly) {
    endDate.setFullYear(endDate.getFullYear() + 1)
  } else {
    endDate.setMonth(endDate.getMonth() + 1)
  }

  // Update subscription to active and extend period
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

  if (subErr) return { error: 'Failed to update subscription: ' + subErr.message }

  // Update payment status to confirmed
  await admin
    .from('Payment')
    .update({
      status: 'confirmed',
      reviewedById: adminUser.id,
      reviewedAt: now.toISOString(),
    })
    .eq('id', paymentId)

  await admin.from('ActivityLog').insert({
    companyId: payment.companyId,
    actorId: adminUser.id,
    action: 'payment.confirmed',
    entityType: 'Payment',
    entityId: paymentId,
    metadata: { amountUsd: payment.amountUsd, planName: payment.Plan.name },
  })

  revalidatePath('/saas-admin')
  revalidatePath('/dashboard/billing')
  return { success: true }
}

export async function rejectPayment(paymentId: string, reason: string) {
  const adminUser = await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { data: payment } = await admin.from('Payment').select('*').eq('id', paymentId).single()
  if (!payment) return { error: 'Payment not found.' }

  await admin
    .from('Payment')
    .update({
      status: 'rejected',
      reviewNotes: reason,
      reviewedById: adminUser.id,
      reviewedAt: new Date().toISOString(),
    })
    .eq('id', paymentId)

  revalidatePath('/saas-admin')
  revalidatePath('/dashboard/billing')
  return { success: true }
}

export async function updateSubscriptionOverride(
  subscriptionId: string,
  overrideUserLimit: number | null,
  overrideLeadLimit: number | null,
  isCustom: boolean
) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('Subscription')
    .update({
      overrideUserLimit,
      overrideLeadLimit,
      isCustom,
    })
    .eq('id', subscriptionId)

  if (error) return { error: error.message }

  revalidatePath('/saas-admin')
  return { success: true }
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: 'active' | 'grace' | 'suspended' | 'canceled'
) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('Subscription')
    .update({ status })
    .eq('id', subscriptionId)

  if (error) return { error: error.message }

  revalidatePath('/saas-admin')
  return { success: true }
}

export async function updatePaymentMethodConfig(
  id: string,
  number: string,
  accountType: string,
  instructions: string,
  isActive: boolean
) {
  await verifyPlatformAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('PaymentMethodConfig')
    .update({ number, accountType, instructions, isActive })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/saas-admin')
  return { success: true }
}
