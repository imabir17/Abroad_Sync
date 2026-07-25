'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Smile,
  Hash,
  User,
  Shield,
  Clock,
  Check,
  CheckCheck,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Users,
  Lock,
} from 'lucide-react'
import {
  getCompanyChatUsers,
  getCompanyChannels,
  getChatMessages,
  sendChatMessage,
  markChatMessagesAsRead,
  createChatChannel,
  updateUserLastSeen,
} from '@/app/actions/chat'
import { createClient } from '@/utils/supabase/client'

interface SecureChatClientProps {
  initialUsers: any[]
  initialChannels: any[]
  currentUser: any
}

export default function SecureChatClient({
  initialUsers,
  initialChannels,
  currentUser,
}: SecureChatClientProps) {
  const [users, setUsers] = useState<any[]>(initialUsers)
  const [channels, setChannels] = useState<any[]>(initialChannels)
  const [activeTab, setActiveTab] = useState<'direct' | 'channels'>('direct')
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(
    initialUsers.length > 0 ? initialUsers[0] : null
  )
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDesc, setNewChannelDesc] = useState('')

  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const commonEmojis = ['😊', '👍', '🎓', '📌', '🚀', '💡', '📝', '✅', '🔥', '🎉', '❤️', '👏']

  const fetchMessages = async () => {
    if (!selectedRecipient && !selectedChannel) return
    setLoadingMessages(true)
    try {
      const res = await getChatMessages({
        receiverId: selectedRecipient?.id,
        channelId: selectedChannel?.id,
      })
      setMessages(res.messages || [])

      if (selectedRecipient) {
        await markChatMessagesAsRead({ senderId: selectedRecipient.id })
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedRecipient.id ? { ...u, unreadCount: 0 } : u))
        )
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [selectedRecipient?.id, selectedChannel?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Setup Real-time Chat listener via Supabase Broadcast / Postgres Changes
  useEffect(() => {
    const channel = supabase
      .channel(`chat_company_${currentUser.companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ChatMessage',
          filter: `companyId=eq.${currentUser.companyId}`,
        },
        (payload) => {
          const newMsg = payload.new
          // Check if message belongs to active conversation
          if (
            (selectedRecipient &&
              ((newMsg.senderId === selectedRecipient.id && newMsg.receiverId === currentUser.id) ||
                (newMsg.senderId === currentUser.id && newMsg.receiverId === selectedRecipient.id))) ||
            (selectedChannel && newMsg.channelId === selectedChannel.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            if (selectedRecipient && newMsg.senderId === selectedRecipient.id) {
              markChatMessagesAsRead({ senderId: selectedRecipient.id })
            }
          } else {
            // Update unread count for background user
            if (newMsg.senderId !== currentUser.id && newMsg.receiverId === currentUser.id) {
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === newMsg.senderId ? { ...u, unreadCount: (u.unreadCount || 0) + 1 } : u
                )
              )
            }
          }
        }
      )
      .subscribe()

    // Poll every 4 seconds as a fallback
    const interval = setInterval(async () => {
      if (selectedRecipient || selectedChannel) {
        const res = await getChatMessages({
          receiverId: selectedRecipient?.id,
          channelId: selectedChannel?.id,
        })
        if (res.messages && res.messages.length > 0) {
          setMessages(res.messages)
        }
      }
    }, 4000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [selectedRecipient?.id, selectedChannel?.id, currentUser.companyId])

  // Track Real-time Presence (Online / Offline status) & Last Seen
  useEffect(() => {
    const presenceChannel = supabase.channel(`presence_company_${currentUser.companyId}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const onlineIds = new Set<string>()
        Object.keys(state).forEach((key) => {
          onlineIds.add(key)
        })
        setOnlineUserIds(onlineIds)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userId: currentUser.id,
            onlineAt: new Date().toISOString(),
          })
          updateUserLastSeen()
        }
      })

    const heartbeat = setInterval(() => {
      updateUserLastSeen()
    }, 45000)

    return () => {
      supabase.removeChannel(presenceChannel)
      clearInterval(heartbeat)
    }
  }, [currentUser.companyId, currentUser.id])

  const formatLastSeen = (userItem: any) => {
    if (onlineUserIds.has(userItem.id)) {
      return 'Active Now'
    }
    if (!userItem.lastSeenAt) {
      return 'Offline'
    }
    const lastSeenDate = new Date(userItem.lastSeenAt)
    const now = new Date()
    const diffMs = now.getTime() - lastSeenDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 2) return 'Active just now'
    if (diffMins < 60) return `Last seen ${diffMins}m ago`

    const isToday = lastSeenDate.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = lastSeenDate.toDateString() === yesterday.toDateString()

    const timeStr = lastSeenDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    })

    if (isToday) return `Last seen today at ${timeStr}`
    if (isYesterday) return `Last seen yesterday at ${timeStr}`

    return `Last seen ${lastSeenDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} at ${timeStr}`
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!messageText.trim() || sending) return

    const textToSend = messageText.trim()
    setMessageText('')
    setShowEmojiPicker(false)
    setSending(true)

    // Optimistic UI update
    const tempMsg = {
      id: 'temp-' + Date.now(),
      senderId: currentUser.id,
      receiverId: selectedRecipient?.id || null,
      channelId: selectedChannel?.id || null,
      content: textToSend,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        role: currentUser.role,
      },
    }

    setMessages((prev) => [...prev, tempMsg])

    try {
      const res = await sendChatMessage({
        receiverId: selectedRecipient?.id,
        channelId: selectedChannel?.id,
        content: textToSend,
      })

      if (res.error) {
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
        alert(res.error)
      } else if (res.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? res.message : m)))
      }
    } catch (err) {
      console.error('Failed to send chat message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    try {
      const res = await createChatChannel(newChannelName, newChannelDesc)
      if (res.error) {
        alert(res.error)
      } else if (res.channel) {
        setChannels((prev) => [...prev, res.channel])
        setSelectedChannel(res.channel)
        setSelectedRecipient(null)
        setActiveTab('channels')
        setIsCreatingChannel(false)
        setNewChannelName('')
        setNewChannelDesc('')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create channel')
    }
  }

  const filteredUsers = users.filter((u) =>
    (u.fullName || u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-400'
      case 'Manager':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-400'
      default:
        return 'bg-teal-500/15 border-teal-500/30 text-teal-400'
    }
  }

  return (
    <div className="h-[calc(100vh-6rem)] bg-[#1E1E1E] border border-[#3C3C3C] rounded-2xl shadow-2xl flex overflow-hidden text-gray-200 font-sans">
      {/* LEFT SIDEBAR */}
      <div className="w-80 sm:w-96 bg-[#252526] border-r border-[#3C3C3C] flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#3C3C3C] bg-[#1E1E1E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#007ACC] text-white flex items-center justify-center font-extrabold text-sm shadow-md">
              💬
            </div>
            <div>
              <h2 className="font-bold text-white text-base font-display">SecureChat</h2>
              <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Internal Company Network
              </span>
            </div>
          </div>

          {(currentUser.role === 'Super Admin' || currentUser.role === 'Manager') && (
            <button
              onClick={() => setIsCreatingChannel(true)}
              className="p-2 rounded-xl bg-[#252526] border border-[#3C3C3C] hover:bg-[#333333] text-gray-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1 shadow-sm"
              title="Create Channel"
            >
              <Plus className="w-4 h-4 text-[#007ACC]" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-[#3C3C3C] bg-[#252526]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search colleagues or channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#3C3C3C] bg-[#1E1E1E]/50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2.5 border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'direct'
                ? 'border-[#007ACC] text-white bg-[#007ACC]/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Direct Messages ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-2.5 border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'channels'
                ? 'border-[#007ACC] text-white bg-[#007ACC]/10'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> Channels ({filteredChannels.length})
          </button>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#3C3C3C]">
          {activeTab === 'direct' ? (
            filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs font-medium">
                No colleagues found.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedRecipient?.id === u.id && !selectedChannel
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedRecipient(u)
                      setSelectedChannel(null)
                    }}
                    className={`p-3.5 flex items-center gap-3 hover:bg-[#1E1E1E] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#007ACC]/15 border-l-4 border-[#007ACC]' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#333333] border border-[#3C3C3C] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {(u.fullName || u.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#252526] ${
                          onlineUserIds.has(u.id) ? 'bg-emerald-500 shadow-sm' : 'bg-gray-500'
                        }`}
                        title={formatLastSeen(u)}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-xs text-white truncate">
                          {u.fullName || u.email}
                        </h4>
                        {u.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500 text-white rounded-full">
                            {u.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${renderRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role || 'Staff'}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate">{u.email}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )
          ) : filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs font-medium">
              No channels created yet.
            </div>
          ) : (
            filteredChannels.map((c) => {
              const isSelected = selectedChannel?.id === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedChannel(c)
                    setSelectedRecipient(null)
                  }}
                  className={`p-3.5 flex items-center gap-3 hover:bg-[#1E1E1E] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#007ACC]/15 border-l-4 border-[#007ACC]' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#007ACC]/15 border border-[#007ACC]/30 text-[#007ACC] font-bold flex items-center justify-center text-sm shrink-0">
                    #
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">#{c.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{c.description || 'Channel'}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#1E1E1E]">
        {selectedRecipient || selectedChannel ? (
          <>
            {/* Main Header */}
            <div className="p-4 border-b border-[#3C3C3C] bg-[#252526] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {selectedRecipient ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-[#007ACC] text-white font-bold flex items-center justify-center text-sm shadow-md">
                      {(selectedRecipient.fullName || selectedRecipient.email || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">
                          {selectedRecipient.fullName || selectedRecipient.email}
                        </h3>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${renderRoleBadge(
                            selectedRecipient.role
                          )}`}
                        >
                          {selectedRecipient.role || 'Staff'}
                        </span>
                      </div>
                      {onlineUserIds.has(selectedRecipient.id) ? (
                        <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Now
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" /> {formatLastSeen(selectedRecipient)}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-[#007ACC]/15 border border-[#007ACC]/30 text-[#007ACC] font-bold flex items-center justify-center text-base">
                      #
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">#{selectedChannel.name}</h3>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {selectedChannel.description || 'Company Channel'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#181818]">
              {loadingMessages ? (
                <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2 text-xs font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-[#007ACC]" /> Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-gray-500 font-medium text-xs">
                  No messages yet. Send a message to start the conversation!
                </div>
              ) : (
                messages.map((m) => {
                  const isOwn = m.senderId === currentUser.id
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && (
                        <div className="w-7 h-7 rounded-lg bg-[#333333] border border-[#3C3C3C] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {(m.sender?.fullName || m.sender?.email || '?').charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="max-w-[75%] sm:max-w-[65%] space-y-1">
                        {!isOwn && (
                          <div className="text-[10px] font-bold text-gray-400 px-1">
                            {m.sender?.fullName || 'Colleague'}
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md whitespace-pre-wrap break-words ${
                            isOwn
                              ? 'bg-[#007ACC] text-white rounded-tr-none'
                              : 'bg-[#252526] border border-[#3C3C3C] text-gray-200 rounded-tl-none'
                          }`}
                        >
                          <p>{m.content}</p>

                          <div
                            className={`text-[9px] font-mono flex items-center justify-end gap-1 pt-1.5 ${
                              isOwn ? 'text-blue-100/80' : 'text-gray-400'
                            }`}
                          >
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                              })}
                            </span>
                            {isOwn &&
                              (m.isRead ? (
                                <CheckCheck className="w-3 h-3 text-emerald-300" />
                              ) : (
                                <Check className="w-3 h-3 text-blue-200" />
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-[#3C3C3C] bg-[#252526] shrink-0 relative">
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-4 bg-[#1E1E1E] border border-[#3C3C3C] p-3 rounded-xl shadow-xl flex flex-wrap gap-2 max-w-xs z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessageText((prev) => prev + emoji)
                        setShowEmojiPicker(false)
                      }}
                      className="text-lg hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] hover:bg-[#333333] text-gray-400 hover:text-white transition-all shrink-0"
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4 text-amber-400" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    selectedRecipient
                      ? `Message ${selectedRecipient.fullName || 'colleague'}...`
                      : `Message #${selectedChannel?.name}...`
                  }
                  className="flex-1 bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-[#007ACC] text-white hover:bg-[#0062A3] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send</span> <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#007ACC]/15 border border-[#007ACC]/30 text-[#007ACC] flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h3 className="text-base font-bold text-white mb-1 font-display">
              Welcome to SecureChat
            </h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Select a colleague or channel from the left sidebar to start messaging within your company network.
            </p>
          </div>
        )}
      </div>

      {/* CREATE CHANNEL MODAL */}
      {isCreatingChannel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#252526] border border-[#3C3C3C] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3C3C3C] pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#007ACC]" /> Create New Channel
              </h3>
              <button
                onClick={() => setIsCreatingChannel(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Channel Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. counselors-team"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#007ACC]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="What is this channel about?"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#007ACC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingChannel(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-gray-300 text-xs font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#007ACC] text-white text-xs font-bold hover:bg-[#0062A3]"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
