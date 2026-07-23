'use server'

import { getUserSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from './push'
import { revalidatePath } from 'next/cache'

export async function getUserNotifications() {
  const user = await getUserSession()
  if (!user) return { notifications: [], unreadCount: 0 }

  const admin = createAdminClient()

  // 30 days cutoff
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Clean up notifications older than 30 days asynchronously
  try {
    await admin
      .from('Notification')
      .delete()
      .eq('userId', user.id)
      .lt('createdAt', thirtyDaysAgo)
  } catch (err) {
    // Ignore cleanup error
  }

  const { data: notifications } = await admin
    .from('Notification')
    .select('*')
    .eq('userId', user.id)
    .gte('createdAt', thirtyDaysAgo)
    .order('createdAt', { ascending: false })
    .limit(100)

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length

  return { notifications: notifications || [], unreadCount }
}

export async function markNotificationAsRead(id: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  await admin.from('Notification').update({ isRead: true }).eq('id', id).eq('userId', user.id)

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  await admin.from('Notification').update({ isRead: true }).eq('userId', user.id).eq('isRead', false)

  return { success: true }
}

export async function dispatchSystemNotification({
  companyId,
  userIds,
  title,
  body,
  url = '/dashboard',
  type = 'info',
}: {
  companyId: string
  userIds: string[]
  title: string
  body: string
  url?: string
  type?: string
}) {
  try {
    const admin = createAdminClient()

    // Superadmins receive ALL company notifications + special alerts
    const { data: superAdmins } = await admin
      .from('User')
      .select('id')
      .eq('companyId', companyId)
      .eq('role', 'Super Admin')
      .eq('status', 'Active')

    const superAdminIds = (superAdmins || []).map((sa) => sa.id)
    const allTargetUserIds = Array.from(new Set([...userIds, ...superAdminIds]))

    if (allTargetUserIds.length === 0) return

    // Insert Notification rows for all target users
    const rows = allTargetUserIds.map((userId) => ({
      companyId,
      userId,
      title,
      body,
      url,
      type,
      isRead: false,
    }))

    await admin.from('Notification').insert(rows)

    // Trigger Web Push Notification
    await sendPushNotification(allTargetUserIds, { title, body, url })
  } catch (err) {
    console.error('Failed to dispatch system notification:', err)
  }
}

export async function checkLeadInactivityAlerts() {
  try {
    const admin = createAdminClient()
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch active non-enrolled leads
    const { data: leads } = await admin
      .from('Lead')
      .select('id, fullName, companyId, assignedCounselorId, contactedAt, createdAt, stage')
      .neq('stage', 'Enrolled')

    if (!leads || leads.length === 0) return { checkedCount: 0, alertsSent: 0 }

    let alertsSent = 0

    for (const lead of leads) {
      const lastContact = lead.contactedAt || lead.createdAt
      const contactDate = new Date(lastContact)

      const daysDiff = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 3600 * 24))

      if (daysDiff >= 30) {
        // Check if 30d inactivity notification was sent in last 7 days
        const { data: existing30d } = await admin
          .from('Notification')
          .select('id')
          .eq('type', 'inactivity_30d')
          .eq('url', `/dashboard/leads/${lead.id}`)
          .gte('createdAt', sevenDaysAgo)
          .limit(1)

        if (!existing30d || existing30d.length === 0) {
          const targetUsers = lead.assignedCounselorId ? [lead.assignedCounselorId] : []
          await dispatchSystemNotification({
            companyId: lead.companyId,
            userIds: targetUsers,
            title: `🚨 Critical Lead Inactivity (30 Days)`,
            body: `Student ${lead.fullName} has not been contacted in over ${daysDiff} days.`,
            url: `/dashboard/leads/${lead.id}`,
            type: 'inactivity_30d',
          })
          alertsSent++
        }
      } else if (daysDiff >= 7) {
        // Check if 7d inactivity notification was sent in last 5 days
        const { data: existing7d } = await admin
          .from('Notification')
          .select('id')
          .eq('type', 'inactivity_7d')
          .eq('url', `/dashboard/leads/${lead.id}`)
          .gte('createdAt', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1)

        if (!existing7d || existing7d.length === 0) {
          const targetUsers = lead.assignedCounselorId ? [lead.assignedCounselorId] : []
          await dispatchSystemNotification({
            companyId: lead.companyId,
            userIds: targetUsers,
            title: `⚠️ Lead Inactivity Notice (7 Days)`,
            body: `Student ${lead.fullName} has not been contacted for ${daysDiff} days.`,
            url: `/dashboard/leads/${lead.id}`,
            type: 'inactivity_7d',
          })
          alertsSent++
        }
      }
    }

    return { checkedCount: leads.length, alertsSent }
  } catch (err) {
    console.error('Error running inactivity alerts:', err)
    return { error: 'Failed to run inactivity alerts' }
  }
}
