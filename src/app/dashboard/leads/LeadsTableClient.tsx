'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'
import { bulkTransferLeads } from '@/app/actions/leads'
import { Users, ExternalLink, Phone, Mail } from 'lucide-react'
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
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const getWhatsAppLink = (phone: string) => {
    const cleanNumber = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanNumber}`
  }

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
      <div className="hidden md:block overflow-x-auto">
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
                  <div className="flex items-center justify-end gap-2.5">
                    {lead.phone && (
                      <a 
                        href={getWhatsAppLink(lead.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#25D366] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all"
                        title="Message on WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <Link 
                      href={`/dashboard/leads/${lead.id}`} 
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#4855E4] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all whitespace-nowrap"
                    >
                      View Profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
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

      {/* Mobile Leads Card List */}
      <div className="block md:hidden space-y-4 p-2">
        {activeLeads.map((lead, i) => {
          const counselorName = lead.assignedCounselor?.fullName
          return (
            <div 
              key={lead.id} 
              className="bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] rounded-2xl p-4 space-y-3.5 border border-[#AEB9C9]/10"
            >
              {/* Header: Name, Country, Avatar */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                    {getInitials(lead.fullName)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#202638] truncate">{lead.fullName}</h4>
                    <p className="text-[10px] text-[#8891A3] truncate">
                      {lead.preferredCountry ? `Pref: ${lead.preferredCountry}` : 'No preferred country'}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[9px] font-bold bg-[#4855E4]/10 text-[#4855E4] px-2.5 py-0.5 rounded-full">
                    {lead.stage}
                  </span>
                </div>
              </div>

              {/* Stats: Stars & Counselor */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#AEB9C9]/10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[#8891A3] font-semibold">Lead Rating</span>
                  <StarRating rating={lead.rating} editable={false} size={11} />
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-[#8891A3] block font-semibold">Counselor</span>
                  <span className="text-[10.5px] font-bold text-[#5C6478]">
                    {counselorName || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3 pt-2">
                {lead.phone && (
                  <a 
                    href={`tel:${lead.phone}`}
                    className="flex-1 h-10 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-emerald-600 rounded-xl hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all flex items-center justify-center gap-2 text-xs font-bold"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                )}
                {lead.phone && (
                  <a 
                    href={getWhatsAppLink(lead.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-[#25D366] rounded-xl hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}
                <Link 
                  href={`/dashboard/leads/${lead.id}`}
                  className="flex-1 h-10 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white rounded-xl shadow-md active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
                >
                  <span>View</span>
                </Link>
              </div>
            </div>
          )
        })}
        {activeLeads.length === 0 && (
          <div className="neo-raised p-8 text-center text-xs font-bold text-[#8891A3]">
            No leads found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
