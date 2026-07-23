// AbroadSync Service Worker for Web Push Notifications

self.addEventListener('push', function (event) {
  if (!event.data) return

  try {
    const payload = event.data.json()
    const title = payload.title || 'AbroadSync Notification'
    const options = {
      body: payload.body || '',
      icon: payload.icon || '/icon.jpg',
      badge: payload.badge || '/icon.jpg',
      data: {
        url: payload.url || '/dashboard',
      },
      tag: payload.tag || 'abroadsync-notification',
      renotify: true,
      vibrate: [100, 50, 100],
    }

    event.waitUntil(self.registration.showNotification(title, options))
  } catch (err) {
    console.error('Push notification error:', err)
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if ('focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
