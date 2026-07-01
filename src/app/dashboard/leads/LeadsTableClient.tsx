'use client'

import { useState } from 'react'
import Link from 'next/link'
import { bulkTransferLeads } from '@/app/actions/leads'
import { Users } from 'lucide-react'

export default function LeadsTableClient({ leads, isAdminOrManager, counselors }: { leads: any[], isAdminOrManager: boolean, counselors: any[] }) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [transferCounselorId, setTransferCounselorId] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const toggleLead = (id: string) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(leads.map(l => l.id))
    }
  }

  const handleBulkTransfer = async () => {
    if (!transferCounselorId || selectedLeadIds.length === 0) return
    setIsTransferring(true)
    await bulkTransferLeads(selectedLeadIds, transferCounselorId)
    setSelectedLeadIds([])
    setTransferCounselorId('')
    setIsTransferring(false)
  }

  return (
    <div>
      {isAdminOrManager && selectedLeadIds.length > 0 && (
        <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-white">{selectedLeadIds.length} leads selected</span>
          <div className="flex items-center space-x-3">
            <select 
              value={transferCounselorId} 
              onChange={e => setTransferCounselorId(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white"
            >
              <option value="">Select Counselor</option>
              {counselors.map(c => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
            <button 
              onClick={handleBulkTransfer} 
              disabled={!transferCounselorId || isTransferring}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center disabled:opacity-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Transfer
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-950/50 border-b border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider">
              {isAdminOrManager && (
                <th className="px-6 py-4 font-medium w-10">
                  <input type="checkbox" checked={leads.length > 0 && selectedLeadIds.length === leads.length} onChange={toggleAll} className="rounded border-neutral-700 bg-neutral-900 text-blue-600" />
                </th>
              )}
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium">Stage</th>
              <th className="px-6 py-4 font-medium">English Test</th>
              <th className="px-6 py-4 font-medium">Counselor</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-neutral-800/50 transition-colors group">
                {isAdminOrManager && (
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLead(lead.id)} className="rounded border-neutral-700 bg-neutral-900 text-blue-600" />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{lead.fullName}</span>
                    <span className="text-xs text-neutral-500">{lead.phone ? lead.phone : lead.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${lead.rating === 'Very Good' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      lead.rating === 'Good' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      lead.rating === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      lead.rating === 'Bad' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'}`}>
                    {lead.rating || 'Unrated'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-300">
                  {lead.stage}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-300">
                  {lead.englishTestStatus === 'Appeared' 
                    ? `${lead.englishTestType} (${lead.englishTestScore})`
                    : lead.englishTestStatus || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-300">
                  {lead.assignedCounselor?.fullName || 'Unassigned'}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/dashboard/leads/${lead.id}`} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
            
            {leads.length === 0 && (
              <tr>
                <td colSpan={isAdminOrManager ? 7 : 6} className="px-6 py-12 text-center text-neutral-500">
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
