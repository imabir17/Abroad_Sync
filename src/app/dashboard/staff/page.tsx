import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StaffClient from './StaffClient'

export default async function StaffManagementPage() {
  const user = await getUserSession()
  
  // Only Super Admin can access this page
  if (!user || user.role !== 'Super Admin') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { data: usersData } = await supabase
    .from('User')
    .select('id, fullName, email, role')
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })

  const users = usersData || []

  return (
    <>
      <StaffClient initialUsers={users} />
    </>
  )
}
