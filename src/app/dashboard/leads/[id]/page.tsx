import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { LeadStatusDropdowns } from '@/components/LeadStatusDropdowns'
import LeadDetailClient from '@/components/LeadDetailClient'
import TransferLeadButton from '@/components/TransferLeadButton'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const user = await getUserSession()
  if (!user) return null
  
  // Await params if Next.js 15+ (where params is a promise)
  const resolvedParams = await params
  
  const lead = await prisma.lead.findFirst({
    where: { id: resolvedParams.id, companyId: user.companyId },
    include: {
      interactions: { 
        orderBy: { createdAt: 'asc' },
        include: { counselor: true }
      },
      tasks: { 
        orderBy: { dueDate: 'asc' },
        include: { counselor: true }
      },
      applications: { orderBy: { createdAt: 'desc' } },
      assignedCounselor: true
    }
  })

  if (!lead) notFound()

  const canEdit = user.role === 'Super Admin' || user.role === 'Manager' || lead.assignedCounselorId === user.id

  let counselors: any[] = []
  if (canEdit) {
    counselors = await prisma.user.findMany({
      where: { role: 'Counselor', companyId: user.companyId },
      select: { id: true, fullName: true }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/leads" className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-white">{lead.fullName}</h2>
            <div className="flex items-center space-x-3 mt-1 text-sm text-neutral-400">
              <span className="flex items-center"><Mail className="h-3.5 w-3.5 mr-1" /> {lead.email || 'N/A'}</span>
              <span>•</span>
              <span className="flex items-center"><Phone className="h-3.5 w-3.5 mr-1" /> {lead.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {canEdit && <TransferLeadButton leadId={lead.id} currentCounselorId={lead.assignedCounselorId || ''} counselors={counselors} />}
          <LeadStatusDropdowns 
            leadId={lead.id} 
            currentStage={lead.stage} 
            currentRating={lead.rating} 
            canEdit={canEdit}
          />
        </div>
      </div>

      <LeadDetailClient lead={lead} canEdit={canEdit} />
    </div>
  )
}
