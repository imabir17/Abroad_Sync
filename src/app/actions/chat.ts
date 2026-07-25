'use server'

import { getUserSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { dispatchSystemNotification } from '@/app/actions/notifications'

export async function getCompanyChatUsers() {
  const user = await getUserSession()
  if (!user) return { users: [], currentUser: null }

  try {
    const admin = createAdminClient()

    // Fetch company users
    const { data: users, error } = await admin
      .from('User')
      .select('id, fullName, email, role, status, lastSeenAt, createdAt')
      .eq('companyId', user.companyId)
      .neq('id', user.id)
      .order('fullName', { ascending: true })

    if (error || !users) return { users: [], currentUser: user }

    // Fetch latest messages & unread counts for 1-on-1 chats involving current user
    const { data: allMessages } = await admin
      .from('ChatMessage')
      .select('id, senderId, receiverId, content, isRead, createdAt')
      .eq('companyId', user.companyId)
      .or(`senderId.eq.${user.id},receiverId.eq.${user.id}`)
      .order('createdAt', { ascending: false })
      .limit(500)

    const lastMessageMap: Record<string, { content: string; createdAt: string }> = {}
    const unreadMap: Record<string, number> = {}

    ;(allMessages || []).forEach((m: any) => {
      const otherId = m.senderId === user.id ? m.receiverId : m.senderId
      if (!otherId) return

      if (m.receiverId === user.id && !m.isRead) {
        unreadMap[otherId] = (unreadMap[otherId] || 0) + 1
      }

      if (!lastMessageMap[otherId]) {
        lastMessageMap[otherId] = {
          content: m.content,
          createdAt: m.createdAt,
        }
      }
    })

    const usersWithMetadata = users.map((u: any) => ({
      ...u,
      unreadCount: unreadMap[u.id] || 0,
      lastMessage: lastMessageMap[u.id]?.content || '',
      lastMessageAt: lastMessageMap[u.id]?.createdAt || u.createdAt,
    }))

    // Sort contacts by latest message timestamp descending (WhatsApp style)
    usersWithMetadata.sort(
      (a: any, b: any) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )

    return { users: usersWithMetadata, currentUser: user }
  } catch (err) {
    console.error('Error fetching chat users:', err)
    return { users: [], currentUser: user }
  }
}

export async function getCompanyChannels() {
  const user = await getUserSession()
  if (!user) return { channels: [] }

  try {
    const admin = createAdminClient()

    let { data: channels, error } = await admin
      .from('ChatChannel')
      .select('*')
      .eq('companyId', user.companyId)
      .order('createdAt', { ascending: true })

    if (error) {
      console.warn('ChatChannel fetch error (table may need migration):', error)
      return { channels: [] }
    }

    // Auto-create default #general channel if no channels exist
    if (!channels || channels.length === 0) {
      const { data: newChan } = await admin
        .from('ChatChannel')
        .insert({
          companyId: user.companyId,
          name: 'general',
          description: 'Company-wide general discussions',
          createdById: user.id,
        })
        .select()
        .single()

      if (newChan) channels = [newChan]
    }

    return { channels: channels || [] }
  } catch (err) {
    console.error('Error fetching company channels:', err)
    return { channels: [] }
  }
}

export async function getChatMessages({
  receiverId,
  channelId,
}: {
  receiverId?: string
  channelId?: string
}) {
  const user = await getUserSession()
  if (!user) return { messages: [] }

  try {
    const admin = createAdminClient()

    if (channelId) {
      const { data: messages, error } = await admin
        .from('ChatMessage')
        .select('*, sender:User!ChatMessage_senderId_fkey(id, fullName, role, email)')
        .eq('companyId', user.companyId)
        .eq('channelId', channelId)
        .order('createdAt', { ascending: true })
        .limit(200)

      if (error) return { messages: [] }
      return { messages: messages || [] }
    }

    if (receiverId) {
      // 1-on-1 Direct Messages
      const { data: messages, error } = await admin
        .from('ChatMessage')
        .select('*, sender:User!ChatMessage_senderId_fkey(id, fullName, role, email)')
        .eq('companyId', user.companyId)
        .or(
          `and(senderId.eq.${user.id},receiverId.eq.${receiverId}),and(senderId.eq.${receiverId},receiverId.eq.${user.id})`
        )
        .order('createdAt', { ascending: true })
        .limit(200)

      if (error) return { messages: [] }
      return { messages: messages || [] }
    }

    return { messages: [] }
  } catch (err) {
    console.error('Error fetching chat messages:', err)
    return { messages: [] }
  }
}

export async function sendChatMessage({
  receiverId,
  channelId,
  content,
  attachmentUrl,
  attachmentName,
  attachmentType,
}: {
  receiverId?: string
  channelId?: string
  content: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentType?: string
}) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  if (!content.trim() && !attachmentUrl) {
    return { error: 'Message content or attachment is required.' }
  }

  try {
    const admin = createAdminClient()

    const { data: message, error } = await admin
      .from('ChatMessage')
      .insert({
        companyId: user.companyId,
        senderId: user.id,
        receiverId: receiverId || null,
        channelId: channelId || null,
        content: content.trim(),
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        attachmentType: attachmentType || null,
        isRead: false,
      })
      .select('*, sender:User!ChatMessage_senderId_fkey(id, fullName, role, email)')
      .single()

    if (error) {
      console.error('Error inserting chat message:', error)
      return { error: 'Failed to send message: ' + error.message }
    }

    // Trigger System & Push Notification for 1-on-1 direct message
    if (receiverId && receiverId !== user.id) {
      const senderName = user.fullName || user.email || 'A colleague'
      await dispatchSystemNotification({
        companyId: user.companyId,
        userIds: [receiverId],
        title: `💬 New Message from ${senderName}`,
        body: content.trim() ? content.trim().slice(0, 100) : 'Sent an attachment',
        url: `/dashboard/chat?user=${user.id}`,
        type: 'chat_message',
        actorId: user.id,
      })
    }

    return { success: true, message }
  } catch (err: any) {
    console.error('sendChatMessage error:', err)
    return { error: err.message || 'Failed to send message' }
  }
}

