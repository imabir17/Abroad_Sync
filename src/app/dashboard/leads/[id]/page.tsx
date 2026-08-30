import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, UserCheck, UserPlus, Clock } from 'lucide-react'
import { LeadStatusDropdowns } from '@/components/LeadStatusDropdowns'
import LeadDetailClient from '@/components/LeadDetailClient'
import TransferLeadButton from '@/components/TransferLeadButton'
import { getStagesAction } from '@/app/actions/stages'
import EditableLeadName from '@/components/EditableLeadName'
import EditableContactInfo from '@/components/EditableContactInfo'
import FormattedDate from '@/components/FormattedDate'

export const dynamic = 'force-dynamic'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const user = await getUserSession()
  if (!user) return null
  
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch the lead along with its related interactions, tasks, applications, assigned counselor, and creator
  const { data: lead } = await supabase
    .from('Lead')
    .select('*, assignedCounselor:User!Lead_assignedCounselorId_fkey(*), createdBy:User!Lead_createdById_fkey(*), interactions:Interaction(*, counselor:User(*)), tasks:Task(*, counselor:User(*)), applications:Application(*)')
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

  // Fetch customizable stages
  const stages = await getStagesAction()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#252526] p-6 rounded-2xl border border-[#3C3C3C] shadow-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/leads" 
            className="p-2.5 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] hover:bg-[#333333] text-gray-400 hover:text-white transition-all shrink-0"
            aria-label="Back to leads list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <EditableLeadName leadId={lead.id} initialName={lead.fullName} canEdit={canEdit} />
              <span className="px-3 py-1 rounded-xl bg-[#007ACC]/15 border border-[#007ACC]/40 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <UserCheck className="h-3.5 w-3.5 text-[#007ACC]" />
                Assigned Counselor: <span className="text-[#007ACC] font-extrabold">{lead.assignedCounselor?.fullName || 'Unassigned'}</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                Last Contacted: <span className="text-white font-bold">
                  <FormattedDate date={lead.contactedAt} fallback="Not Contacted Yet" />
                </span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-400 font-semibold">
              <EditableContactInfo 
                leadId={lead.id} 
                initialEmail={lead.email} 
                initialPhone={lead.phone} 
                canEdit={canEdit} 
              />
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                <UserPlus className="h-3.5 w-3.5 text-[#007ACC]" />
                Added by: <span className="text-gray-200 font-bold">{lead.createdBy?.fullName || lead.createdBy?.email || 'System'}</span>
              </span>
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
            stages={stages}
          />
        </div>
      </div>

      <LeadDetailClient lead={lead} canEdit={canEdit} />
    </div>
  )
}
