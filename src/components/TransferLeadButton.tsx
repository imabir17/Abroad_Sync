'use client'

import { useState } from 'react'
import { transferLead } from '@/app/actions/leads'
import { ArrowRightLeft } from 'lucide-react'

export default function TransferLeadButton({ leadId, currentCounselorId, counselors }: { leadId: string, currentCounselorId: string, counselors: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(currentCounselorId)
  const [isTransferring, setIsTransferring] = useState(false)

  const handleTransfer = async () => {
    if (!selectedId || selectedId === currentCounselorId) {
      setIsOpen(false)
      return
    }
    
    setIsTransferring(true)
    await transferLead(leadId, selectedId)
    setIsTransferring(false)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        <ArrowRightLeft className="h-4 w-4 text-blue-400" />
        <span>Transfer</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4 z-50">
          <h4 className="text-sm font-medium text-white mb-3">Transfer to Counselor</h4>
          <select 
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white mb-3 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Counselor</option>
            {counselors.map(c => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white">Cancel</button>
            <button 
              onClick={handleTransfer} 
              disabled={isTransferring || !selectedId || selectedId === currentCounselorId}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
            >
              {isTransferring ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
