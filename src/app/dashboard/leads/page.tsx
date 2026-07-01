import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { LeadFilters } from '@/components/LeadFilters'
import LeadsTableClient from './LeadsTableClient'
export default async function LeadsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const user = await getUserSession()
  if (!user) return null

  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q as string | undefined
  const stage = resolvedSearchParams.stage as string | undefined
  const rating = resolvedSearchParams.rating as string | undefined
  const counselorId = resolvedSearchParams.counselorId as string | undefined
  const country = resolvedSearchParams.country as string | undefined
  const englishTest = resolvedSearchParams.englishTest as string | undefined
  const source = resolvedSearchParams.source as string | undefined

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'
  
  let counselors: {id: string, fullName: string}[] = []
  // Fetch counselors for filtering and transfer
  counselors = await prisma.user.findMany({
    where: { role: 'Counselor', companyId: user.companyId },
    select: { id: true, fullName: true }
  })

  const rawSources = await prisma.lead.findMany({
    where: { companyId: user.companyId },
    select: { source: true },
    distinct: ['source']
  })
  const dbSources = rawSources.map(s => s.source).filter(Boolean) as string[]
  const predefinedSources = ['Facebook', 'Google', 'Instagram', 'Word of Mouth', 'Walk-in', 'Agent', 'Event/Seminar', 'Other']
  const allSources = Array.from(new Set([...predefinedSources, ...dbSources])).sort()

  // Build the where clause based on search and filters
  const whereClause: any = {
    companyId: user.companyId
  }
  
  if (!isAdminOrManager) {
    whereClause.assignedCounselorId = user.id
  } else if (counselorId) {
    whereClause.assignedCounselorId = counselorId
  }

  if (q) {
    whereClause.OR = [
      { fullName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } }
    ]
  }

  if (stage) {
    whereClause.stage = stage
  }
  
  if (rating) {
    whereClause.rating = rating
  }

  if (country) {
    whereClause.preferredCountry = country
  }

  if (englishTest) {
    whereClause.englishTestType = englishTest
  }

  if (source) {
    whereClause.source = source
  }

  const leads = await prisma.lead.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      assignedCounselor: true
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Leads Pipeline</h2>
          <p className="text-neutral-400">Manage and track your prospective students.</p>
        </div>
        <Link href="/dashboard/leads/new" className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Link>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm overflow-hidden relative">
        <LeadFilters isAdminOrManager={true} counselors={counselors} sources={allSources} />
        
        <LeadsTableClient leads={leads} isAdminOrManager={isAdminOrManager} counselors={counselors} />
      </div>
    </div>
  )
}
