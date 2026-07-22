import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StaffClient from './StaffClient'

export default async function StaffManagementPage() {
  const user = await getUserSession()
  
  // Super Admin and Manager can access staff management
  if (!user || !['Super Admin', 'Manager'].includes(user.role)) {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const [usersRes, invitesRes] = await Promise.all([
    supabase
      .from('User')
      .select('id, fullName, email, role, status, createdAt')
      .eq('companyId', user.companyId)
      .order('createdAt', { ascending: false }),
    supabase
      .from('Invite')
      .select('*')
      .eq('companyId', user.companyId)
      .eq('status', 'Pending')
      .order('createdAt', { ascending: false })
  ])

  const users = usersRes.data || []
  const invites = invitesRes.data || []

  return (
    <>
      <StaffClient initialUsers={users} initialInvites={invites} currentUserRole={user.role} currentUserId={user.id} />
    </>
  )
}
