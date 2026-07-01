import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import StaffClient from './StaffClient'

export default async function StaffManagementPage() {
  const user = await getUserSession()
  
  // Only Super Admin can access this page
  if (!user || user.role !== 'Super Admin') {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true
    }
  })

  return (
    <>
      <StaffClient initialUsers={users} />
    </>
  )
}
