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
              className={`px-4 py-2 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all duration-150 shrink-0 border-none ${
                isActive
                  ? 'text-gray-900 bg-white border border-gray-200'
                  : 'text-gray-600 bg-white border border-gray-100 hover:text-gray-900'
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
              className={`min-w-[155px] max-w-[210px] bg-slate-50 rounded-3xl flex flex-col max-h-[calc(100vh-230px)] transition-all duration-200 border-4 ${
                isMobileHidden ? 'hidden lg:flex' : 'flex'
              } ${
                isDraggingOverThis
                  ? 'border-blue-400 bg-blue-50/30'
                  : 'border-white shadow-[8px_8px_16px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]'
              }`}
            >
            {/* Column Header */}
            <div className="p-2.5 flex items-center justify-between border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }}></span>
                <span className="text-[11px] font-bold text-gray-900 font-display truncate max-w-[95px]" title={stage.name}>
                  {stage.name}
                </span>
              </div>
              <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
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
                    className={`bg-white/60 border-2 border-white shadow-[4px_4px_10px_rgba(0,0,0,0.03),inset_1px_1px_2px_rgba(255,255,255,0.8)] rounded-xl p-2.5 cursor-grab active:cursor-grabbing hover:scale-102 hover:shadow-md transition-all duration-150 relative group ${
                      isThisDragged ? 'opacity-30 scale-95 shadow-inner' : ''
                    }`}
                  >
                    {/* Top Row: Initials Badge & Name */}
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5.5 h-5.5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold shrink-0 shadow-sm">
                          {getInitials(lead.fullName)}
                        </div>
                        <span className="text-[10.5px] font-bold text-gray-900 truncate" title={lead.fullName}>
                          {lead.fullName}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/dashboard/leads/${lead.id}`}
                        className="p-0.5 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-colors shrink-0"
                        title="View profile"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Middle Row: Preferences */}
                    <p className="text-[9px] font-semibold text-gray-600 mb-2 truncate">
                      {lead.preferredCountry ? `Pref: ${lead.preferredCountry}` : 'No destination'}
                    </p>

                    {/* Bottom Row: Ratings, Counselor & Days */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-1">
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
                          className="w-4.5 h-4.5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shadow-inner shrink-0"
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
                <div className="h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-[9px] font-bold text-gray-400/80">
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
