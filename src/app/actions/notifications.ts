'use server'

import { getUserSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification } from './push'

export async function getUserNotifications() {
  const user = await getUserSession()
  if (!user) return { notifications: [], unreadCount: 0 }

  try {
    const admin = createAdminClient()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Clean up notifications older than 30 days asynchronously
    try {
      await admin
        .from('Notification')
        .delete()
        .eq('userId', user.id)
        .lt('createdAt', thirtyDaysAgo)
    } catch (err) {
      // Ignore cleanup error if table doesn't exist yet
    }

    const { data: notifications, error } = await admin
      .from('Notification')
      .select('*')
      .eq('userId', user.id)
      .gte('createdAt', thirtyDaysAgo)
      .order('createdAt', { ascending: false })
      .limit(100)

    if (error) {
      return { notifications: [], unreadCount: 0 }
    }

    const unreadCount = (notifications || []).filter((n) => !n.isRead).length
    return { notifications: notifications || [], unreadCount }
  } catch (err) {
    return { notifications: [], unreadCount: 0 }
  }
}

export async function markNotificationAsRead(id: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  try {
    const admin = createAdminClient()
    await admin.from('Notification').update({ isRead: true }).eq('id', id).eq('userId', user.id)
  } catch (err) {
    // Ignore error if table is missing
  }

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  try {
    const admin = createAdminClient()
    await admin.from('Notification').update({ isRead: true }).eq('userId', user.id).eq('isRead', false)
  } catch (err) {
    // Ignore error if table is missing
  }

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

    try {
      await admin.from('Notification').insert(rows)
    } catch (dbErr) {
      console.warn('Could not insert Notification row (table may need migration):', dbErr)
    }

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
    const { data: leads, error } = await admin
      .from('Lead')
      .select('id, fullName, companyId, assignedCounselorId, contactedAt, createdAt, stage')
      .neq('stage', 'Enrolled')

    if (error || !leads || leads.length === 0) return { checkedCount: 0, alertsSent: 0 }

    let alertsSent = 0

    for (const lead of leads) {
      const lastContact = lead.contactedAt || lead.createdAt
      const contactDate = new Date(lastContact)

      const daysDiff = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 3600 * 24))

      if (daysDiff >= 30) {
        let existing30d: any[] = []
        try {
          const res = await admin
            .from('Notification')
            .select('id')
            .eq('type', 'inactivity_30d')
            .eq('url', `/dashboard/leads/${lead.id}`)
            .gte('createdAt', sevenDaysAgo)
            .limit(1)
          existing30d = res.data || []
        } catch (e) {}

        if (existing30d.length === 0) {
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
        let existing7d: any[] = []
        try {
          const res = await admin
            .from('Notification')
            .select('id')
            .eq('type', 'inactivity_7d')
            .eq('url', `/dashboard/leads/${lead.id}`)
            .gte('createdAt', new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1)
          existing7d = res.data || []
        } catch (e) {}

        if (existing7d.length === 0) {
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
