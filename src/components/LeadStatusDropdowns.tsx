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

  const selectClass = "bg-[#E7ECF3] text-xs font-bold text-[#202638] rounded-xl outline-none focus:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer h-[26px] border-none pr-2 bg-transparent"

  return (
    <div className="flex items-center gap-3">
      {isPending && <span className="text-[10px] font-bold text-[#8891A3] animate-pulse">Saving...</span>}
      
      {/* Dynamic Stage selector */}
      <div className="flex items-center gap-2 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] rounded-xl px-3.5 py-1.5 h-[40px] shrink-0">
        <span className="text-xs font-bold text-[#5C6478]">Stage:</span>
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
      <div className="flex items-center gap-2.5 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] rounded-xl px-4 py-1.5 h-[40px] shrink-0">
        <span className="text-xs font-bold text-[#5C6478]">Rating:</span>
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
