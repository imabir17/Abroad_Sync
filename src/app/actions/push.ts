'use server'

import webpush from 'web-push'
import { getUserSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

let vapidKeys: { publicKey: string; privateKey: string }
try {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    vapidKeys = {
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    }
  } else {
    vapidKeys = webpush.generateVAPIDKeys()
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@abroadsync.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
} catch (e) {
  vapidKeys = webpush.generateVAPIDKeys()
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:support@abroadsync.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    )
  } catch (err) {
    console.error('VAPID setup failed:', err)
  }
}

export async function getVapidPublicKey() {
  return { publicKey: vapidKeys.publicKey }
}

export async function savePushSubscription(subscription: {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return { error: 'Invalid push subscription payload.' }
  }

  const admin = createAdminClient()

  const { error } = await admin.from('PushSubscription').upsert(
    {
      companyId: user.companyId,
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: 'endpoint' }
  )

  if (error) {
    console.error('Error saving push subscription:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function removePushSubscription(endpoint: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  await admin.from('PushSubscription').delete().eq('endpoint', endpoint).eq('userId', user.id)

  return { success: true }
}

export async function getPushSubscriptionStatus() {
  const user = await getUserSession()
  if (!user) return { isSubscribed: false }

  const admin = createAdminClient()
  const { data: subs } = await admin
    .from('PushSubscription')
    .select('id')
    .eq('userId', user.id)

  return { isSubscribed: Boolean(subs && subs.length > 0) }
}

export async function sendPushNotification(
  userIds: string | string[],
  payload: { title: string; body: string; url?: string; tag?: string }
) {
  try {
    const admin = createAdminClient()
    const targetIds = Array.isArray(userIds) ? userIds : [userIds]

    if (targetIds.length === 0) return

    const { data: subs } = await admin
      .from('PushSubscription')
      .select('*')
      .in('userId', targetIds)

    if (!subs || subs.length === 0) return

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/dashboard',
      tag: payload.tag || 'abroadsync-push',
    })

    const expiredEndpoints: string[] = []

    await Promise.all(
      subs.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        try {
          await webpush.sendNotification(pushSubscription, pushPayload)
        } catch (err: any) {
          console.error(`Failed push to endpoint ${sub.endpoint}:`, err)
          if (err.statusCode === 404 || err.statusCode === 410) {
            expiredEndpoints.push(sub.endpoint)
          }
        }
      })
    )

    if (expiredEndpoints.length > 0) {
      await admin.from('PushSubscription').delete().in('endpoint', expiredEndpoints)
    }
  } catch (err) {
    console.error('Error sending push notifications:', err)
  }
}
