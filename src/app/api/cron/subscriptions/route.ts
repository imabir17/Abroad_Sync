import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = createAdminClient()
  const now = new Date()

  try {
    const { data: subs, error } = await admin
      .from('Subscription')
      .select('*, company:Company(*)')
      .in('status', ['active', 'grace'])
      .not('currentPeriodEnd', 'is', null)

    if (error) {
      await logCronExecution(admin, 'failed', 0, { error: error.message })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let processedCount = 0

    for (const sub of subs || []) {
      const periodEnd = new Date(sub.currentPeriodEnd)
      const daysLeft = Math.ceil((periodEnd.getTime() - now.getTime()) / 86400000)

      if (daysLeft === 7) await notifyOnce(admin, sub, '7_day')
      if (daysLeft === 3) await notifyOnce(admin, sub, '3_day')
      if (daysLeft === 1) await notifyOnce(admin, sub, '24_hour')

      // Period lapsed — enter grace period
      if (daysLeft <= 0 && sub.status === 'active') {
        const graceEndsAt = new Date(periodEnd.getTime() + 3 * 86400000).toISOString()
        await admin
          .from('Subscription')
          .update({
            status: 'grace',
            graceEndsAt,
          })
          .eq('id', sub.id)

        await notifyOnce(admin, sub, 'grace_started')
      }

      // Grace period expired — auto-suspend
      if (sub.status === 'grace' && sub.graceEndsAt && new Date(sub.graceEndsAt) < now) {
        await admin
          .from('Subscription')
          .update({ status: 'suspended' })
          .eq('id', sub.id)

        await notifyOnce(admin, sub, 'suspended')
      }

      processedCount++
    }

    await logCronExecution(admin, 'success', processedCount, { timestamp: now.toISOString() })

    return NextResponse.json({
      success: true,
      processedSubscriptions: processedCount,
      timestamp: now.toISOString(),
    })
  } catch (err: any) {
    console.error('Subscription cron error:', err)
    await logCronExecution(admin, 'failed', 0, { errorMessage: err.message || 'Cron execution failed' })
    return NextResponse.json({ error: err.message || 'Cron execution failed' }, { status: 500 })
  }
}

async function notifyOnce(admin: any, sub: any, type: string) {
  const today = new Date().toISOString().slice(0, 10)
  const { data: already } = await admin
    .from('SubscriptionNotification')
    .select('id')
    .eq('subscriptionId', sub.id)
    .eq('type', type)
    .gte('sentAt', `${today}T00:00:00Z`)
    .maybeSingle()

  if (already) return

  await admin.from('SubscriptionNotification').insert({
    subscriptionId: sub.id,
    type,
  })

  await admin.from('ActivityLog').insert({
    companyId: sub.companyId,
    action: `subscription.${type}`,
    entityType: 'Subscription',
    entityId: sub.id,
    metadata: { status: sub.status, currentPeriodEnd: sub.currentPeriodEnd },
  })
}

async function logCronExecution(admin: any, status: string, processedCount: number, details: any) {
  try {
    await admin.from('CronLog').insert({
      jobName: 'subscriptions',
      status,
      processedCount,
      details,
      errorMessage: details?.error || details?.errorMessage || null,
    })
  } catch (err) {
    console.error('Failed to log cron execution:', err)
  }
}
