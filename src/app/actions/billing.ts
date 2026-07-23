'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getSubscriptionDetails() {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  if (user.role === 'Counselor') {
    return { error: 'Access denied: Counselors do not have permission to access billing.' }
  }

  const admin = createAdminClient()

  // Get current subscription & plan
  const { data: subscription } = await admin
    .from('Subscription')
    .select('*, plan:Plan(*), branch:Branch(*)')
    .eq('companyId', user.companyId)
    .maybeSingle()

  // Get public active plans
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

export async function validateCoupon(code: string, planId: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) return { error: 'Please enter a coupon code.' }

  const admin = createAdminClient()

  const { data: coupon } = await admin
    .from('Coupon')
    .select('*')
    .eq('code', cleanCode)
    .eq('isActive', true)
    .maybeSingle()

  if (!coupon) {
    return { error: 'Invalid or inactive coupon code.' }
  }

  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
    return { error: 'This coupon code has expired.' }
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { error: 'This coupon has reached its maximum usage limit.' }
  }

  const { data: plan } = await admin.from('Plan').select('*').eq('id', planId).maybeSingle()
  if (!plan) return { error: 'Selected plan not found.' }

  let discountAmount = 0
  if (coupon.discountType === 'percent') {
    discountAmount = (Number(plan.priceUsd) * Number(coupon.discountValue)) / 100
  } else {
    discountAmount = Number(coupon.discountValue)
  }

  discountAmount = Math.min(Number(plan.priceUsd), Math.max(0, discountAmount))

  return {
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount: Number(discountAmount.toFixed(2)),
    },
  }
}

export async function submitPayment(
  planId: string,
  method: string,
  transactionNumber: string,
  couponCode?: string
) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }
  if (user.role !== 'Super Admin') {
    return { error: 'Only Super Admins can manage billing & submit payments.' }
  }

  if (!planId || !method || !transactionNumber) {
    return { error: 'Please select a plan, payment method, and enter your transaction ID.' }
  }

  const admin = createAdminClient()

  // Get subscription & current plan details
  const { data: sub } = await admin
    .from('Subscription')
    .select('*, plan:Plan(*)')
    .eq('companyId', user.companyId)
    .single()

  if (!sub) return { error: 'Subscription not found for your company.' }

  // Get target plan details
  const { data: targetPlan } = await admin.from('Plan').select('*').eq('id', planId).single()
  if (!targetPlan) return { error: 'Selected plan not found.' }

  // Logical Setup Fee check:
  // Customers pay setup fee ONLY if switching to monthly AND setup has never been paid AND they were on free tier
  const isExistingPaidCustomer = Boolean(sub.setupFeePaid || (sub.plan && sub.plan.billingCycle !== 'free'))
  const includesSetupFee = targetPlan.billingCycle === 'monthly' && !isExistingPaidCustomer
  const baseSetupFee = includesSetupFee ? Number(targetPlan.setupFeeUsd || 0) : 0
  const basePlanPrice = Number(targetPlan.priceUsd || 0)

  let discountAmount = 0
  let validCoupon: any = null

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase()
    const { data: coupon } = await admin
      .from('Coupon')
      .select('*')
      .eq('code', cleanCode)
      .eq('isActive', true)
      .maybeSingle()

    if (coupon) {
      const isValidDate = !coupon.validUntil || new Date(coupon.validUntil) >= new Date()
      const isUnderLimit = coupon.maxUses === null || coupon.usedCount < coupon.maxUses

      if (isValidDate && isUnderLimit) {
        validCoupon = coupon
        if (coupon.discountType === 'percent') {
          discountAmount = (basePlanPrice * Number(coupon.discountValue)) / 100
        } else {
          discountAmount = Number(coupon.discountValue)
        }
        discountAmount = Math.min(basePlanPrice, Math.max(0, discountAmount))
      }
    }
  }

  const finalAmountUsd = Math.max(0, basePlanPrice + baseSetupFee - discountAmount)

  const { data: payment, error } = await admin
    .from('Payment')
    .insert({
      subscriptionId: sub.id,
      companyId: user.companyId,
      planId: targetPlan.id,
      amountUsd: Number(finalAmountUsd.toFixed(2)),
      includesSetupFee,
      method,
      transactionNumber: transactionNumber.trim(),
      submittedById: user.id,
      status: 'pending',
      couponCode: validCoupon ? validCoupon.code : null,
      discountAmount: Number(discountAmount.toFixed(2)),
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to submit payment: ' + error.message }
  }

  if (validCoupon) {
    await admin
      .from('Coupon')
      .update({ usedCount: (validCoupon.usedCount || 0) + 1 })
      .eq('id', validCoupon.id)
  }

  await admin.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'payment.submitted',
    entityType: 'Payment',
    entityId: payment.id,
    metadata: {
      planName: targetPlan.name,
      amountUsd: finalAmountUsd,
      includesSetupFee,
      method,
      transactionNumber,
      couponCode: validCoupon?.code || null,
      discountAmount,
    },
  })

  revalidatePath('/dashboard/billing')
  return { success: true, payment }
}

// ----------------------------------------------------
// Platform Admin Actions
// ----------------------------------------------------

const PLATFORM_ADMIN_EMAILS = ['sheikhabirrahaman@gmail.com']

async function verifyPlatformAdmin() {
  const user = await getUserSession()
  if (!user || !user.email || !PLATFORM_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    throw new Error('Unauthorized: Platform admin privileges required.')
  }
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
