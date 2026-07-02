'use client'

import { useState } from 'react'
import { LayoutDashboard, Users, UserSquare, LogOut, CheckSquare, BarChart, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface User {
  fullName: string
  role: string
}

interface DashboardNavClientProps {
  user: User
  isAdminOrManager: boolean
  children: React.ReactNode
  logoutAction: () => Promise<void>
}

export default function DashboardNavClient({
  user,
  isAdminOrManager,
  children,
  logoutAction,
}: DashboardNavClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/dashboard/leads',
      label: 'Leads',
      icon: Users,
      show: true,
    },
    {
      href: '/dashboard/tasks',
      label: 'Tasks',
      icon: CheckSquare,
      show: true,
    },
    {
      href: '/dashboard/reports',
      label: 'Reports',
      icon: BarChart,
      show: isAdminOrManager,
    },
    {
      href: '/dashboard/staff',
      label: 'Staff Management',
      icon: UserSquare,
      show: user.role === 'Super Admin',
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100">
      <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          AbroadSync
        </h1>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                    isActive
                      ? 'text-white bg-neutral-800'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-neutral-500 group-hover:text-blue-400'
                    }`}
                  />
                  {item.label}
                </Link>
              )
            })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-neutral-800 shrink-0">
        <div className="flex items-center px-3 mb-4">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user.fullName.charAt(0)}
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
            <p className="text-xs font-medium text-neutral-400 truncate">{user.role}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg text-red-400 hover:text-white hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-neutral-800">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Navigation (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay Background */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Panel */}
          <aside className="relative w-64 max-w-xs flex flex-col bg-neutral-900 border-r border-neutral-800 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-950">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-neutral-950/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-neutral-200 truncate">
              Welcome back, {user.fullName.split(' ')[0]}
            </h2>
          </div>
        </header>

        {/* Scrollable Viewport Wrapper */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
