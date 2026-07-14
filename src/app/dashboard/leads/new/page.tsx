import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LeadForm } from '@/components/LeadForm'
import { getStagesAction } from '@/app/actions/stages'

export default async function NewLeadPage() {
  const user = await getUserSession()
  if (!user) return null

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'
  
  let counselors: {id: string, fullName: string}[] = []
  if (isAdminOrManager) {
    const supabase = await createClient()
    const { data: counselorsData } = await supabase
      .from('User')
      .select('id, fullName')
      .eq('role', 'Counselor')
      .eq('companyId', user.companyId)
    
    counselors = counselorsData || []
  }

  // Fetch dynamic stages
  const stages = await getStagesAction()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/leads" 
          className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all"
          aria-label="Back to leads list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Add New Lead</h2>
          <p className="text-xs text-gray-600">Enter the details for the new prospective student profile.</p>
        </div>
      </div>

      <LeadForm counselors={counselors} isAdminOrManager={isAdminOrManager} stages={stages} />
    </div>
  )
}
