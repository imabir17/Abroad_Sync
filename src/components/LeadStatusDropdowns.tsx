'use client'

import { useState, useEffect } from 'react'
import { updateLeadStatus } from '@/app/actions/leads'
import { LEAD_STAGES } from '@/lib/constants'
import { StarRating } from './StarRating'

export function LeadStatusDropdowns({ 
  leadId, 
  currentStage, 
  currentRating,
  canEdit = true,
  stages = []
}: { 
  leadId: string, 
  currentStage: string, 
  currentRating: string | null,
  canEdit?: boolean
  stages?: any[]
}) {
  const [isPending, setIsPending] = useState(false)
  const [localStage, setLocalStage] = useState(currentStage)
  const [localRating, setLocalRating] = useState(currentRating || 'Unrated')

  // Keep state synced with parent props
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalStage(currentStage)
  }, [currentStage])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleRatingSelect = async (newRating: string) => {
    if (!canEdit) return
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

  const selectClass = "bg-white text-xs font-bold text-gray-900 rounded-xl outline-none focus:bg-gray-50 border border-gray-200 transition-all cursor-pointer h-[26px] border-none pr-2 bg-transparent"

  return (
    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
      {isPending && <span className="text-[10px] font-bold text-gray-400 animate-pulse shrink-0">Saving...</span>}
      
      {/* Dynamic Stage selector */}
      <div className="flex-1 md:flex-initial flex items-center justify-between md:justify-start gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 h-[42px]">
        <span className="text-xs font-bold text-gray-600">Stage:</span>
        <select 
          onChange={handleStageChange}
          disabled={isPending || !canEdit}
          className={selectClass}
          value={localStage}
        >
          {stages.length > 0 ? (
            stages.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))
          ) : (
            LEAD_STAGES.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))
          )}
        </select>
      </div>

      {/* Star rating selector */}
      <div className="flex-1 md:flex-initial flex items-center justify-between md:justify-start gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-1.5 h-[42px]">
        <span className="text-xs font-bold text-gray-600">Rating:</span>
        <StarRating 
          rating={localRating} 
          onChange={handleRatingSelect} 
          editable={canEdit && !isPending} 
          size={16} 
        />
      </div>
    </div>
  )
}
