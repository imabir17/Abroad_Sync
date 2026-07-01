'use client'

import { useState, useRef, useEffect } from 'react'
import { GraduationCap, Globe, CheckCircle2, MessageSquare, Clock, Building, Save, X, Wallet, FolderOpen } from 'lucide-react'
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
  const [localInteractions, setLocalInteractions] = useState(lead.interactions || [])
  const timelineContainerRef = useRef<HTMLDivElement>(null)

  // Sync interactions from props
  useEffect(() => {
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
    await updateLeadDetails(lead.id, updatedData)
    setFormData(updatedData)
    setIsEditing(false)
  }

  const handlePostNote = async () => {
    if (!noteContent.trim()) return
    const content = noteContent
    setNoteContent('')
    setIsPostingNote(true)

    // Add optimistic note
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
      // Rollback on error
      setLocalInteractions(prev => prev.filter(n => n.id !== optimisticNote.id))
      setNoteContent(content)
    } finally {
      setIsPostingNote(false)
    }
  }

  const handleAddTask = async () => {
    if (!taskDescription || !taskDueDate) return
    const formData = new FormData()
    formData.append('description', taskDescription)
    formData.append('dueDate', taskDueDate)
    formData.append('counselorId', lead.assignedCounselorId || '') // Generic task assignment fallback if needed
    // Wait, the schema actually uses leadId for tasks assigned directly to leads. 
    // In actions/tasks.ts: it extracts leadId, counselorId, description, dueDate.
    formData.append('leadId', lead.id)

    await createTask(formData)
    setTaskDescription('')
    setTaskDueDate('')
    setIsAddingTask(false)
  }

  const handleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending'
    await updateTaskStatus(taskId, newStatus)
  }

  const handleAddApp = async () => {
    if (!appCountry || !appUniversity || !appCourse) return
    await createApplication(lead.id, appCountry, appUniversity, appCourse)
    setAppCountry('')
    setAppUniversity('')
    setAppCourse('')
    setIsAddingApp(false)
  }

  const handleFileOpenedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return
    const checked = e.target.checked
    setIsPendingFileOpened(true)
    await toggleFileOpened(lead.id, checked)
    setIsFileOpened(checked)
    setIsPendingFileOpened(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`border rounded-xl p-4 shadow-sm shadow-black/20 flex items-center justify-between transition-colors ${isFileOpened ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-neutral-900 border-neutral-800'}`}>
            <h3 className="text-md font-semibold text-white flex items-center">
              <FolderOpen className={`h-4 w-4 mr-2 ${isFileOpened ? 'text-emerald-400' : 'text-neutral-500'}`} /> File Opened Status
            </h3>
            <label className="flex items-center cursor-pointer">
              {isPendingFileOpened && <span className="text-xs text-neutral-500 mr-2 animate-pulse">Saving...</span>}
              <input 
                type="checkbox" 
                checked={isFileOpened}
                onChange={handleFileOpenedChange}
                disabled={isPendingFileOpened || !canEdit}
                className="h-5 w-5 rounded border-neutral-700 bg-neutral-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
              />
            </label>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-blue-400" /> Academic History
              </h3>
              {!isEditing && canEdit ? (
                <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-blue-400 hover:text-blue-300">Edit</button>
              ) : isEditing ? (
                <div className="flex space-x-2">
                  <button onClick={() => setIsEditing(false)} className="text-xs text-neutral-400 hover:text-white"><X className="h-4 w-4"/></button>
                  <button onClick={saveDetails} className="text-xs text-green-400 hover:text-green-300"><Save className="h-4 w-4"/></button>
                </div>
              ) : null}
            </div>
            
            <div className="space-y-6">
              {/* SSC Details */}
              {(formData.sscGroup || formData.sscYear || formData.sscResult || isEditing) && (
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="text-sm font-medium text-neutral-200 mb-3 border-b border-neutral-800 pb-2">SSC / O-Levels</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Group</p>
                      {isEditing ? <input name="sscGroup" value={formData.sscGroup} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.sscGroup || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Year</p>
                      {isEditing ? <input name="sscYear" value={formData.sscYear} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.sscYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Result</p>
                      {isEditing ? <input name="sscResult" value={formData.sscResult} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.sscResult || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* HSC Details */}
              {(formData.hscGroup || formData.hscYear || formData.hscResult || isEditing) && (
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="text-sm font-medium text-neutral-200 mb-3 border-b border-neutral-800 pb-2">HSC / A-Levels</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Group</p>
                      {isEditing ? <input name="hscGroup" value={formData.hscGroup} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.hscGroup || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Year</p>
                      {isEditing ? <input name="hscYear" value={formData.hscYear} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.hscYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Result</p>
                      {isEditing ? <input name="hscResult" value={formData.hscResult} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.hscResult || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Bachelors Details */}
              {(formData.bachelorsMajor || formData.bachelorsYear || formData.bachelorsCgpa || isEditing) && (
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="text-sm font-medium text-neutral-200 mb-3 border-b border-neutral-800 pb-2">Bachelor's Degree</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Major</p>
                      {isEditing ? <input name="bachelorsMajor" value={formData.bachelorsMajor} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.bachelorsMajor || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Year</p>
                      {isEditing ? <input name="bachelorsYear" value={formData.bachelorsYear} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.bachelorsYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">CGPA</p>
                      {isEditing ? <input name="bachelorsCgpa" value={formData.bachelorsCgpa} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.bachelorsCgpa || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Masters Details */}
              {(formData.mastersMajor || formData.mastersYear || formData.mastersCgpa || isEditing) && (
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <h4 className="text-sm font-medium text-neutral-200 mb-3 border-b border-neutral-800 pb-2">Master's Degree</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Major</p>
                      {isEditing ? <input name="mastersMajor" value={formData.mastersMajor} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.mastersMajor || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Year</p>
                      {isEditing ? <input name="mastersYear" value={formData.mastersYear} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.mastersYear || '-'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">CGPA</p>
                      {isEditing ? <input name="mastersCgpa" value={formData.mastersCgpa} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-300 font-medium">{formData.mastersCgpa || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-indigo-400" /> Preferences
              </h3>
              {!isEditing && canEdit ? (
                <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-blue-400 hover:text-blue-300">Edit</button>
              ) : isEditing ? (
                <div className="flex space-x-2">
                  <button onClick={() => setIsEditing(false)} className="text-xs text-neutral-400 hover:text-white"><X className="h-4 w-4"/></button>
                  <button onClick={saveDetails} className="text-xs text-green-400 hover:text-green-300"><Save className="h-4 w-4"/></button>
                </div>
              ) : null}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Preferred Intake</p>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <select value={intakeMonth} onChange={(e) => setIntakeMonth(e.target.value)} className="w-1/2 bg-neutral-900 border border-neutral-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
                      <option value="">Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select value={intakeYear} onChange={(e) => setIntakeYear(e.target.value)} className="w-1/2 bg-neutral-900 border border-neutral-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
                      <option value="">Year</option>
                      {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-white">{formData.preferredIntake || '-'}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Preferred Level</p>
                {isEditing ? <input name="preferredStudyLevel" value={formData.preferredStudyLevel} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-200 font-medium bg-neutral-950 p-2 rounded-md border border-neutral-800">{formData.preferredStudyLevel || 'Not specified'}</p>}
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Preferred Country</p>
                {isEditing ? <input name="preferredCountry" value={formData.preferredCountry} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-200 font-medium bg-neutral-950 p-2 rounded-md border border-neutral-800">{formData.preferredCountry || 'Not specified'}</p>}
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Preferred Course</p>
                {isEditing ? <input name="preferredCourse" value={formData.preferredCourse} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" /> : <p className="text-sm text-neutral-200 font-medium bg-neutral-950 p-2 rounded-md border border-neutral-800">{formData.preferredCourse || 'Not specified'}</p>}
              </div>
            </div>
          </div>

          {(formData.workExperience || isEditing) && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-yellow-500" /> Professional Experience
                </h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-blue-400 hover:text-blue-300">Edit</button>
                ) : (
                  <div className="flex space-x-2">
                    <button onClick={() => setIsEditing(false)} className="text-xs text-neutral-400 hover:text-white"><X className="h-4 w-4"/></button>
                    <button onClick={saveDetails} className="text-xs text-green-400 hover:text-green-300"><Save className="h-4 w-4"/></button>
                  </div>
                )}
              </div>
              {isEditing ? <textarea name="workExperience" value={formData.workExperience} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white min-h-[80px]" /> : <p className="text-sm text-neutral-300 whitespace-pre-wrap">{formData.workExperience}</p>}
            </div>
          )}

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-400" /> English Proficiency
              </h3>
              {!isEditing && canEdit ? (
                <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-blue-400 hover:text-blue-300">Edit</button>
              ) : isEditing ? (
                <div className="flex space-x-2">
                  <button onClick={() => setIsEditing(false)} className="text-xs text-neutral-400 hover:text-white"><X className="h-4 w-4"/></button>
                  <button onClick={saveDetails} className="text-xs text-green-400 hover:text-green-300"><Save className="h-4 w-4"/></button>
                </div>
              ) : null}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <select name="englishTestStatus" value={formData.englishTestStatus} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white">
                  <option value="">Select Status</option>
                  <option value="Appeared">Appeared</option>
                  <option value="Planning">Planning</option>
                  <option value="Not Required">Not Required</option>
                </select>
                {formData.englishTestStatus === 'Appeared' && (
                  <div className="flex gap-2">
                    <input name="englishTestType" placeholder="Test Type (IELTS, PTE)" value={formData.englishTestType} onChange={handleEditChange} className="w-1/2 bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white" />
                    <input name="englishTestScore" placeholder="Score" value={formData.englishTestScore} onChange={handleEditChange} className="w-1/2 bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white" />
                  </div>
                )}
              </div>
            ) : (
              formData.englishTestStatus === 'Appeared' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg text-center">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Test Type</p>
                    <p className="text-lg font-semibold text-white">{formData.englishTestType || '-'}</p>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg text-center">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Overall Score</p>
                    <p className="text-lg font-semibold text-white">{formData.englishTestScore || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Test Status</p>
                    <p className="text-md font-medium text-white">{formData.englishTestStatus || 'Not specified'}</p>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-rose-400" /> Origin & Budget
              </h3>
              {!isEditing && canEdit ? (
                <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-blue-400 hover:text-blue-300">Edit</button>
              ) : isEditing ? (
                <div className="flex space-x-2">
                  <button onClick={() => setIsEditing(false)} className="text-xs text-neutral-400 hover:text-white"><X className="h-4 w-4"/></button>
                  <button onClick={saveDetails} className="text-xs text-green-400 hover:text-green-300"><Save className="h-4 w-4"/></button>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Source</p>
                {isEditing ? (
                  <select name="source" value={formData.source} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white">
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
                  <p className="text-md font-medium text-white">{formData.source || 'Unknown'}</p>
                )}
              </div>
              <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Budget</p>
                {isEditing ? (
                  <input name="budget" value={formData.budget} onChange={handleEditChange} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1 text-sm text-white" placeholder="e.g. $20k" />
                ) : (
                  <p className="text-md font-medium text-white">{formData.budget || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm shadow-black/20 flex flex-col h-[400px]">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-indigo-400" /> Activity Timeline
              </h3>
            </div>
            <div ref={timelineContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
              {lead.initialNote && (
                <div className="flex space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg text-sm text-neutral-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-medium text-blue-400">
                          Initial Inquiry Note
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(lead.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap">{lead.initialNote}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {localInteractions.map((interaction: any) => (
                <div key={interaction.id} className="flex space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg text-sm text-neutral-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-medium text-neutral-400">
                          {interaction.counselor ? `${interaction.counselor.fullName} ${interaction.counselor.role ? `(${interaction.counselor.role})` : ''}` : 'System'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(interaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap">{interaction.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {localInteractions.length === 0 && !lead.initialNote && (
                <div className="text-center text-neutral-500 py-8">
                  No activity recorded yet.
                </div>
              )}
            </div>
            {canEdit && (
              <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
                <div className="flex space-x-3">
                  <textarea 
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add a consultation note..." 
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-12 transition-all duration-200 focus:h-24"
                  ></textarea>
                  <button 
                    onClick={handlePostNote}
                    disabled={isPostingNote}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors h-12 self-end"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-amber-400" /> Follow-Up Tasks
                </h3>
                <button 
                  onClick={() => setIsAddingTask(!isAddingTask)} 
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  {isAddingTask ? 'Cancel' : '+ Add Task'}
                </button>
              </div>
              
              {isAddingTask && (
                <div className="mb-4 bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-3">
                  <input 
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    placeholder="Task description..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white"
                  />
                  <div className="flex items-center space-x-3">
                    <input 
                      type="datetime-local" 
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white flex-1"
                    />
                    <button onClick={handleAddTask} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Save</button>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {lead.tasks?.length === 0 ? (
                  <div className="text-center text-neutral-500 py-6 border border-dashed border-neutral-800 rounded-lg">
                    No upcoming tasks.
                  </div>
                ) : (
                  lead.tasks?.map((task: any) => (
                    <div key={task.id} className={`flex items-start space-x-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800 transition-colors ${task.status === 'Completed' ? 'opacity-50' : 'group hover:border-neutral-700'}`}>
                      <input 
                        type="checkbox" 
                        disabled={!canEdit}
                        checked={task.status === 'Completed'}
                        onChange={() => handleTaskStatus(task.id, task.status)}
                        className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50" 
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-neutral-400' : 'text-neutral-200'}`}>{task.description}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <p className="text-xs text-amber-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {new Date(task.dueDate).toLocaleString()} {task.status === 'Completed' && ' (Completed)'}
                          </p>
                          {task.counselor && (
                            <span className="text-xs text-neutral-500">
                              • Added by {task.counselor.fullName} ({task.counselor.role})
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
      
      {/* Applications Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Building className="h-5 w-5 mr-2 text-purple-400" /> Applications
          </h3>
          {canEdit && (
            <button 
              onClick={() => setIsAddingApp(!isAddingApp)} 
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              {isAddingApp ? 'Cancel' : '+ Add Application'}
            </button>
          )}
        </div>

        {isAddingApp && (
          <div className="mb-4 bg-neutral-950 p-4 rounded-lg border border-neutral-800 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input 
              value={appCountry}
              onChange={e => setAppCountry(e.target.value)}
              placeholder="Country"
              className="bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white"
            />
            <input 
              value={appUniversity}
              onChange={e => setAppUniversity(e.target.value)}
              placeholder="University Name"
              className="bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white"
            />
            <input 
              value={appCourse}
              onChange={e => setAppCourse(e.target.value)}
              placeholder="Course Name"
              className="bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white"
            />
            <button onClick={handleAddApp} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Save Application</button>
          </div>
        )}

        <div className="space-y-3">
          {(!lead.applications || lead.applications.length === 0) ? (
            <div className="text-center text-neutral-500 py-6 border border-dashed border-neutral-800 rounded-lg">
              No applications submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {lead.applications.map((app: any) => (
                <div key={app.id} className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                      {app.country}
                    </span>
                    {app.status !== 'Pending' && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${app.status === 'Offer Received' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {app.status}
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-medium mb-1">{app.university}</h4>
                  <p className="text-sm text-neutral-400">{app.courseName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
