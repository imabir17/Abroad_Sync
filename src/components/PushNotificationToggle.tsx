'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, BellCheck, Loader2, Check, AlertCircle } from 'lucide-react'
import {
  getVapidPublicKey,
  savePushSubscription,
  removePushSubscription,
  getPushSubscriptionStatus,
} from '@/app/actions/push'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscriptionStatus()
    } else {
      setLoading(false)
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          setIsSubscribed(true)
        }
      }
      const res = await getPushSubscriptionStatus()
      if (res.isSubscribed) {
        setIsSubscribed(true)
      }
    } catch (err) {
      console.error('Error checking subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSubscription = async () => {
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (isSubscribed) {
        // Unsubscribe
        const reg = await navigator.serviceWorker.getRegistration('/sw.js')
        if (reg) {
          const sub = await reg.pushManager.getSubscription()
          if (sub) {
            await removePushSubscription(sub.endpoint)
            await sub.unsubscribe()
          }
        }
        setIsSubscribed(false)
        setSuccessMsg('Push notifications disabled.')
      } else {
        // Subscribe
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setErrorMsg('Notification permission denied. Please allow notifications in browser settings.')
          setLoading(false)
          return
        }

        const reg = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready

        const { publicKey } = await getVapidPublicKey()
        const convertedKey = urlBase64ToUint8Array(publicKey)

        let sub = await reg.pushManager.getSubscription()
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          })
        }

        const subJson = sub.toJSON()
        const res = await savePushSubscription({
          endpoint: subJson.endpoint!,
          keys: {
            p256dh: subJson.keys!.p256dh!,
            auth: subJson.keys!.auth!,
          },
        })

        if (res.error) {
          setErrorMsg(res.error)
        } else {
          setIsSubscribed(true)
          setSuccessMsg('Push notifications enabled successfully!')
        }
      }
    } catch (err: any) {
      console.error('Push subscription error:', err)
      setErrorMsg(err.message || 'Failed to toggle push notifications.')
    } finally {
      setLoading(false)
      setTimeout(() => {
        setSuccessMsg('')
        setErrorMsg('')
      }, 4000)
    }
  }

  if (!isSupported) {
    return (
      <div className="text-[11px] text-gray-500 font-semibold italic flex items-center gap-1">
        <Bell className="w-3.5 h-3.5 opacity-50" /> Push notifications not supported on this browser.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleToggleSubscription}
        disabled={loading}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
          isSubscribed
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
            : 'bg-[#007ACC] text-white hover:bg-[#0062A3]'
        } disabled:opacity-50`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <BellCheck className="w-4 h-4 text-emerald-400" />
        ) : (
          <BellRing className="w-4 h-4" />
        )}
        <span>{isSubscribed ? 'Push Notifications Active' : 'Enable Push Notifications'}</span>
      </button>

      {successMsg && (
        <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="text-[11px] font-bold text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
        </div>
      )}
    </div>
  )
}
