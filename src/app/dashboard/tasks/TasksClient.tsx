'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createPortal } from 'react-dom'
import { createClient } from '@/utils/supabase/client'
import { createTask, updateTaskStatus, deleteTask } from '@/app/actions/tasks'
import { CheckSquare, Clock, Plus, Trash2, X, AlertTriangle, Calendar, User, Loader2 } from 'lucide-react'
import Link from 'next/link'

// SWR Tasks Fetcher
const tasksFetcher = async () => {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []

  const { data: user } = await supabase
    .from('User')
    .select('id, role, companyId')
    .eq('id', session.user.id)
    .single()

  if (!user) return []

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'

  let query = supabase
    .from('Task')
    .select('*, counselor:User!inner(fullName, role, companyId), lead:Lead(id, fullName)')
    .order('dueDate', { ascending: true })

  if (!isAdminOrManager) {
    query = query.eq('counselorId', user.id)
  } else {
    query = query.eq('counselor.companyId', user.companyId)
  }

  const { data, error } = await query
  if (error) {
    console.error('SWR Tasks Fetch Error:', error)
    return []
  }
  return data || []
}

export default function TasksClient({ 
  tasks, 
  counselors, 
  isAdminOrManager, 
  currentUser 
}: { 
  tasks: any[]
  counselors: any[]
  isAdminOrManager: boolean
  currentUser: any 
}) {
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ 
    description: '', 
    dueDate: '', 
    counselorId: counselors.length > 0 ? counselors[0].id : currentUser.id 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // SWR Caching
  const { data: clientTasks, mutate } = useSWR(
    'tasks',
    tasksFetcher,
    {
      fallbackData: tasks,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000
    }
  )

  const activeTasks = clientTasks || tasks

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    
    const data = new FormData()
    data.append('description', formData.description)
    data.append('dueDate', formData.dueDate)
    data.append('counselorId', formData.counselorId)

    try {
      const res = await createTask(data)
      if (res && 'error' in res) {
        setErrorMsg(res.error || 'Failed to create task')
      } else {
        mutate() // trigger revalidation
        setFormData({ 
          description: '', 
          dueDate: '', 
          counselorId: counselors.length > 0 ? counselors[0].id : currentUser.id 
        })
        setIsModalOpen(false)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending'
    
    // Optimistic cache update
    mutate(
      activeTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
      false
    )

    try {
      await updateTaskStatus(taskId, newStatus)
      mutate()
    } catch (err) {
      mutate() // rollback
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    // Optimistic delete
    mutate(
      activeTasks.filter(t => t.id !== taskId),
      false
    )

    try {
      await deleteTask(taskId)
      mutate()
    } catch (err) {
      mutate()
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

  // Group tasks by urgency/date
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const overdueTasks: any[] = []
  const todayTasks: any[] = []
  const upcomingTasks: any[] = []
  const completedTasks: any[] = []

  activeTasks.forEach(task => {
    if (task.status === 'Completed') {
      completedTasks.push(task)
      return
    }

    const due = new Date(task.dueDate)
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())

    if (dueDay < todayStart) {
      overdueTasks.push(task)
    } else if (dueDay.getTime() === todayStart.getTime()) {
      todayTasks.push(task)
    } else {
      upcomingTasks.push(task)
    }
  })

  const inputClass = "w-full bg-white border-2 border-white rounded-xl py-2.5 px-4 text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-200 shadow-sm transition-all"
  const selectClass = "w-full bg-white border-2 border-white text-xs font-bold text-gray-600 rounded-xl py-2.5 px-4 outline-none focus:bg-gray-50 shadow-sm transition-all cursor-pointer"

  const renderTaskRow = (task: any) => {
    const isCompleted = task.status === 'Completed'
    const due = new Date(task.dueDate)
    const formattedTime = due.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    const counselorName = task.counselor?.fullName

    return (
      <div 
        key={task.id} 
        className={`flex items-center gap-4 p-4 mb-3.5 bg-white/80 rounded-2xl shadow-[4px_4px_10px_rgba(0,0,0,0.03),inset_1px_1px_2px_rgba(255,255,255,0.8)] border-2 border-white group transition-all duration-300 ${
          isCompleted ? 'opacity-60' : ''
        }`}
      >
        {/* check-circle checkbox */}
        <button
          type="button"
          onClick={() => handleStatusChange(task.id, task.status)}
          disabled={!isAdminOrManager && currentUser.id !== task.counselorId}
          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer border-none transition-all duration-200 ${
            isCompleted 
              ? 'bg-gradient-to-br from-[#1FAE73] to-[#158a5c] shadow-sm text-white'
              : 'bg-white border border-gray-200 text-transparent hover:bg-gray-50'
          }`}
          aria-label={isCompleted ? "Mark task as pending" : "Mark task as completed"}
        >
          <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold text-gray-900 mb-1 leading-normal ${isCompleted ? 'line-through text-gray-400' : ''}`}>
            {task.description}
          </p>
          <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-gray-600 font-semibold">
            {task.lead && (
              <span className="bg-[#4855E4]/8 text-[#333FC2] px-2.5 py-0.5 rounded-full font-bold">
                <Link href={`/dashboard/leads/${task.lead.id}`} className="hover:underline">
                  {task.lead.fullName}
                </Link>
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Counselor Badge */}
        {counselorName && (
          <div 
            className="w-6.5 h-6.5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[8.5px] font-bold shadow-sm shrink-0"
            title={`Assigned to ${counselorName}`}
          >
            {getInitials(counselorName)}
          </div>
        )}

        {/* Action Trash button */}
        {isAdminOrManager && (
          <button
            onClick={() => handleDelete(task.id)}
            className="text-gray-400 hover:text-[#E5484D] transition-colors shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Tasks</h2>
          <p className="text-xs text-gray-600">Your team's follow-up agenda, organized by urgency.</p>
        </div>
        {isAdminOrManager && (
          <button 
            onClick={() => {
              setErrorMsg('')
              setIsModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-5 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-[9px_9px_20px_rgba(51,63,194,0.35)] active:translate-y-0.5 transition-all duration-150"
          >
            <Plus className="h-4.5 w-4.5" />
            New Task
          </button>
        )}
      </div>

      {/* Main groupings */}
      <div className="space-y-8">
        
        {/* 1. Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E5484D] px-1">
              <span className="w-2 h-2 rounded-full bg-[#E5484D]"></span>
              <span>Overdue</span>
              <span className="text-[10px] bg-[#E5484D]/10 px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
            </div>
            <div>{overdueTasks.map(renderTaskRow)}</div>
          </div>
        )}

        {/* 2. Today Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#4855E4] px-1">
            <span className="w-2 h-2 rounded-full bg-[#4855E4]"></span>
            <span>Today</span>
            <span className="text-[10px] bg-[#4855E4]/10 px-2 py-0.5 rounded-full">{todayTasks.length}</span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="bg-slate-50 rounded-[2rem] border-4 border-white shadow-[8px_8px_16px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] p-6 text-center text-xs font-bold text-gray-400">
              No tasks scheduled for today.
            </div>
          ) : (
            <div>{todayTasks.map(renderTaskRow)}</div>
          )}
        </div>

        {/* 3. Upcoming Section */}
        {upcomingTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#12A8B5] px-1">
              <span className="w-2 h-2 rounded-full bg-[#12A8B5]"></span>
              <span>Upcoming</span>
              <span className="text-[10px] bg-[#12A8B5]/10 px-2 py-0.5 rounded-full">{upcomingTasks.length}</span>
            </div>
            <div>{upcomingTasks.map(renderTaskRow)}</div>
          </div>
        )}

        {/* 4. Completed Section */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1FAE73] px-1">
              <span className="w-2 h-2 rounded-full bg-[#1FAE73]"></span>
              <span>Completed</span>
              <span className="text-[10px] bg-[#1FAE73]/10 px-2 py-0.5 rounded-full">{completedTasks.length}</span>
            </div>
            <div>{completedTasks.map(renderTaskRow)}</div>
          </div>
        )}

        {activeTasks.length === 0 && (
          <div className="bg-slate-50 rounded-[2rem] border-4 border-white shadow-[8px_8px_16px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] p-12 text-center text-xs font-bold text-gray-400">
            No tasks found. Create a task to get started!
          </div>
        )}
      </div>

      {/* Creation Modal (Portaled) */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 bg-[#202638]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="relative z-10 max-w-md w-full bg-slate-50 border-4 border-white rounded-[2rem] shadow-[8px_8px_16px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900 font-display">Assign Task</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all"
                aria-label="Close task creation panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-[#E5484D] bg-[#E5484D]/8 p-4 rounded-xl border border-[#E5484D]/10">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Description</label>
                <input 
                  required 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className={inputClass}
                  placeholder="e.g. Call Nusrat regarding visa documents" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Due Date</label>
                <input 
                  required 
                  type="datetime-local" 
                  value={formData.dueDate} 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Assign To</label>
                <select 
                  value={formData.counselorId} 
                  onChange={e => setFormData({...formData, counselorId: e.target.value})} 
                  className={selectClass}
                >
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Assign</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
