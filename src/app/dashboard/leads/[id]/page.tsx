import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { LeadStatusDropdowns } from '@/components/LeadStatusDropdowns'
import LeadDetailClient from '@/components/LeadDetailClient'
import TransferLeadButton from '@/components/TransferLeadButton'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const user = await getUserSession()
  if (!user) return null
  
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch the lead along with its related interactions, tasks, applications, and assigned counselor
  const { data: lead } = await supabase
    .from('Lead')
    .select('*, assignedCounselor:User!Lead_assignedCounselorId_fkey(*), interactions:Interaction(*, counselor:User(*)), tasks:Task(*, counselor:User(*)), applications:Application(*)')
    .eq('id', resolvedParams.id)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!lead) notFound()

  // Sort relations in memory to maintain order consistency
  if (lead.interactions) {
    lead.interactions.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }
  if (lead.tasks) {
    lead.tasks.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }
  if (lead.applications) {
    lead.applications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const canEdit = user.role === 'Super Admin' || user.role === 'Manager' || lead.assignedCounselorId === user.id

  let counselors: any[] = []
  if (canEdit) {
    const { data: counselorsData } = await supabase
      .from('User')
      .select('id, fullName')
      .eq('role', 'Counselor')
      .eq('companyId', user.companyId)
    
    counselors = counselorsData || []
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/leads" 
            className="p-2.5 rounded-xl bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] text-[#5C6478] hover:text-[#202638] transition-all"
            aria-label="Back to leads list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-[#202638] font-display">{lead.fullName}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#5C6478] font-semibold">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-[#4855E4]" /> {lead.email || 'N/A'}</span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-[#12A8B5]" /> {lead.phone || 'N/A'}</span>
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
