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

  const selectClass = "bg-[#1E1E1E] text-xs font-bold text-white rounded-xl outline-none border-none pr-2 transition-all cursor-pointer h-[26px]"

  return (
    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
      {isPending && <span className="text-[10px] font-bold text-[#12A8B5] animate-pulse shrink-0">Saving...</span>}
      
      {/* Dynamic Stage selector */}
      <div className="flex-1 md:flex-initial flex items-center justify-between md:justify-start gap-2 bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl px-3.5 py-1.5 h-[42px]">
        <span className="text-xs font-bold text-gray-400">Stage:</span>
        <select 
          onChange={handleStageChange}
          disabled={isPending || !canEdit}
          className={selectClass}
          value={localStage}
        >
          {stages.length > 0 ? (
            stages.map(s => (
              <option key={s.id} value={s.name} className="bg-[#1E1E1E] text-white">{s.name}</option>
            ))
          ) : (
            LEAD_STAGES.map(stage => (
              <option key={stage} value={stage} className="bg-[#1E1E1E] text-white">{stage}</option>
            ))
          )}
        </select>
      </div>

      {/* Star rating selector */}
      <div className="flex-1 md:flex-initial flex items-center justify-between md:justify-start gap-2.5 bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl px-4 py-1.5 h-[42px]">
        <span className="text-xs font-bold text-gray-400">Rating:</span>
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