export async function markChatMessagesAsRead({
  senderId,
  channelId,
}: {
  senderId?: string
  channelId?: string
}) {
  const user = await getUserSession()
  if (!user) return { success: false }

  try {
    const admin = createAdminClient()

    if (senderId) {
      await admin
        .from('ChatMessage')
        .update({ isRead: true })
        .eq('companyId', user.companyId)
        .eq('senderId', senderId)
        .eq('receiverId', user.id)
        .eq('isRead', false)
    }

    return { success: true }
  } catch (err) {
    console.error('markChatMessagesAsRead error:', err)
    return { success: false }
  }
}

export async function createChatChannel(name: string, description?: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Not authenticated' }

  const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '')
  if (!cleanName) return { error: 'Invalid channel name.' }

  try {
    const admin = createAdminClient()

    const { data: channel, error } = await admin
      .from('ChatChannel')
      .insert({
        companyId: user.companyId,
        name: cleanName,
        description: description || '',
        createdById: user.id,
      })
      .select()
      .single()

    if (error) return { error: 'Failed to create channel: ' + error.message }
    return { success: true, channel }
  } catch (err: any) {
    return { error: err.message || 'Failed to create channel' }
  }
}

export async function updateUserLastSeen() {
  const user = await getUserSession()
  if (!user) return { success: false }

  try {
    const admin = createAdminClient()
    await admin
      .from('User')
      .update({ lastSeenAt: new Date().toISOString() })
      .eq('id', user.id)
    return { success: true }
  } catch (err) {
    return { success: false }
  }
}

export async function getUnreadChatCount() {
  const user = await getUserSession()
  if (!user) return { unreadChatCount: 0 }

  try {
    const admin = createAdminClient()
    const { count, error } = await admin
      .from('ChatMessage')
      .select('id', { count: 'exact', head: true })
      .eq('companyId', user.companyId)
      .eq('receiverId', user.id)
      .eq('isRead', false)

    if (error) return { unreadChatCount: 0 }
    return { unreadChatCount: count || 0 }
  } catch (err) {
    return { unreadChatCount: 0 }
  }
}

