import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LeadForm } from '@/components/LeadForm'

export default async function NewLeadPage() {
  const user = await getUserSession()
  if (!user) return null

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'
  
  let counselors: {id: string, fullName: string}[] = []
  if (isAdminOrManager) {
    counselors = await prisma.user.findMany({
      where: { role: 'Counselor' },
      select: { id: true, fullName: true }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/leads" className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Add New Lead</h2>
          <p className="text-neutral-400">Enter the details for the new prospective student.</p>
        </div>
      </div>

      <LeadForm counselors={counselors} isAdminOrManager={isAdminOrManager} />
    </div>
  )
}
