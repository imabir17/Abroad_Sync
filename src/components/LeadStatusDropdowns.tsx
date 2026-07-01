'use client'

import { useState, useEffect } from 'react'
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
  const [localStage, setLocalStage] = useState(currentStage)
  const [localRating, setLocalRating] = useState(currentRating || 'Unrated')

  // Keep state synced with parent props
  useEffect(() => {
    setLocalStage(currentStage)
  }, [currentStage])

  useEffect(() => {
    setLocalRating(currentRating || 'Unrated')
  }, [currentRating])

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEdit) return
    const newStage = e.target.value
    const rollbackStage = localStage
    
    // Optimistic update
    setLocalStage(newStage)
    setIsPending(true)
    
    try {
      await updateLeadStatus(leadId, newStage, localRating)
    } catch (err) {
      setLocalStage(rollbackStage) // Rollback on error
    } finally {
      setIsPending(false)
    }
  }

  const handleRatingChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEdit) return
    const newRating = e.target.value
    const rollbackRating = localRating
    
    // Optimistic update
    setLocalRating(newRating)
    setIsPending(true)
    
    try {
      await updateLeadStatus(leadId, localStage, newRating)
    } catch (err) {
      setLocalRating(rollbackRating) // Rollback on error
    } finally {
      setIsPending(false)
    }
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
          value={localStage}
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
            ${localRating === 'Very Good' ? 'text-emerald-400' : 
              localRating === 'Good' ? 'text-blue-400' : 
              localRating === 'Moderate' ? 'text-amber-400' : 
              localRating === 'Bad' ? 'text-red-400' : 'text-neutral-400'}`} 
          value={localRating}
        >
          {LEAD_RATINGS.map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
