'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  ShieldAlert,
  MessageSquare,
  UserCheck,
  ExternalLink,
  Clock,
  Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/app/actions/notifications'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'inactivity'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchNotifications = async () => {
    try {
      const res = await getUserNotifications()
      setNotifications(res.notifications || [])
      setUnreadCount(res.unreadCount || 0)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = async (n: any) => {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      await markNotificationAsRead(n.id)
    }
    setIsOpen(false)
    if (n.url) {
      router.push(n.url)
    }
  }

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
    setUnreadCount(0)
    await markAllNotificationsAsRead()
  }

  const filteredList = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'inactivity') return n.type === 'inactivity_7d' || n.type === 'inactivity_30d'
    return true
  })

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'inactivity_30d':
        return (
          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        )
      case 'inactivity_7d':
        return (
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )
      case 'note':
        return (
          <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        )
      case 'assignment':
        return (
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
        )
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        )
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-[#252526] border border-[#3C3C3C] hover:bg-[#333333] text-gray-300 hover:text-white transition-all"
        aria-label="Open notifications menu"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500 text-white rounded-full animate-pulse shadow-md">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-2xl z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Popover Header */}
          <div className="p-4 border-b border-[#3C3C3C] flex items-center justify-between bg-[#1E1E1E]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#007ACC]" />
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              <span className="text-[10px] text-gray-500 font-mono">(Past 30 Days)</span>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#007ACC] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 bg-[#1E1E1E]/50 border-b border-[#3C3C3C] text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'all' ? 'bg-[#007ACC] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'unread' ? 'bg-[#007ACC] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('inactivity')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'inactivity' ? 'bg-[#007ACC] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Inactivity Alerts
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#3C3C3C]">
            {loading ? (
              <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#007ACC]" /> Loading history...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-medium">
                No notifications in the past 30 days.
              </div>
            ) : (
              filteredList.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-[#1E1E1E] transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-[#007ACC]/5 font-semibold' : ''
                  }`}
                >
                  {renderTypeIcon(n.type)}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs text-white truncate ${!n.isRead ? 'font-bold' : 'font-medium'}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#007ACC] shrink-0" title="Unread" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{n.body}</p>
                    <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {new Date(n.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
