'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'
import { bulkTransferLeads } from '@/app/actions/leads'
import { Users, ExternalLink } from 'lucide-react'
import { StarRating } from '@/components/StarRating'

// SWR Client Fetcher
const leadsFetcher = async ([, paramsString]: [string, string]) => {
  const params = new URLSearchParams(paramsString)
  const q = params.get('q') || ''
  const stage = params.get('stage') || ''
  const rating = params.get('rating') || ''
  const counselorId = params.get('counselorId') || ''
  const country = params.get('country') || ''
  const englishTest = params.get('englishTest') || ''
  const source = params.get('source') || ''

  const supabase = createClient()
  
  // Read session to get active companyId scope
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []

  // Read user profile from database to get companyId
  const { data: userProfile } = await supabase
    .from('User')
    .select('companyId')
    .eq('id', session.user.id)
    .single()

  if (!userProfile) return []

  let query = supabase
    .from('Lead')
    .select('*, assignedCounselor:User!Lead_assignedCounselorId_fkey(*)')
    .eq('companyId', userProfile.companyId)
    .order('createdAt', { ascending: false })

  if (counselorId) {
    query = query.eq('assignedCounselorId', counselorId)
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
  
  if (q) {
    query = query.or(`fullName.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error('SWR Lead Fetch Error:', error)
    return []
  }
  return data || []
}

export default function LeadsTableClient({ 
  leads, 
  isAdminOrManager, 
  counselors 
}: { 
  leads: any[]
  isAdminOrManager: boolean
  counselors: any[] 
}) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [transferCounselorId, setTransferCounselorId] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const searchParams = useSearchParams()
  const paramsString = searchParams.toString()

  const { data: clientLeads, mutate } = useSWR(
    ['leads', paramsString],
    leadsFetcher,
    {
      fallbackData: leads,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000
    }
  )

  const activeLeads = clientLeads || leads

  const toggleLead = (id: string) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAll = () => {
    if (selectedLeadIds.length === activeLeads.length) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(activeLeads.map(l => l.id))
    }
  }

  const handleBulkTransfer = async () => {
    if (!transferCounselorId || selectedLeadIds.length === 0) return
    setIsTransferring(true)
    try {
      await bulkTransferLeads(selectedLeadIds, transferCounselorId)
      mutate()
      setSelectedLeadIds([])
      setTransferCounselorId('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="neo-raised overflow-hidden">
      {/* Bulk Transfer Action Bar */}
      {isAdminOrManager && selectedLeadIds.length > 0 && (
        <div className="bg-[#DCE3ED] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#AEB9C9]/20 animate-in fade-in duration-300">
          <span className="text-xs font-bold text-[#202638]">{selectedLeadIds.length} leads selected</span>
          <div className="flex items-center gap-3">
            <select 
              value={transferCounselorId} 
              onChange={e => setTransferCounselorId(e.target.value)}
              className="px-3 py-2 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] rounded-xl outline-none focus:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
            >
              <option value="">Select Counselor</option>
              {counselors.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
            <button 
              onClick={handleBulkTransfer} 
              disabled={!transferCounselorId || isTransferring}
              className="px-4 py-2 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-[9px_9px_20px_rgba(51,63,194,0.35)] active:translate-y-0.5 disabled:opacity-50 transition-all duration-150 flex items-center gap-1.5"
            >
              <Users className="h-4 w-4" />
              Transfer
            </button>
          </div>
        </div>
      )}

      {/* Leads Table Grid wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#DCE3ED] border-b border-[#AEB9C9]/20 text-[#5C6478] text-[10px] font-bold uppercase tracking-wider">
              {isAdminOrManager && (
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={activeLeads.length > 0 && selectedLeadIds.length === activeLeads.length} 
                    onChange={toggleAll} 
                    className="w-4 h-4 rounded text-[#4855E4] cursor-pointer accent-[#4855E4]" 
                  />
                </th>
              )}
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Stage</th>
              <th className="px-6 py-4">English Test</th>
              <th className="px-6 py-4">Counselor</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#AEB9C9]/20">
            {activeLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#DCE3ED]/20 transition-colors group">
                {isAdminOrManager && (
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedLeadIds.includes(lead.id)} 
                      onChange={() => toggleLead(lead.id)} 
                      className="w-4 h-4 rounded text-[#4855E4] cursor-pointer accent-[#4855E4]" 
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#202638]">{lead.fullName}</span>
                    <span className="text-[10px] text-[#8891A3] mt-0.5">{lead.phone ? lead.phone : lead.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StarRating rating={lead.rating} editable={false} size={14} />
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-[#5C6478]">
                  {lead.stage}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-[#5C6478]">
                  {lead.englishTestStatus === 'Appeared' 
                    ? `${lead.englishTestType} (${lead.englishTestScore})`
                    : lead.englishTestStatus || '-'}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-[#5C6478]">
                  {lead.assignedCounselor?.fullName || 'Unassigned'}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/dashboard/leads/${lead.id}`} 
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#4855E4] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all"
                  >
                    View Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
            
            {activeLeads.length === 0 && (
              <tr>
                <td colSpan={isAdminOrManager ? 7 : 6} className="px-6 py-12 text-center text-xs font-bold text-[#8891A3]">
                  No leads found matching your search and filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
