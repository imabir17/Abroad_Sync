'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  createStageAction, 
  updateStageAction, 
  deleteStageAction, 
  reorderStagesAction, 
  PipelineStage 
} from '@/app/actions/stages'
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  AlertTriangle,
  Loader2 
} from 'lucide-react'

interface SettingsClientProps {
  initialStages: PipelineStage[]
  stageLeadCounts: { [key: string]: number }
}

export default function SettingsClient({ initialStages, stageLeadCounts }: SettingsClientProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const [stages, setStages] = useState<PipelineStage[]>(initialStages)
  const [newStageName, setNewStageName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [stageToDelete, setStageToDelete] = useState<PipelineStage | null>(null)
  const [migrateTarget, setMigrateTarget] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const [errorMsg, setErrorMsg] = useState('')

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newStageName.trim()
    if (!name) return

    setIsAdding(true)
    setErrorMsg('')
    const result = await createStageAction(name)
    setIsAdding(false)

    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setNewStageName('')
      // Reload stages locally (simplest approach is to append or refresh)
      const nextIndex = stages.length > 0 ? Math.max(...stages.map(s => s.orderIndex)) + 1 : 0
      setStages(prev => [...prev, {
        id: 'temp-' + Date.now(),
        companyId: '',
        name,
        orderIndex: nextIndex,
        createdAt: new Date().toISOString()
      }])
      // Refresh page
      window.location.reload()
    }
  }

  const handleRenameStage = async (id: string) => {
    const name = editingName.trim()
    if (!name) return

    setErrorMsg('')
    const result = await updateStageAction(id, name)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setStages(prev => prev.map(s => s.id === id ? { ...s, name } : s))
      setEditingId(null)
      window.location.reload()
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= stages.length) return

    setIsSavingOrder(true)
    setErrorMsg('')

    const updated = [...stages]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    // Recalculate order indices
    const payload = updated.map((stage, idx) => ({
      id: stage.id,
      orderIndex: idx
    }))

    const result = await reorderStagesAction(payload)
    setIsSavingOrder(false)

    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setStages(updated.map((s, idx) => ({ ...s, orderIndex: idx })))
    }
  }

  const initiateDelete = (stage: PipelineStage) => {
    setStageToDelete(stage)
    const count = stageLeadCounts[stage.name] || 0
    
    // Find first available target stage for migration dropdown
    const availableTargets = stages.filter(s => s.id !== stage.id)
    if (availableTargets.length > 0) {
      setMigrateTarget(availableTargets[0].name)
    } else {
      setMigrateTarget('')
    }

    if (count > 0) {
      setShowDeleteModal(true)
    } else {
      // Direct delete warning modal
      setShowDeleteModal(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!stageToDelete) return

    const count = stageLeadCounts[stageToDelete.name] || 0
    if (count > 0 && !migrateTarget) {
      setErrorMsg('Please select a target migration stage')
      return
    }

    setIsDeleting(true)
    setErrorMsg('')

    const result = await deleteStageAction(stageToDelete.id, migrateTarget || 'New')
    setIsDeleting(false)

    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setShowDeleteModal(false)
      setStageToDelete(null)
      window.location.reload()
    }
  }

  const otherStages = stageToDelete ? stages.filter(s => s.id !== stageToDelete.id) : []
  const activeLeadsCount = stageToDelete ? (stageLeadCounts[stageToDelete.name] || 0) : 0

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-[#E5484D] bg-[#E5484D]/8 p-4 rounded-xl shadow-sm border border-[#E5484D]/10">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Pipeline customization */}
        <div className="md:col-span-2 space-y-6">
          <div className="neo-raised p-6">
            <h3 className="text-base font-bold text-[#202638] mb-5">Customize Pipeline Stages</h3>

            <div className="space-y-4">
              {stages.map((stage, index) => {
                const isEditing = editingId === stage.id
                const leadCount = stageLeadCounts[stage.name] || 0

                return (
                  <div 
                    key={stage.id} 
                    className="flex items-center justify-between p-4 bg-[#E7ECF3] shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] rounded-xl hover:shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] transition-all"
                  >
                    <div className="flex-1 mr-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-[#E7ECF3] shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] border-none rounded-lg px-3 py-1.5 text-xs font-semibold text-[#202638] focus:outline-none w-full max-w-[200px]"
                          />
                          <button 
                            onClick={() => handleRenameStage(stage.id)}
                            className="p-1.5 rounded-lg bg-[#E7ECF3] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] text-emerald-600 hover:shadow-[inset_1px_1px_2px_#AEB9C9,inset_-1px_-1px_2px_#FFFFFF]"
                            aria-label="Save new stage name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-[#E7ECF3] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] text-[#E5484D] hover:shadow-[inset_1px_1px_2px_#AEB9C9,inset_-1px_-1px_2px_#FFFFFF]"
                            aria-label="Cancel rename"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#202638]">{stage.name}</span>
                          <span className="text-[10px] font-bold text-[#8891A3] bg-[#DCE3ED] px-2 py-0.5 rounded-full">
                            {leadCount} {leadCount === 1 ? 'lead' : 'leads'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Move Up */}
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0 || isSavingOrder}
                        className={`p-2 rounded-lg bg-[#E7ECF3] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_1px_1px_2px_#AEB9C9,inset_-1px_-1px_2px_#FFFFFF] transition-all text-[#5C6478] disabled:opacity-40 disabled:pointer-events-none`}
                        aria-label="Move stage up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === stages.length - 1 || isSavingOrder}
                        className={`p-2 rounded-lg bg-[#E7ECF3] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_1px_1px_2px_#AEB9C9,inset_-1px_-1px_2px_#FFFFFF] transition-all text-[#5C6478] disabled:opacity-40 disabled:pointer-events-none`}
                        aria-label="Move stage down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit stage name */}
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingId(stage.id)
                            setEditingName(stage.name)
                          }}
                          className="p-2 rounded-lg bg-[#E7ECF3] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_1px_1px_2px_#AEB9C9,inset_-1px_-1px_2px_#FFFFFF] text-[#4855E4]"
                          aria-label="Edit stage name"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Stage */}
                      <button
                        onClick={() => initiateDelete(stage)}
                        disabled={stages.length <= 1}
                        className="p-2 rounded-lg bg-[#E7ECF3] shadow-[2px_2px_4px_#AEB9C9,-2px_-2px_4px_#FFFFFF] hover:shadow-[inset_1px_1px_2px_#AEB9C9,inset_-1px_-1px_2px_#FFFFFF] text-[#E5484D] disabled:opacity-40 disabled:pointer-events-none"
                        aria-label="Delete stage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add Stage Form */}
            <form onSubmit={handleAddStage} className="mt-6 flex items-center gap-3">
              <input 
                type="text" 
                placeholder="e.g. Visa Interview Scheduled" 
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                className="flex-1 bg-[#E7ECF3] shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] border-none rounded-xl py-2.5 px-4 text-xs font-semibold text-[#202638] placeholder-[#8891A3] focus:outline-none transition-all"
              />
              <button 
                type="submit" 
                disabled={isAdding || !newStageName.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white shadow-md active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transition-all"
                aria-label="Add stage"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Information panels */}
        <div className="space-y-6">
          <div className="neo-raised p-6">
            <h3 className="text-sm font-bold text-[#202638] mb-3">Customization Rules</h3>
            <p className="text-xs text-[#5C6478] leading-relaxed">
              Custom pipeline stages allow you to adjust AbroadSync to match your consultancy's student recruitment flow.
            </p>
            <ul className="list-disc list-inside text-xs text-[#5C6478] mt-3 space-y-2">
              <li>Changes reflect instantly across the Leads Filters and Kanban board.</li>
              <li>Reordering columns shifts card groupings on the pipeline view.</li>
              <li>Rename triggers database updates for all matching leads.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Migration Deletion Modal Prompt Portaled to document.body */}
      {mounted && showDeleteModal && stageToDelete && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#202638]/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          
          <div className="relative z-10 w-full max-w-md bg-[#E7ECF3] shadow-[0_12px_36px_rgba(32,38,56,0.15)] border border-[#AEB9C9]/20 rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5484D]/10 flex items-center justify-center text-[#E5484D]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#202638] font-display">Delete Stage: {stageToDelete.name}</h3>
            </div>

            <div className="text-xs text-[#5C6478] space-y-3 leading-relaxed">
              <p>
                Are you sure you want to delete the stage <span className="font-bold text-[#202638]">"{stageToDelete.name}"</span>?
              </p>
              
              {activeLeadsCount > 0 ? (
                <div className="p-4 bg-[#FF7A52]/10 border border-[#FF7A52]/20 rounded-xl space-y-3 text-[#FF7A52]">
                  <p className="font-bold">
                    Which stage would you like to move the {activeLeadsCount} active leads to before deleting.
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Target Migration Stage</label>
                    <select
                      value={migrateTarget}
                      onChange={(e) => setMigrateTarget(e.target.value)}
                      className="w-full bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] rounded-xl py-2.5 px-4 outline-none transition-all cursor-pointer"
                    >
                      {otherStages.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <p>This stage has no active leads associated. It will be removed immediately.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting || (activeLeadsCount > 0 && !migrateTarget)}
                className="px-5 py-2.5 bg-[#E5484D] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg active:translate-y-0.5 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
