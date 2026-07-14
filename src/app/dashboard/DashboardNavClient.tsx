'use client'

import { useState } from 'react'
import { LayoutDashboard, Users, UserSquare, LogOut, CheckSquare, BarChart, Menu, X, Settings, Kanban, Globe } from 'lucide-react'
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
      href: '/dashboard/pipeline',
      label: 'Pipeline',
      icon: Kanban,
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
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      show: isAdminOrManager,
    },
    {
      href: '/dashboard/countries',
      label: 'Countries',
      icon: Globe,
      show: isAdminOrManager,
    },
  ]

  // Render function to avoid unmounting/remounting subtree performance issues
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Brand area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-base">
          <div className="w-8 h-8 rounded-lg bg-blue-600 shadow-[3px_3px_6px_#AEB9C9,-3px_3px_6px_#FFFFFF] flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold tracking-tight text-lg text-gray-900 font-display">AbroadSync</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 rounded-xl bg-white border border-gray-200 active:bg-gray-50 text-gray-600 hover:text-gray-900 transition-all"
          aria-label="Close sidebar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-3">
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
                  className={`flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'text-gray-900 bg-gray-50 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-4.5 w-4.5 transition-colors ${
                      isActive ? 'text-[#4855E4]' : 'text-gray-400 group-hover:text-[#4855E4]'
                    }`}
                  />
                  {item.label}
                </Link>
              )
            })}
        </nav>
      </div>
      
      {/* Profile & Logout card */}
      <div className="p-4 border-t border-gray-200 shrink-0">
        <div className="flex items-center p-3 rounded-2xl bg-white border border-gray-300 shadow-sm mb-4">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-xl bg-blue-600 shadow-sm flex items-center justify-center text-white font-bold text-sm">
              {user.fullName.charAt(0)}
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">{user.fullName}</p>
            <p className="text-[10px] font-semibold text-gray-400 truncate">{user.role}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-xl text-red-500 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 active:translate-y-0.5 transition-all duration-150"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-gray-200 bg-white">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Navigation (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay Background */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Panel */}
          <aside className="relative w-64 max-w-xs flex flex-col bg-white border-r border-gray-200 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-white border border-gray-200 active:bg-gray-50 text-gray-600 hover:text-gray-900 transition-all"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-gray-600 truncate">
              Welcome back, <span className="text-gray-900">{user.fullName.split(' ')[0]}</span>
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
