import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
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
  const supabase = await createClient()
  
  // 1. Fetch counselors for filtering and transfer
  const { data: counselorsData } = await supabase
    .from('User')
    .select('id, fullName')
    .eq('role', 'Counselor')
    .eq('companyId', user.companyId)
  
  const counselors = counselorsData || []

  // 2. Fetch distinct sources from database (filtered in memory for simplicity)
  const { data: rawSources } = await supabase
    .from('Lead')
    .select('source')
    .eq('companyId', user.companyId)

  const dbSources = rawSources ? (rawSources.map(s => s.source).filter(Boolean) as string[]) : []
  const predefinedSources = ['Facebook', 'Google', 'Instagram', 'Word of Mouth', 'Walk-in', 'Agent', 'Event/Seminar', 'Other']
  const allSources = Array.from(new Set([...predefinedSources, ...dbSources])).sort()

  // 3. Build the Supabase query based on search and filters
  let query = supabase
    .from('Lead')
    .select('*, assignedCounselor:User!Lead_assignedCounselorId_fkey(*)')
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })
  
  if (counselorId) {
    query = query.eq('assignedCounselorId', counselorId)
  }

  if (q) {
    query = query.or(`fullName.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  if (stage) {
    query = query.eq('stage', stage)
  }
  
  if (rating) {
    query = query.eq('rating', rating)
  }

  if (country) {
    query = query.eq('preferredCountry', country)
  }

  if (englishTest) {
    query = query.eq('englishTestType', englishTest)
  }

  if (source) {
    query = query.eq('source', source)
  }

  const { data: leadsData, error: queryError } = await query
  console.log('Leads Page Debug:', {
    userId: user.id,
    userRole: user.role,
    userCompanyId: user.companyId,
    leadsCount: leadsData ? leadsData.length : null,
    searchParams: resolvedSearchParams
  })
  if (queryError) {
    console.error('Leads Query Error:', {
      message: queryError.message,
      details: queryError.details,
      hint: queryError.hint,
      code: queryError.code
    })
  }
  const leads = leadsData || []

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
