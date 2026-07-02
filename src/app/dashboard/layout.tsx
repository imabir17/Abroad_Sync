import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import DashboardNavClient from './DashboardNavClient'

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
    <DashboardNavClient
      user={user}
      isAdminOrManager={isAdminOrManager}
      logoutAction={logout}
    >
      {children}
    </DashboardNavClient>
  )
}
  )
}
