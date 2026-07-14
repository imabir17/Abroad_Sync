import { getUserSession } from '@/lib/auth'
import { getStagesAction } from '@/app/actions/stages'
import { createClient } from '@/utils/supabase/server'
import PipelineBoardClient from './PipelineBoardClient'

export default async function PipelinePage() {
  const user = await getUserSession()
  if (!user) return null

  const isCounselor = user.role === 'Counselor'

  // Fetch dynamic stages config
  const stages = await getStagesAction()

  // Fetch leads with counselor information
  const supabase = await createClient()
  let query = supabase
    .from('Lead')
    .select(`
      id, 
      fullName, 
      preferredCountry, 
      stage, 
      rating, 
      createdAt, 
      updatedAt, 
      assignedCounselorId,
      assignedCounselor:User!Lead_assignedCounselorId_fkey(fullName)
    `)
    .eq('companyId', user.companyId)

  // Scope to counselor leads if Counselor role
  if (isCounselor) {
    query = query.eq('assignedCounselorId', user.id)
  }

  const { data: leads, error } = await query

  if (error) {
    console.error('Error fetching leads for pipeline:', error)
  }

  const activeLeads = leads || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12 h-[calc(100vh-140px)] flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Pipeline Board</h2>
        <p className="text-xs text-gray-400 mt-1">
          {isCounselor 
            ? 'Track and progress your assigned prospective students through recruitment.' 
            : 'Track and progress agency prospective student recruitment across all counseling staff.'
          }
        </p>
      </div>

      <PipelineBoardClient initialLeads={activeLeads} stages={stages} />
    </div>
  )
}
