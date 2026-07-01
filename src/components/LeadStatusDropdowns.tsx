'use client'

import { useState } from 'react'
import { updateLeadStatus } from '@/app/actions/leads'
import { LEAD_STAGES, LEAD_RATINGS } from '@/lib/constants'

export function LeadStatusDropdowns({ 
  leadId, 
  currentStage, 
  currentRating,
  canEdit = true
}: { 
  leadId: string, 
  currentStage: string, 
  currentRating: string | null,
  canEdit?: boolean
}) {
  const [isPending, setIsPending] = useState(false)

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEdit) return
    const newStage = e.target.value
    setIsPending(true)
    await updateLeadStatus(leadId, newStage, currentRating || 'Unrated')
    setIsPending(false)
  }

  const handleRatingChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEdit) return
    const newRating = e.target.value
    setIsPending(true)
    await updateLeadStatus(leadId, currentStage, newRating)
    setIsPending(false)
  }

  return (
    <div className="flex items-center space-x-3">
      {isPending && <span className="text-xs text-neutral-500 animate-pulse">Saving...</span>}
      
      <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1.5">
        <span className="text-sm text-neutral-400 px-2">Stage:</span>
        <select 
          onChange={handleStageChange}
          disabled={isPending || !canEdit}
          className="bg-neutral-950 border border-neutral-800 text-sm text-white rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50" 
          value={currentStage}
        >
          {LEAD_STAGES.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1.5">
        <span className="text-sm text-neutral-400 px-2">Rating:</span>
        <select 
          onChange={handleRatingChange}
          disabled={isPending || !canEdit}
          className={`bg-neutral-950 border border-neutral-800 text-sm font-medium rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50
            ${currentRating === 'Very Good' ? 'text-emerald-400' : 
              currentRating === 'Good' ? 'text-blue-400' : 
              currentRating === 'Moderate' ? 'text-amber-400' : 
              currentRating === 'Bad' ? 'text-red-400' : 'text-neutral-400'}`} 
          value={currentRating || 'Unrated'}
        >
          {LEAD_RATINGS.map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
