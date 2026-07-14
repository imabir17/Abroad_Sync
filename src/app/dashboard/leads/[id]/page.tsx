import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { LeadStatusDropdowns } from '@/components/LeadStatusDropdowns'
import LeadDetailClient from '@/components/LeadDetailClient'
import TransferLeadButton from '@/components/TransferLeadButton'
import { getStagesAction } from '@/app/actions/stages'

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

  // Fetch customizable stages
  const stages = await getStagesAction()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/leads" 
            className="p-2.5 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] hover:bg-[#333333] text-gray-400 hover:text-white transition-all"
            aria-label="Back to leads list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-white font-display">{lead.fullName}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 text-xs text-gray-400 font-semibold">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-[#4855E4]" /> {lead.email || 'N/A'}</span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#12A8B5]" /> {lead.phone || 'N/A'}
                {lead.phone && (() => {
                  let clean = lead.phone.replace(/\D/g, '')
                  if (clean.startsWith('01') && clean.length === 11) {
                    clean = '880' + clean.slice(1)
                  }
                  return (
                    <a 
                      href={`https://wa.me/${clean}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 p-1 bg-[#1E1E1E] border border-[#3C3C3C] hover:bg-[#333333] rounded-lg text-[#25D366] transition-all inline-flex items-center justify-center shrink-0"
                      title="Message on WhatsApp"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  )
                })()}
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
