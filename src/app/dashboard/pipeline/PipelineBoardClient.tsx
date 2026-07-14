'use client'

import { useState, useEffect } from 'react'
import { updateLeadStageAction } from '@/app/actions/leads'
import { StarRating } from '@/components/StarRating'
import { PipelineStage } from '@/app/actions/stages'
import Link from 'next/link'
import { ExternalLink, User } from 'lucide-react'

// Pre-defined column colors for stages
const STAGE_DOT_COLORS = [
  '#4855E4', '#12A8B5', '#8B5CF6', '#1FAE73', '#FF7A52', '#E5484D', '#8B5CF6', '#EAB308'
]

interface Lead {
  id: string
  fullName: string
  preferredCountry: string | null
  stage: string
  rating: string | null
  createdAt: string
  updatedAt: string
  assignedCounselorId: string | null
  assignedCounselor?: { fullName: string } | { fullName: string }[] | null
}

interface PipelineBoardClientProps {
  initialLeads: Lead[]
  stages: PipelineStage[]
}

export default function PipelineBoardClient({ initialLeads, stages }: PipelineBoardClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [activeStageName, setActiveStageName] = useState<string>(stages.length > 0 ? stages[0].name : '')

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId)
    setDraggedId(leadId)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverStage(null)
  }

  const handleDragOver = (e: React.DragEvent, stageName: string) => {
    e.preventDefault()
    if (dragOverStage !== stageName) {
      setDragOverStage(stageName)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetStageName: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain')
    setDragOverStage(null)
    setDraggedId(null)

    if (!leadId) return

    const leadToMove = leads.find(l => l.id === leadId)
    if (!leadToMove) return

    const oldStage = leadToMove.stage
    if (oldStage === targetStageName) return

    // Optimistic Update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: targetStageName, updatedAt: new Date().toISOString() } : l))

    try {
      const result = await updateLeadStageAction(leadId, targetStageName)
      if (!result.success) {
        throw new Error('Failed to update stage')
      }
    } catch (err) {
      console.error('Error shifting lead stage:', err)
      // Rollback on failure
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: oldStage } : l))
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const getStageColor = (index: number) => {
    return STAGE_DOT_COLORS[index % STAGE_DOT_COLORS.length]
  }

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0 w-full">
      {/* Mobile stage selector tabs */}
      <div className="flex lg:hidden overflow-x-auto gap-2.5 pb-2.5 px-0.5 scrollbar-none shrink-0 w-full">
        {stages.map((stage) => {
          const count = leads.filter(l => l.stage === stage.name).length
          const isActive = activeStageName === stage.name
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStageName(stage.name)}
              className={`px-4 py-2 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all duration-150 shrink-0 border ${
                isActive
                  ? 'text-white bg-[#1E1E1E] border-[#3C3C3C]'
                  : 'text-gray-400 bg-[#252526] border-[#3C3C3C] hover:text-white'
              }`}
            >
              {stage.name} ({count})
            </button>
          )
        })}
      </div>

      <div className="w-full overflow-x-auto flex gap-4 pb-6 select-none items-start flex-1 min-h-0">
        {stages.map((stage, sIdx) => {
          const stageLeads = leads.filter(l => l.stage === stage.name)
          const isDraggingOverThis = dragOverStage === stage.name
          const dotColor = getStageColor(sIdx)
          const isMobileHidden = activeStageName && activeStageName !== stage.name

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.name)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => handleDrop(e, stage.name)}
              className={`min-w-[155px] max-w-[210px] bg-[#252526] rounded-2xl flex flex-col max-h-[calc(100vh-230px)] transition-all duration-200 border ${
                isMobileHidden ? 'hidden lg:flex' : 'flex'
              } ${
                isDraggingOverThis
                  ? 'border-[#007ACC] bg-[#1E1E1E]/50'
                  : 'border-[#3C3C3C] shadow-md'
              }`}
            >
            {/* Column Header */}
            <div className="p-2.5 flex items-center justify-between border-b border-[#3C3C3C] shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }}></span>
                <span className="text-[11px] font-bold text-white font-display truncate max-w-[95px]" title={stage.name}>
                  {stage.name}
                </span>
              </div>
              <span className="text-[9px] font-bold text-gray-300 bg-[#333333] px-1.5 py-0.5 rounded-full shrink-0 border border-[#3C3C3C]">
                {stageLeads.length}
              </span>
            </div>

            {/* Column Body Cards List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2.5 min-h-[100px] scrollbar-thin">
              {stageLeads.map((lead) => {
                const days = Math.max(0, Math.floor((Date.now() - new Date(lead.updatedAt || lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
                const counselor = lead.assignedCounselor
                const counselorName = counselor 
                  ? (Array.isArray(counselor) ? counselor[0]?.fullName : counselor.fullName)
                  : undefined
                const isThisDragged = draggedId === lead.id

                return (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm rounded-xl p-2.5 cursor-grab active:cursor-grabbing hover:scale-102 hover:border-[#555555] transition-all duration-150 relative group ${
                      isThisDragged ? 'opacity-30 scale-95 shadow-inner' : ''
                    }`}
                  >
                    {/* Top Row: Initials Badge & Name */}
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5.5 h-5.5 rounded-lg bg-[#0E639C] text-white flex items-center justify-center text-[8px] font-bold shrink-0 shadow-sm">
                          {getInitials(lead.fullName)}
                        </div>
                        <span className="text-[10.5px] font-bold text-white truncate" title={lead.fullName}>
                          {lead.fullName}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/dashboard/leads/${lead.id}`}
                        className="p-0.5 rounded text-gray-500 hover:text-[#007ACC] hover:bg-[#333333] transition-colors shrink-0"
                        title="View profile"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Middle Row: Preferences */}
                    <p className="text-[9px] font-semibold text-gray-500 mb-2 truncate">
                      {lead.preferredCountry ? `Pref: ${lead.preferredCountry}` : 'No destination'}
                    </p>

                    {/* Bottom Row: Ratings, Counselor & Days */}
                    <div className="flex items-center justify-between border-t border-[#3C3C3C] pt-2 mt-1">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <StarRating rating={lead.rating} editable={false} size={8} />
                        <span className="text-[8px] font-semibold text-gray-400 truncate">
                          {days === 0 ? 'Today' : `${days}d in stage`}
                        </span>
                      </div>

                      {counselorName ? (
                        <div 
                          className="w-4.5 h-4.5 rounded-full bg-[#12A8B5] text-white flex items-center justify-center text-[7px] font-extrabold shadow-sm shrink-0"
                          title={`Assigned to ${counselorName}`}
                        >
                          {getInitials(counselorName)}
                        </div>
                      ) : (
                        <div 
                          className="w-4.5 h-4.5 rounded-full bg-[#333333] border border-[#3C3C3C] text-gray-400 flex items-center justify-center shadow-inner shrink-0"
                          title="Unassigned counselor"
                        >
                          <User className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {stageLeads.length === 0 && (
                <div className="h-16 border-2 border-dashed border-[#3C3C3C] rounded-xl flex items-center justify-center text-[9px] font-bold text-gray-500">
                  Drop leads
                </div>
              )}
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}
