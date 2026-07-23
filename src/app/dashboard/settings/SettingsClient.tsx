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
import { updateCompanyProfile } from '@/app/actions/company'
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  AlertTriangle,
  Loader2,
  Building2,
  Upload,
  Image as ImageIcon,
  FileText,
  Search,
  LogIn,
  LogOut,
  MessageSquare,
  UserPlus,
  FileEdit,
  PlusCircle,
  Clock,
  ShieldCheck,
  User,
  Bell
} from 'lucide-react'
import PushNotificationToggle from '@/components/PushNotificationToggle'

interface SettingsClientProps {
  initialStages: PipelineStage[]
  stageLeadCounts: { [key: string]: number }
  initialCompany: { id: string; name: string; logoUrl?: string | null }
  activityLogs?: any[]
  userRole?: string
}

export default function SettingsClient({
  initialStages,
  stageLeadCounts,
  initialCompany,
  activityLogs = [],
  userRole = 'Manager',
}: SettingsClientProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Company Profile State
  const [companyName, setCompanyName] = useState(initialCompany?.name || '')
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(initialCompany?.logoUrl || null)
  const [isSavingCompany, setIsSavingCompany] = useState(false)
  const [companySuccessMsg, setCompanySuccessMsg] = useState('')
  const [companyErrorMsg, setCompanyErrorMsg] = useState('')

  // Audit Search State
  const [auditSearch, setAuditSearch] = useState('')

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo image file size must be under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setCompanyLogoUrl(evt.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingCompany(true)
    setCompanySuccessMsg('')
    setCompanyErrorMsg('')

    const res = await updateCompanyProfile({
      name: companyName,
      logoUrl: companyLogoUrl,
    })
    setIsSavingCompany(false)

    if (res.error) {
      setCompanyErrorMsg(res.error)
    } else {
      setCompanySuccessMsg('Company name and logo updated successfully!')
      setTimeout(() => setCompanySuccessMsg(''), 3000)
    }
  }

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
      const nextIndex = stages.length > 0 ? Math.max(...stages.map(s => s.orderIndex)) + 1 : 0
      setStages(prev => [...prev, {
        id: 'temp-' + Date.now(),
        companyId: '',
        name,
        orderIndex: nextIndex,
        createdAt: new Date().toISOString()
      }])
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
    
    const availableTargets = stages.filter(s => s.id !== stage.id)
    if (availableTargets.length > 0) {
      setMigrateTarget(availableTargets[0].name)
    } else {
      setMigrateTarget('')
    }

    setShowDeleteModal(true)
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

  const filteredLogs = activityLogs.filter((log) => {
    const search = auditSearch.toLowerCase()
    const actorName = log.actor?.fullName?.toLowerCase() || ''
    const actorEmail = log.actor?.email?.toLowerCase() || log.metadata?.email?.toLowerCase() || ''
    const action = log.action.toLowerCase()
    return actorName.includes(search) || actorEmail.includes(search) || action.includes(search)
  })

  const renderActionBadge = (action: string) => {
    switch (action) {
      case 'user.login':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
            <LogIn className="w-3 h-3" /> Logged In
          </span>
        )
      case 'user.logout':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-500/10 text-gray-400 border border-gray-500/20 flex items-center gap-1 w-fit">
            <LogOut className="w-3 h-3" /> Logged Out
          </span>
        )
      case 'interaction.created':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1 w-fit">
            <MessageSquare className="w-3 h-3" /> Added Note
          </span>
        )
      case 'lead.created':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">
            <PlusCircle className="w-3 h-3" /> Created Lead
          </span>
        )
      case 'lead.status_updated':
      case 'lead.details_updated':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1 w-fit">
            <FileEdit className="w-3 h-3" /> Updated Lead
          </span>
        )
      case 'user.invited':
      case 'invite.accepted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
            <UserPlus className="w-3 h-3" /> Staff Action
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 w-fit">
            {action}
          </span>
        )
    }
  }

  return (
    <div className="space-y-8">
      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-[#E5484D] bg-[#E5484D]/8 p-4 rounded-xl shadow-sm border border-[#E5484D]/10">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Web Push Notifications Settings Card */}
      <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Browser Push Notifications</h3>
              <p className="text-xs text-gray-400">Receive instant push alerts when students are assigned to you, consultation notes are posted, or tasks are assigned.</p>
            </div>
          </div>
          <PushNotificationToggle />
        </div>
      </div>

      {/* Company Branding & Logo Settings */}
      <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#007ACC]/20 text-[#007ACC] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">Company Profile & Logo</h3>
            <p className="text-xs text-gray-400">Customize your agency name and official logo displayed on QR inquiry forms and PDF student reports.</p>
          </div>
        </div>

        {companySuccessMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs font-semibold text-emerald-400">
            {companySuccessMsg}
          </div>
        )}

        {companyErrorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs font-semibold text-red-400">
            {companyErrorMsg}
          </div>
        )}

        <form onSubmit={handleSaveCompany} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Agency / Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. AbroadSync Education Consultancy"
                className="w-full px-4 py-3 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Official Agency Logo
              </label>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#1E1E1E] border border-[#3C3C3C] flex items-center justify-center overflow-hidden shrink-0">
                  {companyLogoUrl ? (
                    <img src={companyLogoUrl} alt="Company Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] hover:bg-[#3C3C3C] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#007ACC]" />
                      Upload New Logo
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">Recommended: Square or horizontal PNG/JPEG (Max 2MB)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#3C3C3C]">
            <button
              type="submit"
              disabled={isSavingCompany}
              className="px-6 py-2.5 rounded-xl bg-[#007ACC] hover:bg-[#0062A3] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Company Profile
            </button>
          </div>
        </form>
      </div>

      {/* Customizable Pipeline Stages */}
      <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white font-display">Customizable Pipeline Stages</h3>
          <p className="text-xs text-gray-400">Define, reorder, and customize the lead workflow columns for your consultancy.</p>
        </div>

        {/* Add Stage Form */}
        <form onSubmit={handleAddStage} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter new stage name..."
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
          />
          <button
            type="submit"
            disabled={isAdding || !newStageName.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#007ACC] hover:bg-[#0062A3] text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Stage
          </button>
        </form>

        {/* Stages List */}
        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const count = stageLeadCounts[stage.name] || 0
            const isEditingThis = editingId === stage.id

            return (
              <div
                key={stage.id}
                className="flex items-center justify-between p-4 bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl hover:border-gray-600 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 mr-4">
                  <span className="text-xs font-mono font-bold text-gray-500 w-6">#{idx + 1}</span>

                  {isEditingThis ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-[#252526] border border-[#007ACC] text-xs font-semibold text-white outline-none"
                      />
                      <button
                        onClick={() => handleRenameStage(stage.id)}
                        className="p-1.5 rounded-lg bg-[#007ACC] text-white hover:bg-[#0062A3]"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-[#333333] text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white">{stage.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#333333] border border-[#3C3C3C] text-[10px] font-mono text-gray-400 font-bold">
                        {count} {count === 1 ? 'lead' : 'leads'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0 || isSavingOrder}
                    className="p-1.5 rounded-lg bg-[#252526] border border-[#3C3C3C] text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === stages.length - 1 || isSavingOrder}
                    className="p-1.5 rounded-lg bg-[#252526] border border-[#3C3C3C] text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(stage.id)
                      setEditingName(stage.name)
                    }}
                    className="p-1.5 rounded-lg bg-[#252526] border border-[#3C3C3C] text-gray-400 hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => initiateDelete(stage)}
                    className="p-1.5 rounded-lg bg-[#252526] border border-[#3C3C3C] text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* --- SUPER ADMIN ONLY: COMPANY ACTIVITY & AUDIT LOG --- */}
      {userRole === 'Super Admin' && (
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3C3C3C] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">Agency Activity & Audit Log</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Audit trail of all team member actions including logins, logouts, student updates, and task creation.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter user or action..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC]"
              />
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No activity logs found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#3C3C3C]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1E1E1E] border-b border-[#3C3C3C] text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Actor / User</th>
                    <th className="p-3.5">Action Event</th>
                    <th className="p-3.5">Entity & Details</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3C3C3C] bg-[#252526]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1E1E1E]/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {log.actor?.fullName || log.metadata?.fullName || 'User'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {log.actor?.email || log.metadata?.email || log.actorId}
                        </div>
                      </td>
                      <td className="p-3.5">{renderActionBadge(log.action)}</td>
                      <td className="p-3.5 font-mono text-[11px] text-gray-300">
                        {log.entityType && (
                          <span className="font-semibold text-gray-400 mr-1.5">[{log.entityType}]</span>
                        )}
                        {log.metadata ? JSON.stringify(log.metadata) : log.entityId || '-'}
                      </td>
                      <td className="p-3.5 text-gray-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Stage Migration Modal */}
      {mounted && showDeleteModal && stageToDelete && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Delete Stage: &quot;{stageToDelete.name}&quot;</h3>

            <div className="text-xs text-gray-300 space-y-3">
              {activeLeadsCount > 0 ? (
                <div className="space-y-3">
                  <p className="text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Warning: {activeLeadsCount} active {activeLeadsCount === 1 ? 'lead' : 'leads'} currently in this stage.
                  </p>
                  <p>
                    Please select a target stage to migrate these active leads to before deleting:
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Target Migration Stage</label>
                    <select
                      value={migrateTarget}
                      onChange={(e) => setMigrateTarget(e.target.value)}
                      className="w-full bg-[#1E1E1E] border border-[#3C3C3C] text-xs font-bold text-white rounded-xl py-2.5 px-4 outline-none focus:border-[#007ACC] transition-all cursor-pointer"
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
                className="px-5 py-2.5 bg-[#333333] border border-[#3C3C3C] text-xs font-bold text-white hover:bg-[#2A2D2E] transition-all rounded-xl"
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
