import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TasksClient from './TasksClient'
import { redirect } from 'next/navigation'

export default async function TasksPage() {
  const user = await getUserSession()
  if (!user) {
    redirect('/login')
  }

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'

  // Fetch counselors for the assignment dropdown (only if admin/manager)
  let counselors: any[] = []
  if (isAdminOrManager) {
    counselors = await prisma.user.findMany({
      where: { role: 'Counselor', companyId: user.companyId },
      select: { id: true, fullName: true, role: true }
    })
  } else {
    // A counselor can assign generic tasks to themselves (or it defaults to them)
    counselors = [{ id: user.id, fullName: user.fullName, role: user.role }]
  }

  // Fetch tasks
  // Admins/Managers see all tasks. Counselors see only their assigned tasks.
  const tasks = await prisma.task.findMany({
    where: isAdminOrManager ? { counselor: { companyId: user.companyId } } : { counselorId: user.id },
    orderBy: [
      { status: 'desc' }, // 'Pending' comes before 'Completed' because P > C lexicographically, wait no. Let's just order by dueDate
      { dueDate: 'asc' }
    ],
    include: {
      counselor: { select: { fullName: true, role: true } },
      lead: { select: { id: true, fullName: true } }
    }
  })

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
