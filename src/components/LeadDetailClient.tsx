'use client'

import { useState, useRef, useEffect } from 'react'
import { GraduationCap, Globe, CheckCircle2, MessageSquare, Clock, Building, Save, X, Wallet, FolderOpen, Send, Plus, Check } from 'lucide-react'
import { updateLeadDetails, createInteraction, createApplication, toggleFileOpened } from '@/app/actions/leads'
import { createTask, updateTaskStatus } from '@/app/actions/tasks'

export default function LeadDetailClient({ lead, canEdit = true }: { lead: any, canEdit?: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    sscGroup: lead.sscGroup || '',
    sscYear: lead.sscYear || '',
    sscResult: lead.sscResult || '',
    hscGroup: lead.hscGroup || '',
    hscYear: lead.hscYear || '',
    hscResult: lead.hscResult || '',
    bachelorsMajor: lead.bachelorsMajor || '',
    bachelorsYear: lead.bachelorsYear || '',
    bachelorsCgpa: lead.bachelorsCgpa || '',
    mastersMajor: lead.mastersMajor || '',
    mastersYear: lead.mastersYear || '',
    mastersCgpa: lead.mastersCgpa || '',
    preferredStudyLevel: lead.preferredStudyLevel || '',
    preferredCountry: lead.preferredCountry || '',
    preferredCourse: lead.preferredCourse || '',
    preferredIntake: lead.preferredIntake || '',

    workExperience: lead.workExperience || '',
    englishTestStatus: lead.englishTestStatus || '',
    englishTestType: lead.englishTestType || '',
    englishTestScore: lead.englishTestScore || '',
    source: lead.source || '',
    budget: lead.budget || ''
  })

  // Timeline State
  const [noteContent, setNoteContent] = useState('')
  const [isPostingNote, setIsPostingNote] = useState(false)
  const [localInteractions, setLocalInteractions] = useState<any[]>(lead.interactions || [])
  const timelineContainerRef = useRef<HTMLDivElement>(null)

  // Sync interactions from props
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalInteractions(lead.interactions || [])
  }, [lead.interactions])

  // File Opened State
  const [isFileOpened, setIsFileOpened] = useState(lead.isFileOpened || false)
  const [isPendingFileOpened, setIsPendingFileOpened] = useState(false)

  useEffect(() => {
    if (timelineContainerRef.current) {
      timelineContainerRef.current.scrollTo({
        top: timelineContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [localInteractions, lead.initialNote])

  // Task State
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')

  // App State
  const [isAddingApp, setIsAddingApp] = useState(false)
  const [appCountry, setAppCountry] = useState('')
  const [appUniversity, setAppUniversity] = useState('')
  const [appCourse, setAppCourse] = useState('')

  const [intakeMonth, setIntakeMonth] = useState(lead.preferredIntake?.split(' ')[0] || '')
  const [intakeYear, setIntakeYear] = useState(lead.preferredIntake?.split(' ')[1] || '')

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const saveDetails = async () => {
    const finalIntake = [intakeMonth, intakeYear].filter(Boolean).join(' ')
    const updatedData = { ...formData, preferredIntake: finalIntake }
    try {
      await updateLeadDetails(lead.id, updatedData)
      setFormData(updatedData)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePostNote = async () => {
    if (!noteContent.trim()) return
    const content = noteContent
    setNoteContent('')
    setIsPostingNote(true)

    const optimisticNote = {
      id: 'optimistic-' + Date.now(),
      content: content,
      createdAt: new Date().toISOString(),
      counselor: {
        fullName: 'Posting...',
        role: ''
      }
    }

    setLocalInteractions(prev => [...prev, optimisticNote])

    try {
      await createInteraction(lead.id, content)
    } catch (err) {
      setLocalInteractions(prev => prev.filter(n => n.id !== optimisticNote.id))
      setNoteContent(content)
    } finally {
      setIsPostingNote(false)
    }
  }

  const handleAddTask = async () => {
    if (!taskDescription || !taskDueDate) return
    const formDataObj = new FormData()
    formDataObj.append('description', taskDescription)
    formDataObj.append('dueDate', taskDueDate)
    formDataObj.append('counselorId', lead.assignedCounselorId || '')
    formDataObj.append('leadId', lead.id)

    try {
      await createTask(formDataObj)
      setTaskDescription('')
      setTaskDueDate('')
      setIsAddingTask(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending'
    try {
      await updateTaskStatus(taskId, newStatus)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddApp = async () => {
    if (!appCountry || !appUniversity || !appCourse) return
    try {
      await createApplication(lead.id, appCountry, appUniversity, appCourse)
      setAppCountry('')
      setAppUniversity('')
      setAppCourse('')
      setIsAddingApp(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileOpenedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return
    const checked = e.target.checked
    setIsPendingFileOpened(true)
    try {
      await toggleFileOpened(lead.id, checked)
      setIsFileOpened(checked)
    } catch (err) {
      console.error(err)
    } finally {
      setIsPendingFileOpened(false)
    }
  }

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2 px-3 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
  const selectClass = "w-full bg-[#1E1E1E] border border-[#3C3C3C] text-xs font-bold text-white rounded-xl py-2 px-3 outline-none focus:border-[#007ACC] transition-all cursor-pointer"
  
  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Academic & Preferences */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* File Opened Status Card */}
          <div className={`bg-[#252526] rounded-xl shadow-md border border-[#3C3C3C] p-5 flex items-center justify-between transition-colors duration-300 ${
            isFileOpened ? 'border-[#007ACC]' : ''
          }`}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderOpen className={`h-4.5 w-4.5 ${isFileOpened ? 'text-emerald-500' : 'text-gray-400'}`} />
              File Opened Status
            </h3>
            <label className="flex items-center cursor-pointer gap-2">
              {isPendingFileOpened && <span className="text-[10px] text-gray-400 animate-pulse font-bold">Saving...</span>}
              <input 
                type="checkbox" 
                checked={isFileOpened}
                onChange={handleFileOpenedChange}
                disabled={isPendingFileOpened || !canEdit}
                className="w-5 h-5 rounded cursor-pointer accent-emerald-500"
              />
            </label>
          </div>

          {/* Academic History Card */}
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#007ACC]" />
                Academic History
              </h3>
              {!isEditing && canEdit ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-3.5 py-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#2A2D2E] transition-all"
                >
                  Edit
                </button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-red-400 hover:bg-[#2A2D2E] transition-all"
                    aria-label="Cancel editing academic history"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={saveDetails} 
                    className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-emerald-400 hover:bg-[#2A2D2E] transition-all"
                    aria-label="Save academic history details"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            
            <div className="space-y-5">
              {/* SSC Details */}
              {(formData.sscGroup || formData.sscYear || formData.sscResult || isEditing) && (
                <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm">
                  <h4 className="text-xs font-bold text-white mb-3 border-b border-[#3C3C3C] pb-2">SSC / O-Levels</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Group</p>
                      {isEditing ? <input name="sscGroup" value={formData.sscGroup} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.sscGroup || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Year</p>
                      {isEditing ? <input name="sscYear" value={formData.sscYear} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.sscYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Result</p>
                      {isEditing ? <input name="sscResult" value={formData.sscResult} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.sscResult || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* HSC Details */}
              {(formData.hscGroup || formData.hscYear || formData.hscResult || isEditing) && (
                <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm">
                  <h4 className="text-xs font-bold text-white mb-3 border-b border-[#3C3C3C] pb-2">HSC / A-Levels</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Group</p>
                      {isEditing ? <input name="hscGroup" value={formData.hscGroup} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.hscGroup || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Year</p>
                      {isEditing ? <input name="hscYear" value={formData.hscYear} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.hscYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Result</p>
                      {isEditing ? <input name="hscResult" value={formData.hscResult} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.hscResult || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Bachelors Details */}
              {(formData.bachelorsMajor || formData.bachelorsYear || formData.bachelorsCgpa || isEditing) && (
                <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm">
                  <h4 className="text-xs font-bold text-white mb-3 border-b border-[#3C3C3C] pb-2">Bachelor&apos;s Degree</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Major</p>
                      {isEditing ? <input name="bachelorsMajor" value={formData.bachelorsMajor} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.bachelorsMajor || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Year</p>
                      {isEditing ? <input name="bachelorsYear" value={formData.bachelorsYear} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.bachelorsYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">CGPA</p>
                      {isEditing ? <input name="bachelorsCgpa" value={formData.bachelorsCgpa} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.bachelorsCgpa || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Masters Details */}
              {(formData.mastersMajor || formData.mastersYear || formData.mastersCgpa || isEditing) && (
                <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm">
                  <h4 className="text-xs font-bold text-white mb-3 border-b border-[#3C3C3C] pb-2">Master&apos;s Degree</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Major</p>
                      {isEditing ? <input name="mastersMajor" value={formData.mastersMajor} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.mastersMajor || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">Year</p>
                      {isEditing ? <input name="mastersYear" value={formData.mastersYear} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.mastersYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1">CGPA</p>
                      {isEditing ? <input name="mastersCgpa" value={formData.mastersCgpa} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold">{formData.mastersCgpa || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#007ACC]" />
                Preferences
              </h3>
              {!isEditing && canEdit ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-3.5 py-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#2A2D2E] transition-all"
                >
                  Edit
                </button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-red-400 hover:bg-[#2A2D2E] transition-all"
                    aria-label="Cancel editing preferences"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={saveDetails} 
                    className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-emerald-400 hover:bg-[#2A2D2E] transition-all"
                    aria-label="Save preference changes"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1">Preferred Intake</p>
                {isEditing ? (
                  <div className="flex gap-2">
                    <select value={intakeMonth} onChange={(e) => setIntakeMonth(e.target.value)} className="w-1/2 bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2 px-3 text-xs font-semibold text-white">
                      <option value="">Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select value={intakeYear} onChange={(e) => setIntakeYear(e.target.value)} className="w-1/2 bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2 px-3 text-xs font-semibold text-white">
                      <option value="">Year</option>
                      {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-white">{formData.preferredIntake || '-'}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1">Preferred Level</p>
                {isEditing ? <input name="preferredStudyLevel" value={formData.preferredStudyLevel} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold bg-[#1E1E1E] p-2.5 rounded-xl border border-[#3C3C3C]">{formData.preferredStudyLevel || 'Not specified'}</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1">Preferred Country</p>
                {isEditing ? <input name="preferredCountry" value={formData.preferredCountry} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold bg-[#1E1E1E] p-2.5 rounded-xl border border-[#3C3C3C]">{formData.preferredCountry || 'Not specified'}</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1">Preferred Course</p>
                {isEditing ? <input name="preferredCourse" value={formData.preferredCourse} onChange={handleEditChange} className={inputClass} /> : <p className="text-xs text-white font-bold bg-[#1E1E1E] p-2.5 rounded-xl border border-[#3C3C3C]">{formData.preferredCourse || 'Not specified'}</p>}
              </div>
            </div>
          </div>

          {/* Professional Experience Card */}
          {(formData.workExperience || isEditing) && (
            <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#FF7A52]" />
                  Experience
                </h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="px-3.5 py-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#2A2D2E] transition-all"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-red-400 hover:bg-[#2A2D2E] transition-all"
                      aria-label="Cancel editing experience details"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={saveDetails} 
                      className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-emerald-400 hover:bg-[#2A2D2E] transition-all"
                      aria-label="Save experience details changes"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {isEditing ? <textarea name="workExperience" value={formData.workExperience} onChange={handleEditChange} className={`${inputClass} min-h-[85px]`} /> : <p className="text-xs font-semibold text-gray-300 whitespace-pre-wrap">{formData.workExperience}</p>}
            </div>
          )}

          {/* English Proficiency Card */}
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#21C285]" />
                English Proficiency
              </h3>
              {!isEditing && canEdit ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-3.5 py-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#2A2D2E] transition-all"
                >
                  Edit
                </button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-red-400 hover:bg-[#2A2D2E] transition-all"
                    aria-label="Cancel editing English proficiency"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={saveDetails} 
                    className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-emerald-400 hover:bg-[#2A2D2E] transition-all"
                    aria-label="Save English proficiency changes"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <select name="englishTestStatus" value={formData.englishTestStatus} onChange={handleEditChange} className={selectClass}>
                  <option value="">Select Status</option>
                  <option value="Appeared">Appeared</option>
                  <option value="Planning">Planning</option>
                  <option value="Not Required">Not Required</option>
                </select>
                {formData.englishTestStatus === 'Appeared' && (
                  <div className="flex gap-3">
                    <input name="englishTestType" placeholder="Test Type (IELTS, PTE)" value={formData.englishTestType} onChange={handleEditChange} className={inputClass} />
                    <input name="englishTestScore" placeholder="Score" value={formData.englishTestScore} onChange={handleEditChange} className={inputClass} />
                  </div>
                )}
              </div>
            ) : (
              formData.englishTestStatus === 'Appeared' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Test Type</p>
                    <p className="text-base font-black text-white font-display">{formData.englishTestType || '-'}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Overall Score</p>
                    <p className="text-base font-black text-white font-display">{formData.englishTestScore || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Test Status</p>
                    <p className="text-xs font-bold text-white">{formData.englishTestStatus || 'Not specified'}</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Budget & Origin Card */}
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#FF7A52]" />
                Origin & Budget
              </h3>
              {!isEditing && canEdit ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-3.5 py-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#2A2D2E] transition-all"
                >
                  Edit
                </button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-red-400 hover:bg-[#2A2D2E] transition-all"
                    aria-label="Cancel editing origin and budget details"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={saveDetails} 
                    className="p-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-emerald-400 hover:bg-[#2A2D2E] transition-all"
                    aria-label="Save origin and budget changes"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C]">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Source</p>
                {isEditing ? (
                  <select name="source" value={formData.source} onChange={handleEditChange} className={selectClass}>
                    <option value="">Unknown</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Word of Mouth">Word of Mouth</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Agent">Agent</option>
                    <option value="Event/Seminar">Event/Seminar</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-xs font-bold text-white">{formData.source || 'Unknown'}</p>
                )}
              </div>
              <div className="p-3 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C]">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Budget</p>
                {isEditing ? (
                  <input name="budget" value={formData.budget} onChange={handleEditChange} className={inputClass} placeholder="e.g. $20k" />
                ) : (
                  <p className="text-xs font-bold text-white">{formData.budget || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline, Followups & Apps */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Consultation Notes Timeline */}
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md flex flex-col h-[400px]">
            <div className="p-5 border-b border-[#3C3C3C] flex justify-between items-center bg-[#1E1E1E] rounded-t-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-[#007ACC]" />
                Activity Timeline
              </h3>
            </div>
            
            <div ref={timelineContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
              {lead.initialNote && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-xl bg-[#333333] border border-[#3C3C3C] flex items-center justify-center text-[#007ACC]">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#1E1E1E] border border-[#3C3C3C] p-4 rounded-xl text-xs text-gray-300">
                      <div className="flex justify-between items-start mb-2 border-b border-[#3C3C3C] pb-1.5">
                        <p className="font-bold text-[#007ACC]">Initial Inquiry Note</p>
                        <p className="text-[10px] text-gray-500">{new Date(lead.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed font-semibold">{lead.initialNote}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {localInteractions.map((interaction: any) => (
                <div key={interaction.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-xl bg-[#333333] border border-[#3C3C3C] flex items-center justify-center text-[#0E639C]">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#1E1E1E] border border-[#3C3C3C] p-4 rounded-xl text-xs text-gray-300">
                      <div className="flex justify-between items-start mb-2 border-b border-[#3C3C3C] pb-1.5">
                        <p className="font-bold text-white">
                          {interaction.counselor ? `${interaction.counselor.fullName} ${interaction.counselor.role ? `(${interaction.counselor.role})` : ''}` : 'System'}
                        </p>
                        <p className="text-[10px] text-gray-500">{new Date(interaction.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed font-semibold">{interaction.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {localInteractions.length === 0 && !lead.initialNote && (
                <div className="text-center text-gray-500 py-12 font-bold text-xs">
                  No activity recorded yet.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#3C3C3C] bg-[#1E1E1E] rounded-b-xl">
              <div className="flex gap-3">
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add a consultation note..." 
                  className="flex-1 bg-[#252526] border border-[#3C3C3C] rounded-xl p-3 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] resize-none h-12 transition-all duration-200 focus:h-24"
                ></textarea>
                <button 
                  onClick={handlePostNote}
                  disabled={isPostingNote}
                  className="px-5 rounded-xl bg-[#0E639C] text-white text-xs font-bold shadow-md hover:bg-[#1177BB] active:translate-y-0.5 transition-all duration-150 h-12 self-end"
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Follow-Up Tasks Card */}
          {canEdit && (
            <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#FF7A52]" />
                  Follow-Up Tasks
                </h3>
                <button 
                  onClick={() => setIsAddingTask(!isAddingTask)} 
                  className="px-3.5 py-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#2A2D2E] transition-all"
                >
                  {isAddingTask ? 'Cancel' : '+ Add Task'}
                </button>
              </div>
              
              {isAddingTask && (
                <div className="mb-5 bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm p-4 rounded-xl space-y-4">
                  <input 
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    placeholder="Task description..."
                    className={inputClass}
                  />
                  <div className="flex items-center gap-4">
                    <input 
                      type="datetime-local" 
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      className={`${inputClass} flex-1`}
                    />
                    <button 
                      onClick={handleAddTask} 
                      className="px-5 py-2.5 rounded-xl bg-[#0E639C] text-white text-xs font-bold shadow-md hover:bg-[#1177BB] active:translate-y-0.5 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {lead.tasks?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 border border-dashed border-[#3C3C3C] rounded-xl font-bold text-xs">
                    No upcoming tasks.
                  </div>
                ) : (
                  lead.tasks?.map((task: any) => (
                    <div key={task.id} className={`flex items-start gap-3 bg-[#1E1E1E] p-4 rounded-xl border border-[#3C3C3C] transition-all ${task.status === 'Completed' ? 'opacity-50' : 'group hover:border-[#555555]'}`}>
                      <input 
                        type="checkbox" 
                        disabled={!canEdit}
                        checked={task.status === 'Completed'}
                        onChange={() => handleTaskStatus(task.id, task.status)}
                        className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#0E639C] disabled:opacity-50 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-normal ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-white'}`}>{task.description}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1.5">
                          <p className="text-[10px] text-[#FF7A52] font-bold flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {new Date(task.dueDate).toLocaleString()} {task.status === 'Completed' && ' (Completed)'}
                          </p>
                          {task.counselor && (
                            <span className="text-[10px] text-gray-500 font-semibold">
                              • Added by {task.counselor.fullName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Applications list */}
      <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-[#007ACC]" /> Applications
          </h3>
          {canEdit && (
            <button 
              onClick={() => setIsAddingApp(!isAddingApp)} 
              className="px-3.5 py-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#2A2D2E] transition-all"
            >
              {isAddingApp ? 'Cancel' : '+ Add Application'}
            </button>
          )}
        </div>

        {isAddingApp && (
          <div className="mb-5 bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm p-5 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              value={appCountry}
              onChange={e => setAppCountry(e.target.value)}
              placeholder="Country"
              className={inputClass}
            />
            <input 
              value={appUniversity}
              onChange={e => setAppUniversity(e.target.value)}
              placeholder="University Name"
              className={inputClass}
            />
            <input 
              value={appCourse}
              onChange={e => setAppCourse(e.target.value)}
              placeholder="Course Name"
              className={inputClass}
            />
            <button 
              onClick={handleAddApp} 
              className="px-5 py-2 rounded-xl bg-[#0E639C] text-white text-xs font-bold shadow-md hover:bg-[#1177BB] active:translate-y-0.5 transition-all"
            >
              Save Application
            </button>
          </div>
        )}

        <div className="space-y-4">
          {(!lead.applications || lead.applications.length === 0) ? (
            <div className="text-center text-gray-500 py-8 border border-dashed border-[#3C3C3C] rounded-xl font-bold text-xs">
              No applications submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lead.applications.map((app: any) => (
                <div key={app.id} className="p-5 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] shadow-sm flex flex-col justify-between min-h-36">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#333333] border border-[#3C3C3C] text-[#007ACC] rounded-full">
                      {app.country}
                    </span>
                    {app.status !== 'Pending' && (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        app.status === 'Offer Received' ? 'bg-[#333333] text-emerald-400 border-[#3C3C3C]' : 'bg-[#333333] text-red-400 border-[#3C3C3C]'
                      }`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1 font-display">{app.university}</h4>
                    <p className="text-[11px] text-gray-400 font-semibold">{app.courseName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
