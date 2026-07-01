import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import TasksClient from './TasksClient'
import { redirect } from 'next/navigation'

export default async function TasksPage() {
  const user = await getUserSession()
  if (!user) {
    redirect('/login')
  }

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'
  const supabase = await createClient()

  // Fetch counselors for the assignment dropdown (only if admin/manager)
  let counselors: any[] = []
  if (isAdminOrManager) {
    const { data: counselorsData } = await supabase
      .from('User')
      .select('id, fullName, role')
      .eq('role', 'Counselor')
      .eq('companyId', user.companyId)
    counselors = counselorsData || []
  } else {
    // A counselor can assign generic tasks to themselves (or it defaults to them)
    counselors = [{ id: user.id, fullName: user.fullName, role: user.role }]
  }

  // Fetch tasks
  // Admins/Managers see all tasks for the company. Counselors see only their assigned tasks.
  let tasksQuery = supabase
    .from('Task')
    .select('*, counselor:User!inner(fullName, role, companyId), lead:Lead(id, fullName)')
    .order('status', { ascending: false }) // 'Pending' (P) comes before 'Completed' (C) lexicographically when descending
    .order('dueDate', { ascending: true })

  if (!isAdminOrManager) {
    tasksQuery = tasksQuery.eq('counselorId', user.id)
  } else {
    tasksQuery = tasksQuery.eq('counselor.companyId', user.companyId)
  }

  const { data: tasksData } = await tasksQuery
  const tasks = tasksData || []

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <TasksClient 
        tasks={tasks} 
        counselors={counselors} 
        isAdminOrManager={isAdminOrManager} 
        currentUser={user} 
      />
    </div>
  )
}
