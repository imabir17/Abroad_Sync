'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/utils/supabase/client'
import { createTask, updateTaskStatus, deleteTask } from '@/app/actions/tasks'
import { CheckSquare, Clock, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'

// SWR Tasks Fetcher
const tasksFetcher = async () => {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []

  // Fetch current user details to inspect role & companyId
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
    .order('status', { ascending: false })
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ 
    description: '', 
    dueDate: '', 
    counselorId: counselors.length > 0 ? counselors[0].id : currentUser.id 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Integrate SWR Caching
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
    
    const data = new FormData()
    data.append('description', formData.description)
    data.append('dueDate', formData.dueDate)
    data.append('counselorId', formData.counselorId)

    try {
      await createTask(data)
      mutate() // trigger background revalidation
      
      setFormData({ 
        description: '', 
        dueDate: '', 
        counselorId: counselors.length > 0 ? counselors[0].id : currentUser.id 
      })
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
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
      mutate() // rollback on error
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

  const pendingTasks = activeTasks.filter(t => t.status === 'Pending')
  const completedTasks = activeTasks.filter(t => t.status === 'Completed')

  const inputClass = "w-full bg-[#E7ECF3] shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] border-none rounded-xl py-2.5 px-3 text-xs font-semibold text-[#202638] placeholder-[#8891A3] focus:outline-none transition-all"
  const selectClass = "w-full bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] rounded-xl py-2.5 px-3 outline-none focus:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#202638] font-display">Tasks & Reminders</h2>
          <p className="text-xs text-[#5C6478]">Manage your follow-ups and student assignments.</p>
        </div>
        {isAdminOrManager && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-[9px_9px_20px_rgba(51,63,194,0.35)] active:translate-y-0.5 transition-all duration-150"
          >
            <Plus className="h-4.5 w-4.5" />
            Assign Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Tasks */}
        <div className="neo-raised p-6">
          <h3 className="text-sm font-bold text-[#202638] flex items-center gap-2 mb-5">
            <Clock className="h-4.5 w-4.5 text-[#FF7A52]" /> Pending ({pendingTasks.length})
          </h3>
          
          <div className="space-y-4">
            {pendingTasks.length === 0 ? (
              <p className="text-[#8891A3] text-xs font-bold text-center py-6">No pending tasks.</p>
            ) : (
              pendingTasks.map(task => (
                <div key={task.id} className="bg-[#E7ECF3] p-4 rounded-xl shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] border border-[#AEB9C9]/10 group transition-all">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={false}
                      onChange={() => handleStatusChange(task.id, task.status)}
                      disabled={!isAdminOrManager && currentUser.id !== task.counselorId}
                      className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#4855E4] disabled:opacity-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#202638] leading-normal mb-1">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#5C6478] font-semibold">
                        <span className="flex items-center text-[#FF7A52] gap-1 font-bold">
                          <Clock className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleString()}
                        </span>
                        {isAdminOrManager && (
                          <span>• Assigned to: {task.counselor?.fullName}</span>
                        )}
                        {task.lead && (
                          <span>• Lead: <Link href={`/dashboard/leads/${task.lead.id}`} className="text-[#4855E4] hover:underline font-bold">{task.lead.fullName}</Link></span>
                        )}
                      </div>
                    </div>
                    {isAdminOrManager && (
                      <button 
                        onClick={() => handleDelete(task.id)} 
                        className="text-[#8891A3] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1"
                        aria-label="Delete pending task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="neo-raised p-6 opacity-85">
          <h3 className="text-sm font-bold text-[#202638] flex items-center gap-2 mb-5">
            <CheckSquare className="h-4.5 w-4.5 text-[#21C285]" /> Completed ({completedTasks.length})
          </h3>
          
          <div className="space-y-4">
            {completedTasks.length === 0 ? (
              <p className="text-[#8891A3] text-xs font-bold text-center py-6">No completed tasks yet.</p>
            ) : (
              completedTasks.map(task => (
                <div key={task.id} className="bg-[#E7ECF3] p-4 rounded-xl shadow-[4px_4px_8px_#AEB9C9,-4px_-4px_8px_#FFFFFF] border border-[#AEB9C9]/10">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={true}
                      onChange={() => handleStatusChange(task.id, task.status)}
                      disabled={!isAdminOrManager && currentUser.id !== task.counselorId}
                      className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#4855E4] disabled:opacity-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#8891A3] line-through leading-normal mb-1">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8891A3] font-semibold">
                        <span className="flex items-center gap-1 font-bold text-[#21C285]">
                          <CheckSquare className="h-3 w-3" />
                          Done
                        </span>
                        {isAdminOrManager && (
                          <span>• By: {task.counselor?.fullName}</span>
                        )}
                        {task.lead && (
                          <span>• Lead: <Link href={`/dashboard/leads/${task.lead.id}`} className="text-[#4855E4] hover:underline font-bold">{task.lead.fullName}</Link></span>
                        )}
                      </div>
                    </div>
                    {isAdminOrManager && (
                      <button 
                        onClick={() => handleDelete(task.id)} 
                        className="text-[#8891A3] hover:text-red-500 shrink-0 p-1"
                        aria-label="Delete completed task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="neo-raised-lg max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-[#202638]">Assign Task</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-xl bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] text-[#5C6478] transition-all"
                aria-label="Close task assignments dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#5C6478] mb-2">Description</label>
                <input 
                  required 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className={inputClass}
                  placeholder="E.g. Prepare university report" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#5C6478] mb-2">Due Date</label>
                <input 
                  required 
                  type="datetime-local" 
                  value={formData.dueDate} 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C6478] mb-2">Assign To</label>
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
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] text-xs font-bold text-[#5C6478] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
