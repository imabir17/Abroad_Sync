import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Users, UserSquare, LogOut, Search, Bell, Menu, CheckSquare, BarChart } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserSession()

  if (!user) {
    redirect('/login')
  }

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            AbroadSync
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            <Link href="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 group transition-colors">
              <LayoutDashboard className="mr-3 h-5 w-5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
              Dashboard
            </Link>
            
            <Link href="/dashboard/leads" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 group transition-colors">
              <Users className="mr-3 h-5 w-5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
              Leads
            </Link>

            <Link href="/dashboard/tasks" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 group transition-colors">
              <CheckSquare className="mr-3 h-5 w-5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
              Tasks
            </Link>

            {isAdminOrManager && (
              <Link href="/dashboard/reports" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 group transition-colors">
                <BarChart className="mr-3 h-5 w-5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                Reports
              </Link>
            )}

            {user.role === 'Super Admin' && (
              <Link href="/dashboard/staff" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 group transition-colors">
                <UserSquare className="mr-3 h-5 w-5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                Staff Management
              </Link>
            )}


          </nav>
        </div>
        
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center px-3 mb-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user.fullName.charAt(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.fullName}</p>
              <p className="text-xs font-medium text-neutral-400">{user.role}</p>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg text-red-400 hover:text-white hover:bg-red-500/10 transition-colors">
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-8 bg-neutral-950/50 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-neutral-200">Welcome back, {user.fullName.split(' ')[0]}</h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
