'use client'

import { useState } from 'react'
import { Clock, AlertCircle, CheckSquare, X, Check } from 'lucide-react'
import Link from 'next/link'
import { updateTaskStatus } from '@/app/actions/tasks'

export default function TasksModalClient({ 
  tasks, 
  pendingCount 
}: { 
  tasks: any[]
  pendingCount: number 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const [localTasks, setLocalTasks] = useState(tasks)

  const pendingTasks = localTasks.filter(t => t.status === 'Pending')
  const completedTasks = localTasks.filter(t => t.status === 'Completed').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const handleTaskComplete = async (taskId: string) => {
    // Optimistic UI update
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed', updatedAt: new Date().toISOString() } : t))
    try {
      await updateTaskStatus(taskId, 'Completed')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {/* Trigger Card */}
      <div 
        onClick={() => setIsOpen(true)}
        className="neo-raised p-6 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#5C6478]">Pending Tasks</h3>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF987A] to-[#FF542B] shadow-[3px_3px_6px_#AEB9C9,-3px_3px_6px_#FFFFFF] flex items-center justify-center text-white">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>
        <p className="text-3xl font-black text-[#202638] font-display mt-4">{pendingCount}</p>
        <p className="text-[10px] text-[#FF7A52] font-bold mt-2 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> Click to view and manage tasks
        </p>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="neo-raised-lg w-full max-w-2xl max-h-[80vh] flex flex-col p-8 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[#AEB9C9]/20">
              <h2 className="text-base font-bold text-[#202638] font-display">Task Management</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-[#E7ECF3] shadow-[3px_3px_6px_#AEB9C9,-3px_-3px_6px_#FFFFFF] hover:shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] text-[#5C6478] transition-all"
                aria-label="Close tasks dialog"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Tab controls */}
            <div className="flex gap-4 my-5 bg-[#E7ECF3] shadow-[inset_2px_2px_5px_#AEB9C9,inset_-2px_-2px_5px_#FFFFFF] p-1.5 rounded-xl">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'pending'
                    ? 'text-[#202638] bg-[#E7ECF3] shadow-[2px_2px_5px_#AEB9C9,-2px_-2px_5px_#FFFFFF]'
                    : 'text-[#8891A3] hover:text-[#202638]'
                }`}
              >
                Pending ({pendingTasks.length})
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'completed'
                    ? 'text-[#202638] bg-[#E7ECF3] shadow-[2px_2px_5px_#AEB9C9,-2px_-2px_5px_#FFFFFF]'
                    : 'text-[#8891A3] hover:text-[#202638]'
                }`}
              >
                History ({completedTasks.length})
              </button>
            </div>

            {/* Task list container */}
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {pendingTasks.length === 0 ? (
                    <p className="text-[#8891A3] text-xs font-bold text-center py-8">No pending tasks!</p>
                  ) : (
                    pendingTasks.map(task => (
                      <div key={task.id} className="bg-[#E7ECF3] p-4 rounded-xl shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] flex items-start gap-3 transition-all">
                        <input 
                          type="checkbox" 
                          onChange={() => handleTaskComplete(task.id)}
                          className="mt-1 w-4 h-4 rounded cursor-pointer accent-[#4855E4] shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#202638] leading-normal">
                            {task.leadId ? (
                              <Link href={`/dashboard/leads/${task.leadId}`} onClick={() => setIsOpen(false)} className="hover:text-[#4855E4] hover:underline font-bold">
                                {task.description}
                              </Link>
                            ) : (
                              <span>{task.description}</span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#FF7A52] font-bold mt-1.5 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Due: {new Date(task.dueDate).toLocaleString()}{task.lead ? ` - ${task.lead.fullName}` : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
 
              {activeTab === 'completed' && (
                <div className="space-y-4">
                  {completedTasks.length === 0 ? (
                    <p className="text-[#8891A3] text-xs font-bold text-center py-8">No task history yet.</p>
                  ) : (
                    completedTasks.map(task => (
                      <div key={task.id} className="bg-[#E7ECF3] p-4 rounded-xl shadow-[4px_4px_8px_#AEB9C9,-4px_-4px_8px_#FFFFFF] flex items-start gap-3 opacity-80">
                        <Check className="mt-0.5 h-4.5 w-4.5 text-[#21C285] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#8891A3] line-through leading-normal">
                            {task.leadId ? (
                              <Link href={`/dashboard/leads/${task.leadId}`} onClick={() => setIsOpen(false)} className="hover:text-[#21C285] hover:underline">
                                {task.description}
                              </Link>
                            ) : (
                              <span>{task.description}</span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#8891A3] font-semibold mt-1">
                            Completed: {new Date(task.updatedAt).toLocaleString()}{task.lead ? ` - ${task.lead.fullName}` : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
